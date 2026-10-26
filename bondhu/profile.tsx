"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState } from "react";
import {
  Loader2,
  Save,
  Phone,
  Instagram,
  Facebook,
  AtSign,
  Info,
} from "lucide-react";
import type { SessionUser } from "./types";
import { useLang } from "./i18n";

interface ProfileProps {
  user: SessionUser;
  onUpdate: (user: SessionUser) => void;
  onBack: () => void;
}

export default function Profile({ user, onUpdate, onBack }: ProfileProps) {
  const { t } = useLang();
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [fbLink, setFbLink] = useState(user.fbLink || "");
  const [instaLink, setInstaLink] = useState(user.instaLink || "");
  const [bio, setBio] = useState(user.bio || "");
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, fbLink, instaLink, bio }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("Could not save profile"));
        return;
      }
      toast.success(t("Profile saved"));
      onUpdate(data.user);
    } catch {
      toast.error(t("Network error — please try again"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 h-9 rounded-full px-4 text-sm text-muted-foreground"
        >
          {t("Back")}
        </Button>

        <Card className="glass border-border/60 anim-fade-up">
          <CardContent className="p-6 sm:p-8">
            {/* identity header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 brand-border border-2">
                <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
                <AvatarFallback className="brand-grad text-lg text-white">
                  {(name || user.email).slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-extrabold sm:text-2xl">
                  {user.name || t("Your profile")}
                </h1>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                <Badge variant="secondary" className="mt-1.5 rounded-lg text-xs">
                  {user.provider === "google" ? t("Google account") : t("Email account")}
                </Badge>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs leading-relaxed text-muted-foreground">
              <Info className="brand-text mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {t(
                  "Everything you add here — phone, Facebook, Instagram — appears on your profile card so friends can recognise and reach you after they play your quiz."
                )}
              </span>
            </div>

            <form onSubmit={save} className="mt-6 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="p-name">{t("Display name *")}</Label>
                <Input
                  id="p-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("How friends see you")}
                  maxLength={80}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {t("Phone number")}
                </Label>
                <Input
                  id="p-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1XXX XXXXXX"
                  className="h-12 rounded-xl"
                />
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label htmlFor="p-fb" className="flex items-center gap-1.5">
                  <Facebook className="h-3.5 w-3.5 text-[#1877F2]" /> {t("Facebook profile link")}
                </Label>
                <Input
                  id="p-fb"
                  value={fbLink}
                  onChange={(e) => setFbLink(e.target.value)}
                  placeholder="https://facebook.com/yourname"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-insta" className="flex items-center gap-1.5">
                  <Instagram className="h-3.5 w-3.5 text-rose-500" /> {t("Instagram profile link")}
                </Label>
                <Input
                  id="p-insta"
                  value={instaLink}
                  onChange={(e) => setInstaLink(e.target.value)}
                  placeholder="https://instagram.com/yourname"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-bio" className="flex items-center gap-1.5">
                  <AtSign className="h-3.5 w-3.5" /> {t("Short bio")}
                </Label>
                <Textarea
                  id="p-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t("Tell the world about yourself in one line…")}
                  maxLength={300}
                  rows={3}
                  className="resize-none rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="btn-gradient h-12 w-full rounded-xl text-sm font-semibold"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> {t("Save profile")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
