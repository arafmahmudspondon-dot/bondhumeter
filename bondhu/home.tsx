"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Wand2,
  Users,
  Trophy,
  Share2,
  Smartphone,
  Lock,
  ChartLine,
  ArrowRight,
  Play,
  ClipboardPaste,
  UtensilsCrossed,
  Target,
  Moon,
  Music,
  Medal,
  Heart,
  Eye,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLang } from "./i18n";
import Reveal from "./reveal";
import { BondhuMark } from "./brand";

interface HomeProps {
  onNav: (view: "auth" | "create" | "dashboard") => void;
  onTakeCode: (code: string) => void;
  loggedIn: boolean;
}

export default function Home({ onNav, onTakeCode, loggedIn }: HomeProps) {
  const [code, setCode] = useState("");
  const [stats, setStats] = useState<{
    quizzes: number;
    questions: number;
    attempts: number;
    avgScorePct: number;
  } | null>(null);
  const { t } = useLang();

  useEffect(() => {
    let alive = true;
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setStats(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const startCreating = () => {
    onNav(loggedIn ? "create" : "auth");
  };

  const previewCards = [
    { icon: UtensilsCrossed, q: t("What's my favourite food?"), a: t("Kacchi Biryani") },
    { icon: Target, q: t("Who is my idol?"), a: t("Messi, always") },
    { icon: Moon, q: t("Am I a morning person?"), a: t("Definitely not!") },
    { icon: Music, q: t("My go-to song?"), a: t("Lofi vibes") },
  ];

  const steps = [
    {
      icon: <Wand2 className="h-6 w-6" />,
      step: "01",
      title: t("Create your quiz"),
      desc: t(
        "Write poll-style questions about yourself — favourite food, crush, habits — and secretly mark the correct answers."
      ),
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      step: "02",
      title: t("Share one link"),
      desc: t(
        "Send your personal quiz link to friends on Messenger, WhatsApp or Instagram. It unfurls into a branded challenge card."
      ),
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      step: "03",
      title: t("See the scoreboard"),
      desc: t(
        "Every friend gets a fun score — and you see exactly who knows you best. Bestie level unlocked."
      ),
    },
  ];

  const features = [
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: t("Perfect on any device"),
      desc: t(
        "The layout adapts beautifully to phones, tablets and desktops — your friends can play from anywhere."
      ),
    },
    {
      icon: <Medal className="h-5 w-5" />,
      title: t("Friend leaderboard"),
      desc: t(
        "Scores are ranked automatically. Bragging rights go to the one who knows you best."
      ),
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: t("Answers stay secret"),
      desc: t(
        "Correct answers are marked by you and never shown before your friends submit."
      ),
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: t("Creator insights"),
      desc: t("See every attempt, best and average scores, and share your quiz with a single tap."),
    },
  ];

  return (
    <main className="flex-1">
      {/* ================= HERO ================= */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex">
            <Badge
              variant="secondary"
              className="brand-border-soft brand-chip rounded-full border px-4 py-1.5 text-xs font-medium"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> {t("The ultimate friendship test")}
            </Badge>
          </div>

          <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            {t("How well do your")}
            <br />
            <span className="gradient-text">{t("friends really know you?")}</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            {t(
              "Build a playful quiz about yourself, share the link with your friends, and watch the scoreboard reveal who your true besties are — who knows your secrets, your favourites, and your quirks."
            )}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={startCreating}
              className="btn-gradient h-13 w-full rounded-full px-8 text-base font-semibold sm:w-auto"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              {t("Create your quiz — it's free")}
            </Button>
            {loggedIn && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNav("dashboard")}
                className="h-13 w-full rounded-full px-8 text-base font-semibold sm:w-auto"
              >
                <ChartLine className="mr-2 h-5 w-5" />
                {t("My dashboard")}
              </Button>
            )}
          </div>

          {/* take a quiz by code */}
          <div className="mx-auto mt-6 flex max-w-md items-center gap-2">
            <div className="relative flex-1">
              <ClipboardPaste className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
                onKeyDown={(e) => e.key === "Enter" && code && onTakeCode(code)}
                placeholder={t("Got a quiz code from a friend? Paste it…")}
                className="h-12 rounded-full pl-10 pr-4 text-sm"
                aria-label={t("Quiz code")}
              />
            </div>
            <Button
              size="lg"
              variant="secondary"
              disabled={!code}
              onClick={() => onTakeCode(code)}
              className="h-12 rounded-full px-6 text-sm font-semibold disabled:opacity-40"
            >
              <Play className="mr-1.5 h-4 w-4" /> {t("Play")}
            </Button>
          </div>

          {/* demo quiz shortcut */}
          <button
            onClick={() => onTakeCode("DEMO001")}
            className="brand-border-soft brand-chip hover:bg-accent/20 mt-3.5 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition"
          >
            <Play className="h-3.5 w-3.5" /> {t("No code yet? Try the demo quiz")}
          </button>
        </div>

        {/* floating preview cards */}
        <Reveal delay={120} className="relative mx-auto mt-14 max-w-4xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {previewCards.map((c, i) => (
              <Card
                key={i}
                className="glass anim-float border-border/60 shadow-xl shadow-black/10"
                style={{ animationDelay: `${i * 0.6}s` } as React.CSSProperties}
              >
                <CardContent className="p-4 sm:p-5">
                  <span className="brand-grad-soft brand-text flex h-9 w-9 items-center justify-center rounded-xl">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <p className="mt-2 text-xs font-medium text-muted-foreground sm:text-sm">
                    {c.q}
                  </p>
                  <p className="mt-1.5 text-sm font-bold sm:text-base">{c.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Reveal>

        {/* community stats strip — site-wide numbers, same honesty for everyone */}
        {stats && stats.attempts > 0 && (
          <Reveal delay={200}>
            <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-border/60 glass px-6 py-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {t("Community stats")}
              </p>
              <div className="mt-2.5 flex items-center justify-center gap-6 sm:gap-10">
                <div>
                  <p className="text-xl font-extrabold gradient-text sm:text-2xl">
                    {stats.quizzes}
                  </p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t("quizzes made")}
                  </p>
                </div>
                <span className="h-8 w-px bg-border/70" />
                <div>
                  <p className="text-xl font-extrabold gradient-text sm:text-2xl">
                    {stats.attempts}
                  </p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t("friends tested")}
                  </p>
                </div>
                <span className="h-8 w-px bg-border/70" />
                <div>
                  <p className="flex items-center justify-center gap-1 text-xl font-extrabold gradient-text sm:text-2xl">
                    <Heart className="h-4 w-4 fill-current" />
                    {stats.avgScorePct}%
                  </p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t("average score")}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
            {t("Three steps. Zero boring forms.")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("From idea to scoreboard in under two minutes.")}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-3 sm:gap-6">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 100}>
              <Card className="glass h-full border-border/60 transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="brand-grad-soft brand-text flex h-12 w-12 items-center justify-center rounded-2xl">
                      {s.icon}
                    </span>
                    <span className="text-3xl font-extrabold text-border">{s.step}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
            {t("Made for sharing. Built to flex.")}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 80}>
              <Card className="glass h-full border-border/60">
                <CardContent className="p-5">
                  <span className="brand-chip flex h-10 w-10 items-center justify-center rounded-xl">
                    {f.icon}
                  </span>
                  <h3 className="mt-3.5 text-base font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <Reveal>
          <div className="brand-border-soft brand-grad-soft relative overflow-hidden rounded-3xl border p-8 text-center sm:p-14">
            <div
              className="pointer-events-none absolute -top-16 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full blur-3xl"
              style={{ backgroundColor: "color-mix(in srgb, var(--bm-accent) 20%, transparent)" }}
            />
            <div className="relative flex justify-center">
              <BondhuMark className="h-14 w-14 rounded-2xl" />
            </div>
            <h2 className="relative mt-5 text-2xl font-extrabold tracking-tight sm:text-4xl">
              {t("Ready to test your squad?")}
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
              {t("Your quiz link is one click away. Find out who your real ones are.")}
            </p>
            <Button
              size="lg"
              onClick={startCreating}
              className="btn-gradient relative mt-7 h-13 rounded-full px-9 text-base font-semibold"
            >
              {t("Start now")} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
