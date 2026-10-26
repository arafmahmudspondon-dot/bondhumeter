import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";
import { getSettings, parseDemoJson } from "@/lib/settings";

/**
 * GET /api/settings — public site settings used by the UI:
 * appearance (accent/font), admin contact button (admin login screen),
 * share-card line and the builder's starter questions.
 */
export async function GET(req: NextRequest) {
  const rl = rateLimit(`settings:${clientIp(req.headers)}`, 60, 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter, "Too many requests");

  const s = await getSettings();
  return NextResponse.json(
    {
      accent: s.accent,
      font: s.font,
      adminContactUrl: s.adminContactUrl,
      cardLine: s.cardLine,
      demoQuestions: parseDemoJson(s.demoQuestions),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
