"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  ArrowLeft,
  Loader2,
  Sparkles,
  Info,
  Eye,
  EyeOff,
  UserRound,
  AtSign,
  Lock,
  ShieldCheck,
  LogIn,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import type { SessionUser } from "./types";
import { useLang } from "./i18n";

interface AuthViewProps {
  googleEnabled: boolean;
  onSuccess: (user: SessionUser) => void;
  onBack: () => void;
}

function pwStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score += 34;
  if (pw.length >= 12) score += 22;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 14;
  if (/\d/.test(pw)) score += 15;
  if (/[^A-Za-z0-9]/.test(pw)) score += 15;
  score = Math.min(score, 100);
  if (score >= 85) return { score, label: "Strong", color: "bg-emerald-500" };
  if (score >= 60) return { score, label: "Good", color: "bg-lime-500" };
  if (score >= 34) return { score, label: "Weak", color: "bg-amber-500" };
  return { score, label: "Too short", color: "bg-rose-500" };
}

export default function AuthView({ googleEnabled, onSuccess, onBack }: AuthViewProps) {
  const router = useRouter();
  const { t } = useLang();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => pwStrength(password), [password]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(t("Please enter your email"));
      return;
    }
    if (!password) {
      toast.error(t("Please enter a password"));
      return;
    }
    if (mode === "signup") {
      if (name.trim().length < 2) {
        toast.error(t("Please enter your name (at least 2 characters)"));
        return;
      }
      if (password.length < 8) {
        toast.error(t("Password must be at least 8 characters"));
        return;
      }
      if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        toast.error(t("Password needs at least one letter and one number"));
        return;
      }
      if (password !== confirm) {
        toast.error(t("Passwords do not match"));
        return;
      }
    }
    setLoading(true);
    try {
      const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login" ? { email, password } : { email, password, name }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("Login failed"));
        return;
      }
      toast.success(
        mode === "login"
          ? t("Welcome back, {name}!", { name: data.user.name || t("Friend") })
          : t("Account created — welcome, {name}!", { name: data.user.name || t("Friend") })
      );
      onSuccess(data.user);
    } catch {
      toast.error(t("Network error — please try again"));
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    router.push("/api/auth/google");
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md anim-fade-up">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 h-10 rounded-full px-4 text-sm text-muted-foreground"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> {t("Back")}
        </Button>

        <Card className="glass border-border/60 shadow-2xl">
          <CardHeader className="text-center">
            <span className="brand-grad brand-glow mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl">
              <Sparkles className="h-7 w-7 text-white" />
            </span>
            <CardTitle className="text-2xl font-extrabold">{t("Welcome to BondhuMeter")}</CardTitle>
            <CardDescription>
              {t("Create quizzes about yourself and see who knows you best.")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Log in / Sign up switch */}
            <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-muted/60 p-1.5">
              {(
                [
                  { id: "login", icon: <LogIn className="h-3.5 w-3.5" />, label: t("Log in") },
                  { id: "signup", icon: <UserPlus className="h-3.5 w-3.5" />, label: t("Sign up") },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMode(tab.id)}
                  className={`flex h-9 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-all ${
                    mode === tab.id
                      ? "brand-grad text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {googleEnabled && (
              <>
                <Button
                  variant="outline"
                  onClick={googleLogin}
                  className="h-12 w-full rounded-xl text-sm font-semibold"
                >
                  <svg className="mr-2.5 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  {t("Continue with Google")}
                </Button>
                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">{t("or use email")}</span>
                  <Separator className="flex-1" />
                </div>
              </>
            )}

            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="auth-name">{t("Your name")}</Label>
                  <div className="relative">
                    <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="auth-name"
                      placeholder={t("e.g. Rahim")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 rounded-xl pl-10"
                      maxLength={80}
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="auth-email">{t("Email")}</Label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="auth-password">{t("Password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="auth-password"
                    type={showPw ? "text" : "password"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder={
                      mode === "login"
                        ? t("Your password")
                        : t("8+ characters with a letter and a number")
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl pl-10 pr-11"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={t("Show password")}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === "signup" && password.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <Progress value={strength.score} className="h-1.5 flex-1" />
                    <span className={`text-[10px] font-bold ${strength.color.replace("bg-", "text-")}`}>
                      {t(strength.label)}
                    </span>
                  </div>
                )}
              </div>

              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="auth-confirm">{t("Confirm password")}</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="auth-confirm"
                      type={showPw ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={t("Type the same password again")}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="h-12 rounded-xl pl-10"
                      required
                      minLength={8}
                    />
                  </div>
                  {confirm.length > 0 && (
                    <p
                      className={`flex items-center gap-1 text-xs ${
                        confirm === password ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {confirm === password ? (
                        <><Check className="h-3.5 w-3.5" /> {t("Passwords match")}</>
                      ) : (
                        <><X className="h-3.5 w-3.5" /> {t("Passwords do not match")}</>
                      )}
                    </p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="btn-gradient h-12 w-full rounded-xl text-sm font-semibold"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : mode === "login" ? (
                  <LogIn className="mr-2 h-4 w-4" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                {mode === "login" ? t("Log in") : t("Create my account")}
              </Button>
            </form>

            {!googleEnabled && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-amber-500">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {t("Google sign-in gets activated the moment")} <b>GOOGLE_CLIENT_ID</b> {t("and")}{" "}
                  <b>GOOGLE_CLIENT_SECRET</b> {t("are added to the server .env — meanwhile, email + password sign-in keeps everything working.")}
                </span>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground">
              {t("By continuing you agree to keep it fun and friendly")}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
