import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

/** GET /api/quizzes/[id] — quiz detail + attempts (owner only) */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { id } = await params;
  const quiz = await db.quiz.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      attempts: { orderBy: [{ score: "desc" }, { createdAt: "asc" }] },
    },
  });

  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  if (quiz.userId !== user.id) {
    return NextResponse.json({ error: "Not your quiz" }, { status: 403 });
  }

  return NextResponse.json({ quiz });
}

/** DELETE /api/quizzes/[id] — owner deletes quiz */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { id } = await params;
  const quiz = await db.quiz.findUnique({ where: { id } });
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  if (quiz.userId !== user.id) {
    return NextResponse.json({ error: "Not your quiz" }, { status: 403 });
  }

  await db.quiz.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
