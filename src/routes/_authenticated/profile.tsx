import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useProfile, levelFromXp } from "@/lib/useProfile";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, update } = useProfile();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile) { setName(profile.display_name ?? ""); setBio(profile.bio ?? ""); }
  }, [profile]);

  const stats = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const [{ data: sessions }, { data: tasks }, { data: cards }, { data: notes }] = await Promise.all([
        supabase.from("focus_sessions").select("minutes"),
        supabase.from("tasks").select("id,completed"),
        supabase.from("flashcards").select("id"),
        supabase.from("notes").select("id"),
      ]);
      return {
        minutes: (sessions ?? []).reduce((a, s) => a + s.minutes, 0),
        tasks: tasks?.length ?? 0,
        completed: (tasks ?? []).filter((t) => t.completed).length,
        cards: cards?.length ?? 0,
        notes: notes?.length ?? 0,
      };
    },
  });

  async function save() {
    await update.mutateAsync({ display_name: name || null, bio: bio || null });
    toast.success("Saved");
  }

  const level = levelFromXp(profile?.xp ?? 0);

  return (
    <AppShell>
      <div className="max-w-3xl space-y-5">
        <h1 className="font-display text-3xl font-bold">Profile</h1>

        <section className="bg-white rounded-[2rem] border border-border p-6 shadow-soft flex flex-col sm:flex-row items-center gap-5">
          <div className="size-24 rounded-[1.75rem] bg-gradient-to-br from-primary to-lavender grid place-items-center text-4xl font-display font-bold">
            {(profile?.display_name?.[0] ?? "✿").toUpperCase()}
          </div>
          <div className="flex-1 w-full space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name"
              className="w-full bg-cream rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-primary font-display text-xl font-bold" />
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A line about you…" rows={2}
              className="w-full bg-cream rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-primary text-sm resize-none" />
            <button onClick={save} disabled={update.isPending} className="bg-primary rounded-full px-5 py-2 font-bold text-sm">
              {update.isPending ? "…" : "Save"}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatBlock label="Level" value={level} />
          <StatBlock label="XP" value={profile?.xp ?? 0} />
          <StatBlock label="Coins" value={profile?.coins ?? 0} />
          <StatBlock label="Streak" value={`${profile?.current_streak ?? 0}d`} />
          <StatBlock label="Longest" value={`${profile?.longest_streak ?? 0}d`} />
          <StatBlock label="Total minutes" value={stats.data?.minutes ?? profile?.total_minutes ?? 0} />
          <StatBlock label="Tasks done" value={`${stats.data?.completed ?? 0}/${stats.data?.tasks ?? 0}`} />
          <StatBlock label="Flashcards" value={stats.data?.cards ?? 0} />
          <StatBlock label="Notes" value={stats.data?.notes ?? 0} />
        </section>

        <section className="bg-white rounded-3xl border border-border p-5">
          <h2 className="font-display text-lg font-bold mb-3">Study preferences</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><span className="font-bold">Goal:</span> {profile?.study_goal ?? "—"}</div>
            <div><span className="font-bold">Daily target:</span> {profile?.daily_minutes_target ?? 60} min</div>
            <div><span className="font-bold">Exam target:</span> {profile?.exam_target ?? "—"}</div>
            <div><span className="font-bold">Preferred time:</span> {profile?.preferred_time ?? "—"}</div>
            <div className="sm:col-span-2"><span className="font-bold">Subjects:</span> {profile?.subjects?.join(", ") || "—"}</div>
            <div className="sm:col-span-2"><span className="font-bold">Languages:</span> {profile?.languages?.join(", ") || "—"}</div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function StatBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-3xl p-4 text-center">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
