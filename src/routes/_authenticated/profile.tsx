import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { useProfile, levelFromXp } from "@/lib/useProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Loader2, Trash2 } from "lucide-react";

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
  const [userId, setUserId] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
      setUserId(data.user?.id ?? "");
    });
  }, []);

  // Seed the form once per user so a background refetch can never wipe
  // whatever the student is currently typing.
  const seeded = useRef<string | null>(null);
  useEffect(() => {
    if (!profile || seeded.current === profile.id) return;
    seeded.current = profile.id;
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


  // Resolve signed URL for the (private) avatar
  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      if (!profile?.avatar_url) { setAvatarUrl(null); return; }
      // avatar_url stored as "<userId>/<file>" path in the avatars bucket
      const { data } = await supabase.storage
        .from("avatars")
        .createSignedUrl(profile.avatar_url, 60 * 60);
      if (!cancelled) setAvatarUrl(data?.signedUrl ?? null);
    }
    resolve();
    return () => { cancelled = true; };
  }, [profile?.avatar_url]);

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

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      // Best-effort cleanup of previous file
      if (profile?.avatar_url && profile.avatar_url !== path) {
        await supabase.storage.from("avatars").remove([profile.avatar_url]);
      }
      await update.mutateAsync({ avatar_url: path });
      toast.success("Profile picture updated");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeAvatar() {
    if (!profile?.avatar_url) return;
    try {
      await supabase.storage.from("avatars").remove([profile.avatar_url]);
      await update.mutateAsync({ avatar_url: null });
      toast.success("Profile picture removed");
    } catch (err: any) {
      toast.error(err.message ?? "Remove failed");
    }
  }

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
  const initial = (form.display_name?.[0] ?? email?.[0] ?? "S").toUpperCase();
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AppShell>
      <div className="max-w-3xl space-y-6 animate-fade-up">
        <header>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Account</div>
          <h1 className="font-display text-4xl font-bold tracking-tight mt-1">Profile</h1>
        </header>

        {/* Avatar card */}
        <section className="glass-panel rounded-[2rem] p-6 flex items-center gap-5">
          <div className="relative">
            <div className="size-24 rounded-3xl overflow-hidden gradient-primary grid place-items-center text-3xl font-display font-bold text-white shadow-soft">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 size-9 rounded-2xl bg-foreground text-background grid place-items-center shadow-soft hover:scale-105 transition"
              aria-label="Change profile picture"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={onPickAvatar}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Profile picture</div>
            <div className="font-display font-bold text-lg mt-0.5 truncate">{form.display_name || email || "Your profile"}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="rounded-full bg-white/80 hover:bg-white border border-border px-3 py-1.5 text-xs font-bold"
              >
                {uploading ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="rounded-full bg-white/70 hover:bg-white border border-border px-3 py-1.5 text-xs font-bold text-destructive inline-flex items-center gap-1"
                >
                  <Trash2 className="size-3.5" /> Remove
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-6 space-y-4">
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
            className="gradient-primary text-white rounded-full px-6 py-2.5 font-bold text-sm shadow-soft hover:opacity-90 transition">
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

const inputCls = "w-full bg-white/70 rounded-2xl px-4 py-3 outline-none border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition";

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
    <div className="glass-panel rounded-3xl p-4 text-center hover:scale-[1.02] transition-transform">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
