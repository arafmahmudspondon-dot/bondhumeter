import { NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_COOKIE, getCookieOptions } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...getCookieOptions(0), maxAge: 0 });
  res.cookies.set(ADMIN_COOKIE, "", { ...getCookieOptions(0), maxAge: 0 });
  return res;
}
