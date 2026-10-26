"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import Nav, { AdminLink, Logo } from "@/components/bondhu/nav";
import Tracker from "@/components/bondhu/tracker";
import HomeView from "@/components/bondhu/home";
import { BondhuMark } from "@/components/bondhu/brand";
import { LangProvider, useLang } from "@/components/bondhu/i18n";
import { applyAppearance, applyCachedAppearance } from "@/lib/appearance";
import type { SessionUser, View } from "@/components/bondhu/types";

/**
 * Heavy views are lazy-loaded (ssr: false) so the landing page paints
 * instantly — only the home view ships in the initial bundle.
 */
function ViewLoader() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground/25 border-t-[var(--bm-accent)]" />
        <p className="text-xs text-muted-foreground">…</p>
      </div>
    </div>
  );
}

const AuthView = dynamic(() => import("@/components/bondhu/auth-view"), {
  ssr: false,
  loading: ViewLoader,
});
const Dashboard = dynamic(() => import("@/components/bondhu/dashboard"), {
  ssr: false,
  loading: ViewLoader,
});
const QuizBuilder = dynamic(() => import("@/components/bondhu/quiz-builder"), {
  ssr: false,
  loading: ViewLoader,
});
const QuizTaker = dynamic(() => import("@/components/bondhu/quiz-taker"), {
  ssr: false,
  loading: ViewLoader,
});
const QuizResults = dynamic(() => import("@/components/bondhu/quiz-results"), {
  ssr: false,
  loading: ViewLoader,
});
const ProfileView = dynamic(() => import("@/components/bondhu/profile"), {
  ssr: false,
  loading: ViewLoader,
});
const AdminPanel = dynamic(() => import("@/components/bondhu/admin-panel"), {
  ssr: false,
  loading: ViewLoader,
});

/** Read the current view from URL query params. */
function viewFromUrl(): View {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q) {
    const r = params.get("r");
    return { name: "take", code: q.trim(), beat: r ? r.trim() : undefined };
  }
  const view = params.get("view");
  switch (view) {
    case "auth":
      return { name: "auth" };
    case "dashboard":
      return { name: "dashboard" };
    case "create":
      return { name: "create" };
    case "results":
      return { name: "results", quizId: params.get("id") || "" };
    case "profile":
      return { name: "profile" };
    case "admin":
      return { name: "admin" };
    default:
      return { name: "home" };
  }
}

/** Convert a view into URL query params (kept on the single / route). */
function urlFromView(view: View): string {
  switch (view.name) {
    case "take":
      return `/?q=${encodeURIComponent(view.code)}${view.beat ? `&r=${encodeURIComponent(view.beat)}` : ""}`;
    case "results":
      return `/?view=results&id=${encodeURIComponent(view.quizId)}`;
    case "home":
      return "/";
    default:
      return `/?view=${view.name}`;
  }
}

export default function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  );
}

function AppInner() {
  const { t } = useLang();
  const [view, setView] = useState<View>({ name: "home" });
  const [user, setUser] = useState<SessionUser | null>(null);
  const [booting, setBooting] = useState(true);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const handledAuthError = useRef(false);

  const navigate = useCallback((next: View) => {
    setView(next);
    const url = urlFromView(next);
    window.history.pushState({ view: next }, "", url);
    window.scrollTo({ top: 0 });
  }, []);

  // initial boot: session + url state + admin-set appearance
  useEffect(() => {
    setView(viewFromUrl());
    applyCachedAppearance();

    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUser(data.user);
        setGoogleEnabled(Boolean(data.googleEnabled));
      } catch {
        /* offline — continue as guest */
      } finally {
        setBooting(false);
      }

      // site appearance (accent theme + font) chosen by the admin
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const s = await res.json();
          applyAppearance(s.accent, s.font);
        }
      } catch {
        /* keep cached/default look */
      }

      // surface google auth errors from the OAuth redirect
      const params = new URLSearchParams(window.location.search);
      const authError = params.get("authError");
      if (authError && !handledAuthError.current) {
        handledAuthError.current = true;
        toast.error(
          authError === "google_unavailable"
            ? t("Google sign-in is not configured on this server yet — use email sign-in instead.")
            : t("Google sign-in failed — please try email sign-in."),
          { duration: 7000 }
        );
        // clean the param
        window.history.replaceState({}, "", "/");
      }
      if (params.get("welcome") === "1") {
        toast.success(t("Welcome! Let's find out who knows you best"));
        window.history.replaceState({}, "", "/?view=dashboard");
      }
    })();
  }, []);

  // browser back/forward
  useEffect(() => {
    const onPop = () => setView(viewFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    toast.success(t("Logged out — see you soon!"));
    navigate({ name: "home" });
  }, [navigate, t]);

  const requireAuth = useCallback(
    (target: View) => {
      if (user) {
        navigate(target);
      } else {
        navigate({ name: "auth" });
      }
    },
    [user, navigate]
  );

  if (booting) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="aurora" />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="anim-float">
              <BondhuMark className="h-14 w-14 rounded-3xl" />
            </span>
            <p className="text-sm text-muted-foreground">{t("Loading BondhuMeter…")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="aurora" />
      <Tracker />

      <Nav
        user={user}
        onNav={(v) => {
          if (v === "dashboard") requireAuth({ name: "dashboard" });
          else if (v === "profile") requireAuth({ name: "profile" });
          else navigate({ name: v });
        }}
        onLogout={logout}
      />

      {view.name === "home" && (
        <HomeView
          loggedIn={Boolean(user)}
          onNav={(v) => {
            if (v === "create") requireAuth({ name: "create" });
            else if (v === "dashboard") requireAuth({ name: "dashboard" });
            else navigate({ name: "auth" });
          }}
          onTakeCode={(code) => navigate({ name: "take", code: code.trim() })}
        />
      )}

      {view.name === "auth" && (
        <AuthView
          googleEnabled={googleEnabled}
          onBack={() => navigate({ name: "home" })}
          onSuccess={(u) => {
            setUser(u);
            navigate({ name: "dashboard" });
          }}
        />
      )}

      {view.name === "dashboard" && user && (
        <Dashboard
          user={user}
          onCreate={() => navigate({ name: "create" })}
          onViewResults={(quizId) => navigate({ name: "results", quizId })}
          onOpenProfile={() => navigate({ name: "profile" })}
        />
      )}

      {view.name === "dashboard" && !user && (
        <RequireLogin onLogin={() => navigate({ name: "auth" })} />
      )}

      {view.name === "create" && user && (
        <QuizBuilder
          creatorName={user.name || user.email.split("@")[0]}
          onDone={() => navigate({ name: "dashboard" })}
          onCancel={() => navigate({ name: "dashboard" })}
        />
      )}

      {view.name === "create" && !user && (
        <RequireLogin onLogin={() => navigate({ name: "auth" })} />
      )}

      {view.name === "take" && (
        <QuizTaker
          code={view.code}
          beat={view.beat}
          onBrowseMore={() => navigate({ name: "home" })}
        />
      )}

      {view.name === "results" && user && (
        <QuizResults quizId={view.quizId} onBack={() => navigate({ name: "dashboard" })} />
      )}

      {view.name === "results" && !user && (
        <RequireLogin onLogin={() => navigate({ name: "auth" })} />
      )}

      {view.name === "profile" && user && (
        <ProfileView
          user={user}
          onUpdate={(u) => setUser(u)}
          onBack={() => navigate({ name: "dashboard" })}
        />
      )}

      {view.name === "profile" && !user && (
        <RequireLogin onLogin={() => navigate({ name: "auth" })} />
      )}

      {view.name === "admin" && <AdminPanel />}

      {/* footer — sticky bottom via flex parent + mt-auto */}
      <footer className="mt-auto border-t border-border/60 safe-bottom">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-7 sm:flex-row sm:px-6">
          <Logo onClick={() => navigate({ name: "home" })} />
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            {t("Made for besties · Knows your squad better than you do")}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => requireAuth({ name: "create" })}
              className="text-xs text-muted-foreground transition hover:text-foreground"
            >
              {t("Create quiz")}
            </button>
            <AdminLink onClick={() => navigate({ name: "admin" })} />
          </div>
        </div>
      </footer>
    </div>
  );
}

function RequireLogin({ onLogin }: { onLogin: () => void }) {
  const { t } = useLang();
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="glass w-full max-w-sm rounded-3xl border border-border/60 p-8 text-center anim-pop">
        <span className="brand-grad mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
          <Lock className="h-6 w-6 text-white" />
        </span>
        <h2 className="mt-4 text-lg font-bold">{t("Sign in first")}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("You need an account to open your dashboard, build quizzes and see results.")}
        </p>
        <button
          onClick={onLogin}
          className="btn-gradient mt-6 h-11 w-full rounded-xl text-sm font-semibold"
        >
          {t("Sign in now")}
        </button>
      </div>
    </main>
  );
}
