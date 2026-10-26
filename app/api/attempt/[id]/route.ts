import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

/**
 * GET /api/attempt/[id] — public, minimal info about one attempt.
 * Powers the "beat this score" banner when someone opens a shared
 * result link (/?q=CODE&r=ATTEMPT). No emails, no answers — just
 * name, score and which quiz it belongs to.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = rateLimit(`attempt-get:${clientIp(req.headers)}`, 30, 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter, "Too many requests");

  const { id } = await params;
  const attempt = await db.attempt.findUnique({
    where: { id },
    select: {
      playerName: true,
      score: true,
      total: true,
      feedback: true,
      quiz: { select: { code: true, title: true, creatorName: true } },
    },
  });
  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  return NextResponse.json({
    attempt: {
      playerName: attempt.playerName,
      score: attempt.score,
      total: attempt.total,
      pct: Math.round((attempt.score / Math.max(attempt.total, 1)) * 100),
      quizCode: attempt.quiz.code,
      quizTitle: attempt.quiz.title,
      creatorName: attempt.quiz.creatorName,
      feedback: attempt.feedback,
    },
  });
}

/**
 * PUT /api/attempt/[id] — the player leaves a short note for the quiz
 * creator after seeing their score (funny / sweet / savage). Public by
 * design (players are anonymous), rate-limited and length-capped.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = rateLimit(`attempt-put:${clientIp(req.headers)}`, 6, 60_000);
  if (!rl.ok) return tooMany(rl.retryAfter, "Slow down a little");

  try {
    const { id } = await params;
    const body = await req.json();
    const feedback = String(body?.feedback || "")
      .trim()
      .slice(0, 160);

    if (!feedback) {
      return NextResponse.json({ error: "Note is empty" }, { status: 400 });
    }

    const existing = await db.attempt.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const updated = await db.attempt.update({
      where: { id },
      data: { feedback },
      select: { feedback: true },
    });

    return NextResponse.json({ ok: true, feedback: updated.feedback });
  } catch (e) {
    console.error("attempt feedback error", e);
    return NextResponse.json({ error: "Could not save note" }, { status: 500 });
  }
}
