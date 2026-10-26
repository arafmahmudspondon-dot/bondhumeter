import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest, randomId } from "@/lib/auth";
import { rateLimit, tooMany } from "@/lib/rate-limit";

const MAX_QUESTIONS = 30;
const MAX_OPTIONS = 8;
const TITLE_MAX = 120;

/** GET /api/quizzes — quizzes of the logged-in user (with attempt stats) */
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const quizzes = await db.quiz.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
  });

  const ids = quizzes.map((q) => q.id);

  // all attempts on this user's quizzes — computed in one small fetch so
  // best/average stay correct even when quizzes have different lengths
  const attempts =
    ids.length > 0
      ? await db.attempt.findMany({
          where: { quizId: { in: ids } },
          select: { quizId: true, score: true, total: true },
        })
      : [];

  const byQuiz = new Map<string, { best: number; sumPct: number; n: number }>();
  let totalPlays = 0;
  let globalSumPct = 0;
  let globalBestPct = 0;
  for (const a of attempts) {
    const pct = Math.min(100, Math.max(0, (a.score / Math.max(a.total, 1)) * 100));
    const entry = byQuiz.get(a.quizId) || { best: 0, sumPct: 0, n: 0 };
    entry.best = Math.max(entry.best, a.score);
    entry.sumPct += pct;
    entry.n += 1;
    byQuiz.set(a.quizId, entry);

    totalPlays += 1;
    globalSumPct += pct;
    globalBestPct = Math.max(globalBestPct, pct);
  }

  // per-quiz enrichment + the user's own headline stats (NOT global numbers)
  const enriched = quizzes.map((q) => {
    const agg = byQuiz.get(q.id);
    return {
      id: q.id,
      code: q.code,
      title: q.title,
      creatorName: q.creatorName,
      createdAt: q.createdAt,
      _count: q._count,
      bestScore: agg ? agg.best : undefined,
      avgPct: agg ? Math.round(agg.sumPct / agg.n) : undefined,
    };
  });

  const stats = {
    quizzes: quizzes.length,
    plays: totalPlays,
    avgPct: totalPlays > 0 ? Math.round(globalSumPct / totalPlays) : 0,
    bestPct: Math.round(globalBestPct),
  };

  return NextResponse.json({ quizzes: enriched, stats });
}

/** POST /api/quizzes — create a new quiz */
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const rl = rateLimit(`create:${user.id}`, 10, 60_000);
  if (!rl.ok) {
    return tooMany(rl.retryAfter, "Too many quizzes created — wait a minute");
  }

  try {
    const body = await req.json();
    const title = String(body?.title || "").trim().slice(0, TITLE_MAX);
    const questions = Array.isArray(body?.questions) ? body.questions.slice(0, MAX_QUESTIONS) : [];

    if (!title) {
      return NextResponse.json({ error: "Quiz title is required" }, { status: 400 });
    }
    if (questions.length === 0) {
      return NextResponse.json(
        { error: "Add at least one question" },
        { status: 400 }
      );
    }

    for (const [i, q] of questions.entries()) {
      const text = String(q?.text || "").trim().slice(0, 240);
      const options = Array.isArray(q?.options)
        ? q.options
            .slice(0, MAX_OPTIONS)
            .map((o: unknown) => String(o || "").trim().slice(0, 100))
            .filter(Boolean)
        : [];
      const ci = Number(q?.correctIndex);
      if (!text || options.length < 2 || Number.isNaN(ci) || ci < 0 || ci >= options.length) {
        return NextResponse.json(
          {
            error: `Question ${i + 1} is incomplete — it needs text, 2+ options and a correct answer marked`,
          },
          { status: 400 }
        );
      }
    }

    // Generate a unique share code
    let code = randomId(7);
    for (let i = 0; i < 5; i++) {
      const exists = await db.quiz.findUnique({ where: { code } });
      if (!exists) break;
      code = randomId(7);
    }

    const quiz = await db.quiz.create({
      data: {
        code,
        title,
        creatorName: user.name || user.email.split("@")[0],
        userId: user.id,
        questions: {
          create: questions.map((q: { text: string; options: string[]; correctIndex: number }, i: number) => ({
            order: i,
            text: String(q.text).trim().slice(0, 240),
            options: JSON.stringify(
              q.options.map((o: string) => String(o).trim().slice(0, 100)).filter(Boolean)
            ),
            correctIndex: Number(q.correctIndex),
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json({ quiz: { id: quiz.id, code: quiz.code, title: quiz.title } });
  } catch (e) {
    console.error("quiz create error", e);
    return NextResponse.json({ error: "Could not create quiz" }, { status: 500 });
  }
}
