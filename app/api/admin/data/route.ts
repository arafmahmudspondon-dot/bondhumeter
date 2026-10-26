import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/auth";

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function tally(values: (string | null | undefined)[], topN: number) {
  const map = new Map<string, number>();
  for (const v of values) {
    const k = (v || "").trim();
    if (!k) continue;
    map.set(k, (map.get(k) || 0) + 1);
  }
  const total = [...map.values()].reduce((a, b) => a + b, 0);
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([label, count]) => ({ label, count }));
}

/** GET /api/admin/data — everything the admin dashboard needs, incl. analytics */
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last24h = new Date(now.getTime() - DAY_MS);
  const last7d = new Date(now.getTime() - 7 * DAY_MS);
  const days14 = Array.from({ length: 14 }, (_, i) =>
    dayKey(new Date(now.getTime() - (13 - i) * DAY_MS))
  );

  const [totalVisitors, uniqueGroups, totalUsers, totalQuizzes, totalAttempts] =
    await Promise.all([
      db.visitor.count(),
      db.visitor.groupBy({ by: ["sessionId"] }),
      db.user.count(),
      db.quiz.count(),
      db.attempt.count(),
    ]);

  const [visitors, users, quizzes, attempts, slimVisitors, slimAttempts, slimQuizzes, avgAgg] =
    await Promise.all([
      db.visitor.findMany({
        orderBy: { createdAt: "desc" },
        take: 300,
        include: { user: { select: { email: true, name: true, image: true, provider: true } } },
      }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 300,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          provider: true,
          password: true,
          phone: true,
          fbLink: true,
          instaLink: true,
          bio: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
          _count: { select: { quizzes: true, visits: true } },
          visits: {
            orderBy: { createdAt: "desc" },
            take: 3,
            select: {
              ip: true,
              city: true,
              country: true,
              isp: true,
              device: true,
              browser: true,
              createdAt: true,
            },
          },
        },
      }),
      db.quiz.findMany({
        orderBy: { createdAt: "desc" },
        take: 300,
        include: {
          user: { select: { email: true, name: true } },
          _count: { select: { questions: true, attempts: true } },
        },
      }),
      db.attempt.findMany({
        orderBy: { createdAt: "desc" },
        take: 300,
        include: { quiz: { select: { title: true, code: true, creatorName: true } } },
      }),
      // slim copies for analytics over the FULL dataset (not just latest 300)
      db.visitor.findMany({
        select: {
          createdAt: true,
          sessionId: true,
          device: true,
          browser: true,
          os: true,
          country: true,
          isp: true,
        },
      }),
      db.attempt.findMany({ select: { createdAt: true, score: true, total: true } }),
      db.quiz.findMany({
        select: { id: true, title: true, code: true, creatorName: true, _count: { select: { attempts: true } } },
      }),
      db.attempt.aggregate({ _avg: { score: true, total: true } }),
    ]);

  /* ---------- time series (14 days) ---------- */
  const visitBuckets = new Map<string, number>(days14.map((d) => [d, 0]));
  const playBuckets = new Map<string, number>(days14.map((d) => [d, 0]));
  for (const v of slimVisitors) {
    const k = dayKey(new Date(v.createdAt));
    if (visitBuckets.has(k)) visitBuckets.set(k, (visitBuckets.get(k) || 0) + 1);
  }
  for (const a of slimAttempts) {
    const k = dayKey(new Date(a.createdAt));
    if (playBuckets.has(k)) playBuckets.set(k, (playBuckets.get(k) || 0) + 1);
  }

  /* ---------- 24h / today / growth ---------- */
  let todayVisits = 0;
  let activeVisitors24h = 0;
  const sessionSeen = new Set<string>();
  for (const v of slimVisitors) {
    const t = new Date(v.createdAt).getTime();
    if (t >= todayStart.getTime()) todayVisits++;
    if (t >= last24h.getTime() && !sessionSeen.has(v.sessionId)) {
      sessionSeen.add(v.sessionId);
      activeVisitors24h++;
    }
  }
  let todayPlays = 0;
  for (const a of slimAttempts) {
    if (new Date(a.createdAt).getTime() >= todayStart.getTime()) todayPlays++;
  }
  const newUsers7d = users.filter((u) => new Date(u.createdAt).getTime() >= last7d.getTime()).length;

  /* ---------- scores ---------- */
  const avgScorePct =
    avgAgg._avg.total && avgAgg._avg.total > 0
      ? Math.round(((avgAgg._avg.score || 0) / avgAgg._avg.total) * 100)
      : 0;
  const bestPct = slimAttempts.reduce((best, a) => {
    const pct = a.total > 0 ? (a.score / a.total) * 100 : 0;
    return pct > best ? pct : best;
  }, 0);

  /* ---------- top quizzes ---------- */
  const topQuizzes = [...slimQuizzes]
    .sort((a, b) => b._count.attempts - a._count.attempts)
    .slice(0, 5)
    .map((q) => ({
      title: q.title,
      code: q.code,
      creatorName: q.creatorName,
      plays: q._count.attempts,
    }));

  const analytics = {
    visitsByDay: days14.map((d) => ({ date: d, count: visitBuckets.get(d) || 0 })),
    playsByDay: days14.map((d) => ({ date: d, count: playBuckets.get(d) || 0 })),
    byDevice: tally(slimVisitors.map((v) => v.device), 6),
    byBrowser: tally(slimVisitors.map((v) => v.browser), 6),
    byOs: tally(slimVisitors.map((v) => v.os), 6),
    byCountry: tally(slimVisitors.map((v) => v.country), 6),
    byIsp: tally(slimVisitors.map((v) => v.isp), 6),
    todayVisits,
    todayPlays,
    activeVisitors24h,
    newUsers7d,
    avgScorePct,
    bestScorePct: Math.round(bestPct),
    topQuizzes,
  };

  // never leak password hashes
  const safeUsers = users.map(({ password, ...u }) => ({ ...u, hasPassword: Boolean(password) }));

  return NextResponse.json({
    stats: {
      totalVisitors,
      uniqueVisitors: uniqueGroups.length,
      totalUsers,
      totalQuizzes,
      totalAttempts,
    },
    analytics,
    visitors,
    users: safeUsers,
    quizzes,
    attempts,
  });
}
