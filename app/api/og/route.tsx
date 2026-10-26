import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { BRAND } from "@/lib/brand";
import { ACCENTS, getSettings } from "@/lib/settings";

/**
 * GET /api/og — dynamic Open Graph share cards (1200×630).
 *  - no params ....... branded BondhuMeter hero card
 *  - ?code=XXXXXXX ... per-quiz challenge card
 *  - ?result=ID ...... per-player score card ("I scored 87% — beat me"),
 *                      the viral loop that turns players into promoters
 * ONE brand family for everything — no per-quiz themes, no emojis,
 * custom brand SVG marks only.
 */

export const runtime = "nodejs";

interface FontBundle {
  latinBold: Buffer;
  latinRegular: Buffer;
  bengaliBold: Buffer;
  bengaliRegular: Buffer;
}

let fontCache: FontBundle | null = null;

function loadFonts(): FontBundle | null {
  if (fontCache) return fontCache;
  try {
    // All fonts live in public/fonts and are bundle-included via
    // outputFileTracingIncludes in next.config.ts — works locally AND on Vercel.
    fontCache = {
      latinBold: fs.readFileSync(
        path.join(process.cwd(), "public/fonts/DejaVuSans-Bold.ttf")
      ),
      latinRegular: fs.readFileSync(
        path.join(process.cwd(), "public/fonts/DejaVuSans.ttf")
      ),
      bengaliBold: fs.readFileSync(
        path.join(process.cwd(), "public/fonts/NotoSansBengali-Bold.ttf")
      ),
      bengaliRegular: fs.readFileSync(
        path.join(process.cwd(), "public/fonts/NotoSansBengali-Regular.ttf")
      ),
    };
    return fontCache;
  } catch (e) {
    console.error("og font load failed", e);
    return null;
  }
}

type FontDef = {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
};

function fontList(): FontDef[] | undefined {
  const f = loadFonts();
  if (!f) return undefined;
  return [
    { name: "sans", data: f.latinBold, weight: 700, style: "normal" },
    { name: "sans", data: f.latinRegular, weight: 400, style: "normal" },
    { name: "bengali", data: f.bengaliBold, weight: 700, style: "normal" },
    { name: "bengali", data: f.bengaliRegular, weight: 400, style: "normal" },
  ];
}

const DARK = "#150d24";

/** Custom brand chat-bubble SVG (matches the app logo) as a data URI. */
function bubbleUri(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 14c-7.2 0-13 5.6-13 12.6 0 4 1.9 7.5 4.8 9.9l-2.3 7.2c-.3 1 .8 1.8 1.7 1.3l7.4-4.4c.5.1.9.1 1.4.1 7.2 0 13-5.6 13-12.6S39.2 14 32 14z" fill="#ffffff" opacity="0.95"/><circle cx="26" cy="26.5" r="2.4" fill="${BRAND.to}"/><circle cx="38" cy="26.5" r="2.4" fill="${BRAND.to}"/><path d="M26.5 32c1.6 1.8 3.4 2.7 5.5 2.7s3.9-.9 5.5-2.7" stroke="${BRAND.to}" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** Small arrow-in-circle CTA icon. */
function arrowUri(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** Branded default card for the site root. */
function heroCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 68,
        backgroundColor: DARK,
        backgroundImage:
          "linear-gradient(135deg, rgba(231,65,168,0.26) 0%, rgba(21,13,36,0) 45%), linear-gradient(315deg, rgba(139,92,246,0.30) 0%, rgba(21,13,36,0) 45%)",
        color: "white",
        fontFamily: "sans",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div
          style={{
            width: 86,
            height: 86,
            borderRadius: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `linear-gradient(135deg, ${BRAND.from}, ${BRAND.to})`,
          }}
        >
          <img src={bubbleUri()} width={54} height={54} alt="" />
        </div>
        <div style={{ display: "flex", fontSize: 42, fontWeight: 700 }}>
          Bondhu<span style={{ color: "#e879f9" }}>Meter</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.14,
            maxWidth: 940,
          }}
        >
          How well do your friends really know you?
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#cbb8f0" }}>
          Build a quiz about yourself · Share one link · Reveal your true besties
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            backgroundColor: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 999,
            padding: "18px 34px",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          Create your quiz — it&apos;s free
          <img src={arrowUri()} width={30} height={30} alt="" />
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#9d8bb8" }}>
          bondhumeter
        </div>
      </div>
    </div>
  );
}

/** Per-quiz challenge card — identical brand design for every quiz.
 *  The wording is interesting, never a dull question count. */
function quizCard(opts: {
  title: string;
  cardLine: string;
  from: string;
  to: string;
}) {
  const { title, cardLine, from, to } = opts;
  const titleSize = title.length <= 26 ? 72 : title.length <= 52 ? 58 : 46;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        backgroundColor: DARK,
        color: "white",
        fontFamily: "sans",
        position: "relative",
      }}
    >
      {/* brand accent blobs */}
      <div
        style={{
          position: "absolute",
          top: -180,
          right: -140,
          width: 560,
          height: 560,
          borderRadius: 999,
          backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
          opacity: 0.5,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -220,
          left: -160,
          width: 480,
          height: 480,
          borderRadius: 999,
          backgroundImage: `linear-gradient(135deg, ${to}, ${from})`,
          opacity: 0.32,
          display: "flex",
        }}
      />

      {/* wordmark */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
          }}
        >
          <img src={bubbleUri()} width={48} height={48} alt="" />
        </div>
        <div style={{ display: "flex", fontSize: 38, fontWeight: 700 }}>
          Bondhu<span style={{ color: from }}>Meter</span>
        </div>
      </div>

      {/* middle: label + title + teaser line */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          position: "relative",
          maxWidth: 900,
        }}
      >
        <span
          style={{
            display: "flex",
            fontSize: 27,
            fontWeight: 700,
            letterSpacing: 6,
            color: "#e879f9",
            textTransform: "uppercase",
          }}
        >
          QUIZ CHALLENGE
        </span>
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.16,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 31, color: "#cbb8f0" }}>
          {cardLine}
        </div>
      </div>

      {/* bottom CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            backgroundColor: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 999,
            padding: "18px 32px",
            fontSize: 29,
            fontWeight: 700,
          }}
        >
          Think you know them? Prove it
          <img src={arrowUri()} width={28} height={28} alt="" />
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#9d8bb8" }}>
          Most friends fail
        </div>
      </div>
    </div>
  );
}

/** Per-player score card — the "beat me" flex a winner shares. */
function resultCard(opts: {
  playerName: string;
  pct: number;
  score: number;
  total: number;
  quizTitle: string;
  from: string;
  to: string;
}) {
  const { playerName, pct, score, total, quizTitle, from, to } = opts;
  // "100%" needs ~0.64em per glyph — size it so the widest case fits the
  // left column (~456px) without clipping
  const pctSize = pct >= 100 ? 168 : pct >= 10 ? 196 : 230;
  const titleLine = `scored ${score}/${total} on ${quizTitle}`;
  const lineSize = titleLine.length <= 40 ? 34 : titleLine.length <= 64 ? 29 : 25;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        backgroundColor: DARK,
        color: "white",
        fontFamily: "sans",
        position: "relative",
      }}
    >
      {/* brand accent blobs — same family as the challenge card */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -160,
          width: 580,
          height: 580,
          borderRadius: 999,
          backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
          opacity: 0.42,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -240,
          right: -170,
          width: 520,
          height: 520,
          borderRadius: 999,
          backgroundImage: `linear-gradient(135deg, ${to}, ${from})`,
          opacity: 0.34,
          display: "flex",
        }}
      />

      {/* wordmark */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
          }}
        >
          <img src={bubbleUri()} width={48} height={48} alt="" />
        </div>
        <div style={{ display: "flex", fontSize: 38, fontWeight: 700 }}>
          Bondhu<span style={{ color: from }}>Meter</span>
        </div>
      </div>

      {/* middle: giant percentage + who/what */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 56,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: pctSize,
            fontWeight: 700,
            lineHeight: 1,
            backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            flexShrink: 0,
          }}
        >
          {pct}%
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 560,
          }}
        >
          <span
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 6,
              color: "#e879f9",
              textTransform: "uppercase",
            }}
          >
            QUIZ SCORE
          </span>
          <div style={{ display: "flex", fontSize: 52, fontWeight: 700, lineHeight: 1.15 }}>
            {playerName}
          </div>
          <div style={{ display: "flex", fontSize: lineSize, color: "#cbb8f0", lineHeight: 1.3 }}>
            {titleLine}
          </div>
        </div>
      </div>

      {/* bottom CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            backgroundColor: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 999,
            padding: "18px 32px",
            fontSize: 29,
            fontWeight: 700,
          }}
        >
          Think you can beat that?
          <img src={arrowUri()} width={28} height={28} alt="" />
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#9d8bb8" }}>
          Most friends can&apos;t
        </div>
      </div>
    </div>
  );
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim().slice(0, 12);
  const resultId = req.nextUrl.searchParams.get("result")?.trim().slice(0, 40);
  const settings = await getSettings();
  const theme = ACCENTS[settings.accent] || { from: BRAND.from, to: BRAND.to };

  let element = heroCard();

  if (resultId) {
    try {
      const attempt = await db.attempt.findUnique({
        where: { id: resultId },
        select: {
          playerName: true,
          score: true,
          total: true,
          quiz: { select: { title: true } },
        },
      });
      if (attempt) {
        element = resultCard({
          playerName: attempt.playerName.slice(0, 24),
          pct: Math.round((attempt.score / Math.max(attempt.total, 1)) * 100),
          score: attempt.score,
          total: attempt.total,
          quizTitle: attempt.quiz.title.slice(0, 70),
          from: theme.from,
          to: theme.to,
        });
      }
    } catch (e) {
      console.error("og result lookup failed", e);
    }
  } else if (code) {
    try {
      const quiz = await db.quiz.findUnique({
        where: { code },
        select: { title: true, creatorName: true },
      });
      if (quiz) {
        element = quizCard({
          title: quiz.title.slice(0, 120),
          cardLine: settings.cardLine.replace(
            /\{name\}/g,
            quiz.creatorName.slice(0, 40)
          ),
          from: theme.from,
          to: theme.to,
        });
      }
    } catch (e) {
      console.error("og quiz lookup failed", e);
    }
  }

  return new ImageResponse(element, {
    width: 1200,
    height: 630,
    fonts: fontList(),
    headers: {
      "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
