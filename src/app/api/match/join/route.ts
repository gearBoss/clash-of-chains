import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getAuthenticatedAddress } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { joinMatchSchema } from "@/lib/validation";
import { validateDeck } from "@/lib/cards";
import { initGame } from "@/lib/engine";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rl = checkRateLimit(`join:${address}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  let body;
  try {
    body = joinMatchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const deckValidation = validateDeck(body.deckCardIds);
  if (!deckValidation.valid) {
    return NextResponse.json({ error: deckValidation.error }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: body.matchId },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match.status !== "WAITING") {
    return NextResponse.json({ error: "Match is not open" }, { status: 400 });
  }

  if (match.p1Id === address) {
    return NextResponse.json({ error: "Cannot join your own match" }, { status: 400 });
  }

  // Initialize game
  const p1DeckIds = JSON.parse(match.p1DeckIds) as number[];
  const initSeed = createHash("sha256")
    .update(match.id + "init" + match.serverSalt)
    .digest("hex");

  const gameState = initGame(p1DeckIds, body.deckCardIds, initSeed);

  await prisma.match.update({
    where: { id: match.id },
    data: {
      p2Id: address,
      p2DeckIds: JSON.stringify(body.deckCardIds),
      gameState: JSON.stringify(gameState),
      status: "ACTIVE",
      currentTurn: 0,
      turnNumber: 1,
      lastMoveAt: new Date(),
    },
  });

  // Ensure p2 player record exists
  await prisma.player.upsert({
    where: { id: address },
    update: {},
    create: { id: address },
  });

  return NextResponse.json({
    matchId: match.id,
    status: "ACTIVE",
  });
}
