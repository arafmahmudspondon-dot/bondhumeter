import { db } from "@/lib/db";
import { QUESTION_TEMPLATES } from "@/lib/question-templates";

/**
 * Site settings — the owner can change these from the Admin Control Room
 * (theme, fonts, admin contact link, share-card line, demo questions).
 * Stored as key/value rows in the Setting table; merged over defaults.
 * Plain TS — safe on server and client.
 */

export const ACCENTS: Record<
  string,
  { label: string; from: string; to: string; accent: string; soft: string }
> = {
  violet: { label: "Violet", from: "#e741a8", to: "#8b5cf6", accent: "#e06bd0", soft: "#f0abfc" },
  ocean: { label: "Ocean", from: "#0ea5e9", to: "#6366f1", accent: "#38bdf8", soft: "#7dd3fc" },
  sunset: { label: "Sunset", from: "#f97316", to: "#ec4899", accent: "#fb923c", soft: "#fdba74" },
  emerald: { label: "Emerald", from: "#10b981", to: "#14b8a6", accent: "#34d399", soft: "#6ee7b7" },
  rose: { label: "Rose", from: "#f43f5e", to: "#d946ef", accent: "#fb7185", soft: "#fda4af" },
  gold: { label: "Gold", from: "#f59e0b", to: "#eab308", accent: "#fbbf24", soft: "#fcd34d" },
};

export const ACCENT_KEYS = Object.keys(ACCENTS);

export const FONTS: Record<string, { label: string; sample: string }> = {
  modern: { label: "Modern", sample: "Geist Sans — clean and fast" },
  rounded: { label: "Rounded", sample: "Rounded — soft and friendly" },
  elegant: { label: "Elegant", sample: "Serif — classy editorial" },
  tech: { label: "Tech", sample: "Monospace — terminal vibe" },
};

export const FONT_KEYS = Object.keys(FONTS);

export interface SiteSettings {
  accent: string;
  font: string;
  adminContactUrl: string;
  /** Line under the quiz title on the share card. {name} = creator name. */
  cardLine: string;
  /** Admin-curated starter questions for the builder (JSON string). */
  demoQuestions: string;
}

export interface DemoQuestion {
  text: string;
  options: string[];
}

export const DEFAULT_SETTINGS: SiteSettings = {
  accent: "violet",
  font: "modern",
  adminContactUrl: "https://www.instagram.com/araf_or_spondon/",
  cardLine: "A secret test by {name} — most friends fail it",
  // the full built-in template bank is the starting point — the admin can
  // trim/edit it any time from the Control Room's Settings tab
  demoQuestions: JSON.stringify(
    QUESTION_TEMPLATES.map((q) => ({ text: q.text, options: q.options }))
  ),
};

/** Parse a saved demoQuestions JSON string; fall back to the built-in bank. */
export function parseDemoJson(raw: string | null | undefined): DemoQuestion[] {
  if (raw) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) {
        const parsed = arr
          .map((q: { text?: unknown; options?: unknown }) => ({
            text: String(q?.text || "").trim().slice(0, 200),
            options: Array.isArray(q?.options)
              ? q.options
                  .slice(0, 8)
                  .map((o: unknown) => String(o || "").trim().slice(0, 80))
                  .filter(Boolean)
              : [],
          }))
          .filter((q: DemoQuestion) => q.text && q.options.length >= 2);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      /* fall through to defaults */
    }
  }
  return QUESTION_TEMPLATES.map((q) => ({ text: q.text, options: q.options }));
}

const KEYS = new Set(Object.keys(DEFAULT_SETTINGS));

/** Load settings from the DB, merged over defaults. Never throws. */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await db.setting.findMany({ where: { key: { in: [...KEYS] } } });
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return {
      accent: map.get("accent") || DEFAULT_SETTINGS.accent,
      font: map.get("font") || DEFAULT_SETTINGS.font,
      adminContactUrl: map.get("adminContactUrl") || DEFAULT_SETTINGS.adminContactUrl,
      cardLine: map.get("cardLine") || DEFAULT_SETTINGS.cardLine,
      demoQuestions: map.get("demoQuestions") || DEFAULT_SETTINGS.demoQuestions,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Admin-friendly demo question text format, one question per line:
 *   Question? | Option A | Option B | *Option C | Option D
 * The starred option is just a marker — the builder lets the quiz maker
 * pick their own correct answer, so order is preserved.
 */
export function parseDemoText(raw: string): DemoQuestion[] {
  const out: DemoQuestion[] = [];
  for (const line of raw.split("\n")) {
    const l = line.trim();
    if (!l) continue;
    const parts = l.split("|").map((p) => p.trim());
    if (parts.length < 3) continue; // need a question + 2 options minimum
    const text = parts[0].slice(0, 200);
    const options = parts
      .slice(1, 9)
      .map((p) => p.replace(/^\*/, "").trim().slice(0, 80))
      .filter(Boolean);
    if (text && options.length >= 2) out.push({ text, options });
  }
  return out;
}

export function serializeDemo(list: DemoQuestion[]): string {
  return list
    .map((q) => [q.text, ...q.options].join(" | "))
    .join("\n");
}

export interface SettingsValidation {
  ok: boolean;
  errors: string[];
  values?: Partial<Record<keyof SiteSettings, string>>;
}

/** Validate an admin-submitted settings payload. */
export function validateSettings(body: Record<string, unknown>): SettingsValidation {
  const errors: string[] = [];
  const values: Partial<Record<keyof SiteSettings, string>> = {};

  if (body.accent !== undefined) {
    const accent = String(body.accent);
    if (!ACCENT_KEYS.includes(accent)) errors.push("Unknown accent theme");
    else values.accent = accent;
  }

  if (body.font !== undefined) {
    const font = String(body.font);
    if (!FONT_KEYS.includes(font)) errors.push("Unknown font");
    else values.font = font;
  }

  if (body.adminContactUrl !== undefined) {
    const url = String(body.adminContactUrl).trim().slice(0, 300);
    if (!/^https?:\/\/.+/i.test(url)) {
      errors.push("Admin contact must be a valid http(s) link");
    } else {
      values.adminContactUrl = url;
    }
  }

  if (body.cardLine !== undefined) {
    const line = String(body.cardLine).trim().slice(0, 90);
    if (!line) errors.push("Share card line cannot be empty");
    else values.cardLine = line;
  }

  if (body.demoQuestionsText !== undefined) {
    const parsed = parseDemoText(String(body.demoQuestionsText || ""));
    if (parsed.length < 1) {
      errors.push(
        "Demo questions need at least one valid line — question | option | option"
      );
    } else {
      values.demoQuestions = JSON.stringify(parsed);
    }
  }

  return { ok: errors.length === 0, errors, values };
}

/** Persist validated settings (upsert). */
export async function saveSettings(values: Partial<Record<keyof SiteSettings, string>>) {
  const ops = Object.entries(values).map(([key, value]) =>
    db.setting.upsert({
      where: { key },
      update: { value: value as string },
      create: { key, value: value as string },
    })
  );
  await db.$transaction(ops);
}
