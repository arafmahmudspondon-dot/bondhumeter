import crypto from "crypto";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

const SECRET =
  process.env.AUTH_SECRET || "bondhumeter-dev-secret-change-in-production";

export const SESSION_COOKIE = "bm_session";
export const VISITOR_COOKIE = "bm_vid";
export const ADMIN_COOKIE = "bm_admin";

function hmac(value: string) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

/** Create a signed session token: payload.signature */
export function signToken(payload: string) {
  const sig = hmac(payload);
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

/** Verify + decode a signed token. Returns payload or null. */
export function verifyToken(token: string | undefined | null): string | null {
  if (!token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  const payload = Buffer.from(encoded, "base64url").toString("utf8");
  const expected = hmac(payload);
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  return payload;
}

/** Extract the logged-in user (full record) from request cookies. */
export async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const userId = verifyToken(token);
  if (!userId) return null;
  const user = await db.user.findUnique({ where: { id: userId } });
  return user;
}

/** Check whether the request carries a valid admin cookie. */
export function isAdminRequest(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const payload = verifyToken(token);
  return payload === "admin-ok";
}

export function getCookieOptions(maxAge = 60 * 60 * 24 * 30) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    // HTTPS preview/prod gets Secure cookies; plain-http dev stays usable
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_INSECURE !== "1",
    path: "/",
    maxAge,
  };
}

export function randomId(len = 10) {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  const bytes = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}
