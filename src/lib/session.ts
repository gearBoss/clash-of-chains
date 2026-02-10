import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  address?: string;
  nonce?: string;
}

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ??
    "complex_password_at_least_32_characters_long_for_dev",
  cookieName: "chainclash_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getAuthenticatedAddress(): Promise<string | null> {
  const session = await getSession();
  return session.address ?? null;
}
