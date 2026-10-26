/**
 * BondhuMeter brand identity — ONE consistent look for every quiz card,
 * share preview and OG image. No per-quiz themes, no emojis: the brand
 * mark and palette are identical for everyone.
 * Plain TS — safe on server and client.
 */

export const BRAND = {
  name: "BondhuMeter",
  tagline: "How well do your friends know you?",
  /** Gradient stops for server-rendered contexts (OG image fallback) —
   *  the live UI uses CSS vars from globals.css so the accent can be
   *  changed by the admin without a redeploy. */
  from: "#e741a8",
  to: "#8b5cf6",
} as const;
