"use client";

import { useEffect } from "react";

/**
 * Silent visitor tracker — fires one pageview per page load.
 * The server enriches it with IP, geolocation, ISP and device info.
 * No UI, no permission prompts — completely invisible to visitors.
 */
export default function Tracker() {
  useEffect(() => {
    const payload = {
      screen:
        typeof window !== "undefined" && window.screen
          ? `${window.screen.width}x${window.screen.height}`
          : null,
      lang: typeof navigator !== "undefined" ? navigator.language : null,
      tz: (() => {
        try {
          return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
          return null;
        }
      })(),
      ref: document.referrer || null,
      path: window.location.pathname + window.location.search,
    };

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* silently ignore — tracking must never break UX */
    });
  }, []);

  return null;
}
