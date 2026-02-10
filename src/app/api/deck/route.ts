import { NextResponse } from "next/server";
import { getAuthenticatedAddress } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deckSchema } from "@/lib/validation";
import { validateDeck } from "@/lib/cards";
import { checkRateLimit } from "@/lib/rate-limit";

// GET: retrieve saved deck
export async function GET() {
  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const player = await prisma.player.findUnique({
    where: { id: address },
    select: { deckCardIds: true },
  });

  const cardIds = player?.deckCardIds
    ? JSON.parse(player.deckCardIds)
    : null;

  return NextResponse.json({ cardIds });
}

// POST: save deck
export async function POST(req: Request) {
  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rl = checkRateLimit(`deck:${address}`, { maxRequests: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  let body;
  try {
    body = deckSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validation = validateDeck(body.cardIds);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  await prisma.player.update({
    where: { id: address },
    data: { deckCardIds: JSON.stringify(body.cardIds) },
  });

  return NextResponse.json({ ok: true, cardIds: body.cardIds });
}
