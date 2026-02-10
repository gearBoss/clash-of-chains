import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = checkRateLimit(`leaderboard:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const players = await prisma.player.findMany({
    orderBy: { rating: "desc" },
    take: 100,
    select: {
      id: true,
      rating: true,
      wins: true,
      losses: true,
    },
  });

  // Fetch recently anchored matches
  const recentAnchored = await prisma.match.findMany({
    where: { status: "ANCHORED" },
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: {
      id: true,
      matchHash: true,
      p1Id: true,
      p2Id: true,
      winnerId: true,
      ratingDeltaP1: true,
      ratingDeltaP2: true,
      txHash: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ players, recentAnchored });
}
