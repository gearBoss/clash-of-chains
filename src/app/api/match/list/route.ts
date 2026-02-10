import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = checkRateLimit(`match-list:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const playerAddress = searchParams.get("player");

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (playerAddress) {
    where.OR = [
      { p1Id: playerAddress.toLowerCase() },
      { p2Id: playerAddress.toLowerCase() },
    ];
  }

  const matches = await prisma.match.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      matchHash: true,
      p1Id: true,
      p2Id: true,
      status: true,
      winnerId: true,
      ratingDeltaP1: true,
      ratingDeltaP2: true,
      txHash: true,
      createdAt: true,
      turnNumber: true,
    },
  });

  return NextResponse.json({ matches });
}
