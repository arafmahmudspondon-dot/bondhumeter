import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractIp, geoLookup } from "@/lib/geo";
import { parseUA } from "@/lib/ua";
import {
  VISITOR_COOKIE,
  getUserFromRequest,
  randomId,
  getCookieOptions,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Resolve (or create) the visitor session id
    let sessionId = req.cookies.get(VISITOR_COOKIE)?.value;
    const isNew = !sessionId;
    if (!sessionId) sessionId = randomId(16);

    const ip = extractIp(req.headers);
    const ua = req.headers.get("user-agent") || "";
    const { browser, os, device } = parseUA(ua);

    const user = await getUserFromRequest(req);
    const geo = await geoLookup(ip);

    const visitor = await db.visitor.create({
      data: {
        sessionId,
        userId: user?.id ?? null,
        ip: ip || null,
        city: geo.city,
        region: geo.region,
        country: geo.country,
        latitude: geo.latitude,
        longitude: geo.longitude,
        isp: geo.isp,
        browser,
        os,
        device,
        screen: typeof body.screen === "string" ? body.screen.slice(0, 32) : null,
        language: typeof body.lang === "string" ? body.lang.slice(0, 32) : null,
        timezone: typeof body.tz === "string" ? body.tz.slice(0, 64) : null,
        referer: typeof body.ref === "string" ? body.ref.slice(0, 256) : null,
        path: typeof body.path === "string" ? body.path.slice(0, 256) : null,
        userAgent: ua.slice(0, 500),
      },
    });

    const res = NextResponse.json({ ok: true, id: visitor.id });
    if (isNew) {
      res.cookies.set(
        VISITOR_COOKIE,
        sessionId!,
        getCookieOptions(60 * 60 * 24 * 365)
      );
    }
    return res;
  } catch (e) {
    console.error("track error", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
