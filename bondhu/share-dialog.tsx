"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import {
  Check,
  Copy,
  Facebook,
  Link2,
  MessageCircle,
  QrCode,
  Share2,
  Twitter,
} from "lucide-react";
import { useLang } from "./i18n";

export interface ShareResult {
  attemptId: string;
  playerName: string;
  pct: number;
  score: number;
  total: number;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  title: string;
  creatorName: string;
  /** when set, the dialog shares the PLAYER's score instead of the quiz */
  result?: ShareResult | null;
}

/**
 * Professional share dialog with two modes:
 *  - quiz mode: the challenge card friends see when the creator posts the link
 *  - result mode: the "I scored X% — beat me" card a player flaunts after winning
 * Both show a scan-to-play QR code and exactly the card social apps unfurl.
 * The words are always a challenge — never a dull question count.
 */
export default function ShareDialog({
  open,
  onOpenChange,
  code,
  title,
  creatorName,
  result,
}: ShareDialogProps) {
  const { t } = useLang();
  const [copied, setCopied] = useState<"link" | "caption" | null>(null);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const isResult = Boolean(result);
  const link = result
    ? `${origin}/?q=${encodeURIComponent(code)}&r=${encodeURIComponent(result.attemptId)}`
    : `${origin}/?q=${encodeURIComponent(code)}`;
  const caption = result
    ? t(
        "I scored {pct}% on {name}'s quiz — most friends fail it. Beat me if you can: {link}",
        { pct: result.pct, name: creatorName, link }
      )
    : t(
        "Think you really know {name}? I made a secret test about myself — most friends fail it. Prove you're a real one: {link}",
        { name: creatorName, link }
      );

  const copy = async (text: string, what: "link" | "caption") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1600);
      toast.success(what === "link" ? t("Link copied!") : t("Caption copied — paste it on Instagram!"));
    } catch {
      toast.error(text, { duration: 8000, description: t("Copy this link manually") });
    }
  };

  const nativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: result
            ? t("I scored {pct}% — can you beat me?", { pct: result.pct })
            : t("Test how well you know me!"),
          text: caption,
          url: link,
        });
        return;
      }
    } catch {
      /* cancelled */
    }
    copy(link, "link");
  };

  const wa = `https://wa.me/?text=${encodeURIComponent(`${caption}`)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(caption)}`;
  const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto nice-scroll sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left">
            <Share2 className="brand-text h-4.5 w-4.5" />
            {isResult ? t("Share your score") : t("Share your quiz")}
          </DialogTitle>
          <DialogDescription className="text-left">
            {isResult
              ? t("This is the card friends see when you show off your score.")
              : t("This is the card your friends will see when you post the link on Facebook, Instagram or WhatsApp.")}
          </DialogDescription>
        </DialogHeader>

        {/* ------- live preview of the branded share card ------- */}
        {isResult && result ? (
          <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#150d24] shadow-xl">
            <div className="brand-grad absolute -left-24 -top-28 h-64 w-64 rounded-full opacity-40" />
            <div className="brand-grad absolute -bottom-32 -right-24 h-56 w-56 rounded-full opacity-30" />
            <div className="relative flex h-full flex-col justify-between p-4 text-white sm:p-5">
              <div className="flex items-center gap-2">
                <span className="brand-grad flex h-7 w-7 items-center justify-center rounded-lg text-sm font-extrabold text-white">
                  B
                </span>
                <span className="text-sm font-bold tracking-tight">
                  Bondhu<span className="brand-text-soft">Meter</span>
                </span>
              </div>
              <div className="flex items-center gap-3 sm:gap-5">
                <p className="bg-gradient-to-br from-[var(--bm-from)] to-[var(--bm-to)] bg-clip-text text-5xl font-extrabold leading-none text-transparent sm:text-7xl">
                  {result.pct}%
                </p>
                <div className="min-w-0">
                  <p className="brand-text-soft text-[9px] font-bold uppercase tracking-[0.25em] sm:text-xs">
                    {t("Quiz score")}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-base font-extrabold sm:text-xl">
                    {result.playerName}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-white/85 sm:text-xs">
                    {t("scored {a}/{b} on {title}", { a: result.score, b: result.total, title })}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold backdrop-blur-sm sm:text-xs">
                  {t("Think you can beat that?")}
                </span>
                <span className="text-[9px] text-white/70 sm:text-[11px]">
                  {t("Most friends can't")}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#150d24] shadow-xl">
            <div className="brand-grad absolute -right-24 -top-28 h-64 w-64 rounded-full opacity-50" />
            <div className="brand-grad absolute -bottom-32 -left-24 h-56 w-56 rounded-full opacity-30" />
            <div className="relative flex h-full flex-col justify-between p-4 text-white sm:p-5">
              <div className="flex items-center gap-2">
                <span className="brand-grad flex h-7 w-7 items-center justify-center rounded-lg text-sm font-extrabold text-white">
                  B
                </span>
                <span className="text-sm font-bold tracking-tight">
                  Bondhu<span className="brand-text-soft">Meter</span>
                </span>
              </div>
              <div className="min-w-0">
                <p className="brand-text-soft text-[10px] font-bold uppercase tracking-[0.25em] sm:text-xs">
                  {t("Quiz challenge")}
                </p>
                <p className="mt-1 line-clamp-2 text-base font-extrabold leading-snug sm:text-xl">
                  {title}
                </p>
                <p className="mt-1 text-[11px] text-white/85 sm:text-xs">
                  {t("A secret test by {name} — most friends fail it", { name: creatorName })}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold backdrop-blur-sm sm:text-xs">
                  {t("Think you know them? Prove it")}
                </span>
                <span className="text-[9px] text-white/70 sm:text-[11px]">
                  {t("Most friends fail")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ------- link ------- */}
        <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/60 p-2 pl-3.5">
          <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
            {link}
          </p>
          <Button
            size="sm"
            onClick={() => copy(link, "link")}
            className="btn-gradient h-8 shrink-0 rounded-lg px-3 text-xs font-semibold"
          >
            {copied === "link" ? (
              <Check className="mr-1 h-3.5 w-3.5" />
            ) : (
              <Copy className="mr-1 h-3.5 w-3.5" />
            )}
            {t("Copy")}
          </Button>
        </div>

        {/* ------- caption ------- */}
        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
            {t("Ready-made caption (great for Instagram)")}
          </p>
          <div className="rounded-xl border border-border/70 bg-background/60 p-3">
            <p className="break-words text-xs leading-relaxed text-muted-foreground">
              {caption}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copy(caption, "caption")}
              className="mt-2.5 h-8 rounded-lg px-3 text-xs font-semibold"
            >
              {copied === "caption" ? (
                <Check className="mr-1 h-3.5 w-3.5" />
              ) : (
                <Copy className="mr-1 h-3.5 w-3.5" />
              )}
              {t("Copy caption")}
            </Button>
          </div>
        </div>

        {/* ------- QR code — scan to play ------- */}
        <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-background/60 p-3">
          {open && (
            /* rendered only while open so the QR always matches the real origin */
            <div className="shrink-0 rounded-lg border border-border/60 bg-white p-1.5 shadow-sm">
              <img
                src={`/api/qr?text=${encodeURIComponent(link)}`}
                alt={t("Scan to play")}
                width={84}
                height={84}
                className="h-[84px] w-[84px] rounded-[4px]"
                loading="lazy"
              />
            </div>
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-bold">
              <QrCode className="brand-text h-3.5 w-3.5" />
              {t("Scan to play")}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {t("Friends can scan this QR code with their phone camera and start playing instantly — perfect when you meet in person.")}
            </p>
          </div>
        </div>

        {/* ------- share buttons ------- */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="secondary"
            onClick={() => window.open(wa, "_blank")}
            className="h-11 flex-col gap-0.5 rounded-xl text-[10px] font-semibold"
          >
            <MessageCircle className="h-4.5 w-4.5 text-emerald-400" />
            WhatsApp
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.open(fb, "_blank")}
            className="h-11 flex-col gap-0.5 rounded-xl text-[10px] font-semibold"
          >
            <Facebook className="h-4.5 w-4.5 text-sky-500" />
            Facebook
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.open(tw, "_blank")}
            className="h-11 flex-col gap-0.5 rounded-xl text-[10px] font-semibold"
          >
            <Twitter className="h-4.5 w-4.5 text-foreground" />
            X
          </Button>
          <Button
            onClick={nativeShare}
            className="btn-gradient h-11 flex-col gap-0.5 rounded-xl text-[10px] font-semibold"
          >
            <Share2 className="h-4.5 w-4.5" />
            {t("More")}
          </Button>
        </div>

        <p className="pb-1 text-center text-[11px] leading-relaxed text-muted-foreground">
          {t("Instagram tip: copy the link + caption above, then paste them in your story, bio or DM.")}
        </p>
      </DialogContent>
    </Dialog>
  );
}
