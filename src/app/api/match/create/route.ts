import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { getAuthenticatedAddress } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createMatchSchema } from "@/lib/validation";
import { validateDeck } from "@/lib/cards";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rl = checkRateLimit(`create:${address}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  let body;
  try {
    body = createMatchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const deckValidation = validateDeck(body.deckCardIds);
  if (!deckValidation.valid) {
    return NextResponse.json({ error: deckValidation.error }, { status: 400 });
  }

  // Check player doesn't have too many active matches
  const activeCount = await prisma.match.count({
    where: {
      OR: [
        { p1Id: address, status: { in: ["WAITING", "ACTIVE"] } },
        { p2Id: address, status: { in: ["WAITING", "ACTIVE"] } },
      ],
    },
  });

  if (activeCount >= 5) {
    return NextResponse.json(
      { error: "Too many active matches (max 5)" },
      { status: 400 }
    );
  }

  const serverSalt = randomBytes(32).toString("hex");
  const matchHash = "0x" + createHash("sha256")
    .update(randomBytes(32))
    .digest("hex");

  const match = await prisma.match.create({
    data: {
      matchHash,
      p1Id: address,
      p1DeckIds: JSON.stringify(body.deckCardIds),
      serverSalt,
      gameState: "{}",
      status: "WAITING",
    },
  });

  return NextResponse.json({
    matchId: match.id,
    matchHash: match.matchHash,
    status: "WAITING",
  });
}
