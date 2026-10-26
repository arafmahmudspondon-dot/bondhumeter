"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, LayoutDashboard, UserRound, LogOut, Shield, Languages } from "lucide-react";
import { BondhuMark } from "./brand";
import type { SessionUser } from "./types";
import { useLang } from "./i18n";

interface NavProps {
  user: SessionUser | null;
  onNav: (view: "home" | "dashboard" | "auth" | "profile" | "admin") => void;
  onLogout: () => void;
}

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 group cursor-pointer focus:outline-none"
      aria-label="BondhuMeter home"
    >
      <span className="transition-transform group-hover:scale-105">
        <BondhuMark className="h-9 w-9 rounded-[26%]" />
      </span>
      <span className="text-lg font-bold tracking-tight">
        Bondhu<span className="gradient-text">Meter</span>
      </span>
    </button>
  );
}

export default function Nav({ user, onNav, onLogout }: NavProps) {
  const { theme, setTheme } = useTheme();
  const { lang, toggle, t } = useLang();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass safe-bottom">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo onClick={() => onNav("home")} />

        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Main navigation">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            aria-label={t("Switch language")}
            title={t("Switch language")}
            className="h-10 gap-1.5 rounded-full px-3 text-xs font-semibold"
          >
            <Languages className="h-4.5 w-4.5" />
            <span className="hidden min-[380px]:inline">{lang === "en" ? "বাংলা" : "EN"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={t("Toggle theme")}
            className="h-10 w-10 p-0"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-4.5 w-4.5" />
            ) : (
              <Moon className="h-4.5 w-4.5" />
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full border border-border/70 py-1 pl-1 pr-3 transition hover:bg-accent/10 focus:outline-none"
                  aria-label={t("Account menu")}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
      <AvatarFallback className="brand-grad text-xs text-white">
                      {(user.name || user.email).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
                    {user.name || user.email.split("@")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="truncate text-sm font-semibold">{user.name || t("Friend")}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNav("dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> {t("My Quizzes")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNav("profile")}>
                  <UserRound className="mr-2 h-4 w-4" /> {t("Profile")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onLogout()}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> {t("Log out")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={() => onNav("auth")}
              className="btn-gradient rounded-full px-5 h-10 text-sm font-semibold"
            >
              {t("Sign in")}
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}

export function AdminLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
      aria-label="Admin dashboard"
    >
      <Shield className="h-3 w-3" /> Admin
    </button>
  );
}
