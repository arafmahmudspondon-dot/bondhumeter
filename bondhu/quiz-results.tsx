"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Copy,
  ArrowLeft,
  Users,
  HelpCircle,
  Medal,
  Crown,
  TrendingUp,
  Target,
  MessageSquareHeart,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { OwnerQuizDetail } from "./types";
import { useLang } from "./i18n";

interface QuizResultsProps {
  quizId: string;
  onBack: () => void;
}

export default function QuizResults({ quizId, onBack }: QuizResultsProps) {
  const { t, locale } = useLang();
  const [quiz, setQuiz] = useState<OwnerQuizDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/quizzes/${quizId}`);
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) setError(true);
        else setQuiz(data.quiz);
      } catch {
        if (alive) setError(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [quizId]);

  const stats = useMemo(() => {
    if (!quiz || quiz.attempts.length === 0) return null;
    const pcts = quiz.attempts.map((a) => (a.score / Math.max(a.total, 1)) * 100);
    const avg = pcts.reduce((s, p) => s + p, 0) / pcts.length;
    const passed = pcts.filter((p) => p >= 50).length;
    return {
      avg: Math.round(avg),
      passRate: Math.round((passed / pcts.length) * 100),
    };
  }, [quiz]);

  const copyLink = async (code: string) => {
    const link = `${window.location.origin}/?q=${code}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success(t("Link copied!"));
    } catch {
      toast.error(link, { duration: 8000 });
    }
  };

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="glass max-w-md border-border/60">
          <CardContent className="p-8 text-center">
            <p className="font-semibold">{t("Could not load results")}</p>
            <Button onClick={onBack} className="mt-5 h-10 rounded-full px-6 text-sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("Back to dashboard")}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Skeleton className="h-9 w-2/3 rounded-xl" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  const best = quiz.attempts[0]?.score ?? 0;

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 h-9 rounded-full px-4 text-sm text-muted-foreground"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> {t("Dashboard")}
        </Button>

        <div className="anim-fade-up flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold tracking-tight sm:text-3xl">
              {quiz.title}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-lg text-xs">
                <HelpCircle className="mr-1 h-3 w-3" /> {t("{n} questions", { n: quiz.questions.length })}
              </Badge>
              <Badge variant="secondary" className="rounded-lg text-xs">
                <Users className="mr-1 h-3 w-3" /> {t("{n} friends played", { n: quiz.attempts.length })}
              </Badge>
              <Badge variant="secondary" className="brand-text rounded-lg font-mono text-xs">
                #{quiz.code}
              </Badge>
            </div>
          </div>
          <Button
            onClick={() => copyLink(quiz.code)}
            className="btn-gradient h-11 shrink-0 rounded-full px-6 text-sm font-semibold"
          >
            <Copy className="mr-1.5 h-4 w-4" /> {t("Share again")}
          </Button>
        </div>

        {/* class stats */}
        {stats && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Card className="glass border-border/60">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="brand-chip flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-extrabold leading-tight">{stats.avg}%</p>
                  <p className="text-xs text-muted-foreground">{t("average score")}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-border/60">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Target className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-extrabold leading-tight">{stats.passRate}%</p>
                  <p className="text-xs text-muted-foreground">{t("passed (50%+)")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* leaderboard */}
        <h2 className="mt-9 flex items-center gap-2 text-lg font-bold">
          <Trophy className="h-5 w-5 text-amber-400" /> {t("Friend leaderboard")}
        </h2>

        {quiz.attempts.length === 0 ? (
          <Card className="glass mt-4 border-dashed border-border/80">
            <CardContent className="px-6 py-12 text-center">
              <p className="font-semibold">{t("No one has played yet")}</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                {t("Share the link")} <span className="font-mono">/?q={quiz.code}</span> {t("with your friends — their scores will show up here automatically.")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 space-y-2.5">
            {quiz.attempts.map((a, i) => {
              const pct = Math.round((a.score / Math.max(a.total, 1)) * 100);
              const isTop = i === 0 && a.score === best;
              const medal =
                i === 1
                  ? "bg-slate-400/90 text-white"
                  : i === 2
                    ? "bg-amber-700/80 text-white"
                    : null;
              return (
                <Card
                  key={a.id}
                  className={`glass anim-fade-up border-border/60 ${
                    isTop ? "border-amber-500/50 shadow-lg shadow-amber-500/10" : ""
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}
                >
                  <CardContent className="flex items-center gap-3.5 p-4">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold ${
                        isTop
                          ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                          : medal
                            ? `${medal}`
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isTop ? (
                        <Crown className="h-5 w-5" />
                      ) : i < 3 ? (
                        <Medal className="h-5 w-5" />
                      ) : (
                        `#${i + 1}`
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{a.playerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.createdAt).toLocaleString(locale, {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {a.feedback && (
                        <p className="mt-1 flex items-start gap-1 text-xs italic text-muted-foreground">
                          <MessageSquareHeart className="brand-text mt-0.5 h-3 w-3 shrink-0" />
                          <span className="line-clamp-2">“{a.feedback}”</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-extrabold ${
                          pct >= 70
                            ? "text-emerald-500"
                            : pct >= 40
                              ? "text-amber-500"
                              : "text-rose-500"
                        }`}
                      >
                        {pct}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.score}/{a.total}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* answer key */}
        <h2 className="mt-10 flex items-center gap-2 text-lg font-bold">
          {t("Answer key (only you can see this)")}
        </h2>
        <div className="mt-3 space-y-2.5 pb-10">
          {quiz.questions.map((q, i) => (
            <Card key={q.id} className="glass border-border/60">
              <CardContent className="p-4">
                <p className="text-sm font-semibold">
                  <span className="brand-text mr-1.5">Q{i + 1}.</span>
                  {q.text}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {t("Correct answer:")}{" "}
                  <span className="font-semibold text-emerald-500">
                    {JSON.parse(q.options)[q.correctIndex]}
                  </span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
