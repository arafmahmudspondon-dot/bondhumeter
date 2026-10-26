"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  BarChart3,
  QrCode,
  Loader2,
  Sparkles,
  Users,
  HelpCircle,
  Trophy,
  Share2,
  TrendingUp,
  Wand2,
} from "lucide-react";
import type { MyStats, QuizListItem, SessionUser } from "./types";
import { useLang } from "./i18n";
import ShareDialog from "./share-dialog";

interface DashboardProps {
  user: SessionUser;
  onCreate: () => void;
  onViewResults: (quizId: string) => void;
  onOpenProfile: () => void;
}

export default function Dashboard({
  user,
  onCreate,
  onViewResults,
  onOpenProfile,
}: DashboardProps) {
  const { t, locale } = useLang();
  const [quizzes, setQuizzes] = useState<QuizListItem[] | null>(null);
  const [stats, setStats] = useState<MyStats | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [shareQuiz, setShareQuiz] = useState<QuizListItem | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/quizzes");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes);
        setStats(data.stats);
      } else {
        setQuizzes([]);
      }
    } catch {
      setQuizzes([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteQuiz = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/quizzes/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("Quiz deleted"));
        setQuizzes((qs) => qs?.filter((q) => q.id !== id) ?? null);
      } else {
        toast.error(t("Could not delete quiz"));
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="anim-fade-up">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t("Hey {name}", { name: user.name?.split(" ")[0] || t("Friend") })}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              {t("Your quizzes, scores and share links — all in one place.")}
            </p>
          </div>
          <Button
            onClick={onCreate}
            className="btn-gradient h-12 rounded-full px-6 text-sm font-semibold sm:h-11"
          >
            <Plus className="mr-1.5 h-5 w-5" /> {t("Create new quiz")}
          </Button>
        </div>

        {/* the user's own stats — computed from THEIR quizzes only */}
        {stats && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                icon: <Sparkles className="h-4.5 w-4.5" />,
                value: stats.quizzes,
                label: t("My quizzes"),
              },
              {
                icon: <Users className="h-4.5 w-4.5" />,
                value: stats.plays,
                label: t("Friends tested"),
              },
              {
                icon: <TrendingUp className="h-4.5 w-4.5" />,
                value: `${stats.avgPct}%`,
                label: t("Average score"),
              },
              {
                icon: <Trophy className="h-4.5 w-4.5" />,
                value: `${stats.bestPct}%`,
                label: t("Best score"),
              },
            ].map((c, i) => (
              <Card
                key={i}
                className="glass anim-fade-up border-border/60"
                style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}
              >
                <CardContent className="p-4">
                  <span className="brand-chip flex h-9 w-9 items-center justify-center rounded-xl">
                    {c.icon}
                  </span>
                  <p className="mt-2.5 text-2xl font-extrabold tabular-nums gradient-text">
                    {c.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* quiz list */}
        <div className="mt-9">
          {quizzes === null ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <Card key={i} className="glass border-border/60">
                  <CardContent className="flex h-40 items-center justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <Card className="glass border-dashed border-border/80">
              <CardContent className="flex flex-col items-center px-6 py-14 text-center">
                <span className="brand-grad-soft flex h-16 w-16 items-center justify-center rounded-3xl">
                  <Wand2 className="brand-text h-8 w-8" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{t("No quizzes yet")}</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  {t(
                    "Create your first quiz, mark the secret answers, and share the link to see who truly knows you."
                  )}
                </p>
                <Button
                  onClick={onCreate}
                  className="btn-gradient mt-6 h-11 rounded-full px-6 text-sm font-semibold"
                >
                  <Plus className="mr-1.5 h-4 w-4" /> {t("Create my first quiz")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {quizzes.map((q, i) => (
                <Card
                  key={q.id}
                  className="glass anim-fade-up border-border/60 transition-shadow hover:shadow-lg"
                  style={{ animationDelay: `${i * 0.06}s` } as React.CSSProperties}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        {/* one uniform brand badge on every card */}
                        <span className="brand-grad brand-glow flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                          <Sparkles className="h-5 w-5 text-white" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold sm:text-lg">
                            {q.title}
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(q.createdAt).toLocaleDateString(locale, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="brand-chip shrink-0 rounded-lg font-mono text-xs"
                      >
                        #{q.code}
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="rounded-lg text-xs">
                        <HelpCircle className="mr-1 h-3 w-3" /> {t("{n} questions", { n: q._count.questions })}
                      </Badge>
                      <Badge variant="secondary" className="rounded-lg text-xs">
                        <Users className="mr-1 h-3 w-3" /> {t("{n} plays", { n: q._count.attempts })}
                      </Badge>
                      {q.bestScore !== undefined && q._count.attempts > 0 && (
                        <Badge
                          variant="secondary"
                          className="rounded-lg bg-amber-500/10 text-xs text-amber-500"
                        >
                          <Trophy className="mr-1 h-3 w-3" /> {t("top {a}/{b}", { a: q.bestScore, b: q._count.questions })}
                        </Badge>
                      )}
                      {q.avgPct !== undefined && q._count.attempts > 0 && (
                        <Badge
                          variant="secondary"
                          className="brand-chip rounded-lg text-xs"
                        >
                          <TrendingUp className="mr-1 h-3 w-3" /> {t("avg {a}%", { a: q.avgPct })}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => setShareQuiz(q)}
                        className="btn-gradient h-9 rounded-full px-4 text-xs font-semibold"
                      >
                        <Share2 className="mr-1.5 h-3.5 w-3.5" /> {t("Share link")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewResults(q.id)}
                        className="h-9 rounded-full px-4 text-xs font-semibold"
                      >
                        <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> {t("Results")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`/?q=${q.code}`, "_blank")}
                        className="h-9 rounded-full px-3 text-xs text-muted-foreground"
                      >
                        <QrCode className="mr-1 h-3.5 w-3.5" /> {t("Preview")}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto h-9 w-9 rounded-full p-0 text-muted-foreground hover:text-destructive"
                            aria-label={`${t("Delete")} ${q.title}`}
                          >
                            {deletingId === q.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("Delete this quiz?")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t(
                                "“{title}” and all its scores will be removed permanently. This cannot be undone.",
                                { title: q.title }
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteQuiz(q.id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              {t("Delete forever")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* professional share dialog with live card preview */}
      {shareQuiz && (
        <ShareDialog
          open={Boolean(shareQuiz)}
          onOpenChange={(open) => !open && setShareQuiz(null)}
          code={shareQuiz.code}
          title={shareQuiz.title}
          creatorName={shareQuiz.creatorName}
        />
      )}
    </main>
  );
}
