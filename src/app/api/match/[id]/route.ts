import { NextResponse } from "next/server";
import { getAuthenticatedAddress } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sanitizeForPlayer, type GameState } from "@/lib/engine";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rl = checkRateLimit(`match-get:${address}`, { maxRequests: 60, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const { id } = await params;

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      moves: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const isP1 = match.p1Id === address;
  const isP2 = match.p2Id === address;

  // Parse and sanitize game state
  let gameState: GameState | null = null;
  if (match.gameState && match.gameState !== "{}") {
    const fullState: GameState = JSON.parse(match.gameState);
    if (isP1 || isP2) {
      gameState = sanitizeForPlayer(fullState, isP1 ? 0 : 1);
    }
  }

  return NextResponse.json({
    id: match.id,
    matchHash: match.matchHash,
    p1Id: match.p1Id,
    p2Id: match.p2Id,
    status: match.status,
    currentTurn: match.currentTurn,
    turnNumber: match.turnNumber,
    winnerId: match.winnerId,
    ratingDeltaP1: match.ratingDeltaP1,
    ratingDeltaP2: match.ratingDeltaP2,
    txHash: match.txHash,
    lastMoveAt: match.lastMoveAt,
    createdAt: match.createdAt,
    gameState,
    isPlayer: isP1 || isP2,
    playerIndex: isP1 ? 0 : isP2 ? 1 : null,
    moves: match.moves.map((m) => ({
      turnNumber: m.turnNumber,
      playerId: m.playerId,
      cardIndex: m.cardIndex,
      createdAt: m.createdAt,
    })),
  });
}
