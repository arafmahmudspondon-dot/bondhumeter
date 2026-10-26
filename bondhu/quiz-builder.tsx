"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Wand2,
  CheckCircle2,
  Circle,
  PartyPopper,
  HelpCircle,
  Lightbulb,
  Dices,
  ArrowUp,
  ArrowDown,
  CopyPlus,
  Share2,
  UtensilsCrossed,
  Drama,
  HeartHandshake,
  Heart,
  AlarmClock,
  Info,
} from "lucide-react";
import { useLang } from "./i18n";
import ShareDialog from "./share-dialog";
import {
  QUESTION_TEMPLATES,
  QUICK_PACKS,
  CATEGORY_META,
  CATEGORY_ICON,
  type QuestionTemplate,
  type TemplateCategory,
} from "@/lib/question-templates";

interface DraftQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}

interface QuizBuilderProps {
  creatorName: string;
  onDone: () => void;
  onCancel: () => void;
}

const CATEGORIES: (TemplateCategory | "all")[] = [
  "all",
  "food",
  "personality",
  "friendship",
  "love",
  "habits",
  "random",
];

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  all: Dices,
  food: UtensilsCrossed,
  personality: Drama,
  friendship: HeartHandshake,
  love: Heart,
  habits: AlarmClock,
  random: Dices,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizBuilder({ creatorName, onDone, onCancel }: QuizBuilderProps) {
  const { t } = useLang();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    { text: "", options: ["", "", "", ""], correctIndex: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState<{ code: string } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  /** Admin-curated starter questions from /api/settings (falls back to built-ins). */
  const [customTemplates, setCustomTemplates] = useState<QuestionTemplate[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d || !Array.isArray(d.demoQuestions) || d.demoQuestions.length === 0) return;
        setCustomTemplates(
          d.demoQuestions.map(
            (q: { text: string; options: string[] }) =>
              ({ text: String(q.text), options: q.options, category: "random" }) as QuestionTemplate
          )
        );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const updateQuestion = (qi: number, patch: Partial<DraftQuestion>) => {
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) } : q))
    );
  };

  const addOption = (qi: number) => {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qi && q.options.length < 8 ? { ...q, options: [...q.options, ""] } : q))
    );
  };

  const removeOption = (qi: number, oi: number) => {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qi || q.options.length <= 2) return q;
        const options = q.options.filter((_, j) => j !== oi);
        let correctIndex = q.correctIndex;
        if (correctIndex === oi) correctIndex = 0;
        else if (correctIndex > oi) correctIndex -= 1;
        return { ...q, options, correctIndex };
      })
    );
  };

  const addQuestion = () => {
    setQuestions((qs) => [...qs, { text: "", options: ["", "", "", ""], correctIndex: 0 }]);
  };

  const removeQuestion = (qi: number) => {
    setQuestions((qs) => (qs.length > 1 ? qs.filter((_, i) => i !== qi) : qs));
  };

  const moveQuestion = (qi: number, dir: -1 | 1) => {
    setQuestions((qs) => {
      const to = qi + dir;
      if (to < 0 || to >= qs.length) return qs;
      const next = [...qs];
      [next[qi], next[to]] = [next[to], next[qi]];
      return next;
    });
  };

  const duplicateQuestion = (qi: number) => {
    setQuestions((qs) => {
      const copy = { ...qs[qi], options: [...qs[qi].options] };
      return [...qs.slice(0, qi + 1), copy, ...qs.slice(qi + 1)];
    });
    toast.success(t("Question duplicated"));
  };

  /** Convert a template into a draft question (translated for the UI language). */
  const templateToDraft = (tpl: QuestionTemplate): DraftQuestion => ({
    text: t(tpl.text),
    options: tpl.options.map((o) => t(o)),
    correctIndex: 0,
  });

  const addFromTemplate = (tpl: QuestionTemplate) => {
    let added = false;
    setQuestions((qs) => {
      if (qs.some((q) => q.text.trim() === t(tpl.text))) return qs;
      added = true;
      const filled = [...qs];
      // fill the first empty slot if there is one, otherwise append
      const emptyIdx = filled.findIndex((q) => !q.text.trim());
      const draft = templateToDraft(tpl);
      if (emptyIdx >= 0) filled[emptyIdx] = draft;
      else filled.push(draft);
      return filled;
    });
    setTimeout(() => {
      if (added) {
        toast.success(t("Question added — now tap the circle next to the correct answer!"));
      } else {
        toast.info(t("That question is already in your quiz"));
      }
    }, 0);
  };

  const surpriseMe = () => {
    const pool = shuffle(
      (customTemplates ?? QUESTION_TEMPLATES).filter(
        (tpl) => customTemplates || category === "all" || tpl.category === category
      )
    );
    const picks = pool.slice(0, 3);
    if (picks.length === 0) return;
    setQuestions((qs) => {
      let next = [...qs];
      // drop one trailing fully-empty question if present so we don't stack blanks
      if (next.length > 1 && next.every((q) => !q.text.trim())) next = [next[0]];
      for (const tpl of picks) {
        if (next.some((q) => q.text.trim() === t(tpl.text))) continue;
        const emptyIdx = next.findIndex((q) => !q.text.trim());
        const draft = templateToDraft(tpl);
        if (emptyIdx >= 0) next[emptyIdx] = draft;
        else next.push(draft);
      }
      return next;
    });
    toast.success(t("Starter questions added — mark the correct answers!"));
  };

  const applyPack = (packIdx: number) => {
    const pack = QUICK_PACKS[packIdx];
    setTitle(t(pack.title));
    setQuestions(pack.indices.map((i) => templateToDraft(QUESTION_TEMPLATES[i])));
    toast.success(t("Template loaded — edit anything you like!"));
  };

  const templates = useMemo(() => {
    const base = customTemplates ?? QUESTION_TEMPLATES;
    return customTemplates
      ? base
      : base.filter((tpl) => category === "all" || tpl.category === category);
  }, [category, customTemplates]);

  const readyCount = questions.filter(
    (q) => q.text.trim() && q.options.filter((o) => o.trim()).length >= 2
  ).length;

  const publish = async () => {
    if (!title.trim()) {
      toast.error(t("Give your quiz a catchy title!"));
      return;
    }
    if (questions.some((q) => !q.text.trim())) {
      toast.error(t("One of your questions is missing its text"));
      return;
    }
    if (questions.length > 30) {
      toast.error(t("A quiz can have at most 30 questions"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, questions }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("Could not publish quiz"));
        return;
      }
      setPublished({ code: data.quiz.code });
      setShareOpen(true);
      toast.success(t("Quiz published!"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error(t("Network error — please try again"));
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- success screen ---------------- */
  if (published) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="glass w-full max-w-lg border-border/60 anim-pop shadow-2xl">
          <CardContent className="flex flex-col items-center p-8 text-center sm:p-10">
            <span className="brand-grad brand-glow flex h-18 w-18 items-center justify-center rounded-3xl">
              <PartyPopper className="h-9 w-9 text-white" />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold">{t("Your quiz is live!")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("Send this link to your friends. Their scores will appear in your Results.")}
            </p>

            <div className="mt-6 w-full rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("Quiz code")}
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-widest gradient-text">
                {published.code}
              </p>
            </div>

            <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row">
              <Button
                onClick={() => setShareOpen(true)}
                className="btn-gradient h-12 flex-1 rounded-xl text-sm font-semibold"
              >
                <Share2 className="mr-2 h-4 w-4" /> {t("Share it everywhere")}
              </Button>
              <Button
                variant="outline"
                onClick={onDone}
                className="h-12 flex-1 rounded-xl text-sm font-semibold"
              >
                {t("Go to dashboard")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          code={published.code}
          title={title}
          creatorName={creatorName}
        />
      </main>
    );
  }

  /* ---------------- builder ---------------- */
  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="anim-fade-up">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="mb-4 h-9 rounded-full px-4 text-sm text-muted-foreground"
          >
            {t("Back")}
          </Button>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {t("Build your quiz")}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
            {t(
              "Ask anything about yourself, then secretly mark the right answers. Your friends will guess — and get scored."
            )}
          </p>
        </div>

        {/* quick-start packs (built-in templates only) */}
        {!customTemplates && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Wand2 className="h-3.5 w-3.5" /> {t("Quick start:")}
            </span>
            {QUICK_PACKS.map((pack, i) => (
              <Button
                key={i}
                variant="secondary"
                size="sm"
                onClick={() => applyPack(i)}
                className="h-8 rounded-full px-3.5 text-xs font-medium"
              >
                {t(pack.title)}
              </Button>
            ))}
          </div>
        )}

        {/* title */}
        <Card className="glass mt-6 border-border/60">
          <CardContent className="p-5">
            <Label htmlFor="quiz-title" className="text-sm font-semibold">
              {t("Quiz title")}
            </Label>
            <Input
              id="quiz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("e.g. \"How well do you know me?\"")}
              maxLength={120}
              className="mt-2 h-12 rounded-xl text-base"
            />
          </CardContent>
        </Card>

        {/* question ideas */}
        <Card className="glass mt-4 border-border/60">
          <CardContent className="p-5">
            <button
              type="button"
              onClick={() => setShowIdeas((v) => !v)}
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4.5 w-4.5 text-amber-400" />
                <div>
                  <span className="block text-sm font-semibold">{t("Need ideas?")}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {t("Tap any question to add it — then mark your correct answer.")}
                  </span>
                </div>
              </div>
              <span className="brand-text text-xs font-medium">
                {showIdeas ? t("Hide ideas") : t("Browse ideas")}
              </span>
            </button>

            {showIdeas && (
              <div className="anim-fade-up mt-4">
                {/* category chips (built-in templates only) */}
                {!customTemplates && (
                  <div className="nice-scroll -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2">
                    {CATEGORIES.map((c) => {
                      const active = category === c;
                      const Icon = CATEGORY_ICONS[c];
                      const label = c === "all" ? t("All") : t(CATEGORY_META[c].label);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCategory(c)}
                          className={`flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold transition ${
                            active
                              ? "brand-border brand-chip"
                              : "border-border/60 text-muted-foreground hover:bg-accent/10"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={surpriseMe}
                      className="brand-grad-soft brand-text ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold ring-1 ring-amber-500/40 transition hover:brightness-110"
                    >
                      <Dices className="h-3.5 w-3.5" /> {t("Surprise me")}
                    </button>
                  </div>
                )}

                {/* template cards */}
                <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto nice-scroll pr-1 sm:grid-cols-2">
                  {templates.map((tpl, i) => (
                    <div
                      key={i}
                      className="group flex flex-col justify-between rounded-xl border border-border/60 bg-background/40 p-3 transition hover:brand-border-soft hover:bg-accent/5"
                    >
                      <p className="text-xs font-semibold leading-snug">{t(tpl.text)}</p>
                      <p className="mt-1.5 line-clamp-1 text-[10px] text-muted-foreground">
                        {tpl.options.map((o) => t(o)).join(" · ")}
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => addFromTemplate(tpl)}
                        className="mt-2.5 h-7 w-fit rounded-full px-3 text-[11px] font-semibold"
                      >
                        <Plus className="mr-1 h-3 w-3" /> {t("Add")}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* questions */}
        {questions.map((q, qi) => (
          <div key={qi} className="anim-fade-up">
            <Card className="glass mt-4 border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="brand-grad-soft brand-text flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 text-xs font-bold">
                      Q{qi + 1}
                    </span>
                    <span
                      className={`text-xs ${q.text.trim() ? "text-emerald-400" : "text-muted-foreground"}`}
                    >
                      {q.text.trim() ? t("ready") : t("in progress")}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveQuestion(qi, -1)}
                      disabled={qi === 0}
                      className="h-8 w-8 rounded-full p-0 text-muted-foreground disabled:opacity-25"
                      aria-label={t("Move up")}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveQuestion(qi, 1)}
                      disabled={qi === questions.length - 1}
                      className="h-8 w-8 rounded-full p-0 text-muted-foreground disabled:opacity-25"
                      aria-label={t("Move down")}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateQuestion(qi)}
                      className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
                      aria-label={t("Duplicate question")}
                    >
                      <CopyPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(qi)}
                      disabled={questions.length === 1}
                      className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-destructive disabled:opacity-30"
                      aria-label={t("Remove question")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      {t("Question {n}", { n: qi + 1 })}
                    </Label>
                    <Textarea
                      value={q.text}
                      onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                      placeholder={t("e.g. What is my favourite food?")}
                      maxLength={240}
                      rows={2}
                      className="mt-1.5 resize-none rounded-xl"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground">
                        {t("Options — tap the circle to mark the")}{" "}
                        <span className="brand-text font-bold">{t("correct answer")}</span>
                      </Label>
                    </div>
                    <RadioGroup
                      value={String(q.correctIndex)}
                      onValueChange={(v) => updateQuestion(qi, { correctIndex: Number(v) })}
                      className="mt-2 space-y-2"
                    >
                      {q.options.map((opt, oi) => (
                        <div
                          key={oi}
                          className={`flex items-center gap-2.5 rounded-xl border p-2 transition ${
                            q.correctIndex === oi
                              ? "brand-border bg-accent/5"
                              : "border-border/60"
                          }`}
                        >
                          <RadioGroupItem
                            value={String(oi)}
                            id={`q${qi}-o${oi}`}
                            className="shrink-0"
                          />
                          <Input
                            value={opt}
                            onChange={(e) => updateOption(qi, oi, e.target.value)}
                            placeholder={t("Option {n}", { n: oi + 1 })}
                            maxLength={100}
                            className="h-9 flex-1 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
                          />
                          {q.correctIndex === oi ? (
                            <CheckCircle2 className="brand-text mr-1 h-4.5 w-4.5 shrink-0" />
                          ) : (
                            <Circle className="mr-1 h-4.5 w-4.5 shrink-0 text-transparent" />
                          )}
                          {q.options.length > 2 && (
                            <button
                              onClick={() => removeOption(qi, oi)}
                              className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground/60 transition hover:text-destructive"
                              aria-label={t("Remove option {n}", { n: oi + 1 })}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                    {q.options.length < 8 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addOption(qi)}
                        className="mt-2 h-8 rounded-full px-3 text-xs text-muted-foreground"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> {t("Add option")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* add question */}
        <Button
          variant="outline"
          onClick={addQuestion}
          disabled={questions.length >= 30}
          className="mt-4 h-12 w-full rounded-2xl border-dashed text-sm font-semibold disabled:opacity-40"
        >
          <Plus className="mr-2 h-4 w-4" /> {t("Add another question")}
        </Button>

        {/* sticky publish bar */}
        <div className="sticky bottom-4 mt-6 safe-bottom">
          <div className="glass flex items-center justify-between gap-3 rounded-2xl border border-border/70 p-3 shadow-xl shadow-black/10">
            <div className="flex items-center gap-2 pl-1 text-sm text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
              <span>
                {t("{a} of {b} ready", { a: readyCount, b: questions.length })}
              </span>
            </div>
            <Button
              onClick={publish}
              disabled={saving}
              className="btn-gradient h-11 rounded-xl px-7 text-sm font-semibold"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("Publish quiz")}
            </Button>
          </div>
        </div>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0" />
          {t(
            "Publishing as {name} — your name shows on the quiz. You can change it in Profile.",
            { name: creatorName }
          )}
        </p>
      </div>
    </main>
  );
}
