import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  VISITOR_COOKIE,
  getCookieOptions,
  signToken,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

/**
 * POST /api/auth/login — email + password sign-in.
 * Body: { email, password }
 */
export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    const rl = rateLimit(`login:${ip}`, 10, 60_000);
    if (!rl.ok) {
      return tooMany(rl.retryAfter, "Too many login attempts — wait a minute and try again");
    }

    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "Please enter your password" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email — please sign up first" },
        { status: 401 }
      );
    }
    if (!user.password) {
      return NextResponse.json(
        {
          error:
            user.provider === "google"
              ? "This email uses Google Sign-In — tap “Continue with Google”"
              : "This account has no password set yet — please sign up to create one",
        },
        { status: 401 }
      );
    }
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }

    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    // Link this browser's past anonymous visits to the account
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
    console.error("login error", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
