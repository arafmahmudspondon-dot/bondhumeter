import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/quiz/[code] — public endpoint for anyone taking a quiz.
 * Returns questions WITHOUT correct answers.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const quiz = await db.quiz.findUnique({
    where: { code },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  return NextResponse.json({
    quiz: {
      id: quiz.id,
      code: quiz.code,
      title: quiz.title,
      creatorName: quiz.creatorName,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: JSON.parse(q.options) as string[],
      })),
    },
  });
}
