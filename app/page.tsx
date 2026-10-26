import type { Metadata } from "next";
import App from "@/components/bondhu/app";
import { db } from "@/lib/db";

/**
 * Server component for the single / route.
 * When a quiz link (?q=CODE) is opened — e.g. from Instagram, Facebook,
 * WhatsApp — we generate custom Open Graph metadata so the shared link
 * unfurls into the branded challenge card.
 */

export const dynamic = "force-dynamic";

async function quizMeta(code: string | undefined) {
  if (!code) return null;
  try {
    return await db.quiz.findUnique({
      where: { code },
      select: {
        code: true,
        title: true,
        creatorName: true,
      },
    });
  } catch {
    return null;
  }
}

/** Attempt lookup for shared result links (?q=CODE&r=ATTEMPT). */
async function attemptMeta(id: string | undefined, code: string) {
  if (!id || id.length > 40 || !/^[a-zA-Z0-9]+$/.test(id)) return null;
  try {
    const a = await db.attempt.findUnique({
      where: { id },
      select: {
        playerName: true,
        score: true,
        total: true,
        quiz: { select: { code: true, creatorName: true } },
      },
    });
    if (!a || a.quiz.code !== code) return null;
    return {
      playerName: a.playerName,
      score: a.score,
      total: a.total,
      pct: Math.round((a.score / Math.max(a.total, 1)) * 100),
      creatorName: a.quiz.creatorName,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const qRaw = params.q;
  const code = (Array.isArray(qRaw) ? qRaw[0] : qRaw)?.trim();
  const rRaw = params.r;
  const resultId = (Array.isArray(rRaw) ? rRaw[0] : rRaw)?.trim();

  const quiz = await quizMeta(code);
  if (!quiz) {
    return {
      title: "BondhuMeter — How well do your friends know you?",
      description:
        "Create a fun quiz about yourself, share one link, and find out who your true besties are. Free, fast and made for sharing.",
      openGraph: {
        type: "website",
        siteName: "BondhuMeter",
        title: "BondhuMeter — How well do your friends know you?",
        description:
          "Create a quiz about yourself, share one link, and reveal who knows you best. Most friends fail.",
        images: [{ url: "/api/og", width: 1200, height: 630, alt: "BondhuMeter" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "BondhuMeter — How well do your friends know you?",
        description:
          "Create a quiz about yourself, share one link, and reveal who knows you best.",
        images: ["/api/og"],
      },
    };
  }

  const name = quiz.creatorName;

  /* ---- shared RESULT link: unfurl the player's score card ---- */
  if (resultId) {
    const beat = await attemptMeta(resultId, quiz.code);
    if (beat) {
      const title = `${beat.playerName} scored ${beat.pct}% on ${beat.creatorName}'s quiz!`;
      const description = `${beat.playerName} got ${beat.score}/${beat.total} testing how well they know ${beat.creatorName} — and most friends fail this test. Think you can beat that score?`;
      return {
        title,
        description,
        openGraph: {
          type: "website",
          siteName: "BondhuMeter",
          title,
          description,
          images: [
            {
              url: `/api/og?result=${encodeURIComponent(resultId)}`,
              width: 1200,
              height: 630,
              alt: `${beat.playerName} scored ${beat.pct}% on ${beat.creatorName}'s quiz`,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: [`/api/og?result=${encodeURIComponent(resultId)}`],
        },
      };
    }
  }

  const title = `${name} challenges you!`;
  const description = `Think you really know ${name}? ${name} secretly marked the answers — and most friends fail this test. Take the challenge, beat the average and claim the bragging rights.`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "BondhuMeter",
      title,
      description,
      images: [
        {
          url: `/api/og?code=${encodeURIComponent(quiz.code)}`,
          width: 1200,
          height: 630,
          alt: `${quiz.title} — a quiz by ${name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?code=${encodeURIComponent(quiz.code)}`],
    },
  };
}

export default function Page() {
  return <App />;
}
