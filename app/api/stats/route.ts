import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

/**
 * GET /api/stats — public, cached community numbers for the landing page.
 * { quizzes, questions, attempts, avgScorePct }
 * avgScorePct is the average of (score / total) across attempts — correct
 * even when quizzes have different numbers of questions (a raw "x/10"
 * average was misleading, which this fixes).
 */

let cache: { data: Record<string, number>; at: number } | null = null;
const TTL = 60_000;

export async function GET(_req: NextRequest) {
  const rl = rateLimit(`stats:${clientIp(_req.headers)}`, 30, 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter, "Too many requests");

  if (cache && Date.now() - cache.at < TTL) {
    return NextResponse.json(cache.data, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=120" },
    });
  }

  try {
    const [quizzes, questions, attempts, agg] = await Promise.all([
      db.quiz.count(),
      db.question.count(),
      db.attempt.findMany({ select: { score: true, total: true } }),
      db.attempt.aggregate({ _count: true }),
    ]);

    const total = agg._count || 0;
    let avgPct = 0;
    if (attempts.length > 0) {
      const sumPct = attempts.reduce(
        (sum, a) => sum + Math.min(100, Math.max(0, (a.score / Math.max(a.total, 1)) * 100)),
        0
      );
      avgPct = Math.round(sumPct / attempts.length);
    }

    const data = {
      quizzes,
      questions,
      attempts: total,
      avgScorePct: avgPct,
    };
    cache = { data, at: Date.now() };
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=120" },
    });
  } catch {
    return NextResponse.json({ quizzes: 0, questions: 0, attempts: 0, avgScorePct: 0 });
  }
}
