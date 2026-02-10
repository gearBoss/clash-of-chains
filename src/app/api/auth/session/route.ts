import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session.address) {
    return NextResponse.json({ address: null, authenticated: false });
  }

  return NextResponse.json({
    address: session.address,
    authenticated: true,
  });
}

export async function DELETE() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
