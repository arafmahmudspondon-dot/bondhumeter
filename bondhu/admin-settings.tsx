"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2, Palette, Type, Save, Link2, Lightbulb, Share2 } from "lucide-react";
import { useLang } from "./i18n";
import { applyAppearance } from "@/lib/appearance";

/**
 * Admin site-settings editor — the owner can change the website theme
 * (accent palette), the site font, the admin contact button link, the
 * share-card line and the builder's starter/demo questions, all from here.
 */

interface SettingsPayload {
  accent: string;
  font: string;
  adminContactUrl: string;
  cardLine: string;
  demoQuestions: { text: string; options: string[] }[];
}

const ACCENT_SWATCHES: { key: string; label: string; css: string }[] = [
  { key: "violet", label: "Violet", css: "linear-gradient(135deg, #e741a8, #8b5cf6)" },
  { key: "ocean", label: "Ocean", css: "linear-gradient(135deg, #0ea5e9, #6366f1)" },
  { key: "sunset", label: "Sunset", css: "linear-gradient(135deg, #f97316, #ec4899)" },
  { key: "emerald", label: "Emerald", css: "linear-gradient(135deg, #10b981, #14b8a6)" },
  { key: "rose", label: "Rose", css: "linear-gradient(135deg, #f43f5e, #d946ef)" },
  { key: "gold", label: "Gold", css: "linear-gradient(135deg, #f59e0b, #eab308)" },
];

const FONT_OPTIONS: { key: string; label: string; preview: string; style: string }[] = [
  { key: "modern", label: "Modern", preview: "Aa", style: "font-sans" },
  { key: "rounded", label: "Rounded", preview: "Aa", style: "font-[ui-rounded,system-ui]" },
  { key: "elegant", label: "Elegant", preview: "Aa", style: "font-serif" },
  { key: "tech", label: "Tech", preview: "Aa", style: "font-mono" },
];

function serializeDemo(list: { text: string; options: string[] }[]): string {
  return list.map((q) => [q.text, ...q.options].join(" | ")).join("\n");
}

export default function AdminSettings() {
  const { t } = useLang();
  const [accent, setAccent] = useState("violet");
  const [font, setFont] = useState("modern");
  const [contactUrl, setContactUrl] = useState("");
  const [cardLine, setCardLine] = useState("");
  const [demoText, setDemoText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: SettingsPayload | null) => {
        if (!alive || !d) return;
        setAccent(d.accent || "violet");
        setFont(d.font || "modern");
        setContactUrl(d.adminContactUrl || "");
        setCardLine(d.cardLine || "");
        setDemoText(serializeDemo(d.demoQuestions || []));
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accent,
          font,
          adminContactUrl: contactUrl,
          cardLine,
          demoQuestionsText: demoText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("Could not save settings"));
        return;
      }
      // apply the new look instantly — no reload needed
      applyAppearance(data.settings.accent, data.settings.font);
      toast.success(t("Settings saved"));
    } catch {
      toast.error(t("Network error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass border-border/60">
        <CardContent className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* ---------- appearance ---------- */}
      <Card className="glass border-border/60">
        <CardContent className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Palette className="brand-text h-4 w-4" /> {t("Website appearance")}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("The whole website — buttons, highlights, share card — instantly matches your pick.")}
          </p>

          <Label className="mt-5 block text-xs font-semibold text-muted-foreground">
            {t("Accent theme")}
          </Label>
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {ACCENT_SWATCHES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setAccent(s.key)}
                aria-label={t(s.label)}
                className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-xs font-semibold transition ${
                  accent === s.key
                    ? "brand-border-soft bg-accent/10"
                    : "border-border/60 text-muted-foreground hover:bg-accent/5"
                }`}
              >
                <span
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundImage: s.css }}
                />
                {t(s.label)}
              </button>
            ))}
          </div>

          <Label className="mt-5 block text-xs font-semibold text-muted-foreground">
            {t("Font")}
          </Label>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFont(f.key)}
                className={`rounded-xl border p-3 text-center transition ${
                  font === f.key
                    ? "brand-border-soft bg-accent/10"
                    : "border-border/60 hover:bg-accent/5"
                }`}
              >
                <span className={`text-2xl font-extrabold ${f.style}`}>{f.preview}</span>
                <span className="mt-1 block text-xs font-semibold">{t(f.label)}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ---------- branding & contact ---------- */}
      <Card className="glass border-border/60">
        <CardContent className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Link2 className="brand-text h-4 w-4" /> {t("Admin contact & share card")}
          </h3>

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="set-contact" className="text-xs font-semibold">
              {t("Admin contact link")}
            </Label>
            <Input
              id="set-contact"
              value={contactUrl}
              onChange={(e) => setContactUrl(e.target.value)}
              placeholder="https://www.instagram.com/your_id/"
              maxLength={300}
              className="h-11 rounded-xl font-mono text-xs"
            />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {t(
                "This opens when someone taps the Contact Admin button on the admin login screen. The raw link is never shown — only the button."
              )}
            </p>
          </div>

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="set-cardline" className="flex items-center gap-1.5 text-xs font-semibold">
              <Share2 className="h-3.5 w-3.5" /> {t("Share card line")}
            </Label>
            <Input
              id="set-cardline"
              value={cardLine}
              onChange={(e) => setCardLine(e.target.value)}
              maxLength={90}
              className="h-11 rounded-xl text-sm"
            />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {t("The teaser line on the share card. Use {name} — it becomes the creator's name.")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ---------- demo questions ---------- */}
      <Card className="glass border-border/60">
        <CardContent className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Lightbulb className="h-4 w-4 text-amber-400" /> {t("Demo questions")}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t(
              "The starter questions every creator sees in the quiz builder. Edit them here — changes go live instantly."
            )}
          </p>
          <Textarea
            value={demoText}
            onChange={(e) => setDemoText(e.target.value)}
            rows={10}
            className="mt-3 rounded-xl font-mono text-xs"
            spellCheck={false}
          />
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            {t(
              "One question per line — separate options with | like: What's my dream place? | Paris | Tokyo | Bali"
            )}
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end pb-4">
        <Button
          onClick={save}
          disabled={saving}
          className="btn-gradient h-11 rounded-xl px-7 text-sm font-semibold"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {t("Save settings")}
        </Button>
      </div>
    </div>
  );
}
