import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

/**
 * GET /api/qr?text=<url> — scan-to-play QR code (PNG).
 * Only encodes same-origin URLs so the endpoint can't be abused as a
 * free QR generator for random content. Cached hard — quiz links are
 * stable, so one render serves everyone.
 */
export const runtime = "nodejs";

const DARK = "#150d24";
const LIGHT = "#ffffff";

export async function GET(req: NextRequest) {
  const rl = rateLimit(`qr:${clientIp(req.headers)}`, 60, 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter, "Too many requests");

  const text = req.nextUrl.searchParams.get("text")?.trim() || "";
  if (!text || text.length > 300) {
    return NextResponse.json({ error: "Invalid text" }, { status: 400 });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin || "";
  if (!text.startsWith(origin)) {
    return NextResponse.json({ error: "Only BondhuMeter links allowed" }, { status: 400 });
  }

  try {
    const buf = await QRCode.toBuffer(text, {
      type: "png",
      width: 480,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: DARK, light: LIGHT },
    });

    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (e) {
    console.error("qr generation failed", e);
    return NextResponse.json({ error: "QR failed" }, { status: 500 });
  }
}
