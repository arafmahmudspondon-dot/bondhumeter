"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2,
  PartyPopper,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Wand2,
  SearchX,
  Trophy,
  Heart,
  Smile,
  Search,
  Ghost,
  ClipboardList,
  Share2,
  Target,
  Send,
  MessageSquareHeart,
  TrendingUp,
} from "lucide-react";
import type { BeatInfo, PublicQuiz, ScoreIcon, SubmitResult } from "./types";
import { scoreBadge } from "./types";
import { useLang } from "./i18n";
import ShareDialog from "./share-dialog";
import Confetti from "./confetti";

interface QuizTakerProps {
  code: string;
  /** attempt id from a shared result link (/?q=CODE&r=ID) — shows the beat banner */
  beat?: string;
  onBrowseMore: () => void;
}

type Stage = "loading" | "intro" | "playing" | "naming" | "result" | "error";

const SCORE_ICONS: Record<ScoreIcon, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  heart: Heart,
  smile: Smile,
  search: Search,
  ghost: Ghost,
};

export default function QuizTaker({ code, beat, onBrowseMore }: QuizTakerProps) {
  const { t, lang } = useLang();
  const [stage, setStage] = useState<Stage>("loading");
  const [quiz, setQuiz] = useState<PublicQuiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [beatInfo, setBeatInfo] = useState<BeatInfo | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const advancing = useRef(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/quiz/${encodeURIComponent(code)}`);
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) {
          setStage("error");
          return;
        }
        setQuiz(data.quiz);
        setAnswers(new Array(data.quiz.questions.length).fill(-1));
        setStage("intro");
      } catch {
        if (alive) setStage("error");
      }
    };
    load();

    // shared result link — fetch the score the visitor came to beat
    if (beat) {
      (async () => {
        try {
          const res = await fetch(`/api/attempt/${encodeURIComponent(beat)}`);
          if (!res.ok) return;
          const data = await res.json();
          const a = data?.attempt;
          if (alive && a && a.quizCode === code) {
            setBeatInfo({
              attemptId: beat,
              playerName: a.playerName,
              pct: a.pct,
              score: a.score,
              total: a.total,
            });
          }
        } catch {
          /* banner is optional — ignore */
        }
      })();
    }

    return () => {
      alive = false;
    };
  }, [code, beat]);

  const choose = (optIndex: number) => {
    // ignore extra taps while the 220ms auto-advance is pending (prevents
    // double-advance past the last question)
    if (advancing.current) return;
    advancing.current = true;
    setAnswers((a) => a.map((v, i) => (i === current ? optIndex : v)));
    // small delay for tap feedback, then advance
    setTimeout(() => {
      advancing.current = false;
      if (quiz && current < quiz.questions.length - 1) {
        setCurrent((c) => Math.min(c + 1, quiz.questions.length - 1));
      } else {
        setStage("naming");
      }
    }, 220);
  };

  const submit = useCallback(async () => {
    if (!playerName.trim()) {
      toast.error(t("Tell us your name so your friend knows who scored!"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/${encodeURIComponent(code)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: playerName.trim(), answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("Submit failed"));
        return;
      }
      setResult(data);
      setStage("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error(t("Network error — please try again"));
    } finally {
      setSubmitting(false);
    }
  }, [answers, code, playerName, t]);

  const restart = () => {
    setAnswers(new Array(quiz?.questions.length || 0).fill(-1));
    setCurrent(0);
    setResult(null);
    setStage("intro");
  };
  /* ---------- loading ---------- */
  if (stage === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-3/4 rounded-xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </main>
    );
  }

  /* ---------- error ---------- */
  if (stage === "error" || !quiz) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="glass w-full max-w-md border-border/60 anim-pop">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <SearchX className="h-12 w-12 text-muted-foreground" />
            <h1 className="mt-4 text-xl font-bold">{t("Quiz not found")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "This link may be wrong or the quiz was deleted. Double-check the code:"
              )}{" "}
              <span className="font-mono font-semibold">{code}</span>
            </p>
            <Button onClick={onBrowseMore} className="btn-gradient mt-6 h-11 rounded-full px-6 text-sm font-semibold">
              {t("Create your own quiz")}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const pct =
    result ? Math.round((result.attempt.score / Math.max(result.attempt.total, 1)) * 100) : 0;
  const badge = scoreBadge(pct, lang);
  const BadgeIcon = SCORE_ICONS[badge.icon];
  // clamp so an out-of-range index can never crash the render
  const cur = Math.min(current, quiz.questions.length - 1);

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-xl px-4 py-8 sm:py-12">
        {/* ============ INTRO ============ */}
        {stage === "intro" && (
          <Card className="glass border-border/60 anim-pop shadow-2xl">
            <CardContent className="flex flex-col items-center p-8 text-center sm:p-10">
              {beatInfo && (
                <div className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25">
                    <Target className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-snug">
                      {t("{player} scored {pct}% on this quiz — beat it!", {
                        player: beatInfo.playerName,
                        pct: beatInfo.pct,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("{a}/{b} correct — most friends can't", { a: beatInfo.score, b: beatInfo.total })}
                    </p>
                  </div>
                </div>
              )}
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-3xl brand-grad shadow-lg anim-float`}
              >
                <Wand2 className="h-8 w-8 text-white" />
              </span>
              <p className={`mt-4 text-sm font-medium brand-text`}>
                {t("{name} challenges you", { name: quiz.creatorName })}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {quiz.title}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {t(
                  quiz.questions.length > 1
                    ? "{n} questions · no time limit · be honest"
                    : "{n} question · no time limit · be honest",
                  { n: quiz.questions.length }
                )}
              </p>
              <Button
                onClick={() => setStage("playing")}
                className="btn-gradient mt-8 h-13 w-full rounded-2xl text-base font-semibold sm:w-auto sm:px-12"
              >
                {t("Let's go!")} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <button
                onClick={onBrowseMore}
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
              >
                <Wand2 className="h-3.5 w-3.5" /> {t("Want to make your own quiz?")}
              </button>
            </CardContent>
          </Card>
        )}

        {/* ============ PLAYING ============ */}
        {stage === "playing" && (
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">
                {t("Question {n}", { n: cur + 1 })}
                <span className="text-muted-foreground"> / {quiz.questions.length}</span>
              </span>
              <span className="text-muted-foreground">{t("{name}'s quiz", { name: quiz.creatorName })}</span>
            </div>
            <Progress
              value={((cur + 1) / quiz.questions.length) * 100}
              className="mt-2.5 h-2"
            />

            <div key={cur} className="anim-fade-up">
              <Card className="glass mt-5 border-border/60">
                <CardContent className="p-5 sm:p-7">
                  <h2 className="text-lg font-bold leading-snug sm:text-xl">
                    {quiz.questions[cur].text}
                  </h2>
                  <div className="mt-5 space-y-2.5">
                    {quiz.questions[cur].options.map((opt, oi) => {
                      const selected = answers[cur] === oi;
                      return (
                        <button
                          key={oi}
                          onClick={() => choose(oi)}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-all active:scale-[0.98] sm:text-base ${
                            selected
                              ? "brand-border brand-chip shadow-lg shadow-black/10"
                              : "border-border/70 hover:brand-border-soft hover:bg-accent/5"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              selected
                                ? "brand-grad text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {String.fromCharCode(65 + oi)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {cur > 0 && (
              <Button
                variant="ghost"
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                className="mt-4 h-9 rounded-full px-4 text-xs text-muted-foreground"
              >
                {t("← Previous question")}
              </Button>
            )}
          </div>
        )}

        {/* ============ NAMING ============ */}
        {stage === "naming" && (
          <Card className="glass border-border/60 anim-pop">
            <CardContent className="p-6 text-center sm:p-8">
              <PartyPopper className="mx-auto h-10 w-10 text-amber-400" />
              <h2 className="mt-3 text-xl font-extrabold">{t("All answered!")}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t(
                  "What's your name? {name} will see your score on their dashboard.",
                  { name: quiz.creatorName }
                )}
              </p>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={t("Your name…")}
                maxLength={60}
                autoFocus
                className="mx-auto mt-5 h-12 max-w-xs rounded-xl text-center text-base"
              />
              <div className="mx-auto mt-5 flex max-w-xs flex-col gap-2 sm:flex-row">
                <Button
                  onClick={submit}
                  disabled={submitting}
                  className="btn-gradient h-12 flex-1 rounded-xl text-sm font-semibold"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("Reveal my score")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStage("playing")}
                  className="h-12 rounded-xl text-sm"
                >
                  {t("Edit answers")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============ RESULT ============ */}
        {stage === "result" && result && (
          <ScoreResult
            pct={pct}
            badgeIcon={badge.icon}
            badgeTile={badge.tile}
            badgeTitle={badge.title}
            badgeNote={badge.note}
            creatorName={result.creatorName}
            quizTitle={result.quizTitle}
            score={result.attempt.score}
            total={result.attempt.total}
            code={code}
            attemptId={result.attempt.id}
            playerName={playerName.trim()}
            rank={result.rank}
            others={result.others}
            percentile={result.percentile}
            review={result.review}
            onRestart={restart}
            onBrowseMore={onBrowseMore}
          />
        )}
      </div>
    </main>
  );
}

/* ================= result screen ================= */

function ScoreResult({
  pct,
  badgeIcon,
  badgeTile,
  badgeTitle,
  badgeNote,
  creatorName,
  quizTitle,
  score,
  total,
  code,
  attemptId,
  playerName,
  rank,
  others,
  percentile,
  review,
  onRestart,
  onBrowseMore,
}: {
  pct: number;
  badgeIcon: ScoreIcon;
  badgeTile: string;
  badgeTitle: string;
  badgeNote: string;
  creatorName: string;
  quizTitle: string;
  score: number;
  total: number;
  code: string;
  attemptId: string;
  playerName: string;
  rank?: number;
  others?: number;
  percentile?: number | null;
  review: SubmitResult["review"];
  onRestart: () => void;
  onBrowseMore: () => void;
}) {
  const { t } = useLang();
  const [ring, setRing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [note, setNote] = useState("");
  const [noteSent, setNoteSent] = useState(false);
  const [noteSending, setNoteSending] = useState(false);
  const BadgeIcon = SCORE_ICONS[badgeIcon];
  const CIRC = 2 * Math.PI * 52;

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setRing(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  const sendNote = async () => {
    if (!note.trim()) {
      toast.error(t("Write something first"));
      return;
    }
    setNoteSending(true);
    try {
      const res = await fetch(`/api/attempt/${encodeURIComponent(attemptId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: note.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || t("Could not send the note"));
        return;
      }
      setNoteSent(true);
      toast.success(t("Note sent to {name}", { name: creatorName }));
    } catch {
      toast.error(t("Network error — please try again"));
    } finally {
      setNoteSending(false);
    }
  };

  return (
    <div className="anim-fade-up">
      {pct >= 70 && <Confetti fire />}

      <Card className="glass border-border/60 shadow-2xl">
        <CardContent className="flex flex-col items-center p-8 text-center sm:p-10">
          <div className="anim-score">
            <span
              className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${badgeTile} shadow-lg`}
            >
              <BadgeIcon className="h-10 w-10 text-white" />
            </span>
          </div>
          <p className="mt-4 text-sm font-medium brand-text">
            {t("{name}'s quiz", { name: creatorName })} · {quizTitle}
          </p>
          <div className="relative mt-4 flex h-40 w-40 items-center justify-center">
            <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-border/40"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={`url(#scoreGrad)`}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={ring ? CIRC * (1 - pct / 100) : CIRC}
                style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s" }}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--bm-from)" />
                  <stop offset="100%" stopColor="var(--bm-to)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center">
              <p className="text-4xl font-extrabold gradient-text">{pct}%</p>
              <p className="text-xs font-medium text-muted-foreground">
                {t("{a}/{b} correct", { a: score, b: total })}
              </p>
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">{badgeTitle}</h1>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{badgeNote}</p>

          {/* percentile + rank — honest bragging rights */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {percentile !== null && percentile !== undefined && (others ?? 0) > 0 ? (
              <span className="brand-chip inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold">
                <TrendingUp className="h-3.5 w-3.5" />
                {t("Better than {pct}% of everyone who played", { pct: percentile })}
              </span>
            ) : (
              <span className="brand-chip inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold">
                <PartyPopper className="h-3.5 w-3.5" />
                {t("You're the first to play this quiz!")}
              </span>
            )}
            {rank !== undefined && (others ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                {t("Rank #{n} on the leaderboard", { n: rank })}
              </span>
            )}
          </div>

          <div className="mt-7 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Button
              onClick={() => setShareOpen(true)}
              className="btn-gradient h-11 flex-1 rounded-xl text-sm font-semibold"
            >
              <Share2 className="mr-2 h-4 w-4" /> {t("Share my score")}
            </Button>
            <Button
              onClick={onRestart}
              variant="outline"
              className="h-11 flex-1 rounded-xl text-sm font-semibold"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> {t("Try again")}
            </Button>
            <Button
              onClick={onBrowseMore}
              variant="outline"
              className="h-11 flex-1 rounded-xl text-sm font-semibold"
            >
              <Wand2 className="mr-2 h-4 w-4" /> {t("Make your own quiz")}
            </Button>
          </div>

          {/* note to the creator — the player's voice */}
          {!noteSent ? (
            <div className="mt-7 w-full rounded-2xl border border-border/60 bg-background/40 p-4 text-left">
              <p className="flex items-center gap-1.5 text-xs font-bold">
                <MessageSquareHeart className="brand-text h-4 w-4" />
                {t("Leave a note for {name} (optional)", { name: creatorName })}
              </p>
              <div className="mt-2.5 flex gap-2">
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendNote()}
                  placeholder={t("Say something funny, sweet or savage…")}
                  maxLength={160}
                  className="h-10 flex-1 rounded-xl text-sm"
                />
                <Button
                  onClick={sendNote}
                  disabled={noteSending}
                  size="sm"
                  className="btn-gradient h-10 shrink-0 rounded-xl px-4 text-xs font-semibold"
                >
                  {noteSending ? (
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="mr-1 h-3.5 w-3.5" />
                  )}
                  {t("Send")}
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {t("They'll see it next to your score on their dashboard.")}
              </p>
            </div>
          ) : (
            <p className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
              {t("Note sent to {name}", { name: creatorName })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* result share dialog — the player's own score card */}
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        code={code}
        title={quizTitle}
        creatorName={creatorName}
        result={{
          attemptId,
          playerName: playerName || "Your friend",
          pct,
          score,
          total,
        }}
      />

      {/* review */}
      <h3 className="mt-8 flex items-center gap-2 px-1 text-lg font-bold">
        <ClipboardList className="brand-text h-5 w-5" />
        {t("The answer sheet")}
      </h3>
      <div className="mt-3 space-y-3 pb-10">
        {review.map((r, i) => (
          <Card key={i} className="glass border-border/60">
            <CardContent className="p-4">
              <div className="flex items-start gap-2.5">
                {r.correct ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{r.question}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {t("Your answer:")}{" "}
                    <span
                      className={
                        r.correct
                          ? "font-semibold text-emerald-500"
                          : "font-semibold text-rose-500"
                      }
                    >
                      {r.chosen >= 0 ? r.options[r.chosen] : t("Skipped")}
                    </span>
                    {!r.correct && (
                      <>
                        {" · "}{t("Correct:")}{" "}
                        <span className="font-semibold text-emerald-500">
                          {r.options[r.correctIndex]}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
