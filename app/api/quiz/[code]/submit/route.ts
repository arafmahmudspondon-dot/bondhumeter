import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

/**
 * POST /api/quiz/[code]/submit — submit answers for a quiz.
 * Body: { playerName, answers: number[] } (answers[i] = chosen option index, -1 = skip)
 * Server scores the attempt (correct answers never leave the server).
 * Out-of-range or malformed picks are treated as skipped — tamper-proof.
 * Also returns the player's leaderboard rank + percentile so the result
 * screen can brag properly ("better than 78% of everyone who played").
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const rl = rateLimit(`submit:${clientIp(req.headers)}`, 12, 60_000);
    if (!rl.ok) {
      return tooMany(rl.retryAfter, "Slow down a little — too many submissions");
    }

    const { code } = await params;
    const body = await req.json();
    const playerName = String(body?.playerName || "").trim().slice(0, 60);
    const answers: number[] = Array.isArray(body?.answers)
      ? body.answers.slice(0, 60).map((a: unknown) => {
          const n = Number(a);
          return Number.isInteger(n) ? n : -1;
        })
      : [];

    if (!playerName) {
      return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
    }

    const quiz = await db.quiz.findUnique({
      where: { code },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    if (answers.length > quiz.questions.length) {
      return NextResponse.json({ error: "Answers do not match this quiz" }, { status: 400 });
    }

    const total = quiz.questions.length;
    let score = 0;
    const review = quiz.questions.map((q, i) => {
      const raw = answers[i];
      const optionCount = (() => {
        try {
          return (JSON.parse(q.options) as string[]).length;
        } catch {
          return 0;
        }
      })();
      // any out-of-range pick counts as skipped — never crashable, never exploitable
      const chosen =
        Number.isInteger(raw) && raw >= 0 && raw < optionCount ? raw : -1;
      const options = JSON.parse(q.options) as string[];
      const correct = chosen === q.correctIndex;
      if (correct) score++;
      return {
        question: q.text,
        options,
        chosen,
        correctIndex: q.correctIndex,
        correct,
      };
    });

    const attempt = await db.attempt.create({
      data: {
        quizId: quiz.id,
        playerName,
        answers: JSON.stringify(answers),
        score,
        total,
      },
    });

    // leaderboard position + percentile — computed after insert so the
    // numbers always include this attempt
    const better = await db.attempt.count({
      where: { quizId: quiz.id, score: { gt: score } },
    });
    const everyone = await db.attempt.count({ where: { quizId: quiz.id } });
    const others = Math.max(everyone - 1, 0);
    const lower = Math.max(others - better, 0);

    return NextResponse.json({
      attempt: { id: attempt.id, score, total },
      creatorName: quiz.creatorName,
      quizTitle: quiz.title,
      review,
      rank: better + 1,
      others,
      // null when this player is the only one so far — UI shows a
      // "first to play" message instead of a fake percentage
      percentile: others > 0 ? Math.round((lower / others) * 100) : null,
    });
  } catch (e) {
    console.error("submit error", e);
    return NextResponse.json({ error: "Submit failed" }, { status: 500 });
  }
}
