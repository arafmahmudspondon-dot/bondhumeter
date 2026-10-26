import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { BRAND } from "@/lib/brand";

/**
 * GET /api/icon?size=192 — branded app icon (PNG) for the PWA manifest
 * and apple-touch-icon. Full-bleed brand gradient + white chat-bubble
 * mark — matches the favicon and every share card. Cached hard.
 */
export const runtime = "nodejs";

const bubbleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 14c-7.2 0-13 5.6-13 12.6 0 4 1.9 7.5 4.8 9.9l-2.3 7.2c-.3 1 .8 1.8 1.7 1.3l7.4-4.4c.5.1.9.1 1.4.1 7.2 0 13-5.6 13-12.6S39.2 14 32 14z" fill="#ffffff"/><circle cx="26" cy="26.5" r="2.6" fill="${BRAND.to}"/><circle cx="38" cy="26.5" r="2.6" fill="${BRAND.to}"/><path d="M26.5 32c1.6 1.8 3.4 2.7 5.5 2.7s3.9-.9 5.5-2.7" stroke="${BRAND.to}" stroke-width="2.6" stroke-linecap="round" fill="none"/></svg>`;
const bubbleUri = `data:image/svg+xml;base64,${Buffer.from(bubbleSvg).toString("base64")}`;

export async function GET(req: NextRequest) {
  const raw = Number(req.nextUrl.searchParams.get("size") || 192);
  const size = Math.min(Math.max(Number.isFinite(raw) ? raw : 192, 64), 512);

  const element = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(135deg, ${BRAND.from}, ${BRAND.to})`,
      }}
    >
      {/* brand bubble mark centered in the safe zone */}
      <img src={bubbleUri} width={`${size * 0.58}`} height={`${size * 0.58}`} alt="" />
    </div>
  );

  return new ImageResponse(element, {
    width: size,
    height: size,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
    },
  });
}
