import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = checkRateLimit(`nonce:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const nonce = randomBytes(16).toString("hex");
  const session = await getSession();
  session.nonce = nonce;
  await session.save();

  return NextResponse.json({ nonce });
}
