import { NextResponse } from "next/server";
import { getAuthenticatedAddress } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { forfeitSchema } from "@/lib/validation";
import { calculateElo } from "@/lib/elo";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rl = checkRateLimit(`forfeit:${address}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  let body;
  try {
    body = forfeitSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: body.matchId },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match.status === "WAITING") {
    // Creator cancelling before opponent joins
    if (match.p1Id !== address) {
      return NextResponse.json({ error: "Not your match" }, { status: 403 });
    }
    await prisma.match.update({
      where: { id: match.id },
      data: { status: "FORFEITED" },
    });
    return NextResponse.json({ status: "CANCELLED" });
  }

  if (match.status !== "ACTIVE") {
    return NextResponse.json({ error: "Match is not active" }, { status: 400 });
  }

  const isP1 = match.p1Id === address;
  const isP2 = match.p2Id === address;
  if (!isP1 && !isP2) {
    return NextResponse.json({ error: "Not a player" }, { status: 403 });
  }

  const winnerId = isP1 ? match.p2Id! : match.p1Id;

  const [p1, p2] = await Promise.all([
    prisma.player.findUnique({ where: { id: match.p1Id } }),
    prisma.player.findUnique({ where: { id: match.p2Id! } }),
  ]);

  const elo = calculateElo(p1!.rating, p2!.rating, winnerId === match.p1Id);

  await prisma.$transaction([
    prisma.match.update({
      where: { id: match.id },
      data: {
        status: "FORFEITED",
        winnerId,
        ratingDeltaP1: elo.deltaP1,
        ratingDeltaP2: elo.deltaP2,
      },
    }),
    prisma.player.update({
      where: { id: match.p1Id },
      data: {
        rating: elo.newRatingP1,
        wins: winnerId === match.p1Id ? { increment: 1 } : undefined,
        losses: winnerId !== match.p1Id ? { increment: 1 } : undefined,
      },
    }),
    prisma.player.update({
      where: { id: match.p2Id! },
      data: {
        rating: elo.newRatingP2,
        wins: winnerId === match.p2Id ? { increment: 1 } : undefined,
        losses: winnerId !== match.p2Id ? { increment: 1 } : undefined,
      },
    }),
  ]);

  return NextResponse.json({
    status: "FORFEITED",
    winnerId,
    ratingDeltaP1: elo.deltaP1,
    ratingDeltaP2: elo.deltaP2,
  });
}
