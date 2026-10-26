import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  VISITOR_COOKIE,
  getCookieOptions,
  signToken,
} from "@/lib/auth";
import { hashPassword, passwordPolicyError } from "@/lib/password";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

/**
 * POST /api/auth/register — create an account with email + password.
 * Body: { name, email, password }
 */
export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    const rl = rateLimit(`register:${ip}`, 5, 10 * 60_000);
    if (!rl.ok) {
      return tooMany(rl.retryAfter, "Too many sign-up attempts — try again later");
    }

    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const name = String(body?.name || "").trim();
    const password = String(body?.password || "");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Please enter your name (at least 2 characters)" },
        { status: 400 }
      );
    }
    const policy = passwordPolicyError(password);
    if (policy) {
      return NextResponse.json({ error: policy }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        {
          error: existing.password
            ? "This email is already registered — please log in instead"
            : "This email is linked to a Google account — please sign in with Google",
        },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashPassword(password),
        provider: "email",
        lastLoginAt: new Date(),
      },
    });

    // Link this browser's past anonymous visits to the new account
    const vid = req.cookies.get(VISITOR_COOKIE)?.value;
    if (vid) {
      await db.visitor.updateMany({
        where: { sessionId: vid, userId: null },
        data: { userId: user.id },
      });
    }

    const res = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        provider: user.provider,
        role: user.role,
      },
    });
    res.cookies.set(SESSION_COOKIE, signToken(user.id), getCookieOptions());
    return res;
  } catch (e) {
    console.error("register error", e);
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }
}
