import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";
import { THEMES } from "@/lib/themes";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ComponentType } from "react";
import { toast } from "sonner";
import {
  Palette, Bell, Sparkles, GraduationCap, Video, Map, Cat, Download,
  HardDrive, Shield, Lock, Languages, Info, ChevronRight, LogOut, User,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

type Row = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  to?: string;
  onClick?: () => void;
};

function SettingsPage() {
  const { profile, update } = useProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [goal, setGoal] = useState("");
  const [daily, setDaily] = useState(60);

  useEffect(() => {
    if (profile) { setGoal(profile.study_goal ?? ""); setDaily(profile.daily_minutes_target ?? 60); }
  }, [profile]);

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const groups: { title: string; rows: Row[] }[] = [
    {
      title: "Appearance",
      rows: [
        { icon: Palette, label: "Theme", hint: "The overall vibe of your workspace" },
      ],
    },
    {
      title: "Learning",
      rows: [
        { icon: GraduationCap, label: "Learning Academy", hint: "Japanese, Chinese, Korean", to: "/learning-academy" },
        { icon: Sparkles, label: "AI Tutor", hint: "Personalized study help", to: "/tutor" },
        { icon: Video, label: "Media Translator", hint: "Translate video and screenshots", to: "/media-translator" },
        { icon: Map, label: "World Explorer", hint: "Learn cultures interactively", to: "/world-explorer" },
        { icon: Cat, label: "DoodleKitty", hint: "AI-powered drawing", to: "/doodlekitty" },
      ],
    },
    {
      title: "Preferences",
      rows: [
        { icon: Bell, label: "Notifications", hint: "Reminders and streaks" },
        { icon: Languages, label: "Language", hint: "Interface language" },
        { icon: Download, label: "Downloads", hint: "Manage offline content" },
        { icon: HardDrive, label: "Storage", hint: "Cache and local data" },
      ],
    },
    {
      title: "Privacy & Security",
      rows: [
        { icon: Shield, label: "Privacy", hint: "Data and visibility" },
        { icon: Lock, label: "Security", hint: "Account protection" },
      ],
    },
    {
      title: "Account",
      rows: [
        { icon: User, label: "Profile", hint: "Name, avatar, bio", to: "/profile" },
        { icon: Info, label: "About", hint: "Version and credits" },
      ],
    },
  ];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Fine-tune StudyHub to fit the way you learn.</p>
        </header>

        {/* Study goal / daily target — kept from original settings */}
        <section className="rounded-3xl border border-border/60 bg-card p-5 space-y-4">
          <h2 className="font-display text-base font-bold">Study</h2>
          <label className="block text-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Goal</div>
            <input value={goal} onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-muted/60 rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-primary focus:bg-background transition" />
          </label>
          <label className="block text-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Daily target ({daily} min)</div>
            <input type="range" min={15} max={300} step={15} value={daily} onChange={(e) => setDaily(parseInt(e.target.value))} className="w-full accent-primary" />
          </label>
          <button onClick={async () => { await update.mutateAsync({ study_goal: goal || null, daily_minutes_target: daily }); toast.success("Saved"); }}
            className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 font-semibold text-sm shadow-sm hover:brightness-105 active:scale-[0.98] transition">
            Save changes
          </button>
        </section>

        {/* Theme swatches */}
        <section className="rounded-3xl border border-border/60 bg-card p-5">
          <h2 className="font-display text-base font-bold mb-3">Theme</h2>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button key={t.id} onClick={() => update.mutate({ selected_theme: t.id })}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition ${profile?.selected_theme === t.id ? "bg-primary/10 border-primary text-primary" : "bg-background border-border/60 hover:bg-muted/60"}`}>
                <span className="size-3.5 rounded-full ring-1 ring-border/60" style={{ background: t.swatch }} /> {t.name}
              </button>
            ))}
          </div>
        </section>

        {/* Grouped rows */}
        {groups.map((g) => (
          <section key={g.title}>
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-4 mb-2">{g.title}</div>
            <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
              {g.rows.map((r, i) => {
                const Icon = r.icon;
                const body = (
                  <div className={`flex items-center gap-4 px-4 py-4 hover:bg-muted/50 active:bg-muted transition ${i !== 0 ? "border-t border-border/60" : ""}`}>
                    <span className="size-10 rounded-2xl bg-muted/70 grid place-items-center shrink-0">
                      <Icon className="size-[18px] stroke-[1.75] text-foreground/75" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold text-foreground truncate">{r.label}</div>
                      {r.hint && <div className="text-xs text-muted-foreground truncate">{r.hint}</div>}
                    </div>
                    <ChevronRight className="size-[18px] stroke-[1.75] text-muted-foreground shrink-0" />
                  </div>
                );
                return r.to ? (
                  <Link key={r.label} to={r.to as "/dashboard"}>{body}</Link>
                ) : (
                  <button key={r.label} onClick={r.onClick} className="w-full text-left">{body}</button>
                );
              })}
            </div>
          </section>
        ))}

        <section className="pt-2">
          <button onClick={signOut}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive font-semibold px-5 py-3.5 hover:bg-destructive/10 transition">
            <LogOut className="size-4" /> Sign out
          </button>
        </section>

        <div className="text-center text-xs text-muted-foreground pb-4">StudyHub · v1.0</div>
      </div>
    </AppShell>
  );
}
