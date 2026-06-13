import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";
import { THEMES } from "@/lib/themes";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

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

  return (
    <AppShell>
      <div className="max-w-2xl space-y-5">
        <h1 className="font-display text-3xl font-bold">Settings</h1>

        <section className="bg-white rounded-[2rem] border border-border p-5 space-y-3">
          <h2 className="font-display text-lg font-bold">Study</h2>
          <label className="block text-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Goal</div>
            <input value={goal} onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-cream rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-primary" />
          </label>
          <label className="block text-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Daily target ({daily} min)</div>
            <input type="range" min={15} max={300} step={15} value={daily} onChange={(e) => setDaily(parseInt(e.target.value))} className="w-full" />
          </label>
          <button onClick={async () => { await update.mutateAsync({ study_goal: goal || null, daily_minutes_target: daily }); toast.success("Saved"); }}
            className="bg-primary rounded-full px-5 py-2 font-bold text-sm">Save</button>
        </section>

        <section className="bg-white rounded-[2rem] border border-border p-5">
          <h2 className="font-display text-lg font-bold mb-3">Theme</h2>
          <div className="flex flex-wrap gap-3">
            {THEMES.map((t) => (
              <button key={t.id} onClick={() => update.mutate({ selected_theme: t.id })}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border ${profile?.selected_theme === t.id ? "bg-primary/30 border-primary" : "bg-white border-border"}`}>
                <span className="size-4 rounded-full" style={{ background: t.swatch }} /> {t.name}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-[2rem] border border-border p-5">
          <h2 className="font-display text-lg font-bold mb-3">Account</h2>
          <button onClick={signOut} className="bg-destructive/20 text-destructive rounded-full px-5 py-2 font-bold text-sm">
            Sign out
          </button>
        </section>
      </div>
    </AppShell>
  );
}
