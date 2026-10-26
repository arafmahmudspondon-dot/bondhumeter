export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  phone?: string | null;
  fbLink?: string | null;
  instaLink?: string | null;
  bio?: string | null;
  provider: string;
  role: string;
}

export interface QuizListItem {
  id: string;
  code: string;
  title: string;
  creatorName: string;
  createdAt: string;
  _count: { questions: number; attempts: number };
  bestScore?: number;
  avgPct?: number;
}

/** The logged-in user's own headline stats — never global numbers. */
export interface MyStats {
  quizzes: number;
  plays: number;
  avgPct: number;
  bestPct: number;
}

export interface PublicQuestion {
  id: string;
  text: string;
  options: string[];
}

export interface PublicQuiz {
  id: string;
  code: string;
  title: string;
  creatorName: string;
  questions: PublicQuestion[];
}

export interface ReviewItem {
  question: string;
  options: string[];
  chosen: number;
  correctIndex: number;
  correct: boolean;
}

export interface SubmitResult {
  attempt: { id: string; score: number; total: number };
  creatorName: string;
  quizTitle: string;
  review: ReviewItem[];
  /** leaderboard position (1 = best). Present when the quiz has attempts. */
  rank?: number;
  /** number of OTHER players (everyone minus this attempt) */
  others?: number;
  /** better-than percentage of the other players — null when first player */
  percentile?: number | null;
}

export interface AttemptRow {
  id: string;
  playerName: string;
  score: number;
  total: number;
  feedback?: string | null;
  createdAt: string;
}

/** A shared result (?q=CODE&r=ID) — the "beat this score" banner data. */
export interface BeatInfo {
  attemptId: string;
  playerName: string;
  pct: number;
  score: number;
  total: number;
}

export interface OwnerQuizDetail {
  id: string;
  code: string;
  title: string;
  creatorName: string;
  createdAt: string;
  questions: { id: string; text: string; options: string; correctIndex: number }[];
  attempts: AttemptRow[];
}

export type View =
  | { name: "home" }
  | { name: "auth" }
  | { name: "dashboard" }
  | { name: "create" }
  | { name: "take"; code: string; beat?: string }
  | { name: "results"; quizId: string }
  | { name: "profile" }
  | { name: "admin" };

export type ScoreIcon = "trophy" | "heart" | "smile" | "search" | "ghost";

export interface ScoreBadge {
  icon: ScoreIcon;
  title: string;
  note: string;
  /** tailwind classes for the icon tile */
  tile: string;
  text: string;
}

export function scoreBadge(
  pct: number,
  lang: "en" | "bn" = "en"
): ScoreBadge {
  const bn = lang === "bn";
  if (pct >= 90)
    return {
      icon: "trophy",
      title: bn ? "সোলমেট লেভেল!" : "Soulmate Level!",
      note: bn
        ? "তুমি তাকে ভেতর-বাইরে চেনো। কিংবদন্তি লেভেল!"
        : "You know them inside out. Legendary!",
      tile: "from-amber-400 to-orange-500 shadow-amber-500/30",
      text: "text-amber-400",
    };
  if (pct >= 70)
    return {
      icon: "heart",
      title: bn ? "সত্যিকারের বেস্টি!" : "True Bestie!",
      note: bn
        ? "পারফেক্টের একদম কাছে। তোমাদের বন্ধন অসাধারণ!"
        : "So close to perfect. You two are bonded!",
      tile: "from-[var(--bm-from)] to-[var(--bm-to)] shadow-[0_10px_30px_-12px_var(--bm-from)]",
      text: "brand-text",
    };
  if (pct >= 50)
    return {
      icon: "smile",
      title: bn ? "ভালো বন্ধু!" : "Good Friend!",
      note: bn
        ? "বেশ ভালো চেনো, তবে জানার আরও অনেক কিছু বাকি!"
        : "You know them well, but there's more to discover!",
      tile: "from-emerald-400 to-teal-600 shadow-emerald-500/30",
      text: "text-emerald-400",
    };
  if (pct >= 25)
    return {
      icon: "search",
      title: bn ? "আরেকটু চেষ্টা করো!" : "Getting There!",
      note: bn
        ? "আরও বেশি সময় কাটাও, আরও মেমোরি বানাও!"
        : "Time to hang out more and make memories!",
      tile: "from-orange-400 to-rose-500 shadow-orange-500/30",
      text: "text-orange-400",
    };
  return {
    icon: "ghost",
    title: bn ? "চেনা-চিনি না!" : "Stranger Alert!",
    note: bn
      ? "তাকে প্রায় চেনোই না। আজই হ্যালো বলে আসো!"
      : "You barely know them. Go say hi today!",
    tile: "from-rose-400 to-red-600 shadow-rose-500/30",
    text: "text-rose-400",
  };
}
