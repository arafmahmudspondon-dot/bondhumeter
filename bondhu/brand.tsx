"use client";

/**
 * BondhuMark — the custom BondhuMeter logo (chat-bubble smiley on a
 * gradient tile, matches the favicon). Used everywhere a quiz/person
 * badge is shown, replacing emojis with a real brand asset.
 */
export function BondhuMark({
  className = "h-9 w-9",
  radius = "rounded-[26%]",
}: {
  className?: string;
  radius?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`${className} ${radius} shadow-md`}
      style={{ boxShadow: "0 4px 14px -6px color-mix(in srgb, var(--bm-from) 45%, transparent)" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--bm-from)" />
          <stop offset="1" stopColor="var(--bm-to)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#bm-g)" />
      <path
        d="M32 14c-7.2 0-13 5.6-13 12.6 0 4 1.9 7.5 4.8 9.9l-2.3 7.2c-.3 1 .8 1.8 1.7 1.3l7.4-4.4c.5.1.9.1 1.4.1 7.2 0 13-5.6 13-12.6S39.2 14 32 14z"
        fill="#fff"
      />
      <circle cx="26" cy="26.5" r="2.4" fill="var(--bm-to)" />
      <circle cx="38" cy="26.5" r="2.4" fill="var(--bm-to)" />
      <path
        d="M26.5 32c1.6 1.8 3.4 2.7 5.5 2.7s3.9-.9 5.5-2.7"
        stroke="var(--bm-to)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Outlined variant for use on gradient backgrounds (share card / OG). */
export function BondhuMarkOutline({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M32 14c-7.2 0-13 5.6-13 12.6 0 4 1.9 7.5 4.8 9.9l-2.3 7.2c-.3 1 .8 1.8 1.7 1.3l7.4-4.4c.5.1.9.1 1.4.1 7.2 0 13-5.6 13-12.6S39.2 14 32 14z"
        fill="rgba(255,255,255,0.22)"
        stroke="#fff"
        strokeWidth="2.5"
      />
      <circle cx="26" cy="26.5" r="2.4" fill="#fff" />
      <circle cx="38" cy="26.5" r="2.4" fill="#fff" />
      <path
        d="M26.5 32c1.6 1.8 3.4 2.7 5.5 2.7s3.9-.9 5.5-2.7"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
