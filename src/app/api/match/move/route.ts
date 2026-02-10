import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getAuthenticatedAddress } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { moveSchema } from "@/lib/validation";
import { isValidMove, applyMove, type GameState } from "@/lib/engine";
import { calculateElo } from "@/lib/elo";
import { checkRateLimit } from "@/lib/rate-limit";
import { MOVE_TIMEOUT_MS } from "@/lib/constants";

export async function POST(req: Request) {
  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rl = checkRateLimit(`move:${address}`, { maxRequests: 30, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  let body;
  try {
    body = moveSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: body.matchId },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match.status !== "ACTIVE") {
    return NextResponse.json({ error: "Match is not active" }, { status: 400 });
  }

  // Check timeout
  if (match.lastMoveAt) {
    const elapsed = Date.now() - new Date(match.lastMoveAt).getTime();
    if (elapsed > MOVE_TIMEOUT_MS) {
      // Auto-forfeit: the player whose turn it is loses
      const forfeiterId = match.currentTurn === 0 ? match.p1Id : match.p2Id!;
      const winnerId = forfeiterId === match.p1Id ? match.p2Id! : match.p1Id;

      const [p1, p2] = await Promise.all([
        prisma.player.findUnique({ where: { id: match.p1Id } }),
        prisma.player.findUnique({ where: { id: match.p2Id! } }),
      ]);

      const elo = calculateElo(
        p1!.rating,
        p2!.rating,
        winnerId === match.p1Id
      );

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
        reason: "timeout",
      });
    }
  }

  // Check it's this player's turn
  const isP1 = match.p1Id === address;
  const isP2 = match.p2Id === address;

  if (!isP1 && !isP2) {
    return NextResponse.json({ error: "Not a player in this match" }, { status: 403 });
  }

  const playerIdx = isP1 ? 0 : 1;
  if (match.currentTurn !== playerIdx) {
    return NextResponse.json({ error: "Not your turn" }, { status: 400 });
  }

  const gameState: GameState = JSON.parse(match.gameState);

  // Validate move
  const validation = isValidMove(gameState, { cardIndex: body.cardIndex });
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Apply move
  const newState = applyMove(gameState, { cardIndex: body.cardIndex });

  // Create move hash for integrity chain
  const prevMoveHash = await prisma.move.findFirst({
    where: { matchId: match.id },
    orderBy: { createdAt: "desc" },
    select: { moveHash: true },
  });

  const moveHash = createHash("sha256")
    .update(
      (prevMoveHash?.moveHash ?? match.matchHash) +
        match.turnNumber +
        body.cardIndex +
        match.serverSalt
    )
    .digest("hex");

  // Check if game is over
  const isGameOver =
    newState.status === "p1_wins" || newState.status === "p2_wins";

  if (isGameOver) {
    const winnerId =
      newState.status === "p1_wins" ? match.p1Id : match.p2Id!;

    const [p1, p2] = await Promise.all([
      prisma.player.findUnique({ where: { id: match.p1Id } }),
      prisma.player.findUnique({ where: { id: match.p2Id! } }),
    ]);

    const elo = calculateElo(
      p1!.rating,
      p2!.rating,
      winnerId === match.p1Id
    );

    await prisma.$transaction([
      prisma.move.create({
        data: {
          matchId: match.id,
          playerId: address,
          turnNumber: match.turnNumber,
          cardIndex: body.cardIndex,
          moveHash,
        },
      }),
      prisma.match.update({
        where: { id: match.id },
        data: {
          gameState: JSON.stringify(newState),
          status: "COMPLETED",
          winnerId,
          currentTurn: newState.currentTurn,
          turnNumber: newState.turnNumber,
          ratingDeltaP1: elo.deltaP1,
          ratingDeltaP2: elo.deltaP2,
          lastMoveAt: new Date(),
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
      status: "COMPLETED",
      winnerId,
      ratingDeltaP1: elo.deltaP1,
      ratingDeltaP2: elo.deltaP2,
      gameState: newState,
    });
  }

  // Game continues
  await prisma.$transaction([
    prisma.move.create({
      data: {
        matchId: match.id,
        playerId: address,
        turnNumber: match.turnNumber,
        cardIndex: body.cardIndex,
        moveHash,
      },
    }),
    prisma.match.update({
      where: { id: match.id },
      data: {
        gameState: JSON.stringify(newState),
        currentTurn: newState.currentTurn,
        turnNumber: newState.turnNumber,
        lastMoveAt: new Date(),
      },
    }),
  ]);

  return NextResponse.json({
    status: "ACTIVE",
    gameState: newState,
    turnNumber: newState.turnNumber,
    currentTurn: newState.currentTurn,
  });
}
