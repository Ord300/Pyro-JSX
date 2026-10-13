// ============================================================
// SESSION — jeton signé HMAC stocké en cookie httpOnly.
// Le jeton ne contient que l'e-mail + l'expiration ; le rôle et le
// profil sont toujours relus en base (source unique de vérité).
// ============================================================

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "sport_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

function secret(): string {
  const s = (process.env.SESSION_SECRET || "").trim();
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET manquant en production.");
  }
  return s || "dev-only-insecure-secret-change-me";
}

const b64url = (buf: Buffer) =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64url = (str: string) =>
  Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64");

export function signSession(email: string): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${b64url(Buffer.from(email.toLowerCase(), "utf8"))}.${exp}`;
  const sig = b64url(createHmac("sha256", secret()).update(payload).digest());
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [payloadB64, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
  const expected = b64url(createHmac("sha256", secret()).update(`${payloadB64}.${expStr}`).digest());
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    return unb64url(payloadB64).toString("utf8") || null;
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, email: string): void {
  response.cookies.set(SESSION_COOKIE, signSession(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function sessionEmailFrom(request: NextRequest): string | null {
  return verifySession(request.cookies.get(SESSION_COOKIE)?.value);
}
