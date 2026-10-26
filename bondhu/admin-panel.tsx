"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "./i18n";
import AdminOverview from "./admin-overview";
import AdminSettings from "./admin-settings";
import {
  type AdminData,
  type UserRow,
  EmptyCard,
  downloadCsv,
} from "./admin-utils";
import {
  ShieldCheck,
  Lock,
  Loader2,
  RefreshCw,
  Eye,
  Users,
  HelpCircle,
  Gamepad2,
  Trash2,
  LogOut,
  Globe,
  MapPin,
  Wifi,
  Monitor,
  Search,
  Crown,
  EyeOff,
  Download,
  LayoutDashboard,
  KeyRound,
  Clock,
  Phone,
  ExternalLink,
  UserRound,
  MessageSquare,
  Instagram,
  Palette,
  Type,
  Save,
  Link2,
  Lightbulb,
  Settings2,
} from "lucide-react";

/* ================= ADMIN LOGIN GATE ================= */
function AdminLogin({ onOk }: { onOk: () => void }) {
  const { t } = useLang();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contactUrl, setContactUrl] = useState<string | null>(null);

  // the owner's contact button (link itself is never displayed)
  useEffect(() => {
    let alive = true;
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.adminContactUrl) setContactUrl(d.adminContactUrl);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onOk();
      } else {
        toast.error(t("Wrong admin password"));
      }
    } catch {
      toast.error(t("Network error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="glass w-full max-w-sm border-border/60 anim-pop">
        <CardContent className="p-7 text-center">
          <span className="brand-grad brand-glow mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
            <ShieldCheck className="h-7 w-7 text-white" />
          </span>
          <h1 className="mt-4 text-xl font-extrabold">{t("Admin access")}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("Enter the admin password to open the control room.")}
          </p>
          <form onSubmit={login} className="mt-6 space-y-3.5">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("Admin password")}
                autoFocus
                className="h-12 rounded-xl pl-10 pr-11"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={t("Show password")}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="btn-gradient h-12 w-full rounded-xl text-sm font-semibold"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("Unlock dashboard")}
            </Button>
          </form>
          <div className="mt-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border/70" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {t("Need access?")}
            </span>
            <span className="h-px flex-1 bg-border/70" />
          </div>
          {contactUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(contactUrl, "_blank", "noopener,noreferrer")}
              className="mt-3.5 h-11 w-full rounded-xl text-sm font-semibold"
            >
              <Instagram className="mr-2 h-4 w-4 text-rose-400" />
              {t("Contact Admin")}
            </Button>
          )}
          <p className="mt-3.5 text-[11px] leading-relaxed text-muted-foreground">
            {t("Message the admin to get your dashboard password.")}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

/* ================= MAIN PANEL ================= */
export default function AdminPanel() {
  const { t, locale } = useLang();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [detail, setDetail] = useState<UserRow | null>(null);
  const loadRef = useRef<() => void>(() => {});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data");
      if (res.status === 403) {
        setAuthed(false);
        return;
      }
      const json = await res.json();
      setAuthed(true);
      setData(json);
    } catch {
      toast.error(t("Failed to load admin data"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  // keep latest load in a ref so the interval never goes stale
  loadRef.current = load;
  useEffect(() => {
    if (!autoRefresh || authed !== true) return;
    const id = setInterval(() => loadRef.current(), 30000);
    return () => clearInterval(id);
  }, [autoRefresh, authed]);

  const del = async (type: string, id?: string) => {
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      if (res.ok) {
        toast.success(t("Deleted"));
        setDetail(null);
        await load();
      } else {
        toast.error(t("Delete failed"));
      }
    } catch {
      toast.error(t("Delete failed"));
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  };

  if (authed === false) {
    return <AdminLogin onOk={() => load()} />;
  }

  if (authed === null || (!data && loading)) {
    return (
      <main className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  const s = data!.stats;
  const q = search.trim().toLowerCase();
  const match = (...fields: (string | null | undefined)[]) =>
    !q || fields.some((f) => (f || "").toLowerCase().includes(q));

  const visitors = data!.visitors.filter((v) =>
    match(v.ip, v.city, v.country, v.isp, v.browser, v.os, v.device, v.user?.email, v.path, v.sessionId)
  );
  const users = data!.users.filter((u) =>
    match(u.email, u.name, u.phone, u.fbLink, u.instaLink, u.bio, u.provider)
  );
  const quizzes = data!.quizzes.filter((qr) =>
    match(qr.title, qr.code, qr.creatorName, qr.user?.email)
  );
  const attempts = data!.attempts.filter((a) =>
    match(a.playerName, a.quiz?.title, a.quiz?.code, a.quiz?.creatorName)
  );

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleString(locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  /* ---------- CSV builders ---------- */
  const stamp = new Date().toISOString().slice(0, 10);
  const csvVisitors = () =>
    downloadCsv(`bondhumeter-visitors-${stamp}.csv`, [
      ["When", "Account", "IP", "City", "Region", "Country", "ISP", "Device", "Browser", "OS", "Screen", "Language", "Timezone", "Page", "Referer"],
      ...visitors.map((v) => [
        v.createdAt, v.user?.email || "Guest", v.ip, v.city, v.region, v.country, v.isp,
        v.device, v.browser, v.os, v.screen, v.language, v.timezone, v.path, v.referer,
      ]),
    ]);
  const csvUsers = () =>
    downloadCsv(`bondhumeter-users-${stamp}.csv`, [
      ["Name", "Email", "Provider", "Has password", "Phone", "Facebook", "Instagram", "Bio", "Quizzes", "Visits", "Last login", "Joined", "Last IP", "Last place"],
      ...users.map((u) => [
        u.name, u.email, u.provider, u.hasPassword ? "yes" : "no", u.phone, u.fbLink, u.instaLink,
        u.bio, u._count.quizzes, u._count.visits, u.lastLoginAt, u.createdAt,
        u.visits[0]?.ip || "", [u.visits[0]?.city, u.visits[0]?.country].filter(Boolean).join(", "),
      ]),
    ]);
  const csvQuizzes = () =>
    downloadCsv(`bondhumeter-quizzes-${stamp}.csv`, [
      ["Title", "Code", "Creator", "Account", "Questions", "Plays", "Created"],
      ...quizzes.map((qr) => [
        qr.title, qr.code, qr.creatorName, qr.user?.email || "", qr._count.questions, qr._count.attempts, qr.createdAt,
      ]),
    ]);
  const csvAttempts = () =>
    downloadCsv(`bondhumeter-plays-${stamp}.csv`, [
      ["Player", "Quiz", "Code", "Creator", "Score", "Total", "Percent", "When"],
      ...attempts.map((a) => [
        a.playerName, a.quiz?.title || "", a.quiz?.code || "", a.quiz?.creatorName || "",
        a.score, a.total, Math.round((a.score / Math.max(a.total, 1)) * 100) + "%", a.createdAt,
      ]),
    ]);

  const tabExtras = (onCsv: () => void, csvLabel: string) => (
    <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onCsv}
        className="h-9 rounded-full px-4 text-xs font-semibold"
      >
        <Download className="mr-1.5 h-3.5 w-3.5" /> {csvLabel}
      </Button>
    </div>
  );

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-10">
        {/* header */}
        <div className="anim-fade-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="brand-grad brand-glow flex h-11 w-11 items-center justify-center rounded-2xl">
              <ShieldCheck className="h-6 w-6 text-white" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                {t("Admin Control Room")}
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {t("Every visit, user, quiz and score — full visibility.")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-10 items-center gap-2.5 rounded-full border border-border/60 bg-muted/40 px-4 text-xs font-medium">
              <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${autoRefresh ? "animate-spin brand-text" : ""}`} style={autoRefresh ? { animationDuration: "3s" } : undefined} />
              {t("Auto-refresh")}
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} aria-label={t("Auto-refresh")} />
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={load}
              disabled={loading}
              className="h-10 rounded-full px-4 text-xs font-semibold"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {t("Refresh")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="h-10 rounded-full px-4 text-xs text-muted-foreground"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> {t("Exit")}
            </Button>
          </div>
        </div>

        {/* primary stat cards */}
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { icon: <Eye className="h-4.5 w-4.5" />, label: t("Total visits"), value: s.totalVisitors, tint: "brand-chip" },
            { icon: <Globe className="h-4.5 w-4.5" />, label: t("Unique visitors"), value: s.uniqueVisitors, tint: "text-violet-400 bg-violet-500/15" },
            { icon: <Users className="h-4.5 w-4.5" />, label: t("Registered users"), value: s.totalUsers, tint: "text-pink-400 bg-pink-500/15" },
            { icon: <HelpCircle className="h-4.5 w-4.5" />, label: t("Quizzes created"), value: s.totalQuizzes, tint: "text-amber-400 bg-amber-500/15" },
            { icon: <Gamepad2 className="h-4.5 w-4.5" />, label: t("Quiz plays"), value: s.totalAttempts, tint: "text-emerald-400 bg-emerald-500/15" },
          ].map((c, i) => (
            <Card
              key={i}
              className="glass anim-fade-up border-border/60"
              style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}
            >
              <CardContent className="p-4">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.tint}`}>
                  {c.icon}
                </span>
                <p className="mt-3 text-2xl font-extrabold tabular-nums">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* search + tabs */}
        <div className="relative mt-7 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search everything — email, IP, city, quiz…")}
            className="h-11 rounded-xl pl-10 text-sm"
          />
        </div>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="nice-scroll flex h-11 w-full justify-start gap-1 overflow-x-auto rounded-2xl bg-muted/60 p-1.5">
            <TabsTrigger value="overview" className="rounded-xl text-xs sm:text-sm">
              <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" /> {t("Overview")}
            </TabsTrigger>
            <TabsTrigger value="visitors" className="rounded-xl text-xs sm:text-sm">
              <Eye className="mr-1.5 h-3.5 w-3.5" /> {t("Visitors")}
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl text-xs sm:text-sm">
              <Users className="mr-1.5 h-3.5 w-3.5" /> {t("Users")}
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="rounded-xl text-xs sm:text-sm">
              <HelpCircle className="mr-1.5 h-3.5 w-3.5" /> {t("Quizzes")}
            </TabsTrigger>
            <TabsTrigger value="attempts" className="rounded-xl text-xs sm:text-sm">
              <Gamepad2 className="mr-1.5 h-3.5 w-3.5" /> {t("Plays")}
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl text-xs sm:text-sm">
              <Settings2 className="mr-1.5 h-3.5 w-3.5" /> {t("Settings")}
            </TabsTrigger>
          </TabsList>

          {/* ---------- OVERVIEW ---------- */}
          <TabsContent value="overview" className="mt-4">
            <AdminOverview data={data!} fmtTime={fmtTime} />
          </TabsContent>

          {/* ---------- SETTINGS (site theme, fonts, contact, demo questions) ---------- */}
          <TabsContent value="settings" className="mt-4">
            <AdminSettings />
          </TabsContent>

          {/* ---------- VISITORS ---------- */}
          <TabsContent value="visitors" className="mt-4">
            <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={csvVisitors}
                className="h-9 rounded-full px-4 text-xs font-semibold"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" /> {t("Export CSV")}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 rounded-full px-4 text-xs text-muted-foreground hover:text-destructive">
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> {t("Clear all visits")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("Clear the entire visitor log?")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("All visit records will be permanently removed.")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-white hover:bg-destructive/90"
                      onClick={() => del("clearVisitors")}
                    >
                      {t("Clear everything")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {visitors.length === 0 ? (
              <EmptyCard text={t("No visits recorded yet — share the website link and watch them appear.")} />
            ) : (
              <>
                {/* desktop table */}
                <Card className="glass hidden border-border/60 md:block">
                  <CardContent className="p-0">
                    <div className="nice-scroll max-h-[65vh] overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-card/95 backdrop-blur">
                          <TableRow>
                            <TableHead className="text-xs">{t("When")}</TableHead>
                            <TableHead className="text-xs">{t("Visitor")}</TableHead>
                            <TableHead className="text-xs">{t("IP address")}</TableHead>
                            <TableHead className="text-xs">{t("Location")}</TableHead>
                            <TableHead className="text-xs">{t("Network (ISP)")}</TableHead>
                            <TableHead className="text-xs">{t("Device")}</TableHead>
                            <TableHead className="text-xs">{t("Page")}</TableHead>
                            <TableHead className="w-10" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {visitors.map((v) => (
                            <TableRow key={v.id} className="text-xs">
                              <TableCell className="whitespace-nowrap tabular-nums">
                                {fmtTime(v.createdAt)}
                              </TableCell>
                              <TableCell>
                                {v.user ? (
                                  <span className="brand-text inline-flex items-center gap-1.5 font-medium">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={v.user.image || undefined} />
                                      <AvatarFallback className="text-[8px]">
                                        {(v.user.name || v.user.email).slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    {v.user.email}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">{t("Guest")}</span>
                                )}
                              </TableCell>
                              <TableCell className="font-mono">{v.ip || "—"}</TableCell>
                              <TableCell>
                                {[v.city, v.region, v.country].filter(Boolean).join(", ") || "—"}
                              </TableCell>
                              <TableCell className="max-w-44 truncate">{v.isp || "—"}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {v.device} · {v.browser}
                                <br />
                                <span className="text-muted-foreground">{v.os} · {v.screen || "?"}</span>
                              </TableCell>
                              <TableCell className="max-w-36 truncate font-mono">{v.path || "/"}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => del("visitor", v.id)}
                                  className="h-7 w-7 rounded-full p-0 text-muted-foreground hover:text-destructive"
                                  aria-label={t("Delete visit record")}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* mobile cards */}
                <div className="space-y-3 md:hidden">
                  {visitors.map((v) => (
                    <Card key={v.id} className="glass border-border/60">
                      <CardContent className="p-4 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold tabular-nums">{fmtTime(v.createdAt)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => del("visitor", v.id)}
                            className="h-7 w-7 rounded-full p-0 text-muted-foreground hover:text-destructive"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <p className="mt-1 font-mono text-sm font-semibold">{v.ip || "—"}</p>
                        <div className="mt-2 space-y-1 text-muted-foreground">
                          <p className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            {[v.city, v.region, v.country].filter(Boolean).join(", ") || t("Unknown")}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Wifi className="h-3 w-3" /> {v.isp || t("Unknown network")}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Monitor className="h-3 w-3" /> {v.device} · {v.browser} · {v.os} · {v.screen || "?"}
                          </p>
                          {v.user && (
                            <p className="brand-text flex items-center gap-1.5 font-medium">
                              <Crown className="h-3 w-3" /> {v.user.email}
                            </p>
                          )}
                          <p className="truncate font-mono">→ {v.path || "/"}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
          {/* ---------- USERS ---------- */}
          <TabsContent value="users" className="mt-4">
            {users.length === 0 ? (
              <EmptyCard text={t("No registered users yet.")} />
            ) : (
              <>
                <div className="mb-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={csvUsers}
                    className="h-9 rounded-full px-4 text-xs font-semibold"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" /> {t("Export CSV")}
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {users.map((u) => {
                    const lastVisit = u.visits[0];
                    return (
                      <Card key={u.id} className="glass border-border/60 anim-fade-up">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setDetail(u)}
                              className="flex min-w-0 items-center gap-3 text-left"
                            >
                              <Avatar className="h-11 w-11">
                                <AvatarImage src={u.image || undefined} alt={u.name || u.email} />
                                <AvatarFallback className="brand-grad text-xs text-white">
                                  {(u.name || u.email).slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold hover:underline">{u.name || t("Unnamed")}</p>
                                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                              </div>
                            </button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 shrink-0 rounded-full p-0 text-muted-foreground hover:text-destructive"
                                  aria-label={t("Delete user")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t("Delete user {email}?", { email: u.email })}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t("Their account, quizzes and scores will be removed permanently.")}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-white hover:bg-destructive/90"
                                    onClick={() => del("user", u.id)}
                                  >
                                    {t("Delete user")}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            <Badge variant="secondary" className="rounded-md text-[10px]">
                              {u.provider === "google" ? "Google" : "Email"}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`rounded-md text-[10px] ${
                                u.hasPassword ? "text-emerald-600 dark:text-emerald-400" : ""
                              }`}
                            >
                              <KeyRound className="mr-1 h-2.5 w-2.5" />
                              {u.hasPassword ? t("password set") : t("no password")}
                            </Badge>
                            {u.role === "ADMIN" && (
                              <Badge className="brand-chip rounded-md text-[10px]">
                                ADMIN
                              </Badge>
                            )}
                            <Badge variant="secondary" className="rounded-md text-[10px]">
                              {t("{n} quizzes", { n: u._count.quizzes })}
                            </Badge>
                            <Badge variant="secondary" className="rounded-md text-[10px]">
                              {t("{n} visits", { n: u._count.visits })}
                            </Badge>
                          </div>

                          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                            {u.phone && (
                              <p className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3" /> {u.phone}
                              </p>
                            )}
                            {u.bio && <p className="flex items-center gap-1.5 line-clamp-2"><MessageSquare className="h-3.5 w-3.5 shrink-0" /> {u.bio}</p>}
                            {u.fbLink && (
                              <p className="flex items-center gap-1.5 truncate">
                                <ExternalLink className="h-3 w-3 shrink-0" />
                                <a href={u.fbLink} target="_blank" rel="noreferrer" className="underline">
                                  {u.fbLink}
                                </a>
                              </p>
                            )}
                            {u.instaLink && (
                              <p className="flex items-center gap-1.5 truncate">
                                <ExternalLink className="h-3 w-3 shrink-0" />
                                <a href={u.instaLink} target="_blank" rel="noreferrer" className="underline">
                                  {u.instaLink}
                                </a>
                              </p>
                            )}
                            {lastVisit && (
                              <p className="flex items-center gap-1.5 pt-1 font-mono">
                                <Clock className="h-3 w-3 shrink-0" />
                                {t(
                                  "last seen {v}",
                                  {
                                    v: `${lastVisit.ip || "?"} · ${
                                      [lastVisit.city, lastVisit.country].filter(Boolean).join(", ") ||
                                      t("unknown")
                                    }`,
                                  }
                                )}
                              </p>
                            )}
                            <p className="text-[10px] opacity-70">
                              {t("joined {t}", { t: fmtTime(u.createdAt) })}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>

          {/* ---------- QUIZZES ---------- */}
          <TabsContent value="quizzes" className="mt-4">
            {quizzes.length === 0 ? (
              <EmptyCard text={t("No quizzes created yet.")} />
            ) : (
              <>
                <div className="mb-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={csvQuizzes}
                    className="h-9 rounded-full px-4 text-xs font-semibold"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" /> {t("Export CSV")}
                  </Button>
                </div>
                <Card className="glass border-border/60">
                  <CardContent className="p-0">
                    <div className="nice-scroll max-h-[65vh] overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-card/95 backdrop-blur">
                          <TableRow>
                            <TableHead className="text-xs">{t("Quiz")}</TableHead>
                            <TableHead className="text-xs">{t("Code")}</TableHead>
                            <TableHead className="text-xs">{t("Creator")}</TableHead>
                            <TableHead className="text-xs">{t("Qs")}</TableHead>
                            <TableHead className="text-xs">{t("Plays")}</TableHead>
                            <TableHead className="text-xs">{t("Created")}</TableHead>
                            <TableHead className="w-10" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {quizzes.map((qr) => (
                            <TableRow key={qr.id} className="text-xs">
                              <TableCell className="max-w-52 truncate font-medium">{qr.title}</TableCell>
                              <TableCell className="brand-text font-mono">#{qr.code}</TableCell>
                              <TableCell>
                                <span className="block truncate">{qr.creatorName}</span>
                                {qr.user?.email && (
                                  <span className="text-muted-foreground">{qr.user.email}</span>
                                )}
                              </TableCell>
                              <TableCell className="tabular-nums">{qr._count.questions}</TableCell>
                              <TableCell className="tabular-nums">{qr._count.attempts}</TableCell>
                              <TableCell className="whitespace-nowrap tabular-nums">
                                {fmtTime(qr.createdAt)}
                              </TableCell>
                              <TableCell>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 rounded-full p-0 text-muted-foreground hover:text-destructive"
                                      aria-label={t("Delete quiz")}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>{t("Delete this quiz?")}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {t("“{title}” and all its attempts will be removed.", { title: qr.title })}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-white hover:bg-destructive/90"
                                        onClick={() => del("quiz", qr.id)}
                                      >
                                        {t("Delete")}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ---------- ATTEMPTS ---------- */}
          <TabsContent value="attempts" className="mt-4">
            {attempts.length === 0 ? (
              <EmptyCard text={t("No quiz plays yet.")} />
            ) : (
              <>
                <div className="mb-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={csvAttempts}
                    className="h-9 rounded-full px-4 text-xs font-semibold"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" /> {t("Export CSV")}
                  </Button>
                </div>
                <Card className="glass border-border/60">
                  <CardContent className="p-0">
                    <div className="nice-scroll max-h-[65vh] overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-card/95 backdrop-blur">
                          <TableRow>
                            <TableHead className="text-xs">{t("Player")}</TableHead>
                            <TableHead className="text-xs">{t("Quiz")}</TableHead>
                            <TableHead className="text-xs">{t("Score")}</TableHead>
                            <TableHead className="text-xs">%</TableHead>
                            <TableHead className="text-xs">{t("When")}</TableHead>
                            <TableHead className="w-10" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attempts.map((a) => {
                            const pct = Math.round((a.score / Math.max(a.total, 1)) * 100);
                            return (
                              <TableRow key={a.id} className="text-xs">
                                <TableCell className="font-medium">
                                  {a.playerName}
                                  {a.feedback && (
                                    <p className="mt-0.5 max-w-44 truncate text-[11px] italic text-muted-foreground">
                                      “{a.feedback}”
                                    </p>
                                  )}
                                </TableCell>
                                <TableCell className="max-w-52 truncate">
                                  {a.quiz?.title || "—"}
                                  <span className="ml-1 font-mono text-muted-foreground">
                                    #{a.quiz?.code}
                                  </span>
                                </TableCell>
                                <TableCell className="whitespace-nowrap tabular-nums">
                                  {a.score}/{a.total}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={
                                      pct >= 70
                                        ? "font-bold text-emerald-500"
                                        : pct >= 40
                                          ? "font-bold text-amber-500"
                                          : "font-bold text-rose-500"
                                    }
                                  >
                                    {pct}%
                                  </span>
                                </TableCell>
                                <TableCell className="whitespace-nowrap tabular-nums">
                                  {fmtTime(a.createdAt)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => del("attempt", a.id)}
                                    className="h-7 w-7 rounded-full p-0 text-muted-foreground hover:text-destructive"
                                    aria-label={t("Delete attempt")}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* ---------- USER DETAIL DIALOG ---------- */}
        <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
          <DialogContent className="glass max-h-[85vh] overflow-y-auto border-border/60 sm:max-w-lg">
            {detail && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3.5 pt-1">
                    <Avatar className="h-14 w-14 brand-border border-2">
                      <AvatarImage src={detail.image || undefined} alt={detail.name || detail.email} />
                      <AvatarFallback className="brand-grad text-sm text-white">
                        {(detail.name || detail.email).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <DialogTitle className="truncate text-left text-lg font-extrabold">
                        {detail.name || t("Unnamed")}
                      </DialogTitle>
                      <DialogDescription className="truncate text-left">{detail.email}</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="rounded-md text-[10px]">
                    {detail.provider === "google" ? "Google" : "Email"}
                  </Badge>
                  <Badge variant="secondary" className="rounded-md text-[10px]">
                    <KeyRound className="mr-1 h-2.5 w-2.5" />
                    {detail.hasPassword ? t("password set") : t("no password")}
                  </Badge>
                  {detail.role === "ADMIN" && (
                    <Badge className="brand-chip rounded-md text-[10px]">ADMIN</Badge>
                  )}
                  <Badge variant="secondary" className="rounded-md text-[10px]">
                    {t("{n} quizzes", { n: detail._count.quizzes })}
                  </Badge>
                  <Badge variant="secondary" className="rounded-md text-[10px]">
                    {t("{n} visits", { n: detail._count.visits })}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                    <p className="flex items-center gap-1.5 font-semibold">
                      <Clock className="brand-text h-3.5 w-3.5" /> {t("Last login")}
                    </p>
                    <p className="mt-1 tabular-nums text-muted-foreground">
                      {detail.lastLoginAt ? fmtTime(detail.lastLoginAt) : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                    <p className="flex items-center gap-1.5 font-semibold">
                      <UserRound className="h-3.5 w-3.5 text-violet-400" /> {t("Joined")}
                    </p>
                    <p className="mt-1 tabular-nums text-muted-foreground">{fmtTime(detail.createdAt)}</p>
                  </div>
                </div>

                {(detail.phone || detail.bio || detail.fbLink || detail.instaLink) && (
                  <div className="space-y-1.5 rounded-xl border border-border/50 p-3.5 text-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      {t("Profile details")}
                    </p>
                    {detail.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> {detail.phone}
                      </p>
                    )}
                    {detail.bio && <p className="flex items-center gap-1.5 text-muted-foreground"><MessageSquare className="h-3.5 w-3.5 shrink-0" /> {detail.bio}</p>}
                    {detail.fbLink && (
                      <p className="flex items-center gap-2 truncate">
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <a href={detail.fbLink} target="_blank" rel="noreferrer" className="underline">
                          {detail.fbLink}
                        </a>
                      </p>
                    )}
                    {detail.instaLink && (
                      <p className="flex items-center gap-2 truncate">
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <a href={detail.instaLink} target="_blank" rel="noreferrer" className="underline">
                          {detail.instaLink}
                        </a>
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {t("Recent visits")}
                  </p>
                  <div className="space-y-2">
                    {detail.visits.length === 0 && (
                      <p className="text-xs text-muted-foreground">{t("No visits recorded for this account.")}</p>
                    )}
                    {detail.visits.map((v, i) => (
                      <div
                        key={i}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/40 px-3 py-2 text-xs"
                      >
                        <span className="font-mono font-semibold">{v.ip || "?"}</span>
                        <span className="text-muted-foreground">
                          {[v.city, v.country].filter(Boolean).join(", ") || t("unknown")}
                        </span>
                        <span className="text-muted-foreground">
                          {v.device} · {v.browser}
                        </span>
                        <span className="tabular-nums text-muted-foreground">{fmtTime(v.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDetail(null);
                      del("user", detail.id);
                    }}
                    className="h-9 rounded-full px-4 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> {t("Delete user")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDetail(null)} className="h-9 rounded-full px-5 text-xs">
                    {t("Close")}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <p className="mt-8 pb-8 text-center text-[11px] leading-relaxed text-muted-foreground">
          {t(
            "Visitor tracking captures IP, approximate location, ISP/network, device, browser, screen, language, timezone and the logged-in account (when the visitor signs in). Browsers do not expose the WiFi name (SSID) — the ISP/org name from the IP lookup is the closest available network identifier."
          )}
        </p>
      </div>
    </main>
  );
}
