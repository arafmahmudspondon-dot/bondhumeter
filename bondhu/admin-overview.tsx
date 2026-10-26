"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Activity,
  Trophy,
  UserPlus,
  Eye,
  Users,
  HelpCircle,
  Gamepad2,
  Monitor,
  Globe,
  Wifi,
  Chrome,
  Flame,
  Target,
} from "lucide-react";
import type { AdminData } from "./admin-utils";
import { BreakdownBars, DualDayChart } from "./admin-utils";
import { useLang } from "./i18n";

type FeedItem = {
  at: number;
  icon: React.ReactNode;
  text: string;
  sub: string;
  tint: string;
};

export default function AdminOverview({
  data,
  fmtTime,
}: {
  data: AdminData;
  fmtTime: (iso: string) => string;
}) {
  const { t } = useLang();
  const a = data.analytics;

  /* ---------- recent activity feed ---------- */
  const feed: FeedItem[] = [];
  for (const v of data.visitors.slice(0, 40)) {
    feed.push({
      at: new Date(v.createdAt).getTime(),
      icon: <Eye className="h-3.5 w-3.5" />,
      text: v.user ? v.user.email : t("Guest"),
      sub:
        t("visited from {place}", {
          place:
            [v.city, v.country].filter(Boolean).join(", ") || v.isp || t("unknown"),
        }) + ` · ${v.ip || "?"}`,
      tint: "brand-chip",
    });
  }
  for (const u of data.users.slice(0, 40)) {
    feed.push({
      at: new Date(u.createdAt).getTime(),
      icon: <UserPlus className="h-3.5 w-3.5" />,
      text: u.name || u.email,
      sub: t("created an account ({provider})", {
        provider: u.provider === "google" ? "Google" : "email",
      }),
      tint: "text-emerald-400 bg-emerald-500/15",
    });
  }
  for (const q of data.quizzes.slice(0, 40)) {
    feed.push({
      at: new Date(q.createdAt).getTime(),
      icon: <HelpCircle className="h-3.5 w-3.5" />,
      text: q.creatorName,
      sub: t("published “{title}”", { title: q.title }) + ` · #${q.code}`,
      tint: "text-amber-400 bg-amber-500/15",
    });
  }
  for (const at of data.attempts.slice(0, 40)) {
    feed.push({
      at: new Date(at.createdAt).getTime(),
      icon: <Gamepad2 className="h-3.5 w-3.5" />,
      text: at.playerName,
      sub: t("scored {a}/{b} on “{title}”", {
        a: at.score,
        b: at.total,
        title: at.quiz?.title || "—",
      }),
      tint: "text-violet-400 bg-violet-500/15",
    });
  }
  feed.sort((x, y) => y.at - x.at);
  const recent = feed.slice(0, 12);

  const kpis = [
    {
      icon: <CalendarDays className="h-4 w-4" />,
      label: t("Visits today"),
      value: a.todayVisits,
      tint: "brand-chip",
    },
    {
      icon: <Activity className="h-4 w-4" />,
      label: t("Active visitors (24h)"),
      value: a.activeVisitors24h,
      tint: "text-violet-400 bg-violet-500/15",
    },
    {
      icon: <Target className="h-4 w-4" />,
      label: t("Average score"),
      value: `${a.avgScorePct}%`,
      tint: "text-emerald-400 bg-emerald-500/15",
    },
    {
      icon: <Flame className="h-4 w-4" />,
      label: t("Best score ever"),
      value: `${a.bestScorePct}%`,
      tint: "text-amber-400 bg-amber-500/15",
    },
    {
      icon: <UserPlus className="h-4 w-4" />,
      label: t("New users (7d)"),
      value: a.newUsers7d,
      tint: "text-pink-400 bg-pink-500/15",
    },
    {
      icon: <Gamepad2 className="h-4 w-4" />,
      label: t("Plays today"),
      value: a.todayPlays,
      tint: "text-indigo-400 bg-indigo-500/15",
    },
  ];

  const breakdowns = [
    {
      icon: <Monitor className="h-3.5 w-3.5" />,
      title: t("Devices"),
      rows: a.byDevice,
      total: data.stats.totalVisitors,
      empty: t("No device data yet"),
    },
    {
      icon: <Chrome className="h-3.5 w-3.5" />,
      title: t("Browsers"),
      rows: a.byBrowser,
      total: data.stats.totalVisitors,
      empty: t("No browser data yet"),
    },
    {
      icon: <Globe className="h-3.5 w-3.5" />,
      title: t("Top countries"),
      rows: a.byCountry,
      total: data.stats.totalVisitors,
      empty: t("No location data yet"),
    },
    {
      icon: <Wifi className="h-3.5 w-3.5" />,
      title: t("Networks (ISP)"),
      rows: a.byIsp,
      total: data.stats.totalVisitors,
      empty: t("No network data yet"),
    },
  ];

  return (
    <div className="space-y-4">
      {/* mini KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k, i) => (
          <Card
            key={i}
            className="glass anim-fade-up border-border/60"
            style={{ animationDelay: `${i * 0.04}s` } as React.CSSProperties}
          >
            <CardContent className="p-4">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${k.tint}`}>
                {k.icon}
              </span>
              <p className="mt-2.5 text-xl font-extrabold tabular-nums">{k.value}</p>
              <p className="text-[11px] leading-tight text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 14-day chart */}
      <Card className="glass anim-fade-up border-border/60">
        <CardContent className="p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="brand-chip flex h-8 w-8 items-center justify-center rounded-lg">
              <CalendarDays className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold">{t("Activity — last 14 days")}</h3>
              <p className="text-[11px] text-muted-foreground">
                {t("Website visits and quiz plays, day by day.")}
              </p>
            </div>
          </div>
          <DualDayChart visits={a.visitsByDay} plays={a.playsByDay} />
        </CardContent>
      </Card>

      {/* breakdowns */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {breakdowns.map((b, i) => (
          <Card
            key={i}
            className="glass anim-fade-up border-border/60"
            style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}
          >
            <CardContent className="p-5">
              <div className="mb-3.5 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                  {b.icon}
                </span>
                <h3 className="text-sm font-bold">{b.title}</h3>
              </div>
              <BreakdownBars data={b.rows} total={b.total} emptyText={b.empty} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* top quizzes */}
        <Card className="glass anim-fade-up border-border/60">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                <Trophy className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold">{t("Most played quizzes")}</h3>
                <p className="text-[11px] text-muted-foreground">{t("Top 5 by number of plays.")}</p>
              </div>
            </div>
            {a.topQuizzes.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                {t("No quiz plays yet.")}
              </p>
            ) : (
              <div className="space-y-2">
                {a.topQuizzes.map((q, i) => (
                  <div
                    key={q.code}
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-3.5 py-2.5"
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${
                        i === 0
                          ? "bg-amber-500/20 text-amber-400"
                          : i === 1
                            ? "bg-slate-500/20 text-slate-300"
                            : i === 2
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">{q.title}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {q.creatorName} · #{q.code}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 rounded-md text-[10px] tabular-nums">
                      {t("{n} plays", { n: q.plays })}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* activity feed */}
        <Card className="glass anim-fade-up border-border/60">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold">{t("Live activity")}</h3>
                <p className="text-[11px] text-muted-foreground">
                  {t("The 12 most recent events across the whole site.")}
                </p>
              </div>
            </div>
            <div className="nice-scroll max-h-72 space-y-2 overflow-y-auto pr-1">
              {recent.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border/40 px-3 py-2"
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${f.tint}`}
                  >
                    {f.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{f.text}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{f.sub}</p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-[10px] tabular-nums text-muted-foreground">
                    {fmtTime(new Date(f.at).toISOString())}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
