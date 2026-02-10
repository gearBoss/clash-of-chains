import { NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { getSession } from "@/lib/session";
import { verifySchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = checkRateLimit(`verify:${ip}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  let body;
  try {
    body = verifySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const session = await getSession();

  // Verify nonce matches
  if (!session.nonce || session.nonce !== body.nonce) {
    return NextResponse.json({ error: "Invalid nonce" }, { status: 401 });
  }

  // Verify the expected message format
  const expectedMessage = `Sign in to ChainClash\n\nNonce: ${body.nonce}`;
  if (body.message !== expectedMessage) {
    return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
  }

  // Verify signature
  let valid = false;
  try {
    valid = await verifyMessage({
      address: body.address as `0x${string}`,
      message: body.message,
      signature: body.signature as `0x${string}`,
    });
  } catch {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
  }

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Upsert player
  const address = body.address.toLowerCase();
  await prisma.player.upsert({
    where: { id: address },
    update: {},
    create: { id: address },
  });

  // Save session
  session.address = address;
  session.nonce = undefined;
  await session.save();

  return NextResponse.json({ address, ok: true });
}
