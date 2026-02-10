import { NextResponse } from "next/server";
import { createWalletClient, http, keccak256, encodePacked } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, base } from "viem/chains";
import { getAuthenticatedAddress } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { anchorSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { getChainKey } from "@/lib/constants";
import { CHAIN_CLASH_ARENA_ABI, getContractAddress } from "@/lib/contracts";

export async function POST(req: Request) {
  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rl = checkRateLimit(`anchor:${address}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  let body;
  try {
    body = anchorSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: body.matchId },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match.status !== "COMPLETED" && match.status !== "FORFEITED") {
    return NextResponse.json({ error: "Match not finished" }, { status: 400 });
  }

  if (match.txHash) {
    return NextResponse.json({
      status: "ALREADY_ANCHORED",
      txHash: match.txHash,
    });
  }

  if (!match.winnerId || !match.p2Id) {
    return NextResponse.json({ error: "Match data incomplete" }, { status: 400 });
  }

  const signerKey = process.env.ANCHOR_SIGNER_PRIVATE_KEY;
  if (!signerKey) {
    return NextResponse.json({ error: "Server signer not configured" }, { status: 500 });
  }

  try {
    const account = privateKeyToAccount(signerKey as `0x${string}`);
    const chainKey = getChainKey();
    const chain = chainKey === "base" ? base : baseSepolia;

    const contractAddress = getContractAddress();

    // Create EIP-712 signature
    const matchIdBytes = keccak256(
      encodePacked(["string"], [match.matchHash])
    );

    const domain = {
      name: "ChainClashArena",
      version: "1",
      chainId: chain.id,
      verifyingContract: contractAddress,
    } as const;

    const types = {
      MatchResult: [
        { name: "matchId", type: "bytes32" },
        { name: "p1", type: "address" },
        { name: "p2", type: "address" },
        { name: "winner", type: "address" },
        { name: "ratingDeltaP1", type: "int32" },
        { name: "ratingDeltaP2", type: "int32" },
      ],
    } as const;

    const message = {
      matchId: matchIdBytes,
      p1: match.p1Id as `0x${string}`,
      p2: match.p2Id as `0x${string}`,
      winner: match.winnerId as `0x${string}`,
      ratingDeltaP1: match.ratingDeltaP1!,
      ratingDeltaP2: match.ratingDeltaP2!,
    };

    const signature = await account.signTypedData({
      domain,
      types,
      primaryType: "MatchResult",
      message,
    });

    // Send transaction
    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(),
    });

    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: CHAIN_CLASH_ARENA_ABI,
      functionName: "recordResult",
      args: [
        matchIdBytes,
        match.p1Id as `0x${string}`,
        match.p2Id as `0x${string}`,
        match.winnerId as `0x${string}`,
        match.ratingDeltaP1!,
        match.ratingDeltaP2!,
        signature,
      ],
    });

    await prisma.match.update({
      where: { id: match.id },
      data: { txHash, status: "ANCHORED" },
    });

    return NextResponse.json({ txHash, status: "ANCHORED" });
  } catch (error) {
    console.error("Anchor error:", error);
    return NextResponse.json(
      { error: "Failed to anchor match onchain" },
      { status: 500 }
    );
  }
}
