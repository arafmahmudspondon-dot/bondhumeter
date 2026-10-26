"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useLang } from "./i18n";

/* ================= shared types ================= */

export interface VisitorRow {
  id: string;
  sessionId: string;
  createdAt: string;
  ip: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  isp: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  screen: string | null;
  language: string | null;
  timezone: string | null;
  referer: string | null;
  path: string | null;
  userAgent: string | null;
  user: { email: string; name: string | null; image: string | null; provider: string } | null;
}

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  provider: string;
  hasPassword: boolean;
  phone: string | null;
  fbLink: string | null;
  instaLink: string | null;
  bio: string | null;
  role: string;
  lastLoginAt: string | null;
  createdAt: string;
  _count: { quizzes: number; visits: number };
  visits: {
    ip: string | null;
    city: string | null;
    country: string | null;
    isp: string | null;
    device: string | null;
    browser: string | null;
    createdAt: string;
  }[];
}

export interface QuizRow {
  id: string;
  code: string;
  title: string;
  creatorName: string;
  createdAt: string;
  user: { email: string; name: string | null } | null;
  _count: { questions: number; attempts: number };
}

export interface AttemptRow {
  id: string;
  playerName: string;
  score: number;
  total: number;
  feedback?: string | null;
  createdAt: string;
  quiz: { title: string; code: string; creatorName: string } | null;
}

export interface Breakdown {
  label: string;
  count: number;
}

export interface Analytics {
  visitsByDay: { date: string; count: number }[];
  playsByDay: { date: string; count: number }[];
  byDevice: Breakdown[];
  byBrowser: Breakdown[];
  byOs: Breakdown[];
  byCountry: Breakdown[];
  byIsp: Breakdown[];
  todayVisits: number;
  todayPlays: number;
  activeVisitors24h: number;
  newUsers7d: number;
  avgScorePct: number;
  bestScorePct: number;
  topQuizzes: { title: string; code: string; creatorName: string; plays: number }[];
}

export interface AdminData {
  stats: {
    totalVisitors: number;
    uniqueVisitors: number;
    totalUsers: number;
    totalQuizzes: number;
    totalAttempts: number;
  };
  analytics: Analytics;
  visitors: VisitorRow[];
  users: UserRow[];
  quizzes: QuizRow[];
  attempts: AttemptRow[];
}

/* ================= CSV export ================= */

export function downloadCsv(
  filename: string,
  rows: (string | number | null | undefined)[][]
) {
  const esc = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(esc).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ================= empty state ================= */

export function EmptyCard({ text }: { text: string }) {
  return (
    <Card className="glass border-dashed border-border/80">
      <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
        {text}
      </CardContent>
    </Card>
  );
}

/* ================= horizontal breakdown bars ================= */

const TINTS = [
  "from-fuchsia-500 to-violet-500",
  "from-violet-500 to-purple-500",
  "from-pink-500 to-fuchsia-500",
  "from-purple-500 to-indigo-500",
  "from-fuchsia-400 to-pink-500",
  "from-indigo-500 to-violet-500",
];

export function BreakdownBars({
  data,
  total,
  emptyText,
}: {
  data: Breakdown[];
  total: number;
  emptyText: string;
}) {
  const { t } = useLang();
  if (data.length === 0) {
    return <p className="py-4 text-center text-xs text-muted-foreground">{emptyText}</p>;
  }
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.label} className="group">
          <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
            <span className="truncate font-medium">{d.label}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {d.count}
              {total > 0 && (
                <span className="ml-1 opacity-70">({Math.round((d.count / total) * 100)}%)</span>
              )}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted/70">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${TINTS[i % TINTS.length]} transition-all duration-700`}
              style={{ width: `${Math.max((d.count / max) * 100, 4)}%` }}
            />
          </div>
        </div>
      ))}
      <p className="sr-only">{t("Share of total visits")}</p>
    </div>
  );
}

/* ================= 14-day dual bar chart (hand-rolled, no deps) ================= */

export function DualDayChart({
  visits,
  plays,
}: {
  visits: { date: string; count: number }[];
  plays: { date: string; count: number }[];
}) {
  const { t, locale } = useLang();
  const max = Math.max(1, ...visits.map((v) => v.count), ...plays.map((p) => p.count));

  const dayLabel = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
  };
  const fullLabel = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "long" });
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-b from-fuchsia-400 to-fuchsia-600" />
          {t("Visits")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-b from-violet-400 to-violet-600" />
          {t("Quiz plays")}
        </span>
      </div>
      <div className="flex h-44 items-end gap-[3px] sm:gap-1.5">
        {visits.map((v, i) => {
          const p = plays[i]?.count ?? 0;
          return (
            <div
              key={v.date}
              className="group flex h-full flex-1 cursor-default flex-col justify-end gap-0.5"
              title={`${fullLabel(v.date)} — ${t("Visits")}: ${v.count} · ${t("Quiz plays")}: ${p}`}
            >
              <div className="flex flex-1 items-end justify-center gap-[2px] sm:gap-[3px]">
                <div
                  className="w-full max-w-3.5 rounded-t-[3px] bg-gradient-to-b from-fuchsia-400 to-fuchsia-600 transition-all duration-500 group-hover:brightness-125"
                  style={{ height: `${Math.max((v.count / max) * 100, v.count > 0 ? 5 : 1.5)}%` }}
                />
                <div
                  className="w-full max-w-3.5 rounded-t-[3px] bg-gradient-to-b from-violet-400 to-violet-600 transition-all duration-500 group-hover:brightness-125"
                  style={{ height: `${Math.max((p / max) * 100, p > 0 ? 5 : 1.5)}%` }}
                />
              </div>
              {i % 2 === 0 && (
                <span className="hidden text-center text-[9px] leading-tight text-muted-foreground sm:block">
                  {dayLabel(v.date)}
                </span>
              )}
              {i % 2 === 0 && <span className="text-center text-[8px] text-muted-foreground sm:hidden">{dayLabel(v.date).split(" ")[0]}</span>}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{dayLabel(visits[0]?.date || "")}</span>
        <span className="sm:hidden">{t("Every bar = one day (odd days hidden on mobile)")}</span>
        <span>{t("Today")}</span>
      </div>
    </div>
  );
}
