/**
 * Client-side appearance applier — sets html[data-accent] and
 * html[data-font] from the admin's saved site settings, with a
 * localStorage cache so repeat visits paint with zero flash.
 */

export function applyAppearance(accent: string, font: string) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  if (accent) html.dataset.accent = accent;
  if (font) html.dataset.font = font;
  try {
    if (accent) localStorage.setItem("bm_accent", accent);
    if (font) localStorage.setItem("bm_font", font);
  } catch {
    /* private mode */
  }
}

/** Instantly apply the last-known accent/font before the network responds. */
export function applyCachedAppearance() {
  try {
    const accent = localStorage.getItem("bm_accent");
    const font = localStorage.getItem("bm_font");
    if (accent) document.documentElement.dataset.accent = accent;
    if (font) document.documentElement.dataset.font = font;
  } catch {
    /* ignore */
  }
}
