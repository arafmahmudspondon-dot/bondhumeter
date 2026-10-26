import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  SESSION_COOKIE,
  VISITOR_COOKIE,
  getCookieOptions,
  signToken,
} from "@/lib/auth";

/**
 * Google OAuth callback: exchanges the code, fetches profile,
 * upserts the user and starts a session.
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get("bm_oauth_state")?.value;

  if (!clientId || !clientSecret || !code) {
    return NextResponse.redirect(new URL("/?authError=google_failed", req.url));
  }
  if (!state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(new URL("/?authError=google_state", req.url));
  }

  try {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host =
      req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const redirectUri = `${proto}://${host}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) throw new Error("token exchange failed");
    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;
    if (!accessToken) throw new Error("no access token");

    const infoRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!infoRes.ok) throw new Error("userinfo failed");
    const info = await infoRes.json();

    const email = String(info.email || "").toLowerCase();
    if (!email) throw new Error("no email in google profile");

    const user = await db.user.upsert({
      where: { email },
      update: {
        name: info.name || undefined,
        image: info.picture || undefined,
        provider: "google",
      },
      create: {
        email,
        name: info.name || email.split("@")[0],
        image: info.picture || null,
        provider: "google",
      },
    });

    // Link this browser's past anonymous visits to the Google account
    const vid = req.cookies.get(VISITOR_COOKIE)?.value;
    if (vid) {
      await db.visitor.updateMany({
        where: { sessionId: vid, userId: null },
        data: { userId: user.id },
      });
    }

    const res = NextResponse.redirect(new URL("/?view=dashboard&welcome=1", req.url));
    res.cookies.set(SESSION_COOKIE, signToken(user.id), getCookieOptions());
    res.cookies.set("bm_oauth_state", "", { path: "/", maxAge: 0 });
    return res;
  } catch (e) {
    console.error("google callback error", e);
    return NextResponse.redirect(new URL("/?authError=google_failed", req.url));
  }
}
