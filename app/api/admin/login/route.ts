import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ADMIN_COOKIE, getCookieOptions, signToken } from "@/lib/auth";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

/** POST /api/admin/login — { password } */
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rl = rateLimit(`admin:${ip}`, 5, 10 * 60_000);
  if (!rl.ok) {
    return tooMany(rl.retryAfter, "Too many attempts — try again in a few minutes");
  }

  const body = await req.json().catch(() => ({}));
  const password = String(body?.password || "");
  const expected = process.env.ADMIN_PASSWORD || "admin1234";

  // constant-time compare so response timing can't leak the password
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  const ok =
    a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!ok) {
    return NextResponse.json({ error: "Wrong admin password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, signToken("admin-ok"), getCookieOptions(60 * 60 * 8));
  return res;
}
