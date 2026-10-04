import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { type ComponentType } from "react";
import { User, Info, ChevronRight, LogOut, Shield, Lock } from "lucide-react";
import { THEMES, type ThemeId } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { ColorModeToggle } from "@/components/ColorModeToggle";

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

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const rows: Row[] = [
    { icon: User, label: "Profile", hint: "Name, avatar, bio", to: "/profile" },
    { icon: Shield, label: "Privacy", hint: "Data and visibility" },
    { icon: Lock, label: "Security", hint: "Account protection" },
    { icon: Info, label: "About", hint: "Version and credits" },
  ];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Signed in as <span className="font-semibold text-foreground">{profile?.display_name ?? "Learner"}</span>
          </p>
        </header>

        <section>
          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-4 mb-2">Account</div>
          <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
            {rows.map((r, i) => {
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

        <section>
          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-4 mb-2">Appearance</div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-border">
              <div><div className="text-[15px] font-semibold">Display mode</div><div className="text-xs text-muted-foreground">Light or dark across StudyHub</div></div>
              <ColorModeToggle />
            </div>
            <div className="mb-3">
              <div className="text-[15px] font-semibold">Study atmosphere</div>
              <div className="text-xs text-muted-foreground">Choose a palette for your study space.</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEMES.map((theme) => {
                const selected = (profile?.selected_theme ?? "peach") === theme.id;
                return (
                  <Button
                    key={theme.id}
                    type="button"
                    variant="outline"
                    aria-pressed={selected}
                    onClick={() => update.mutate({ selected_theme: theme.id as ThemeId })}
                    data-theme-swatch={theme.id}
                    className={`h-auto min-h-14 justify-start gap-2.5 rounded-lg px-3 py-2.5 text-left ${selected ? "border-primary ring-2 ring-primary/20" : ""}`}
                  >
                    <span className={`theme-swatch theme-swatch-${theme.id} size-6 rounded-full border border-foreground/10 shrink-0`} />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-bold">{theme.name}</span>
                      <span className="block truncate text-[10px] text-muted-foreground font-normal">{theme.mood}</span>
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive font-semibold px-5 py-3.5 hover:bg-destructive/10 transition"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </section>

        <div className="text-center text-xs text-muted-foreground pb-4">StudyHub · v1.0</div>
      </div>
    </AppShell>
  );
}
