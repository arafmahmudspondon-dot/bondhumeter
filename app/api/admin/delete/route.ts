import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";

/** POST /api/admin/delete — { type: "visitor"|"user"|"quiz"|"attempt", id } */
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { type, id } = body as { type: string; id: string };
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    switch (type) {
      case "visitor":
        await db.visitor.delete({ where: { id } });
        break;
      case "user":
        await db.user.delete({ where: { id } });
        break;
      case "quiz":
        await db.quiz.delete({ where: { id } });
        break;
      case "attempt":
        await db.attempt.delete({ where: { id } });
        break;
      case "clearVisitors":
        await db.visitor.deleteMany({});
        break;
      case "clearAttempts":
        await db.attempt.deleteMany({});
        break;
      default:
        return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin delete error", e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
