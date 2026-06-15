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
  const [form, setForm] = useState({
    display_name: "", bio: "", age_group: "", current_grade: "",
    subjects: "", dream_career: "", dream_country: "", dream_university: "",
  });
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name ?? "",
      bio: profile.bio ?? "",
      age_group: profile.age_group ?? "",
      current_grade: profile.current_grade ?? "",
      subjects: profile.subjects?.join(", ") ?? "",
      dream_career: profile.dream_career ?? "",
      dream_country: profile.dream_country ?? "",
      dream_university: profile.dream_university ?? "",
    });
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
    await update.mutateAsync({
      display_name: form.display_name || null,
      bio: form.bio || null,
      age_group: form.age_group || null,
      current_grade: form.current_grade || null,
      subjects: form.subjects ? form.subjects.split(",").map((s) => s.trim()).filter(Boolean) : null,
      dream_career: form.dream_career || null,
      dream_country: form.dream_country || null,
      dream_university: form.dream_university || null,
    });
    toast.success("Profile saved");
  }

  const level = levelFromXp(profile?.xp ?? 0);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AppShell>
      <div className="max-w-3xl space-y-6 animate-fade-up">
        <header>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Account</div>
          <h1 className="font-display text-4xl font-bold tracking-tight mt-1">Profile</h1>
        </header>

        <section className="bg-white/85 backdrop-blur rounded-[2rem] border border-border p-6 shadow-soft space-y-4">
          <Field label="Name">
            <input value={form.display_name} onChange={set("display_name")} className={inputCls} placeholder="Your name" />
          </Field>
          <Field label="Email">
            <input value={email} readOnly className={`${inputCls} text-muted-foreground`} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Age">
              <select value={form.age_group} onChange={set("age_group")} className={inputCls}>
                <option value="">Select…</option>
                {["<13","13–15","16–18","19–22","23–27","28+"].map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Education level">
              <select value={form.current_grade} onChange={set("current_grade")} className={inputCls}>
                <option value="">Select…</option>
                {["Middle school","High school","Undergraduate","Graduate","Working professional"].map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Interests (comma separated)">
            <input value={form.subjects} onChange={set("subjects")} className={inputCls} placeholder="e.g. Japanese, AI, design" />
          </Field>
          <Field label="Career goals">
            <input value={form.dream_career} onChange={set("dream_career")} className={inputCls} placeholder="e.g. Software engineer in Tokyo" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Dream country">
              <input value={form.dream_country} onChange={set("dream_country")} className={inputCls} placeholder="Japan" />
            </Field>
            <Field label="Dream university">
              <input value={form.dream_university} onChange={set("dream_university")} className={inputCls} placeholder="University of Tokyo" />
            </Field>
          </div>
          <Field label="Bio">
            <textarea value={form.bio} onChange={set("bio")} rows={2} className={`${inputCls} resize-none`} placeholder="A line about you…" />
          </Field>
          <button onClick={save} disabled={update.isPending}
            className="bg-foreground text-background rounded-full px-6 py-2.5 font-bold text-sm">
            {update.isPending ? "Saving…" : "Save changes"}
          </button>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatBlock label="Level" value={level} />
          <StatBlock label="XP" value={profile?.xp ?? 0} />
          <StatBlock label="Streak" value={`${profile?.current_streak ?? 0}d`} />
          <StatBlock label="Minutes" value={stats.data?.minutes ?? profile?.total_minutes ?? 0} />
          <StatBlock label="Tasks done" value={`${stats.data?.completed ?? 0}/${stats.data?.tasks ?? 0}`} />
          <StatBlock label="Notes" value={stats.data?.notes ?? 0} />
        </section>
      </div>
    </AppShell>
  );
}

const inputCls = "w-full bg-cream rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-primary text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function StatBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white/85 backdrop-blur border border-border rounded-3xl p-4 text-center">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
