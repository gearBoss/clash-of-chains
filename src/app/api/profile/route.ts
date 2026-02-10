import { NextResponse } from "next/server";
import { getAuthenticatedAddress } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rl = checkRateLimit(`profile:${address}`, { maxRequests: 30, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const player = await prisma.player.findUnique({
    where: { id: address },
  });

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  // Recent matches
  const recentMatches = await prisma.match.findMany({
    where: {
      OR: [{ p1Id: address }, { p2Id: address }],
      status: { in: ["COMPLETED", "FORFEITED", "ANCHORED"] },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: {
      id: true,
      p1Id: true,
      p2Id: true,
      winnerId: true,
      ratingDeltaP1: true,
      ratingDeltaP2: true,
      status: true,
      txHash: true,
      turnNumber: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    address: player.id,
    rating: player.rating,
    wins: player.wins,
    losses: player.losses,
    deckCardIds: player.deckCardIds
      ? JSON.parse(player.deckCardIds)
      : null,
    recentMatches,
  });
}
