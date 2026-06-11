import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";
import { Avatar, AVATAR_OPTIONS, DEFAULT_AVATAR, type AvatarConfig } from "@/components/Avatar";
import { Shuffle, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/avatar")({
  component: AvatarPage,
});

const TEACHER_PERSONALITIES = ["Friendly", "Professional", "Motivational", "Encouraging"];
const TEACHER_STYLES = ["Visual", "Conversational", "Step-by-step", "Quiz-based"];
const TEACHER_VOICES = ["Soft", "Warm", "Bright", "Calm"];

function AvatarPage() {
  const { profile, update } = useProfile();
  const [cfg, setCfg] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [teacherName, setTeacherName] = useState("");
  const [personality, setPersonality] = useState(TEACHER_PERSONALITIES[0]);
  const [style, setStyle] = useState(TEACHER_STYLES[0]);
  const [voice, setVoice] = useState(TEACHER_VOICES[0]);

  useEffect(() => {
    if (!profile) return;
    if (profile.avatar_config) setCfg({ ...DEFAULT_AVATAR, ...(profile.avatar_config as Partial<AvatarConfig>) });
    setTeacherName(profile.teacher_name ?? "Mochi-sensei");
    setPersonality(profile.teacher_personality ?? TEACHER_PERSONALITIES[0]);
    setStyle(profile.teacher_style ?? TEACHER_STYLES[0]);
    setVoice(profile.teacher_voice ?? TEACHER_VOICES[0]);
  }, [profile]);

  function cycle(key: keyof AvatarConfig) {
    setCfg((c) => ({ ...c, [key]: (c[key] + 1) % AVATAR_OPTIONS[key] }));
  }
  function randomize() {
    const next: AvatarConfig = { ...DEFAULT_AVATAR };
    (Object.keys(AVATAR_OPTIONS) as (keyof AvatarConfig)[]).forEach((k) => {
      next[k] = Math.floor(Math.random() * AVATAR_OPTIONS[k]);
    });
    setCfg(next);
  }
  async function save() {
    await update.mutateAsync({
      avatar_config: cfg as never,
      teacher_name: teacherName || null,
      teacher_personality: personality,
      teacher_style: style,
      teacher_voice: voice,
    });
    toast.success("Saved");
  }

  const parts: { key: keyof AvatarConfig; label: string }[] = [
    { key: "hair", label: "Hair" }, { key: "eyes", label: "Eyes" }, { key: "mouth", label: "Mouth" },
    { key: "outfit", label: "Outfit" }, { key: "accessory", label: "Accessory" },
    { key: "skin", label: "Skin" }, { key: "bg", label: "Background" },
  ];

  return (
    <AppShell>
      <div className="max-w-4xl space-y-6">
        <header>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Studio</div>
          <h1 className="font-display text-3xl font-bold mt-1">Your avatar & teacher</h1>
        </header>

        <section className="bg-white border border-border rounded-[2rem] p-5 shadow-soft grid md:grid-cols-[200px_1fr] gap-6 items-start">
          <div className="grid place-items-center">
            <Avatar config={cfg} size={180} />
            <button onClick={randomize} className="mt-3 inline-flex items-center gap-1 text-sm font-bold bg-secondary rounded-full px-3 py-1.5">
              <Shuffle className="size-4" /> Randomize
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {parts.map((p) => (
              <button key={p.key} onClick={() => cycle(p.key)}
                className="bg-cream rounded-2xl p-3 text-left hover:bg-secondary transition-colors">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{p.label}</div>
                <div className="font-display font-bold">Style {cfg[p.key] + 1}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white border border-border rounded-[2rem] p-5 shadow-soft space-y-3">
          <h2 className="font-display font-bold text-lg">Your AI teacher</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Labeled label="Teacher name">
              <input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} className="w-full bg-cream rounded-2xl px-3 py-2.5 text-sm outline-none" />
            </Labeled>
            <Labeled label="Voice">
              <Select value={voice} onChange={setVoice} options={TEACHER_VOICES} />
            </Labeled>
            <Labeled label="Personality">
              <Select value={personality} onChange={setPersonality} options={TEACHER_PERSONALITIES} />
            </Labeled>
            <Labeled label="Teaching style">
              <Select value={style} onChange={setStyle} options={TEACHER_STYLES} />
            </Labeled>
          </div>
        </section>

        <div className="flex justify-end">
          <button onClick={save} disabled={update.isPending} className="inline-flex items-center gap-2 bg-primary rounded-full px-5 py-2.5 font-bold text-sm">
            <Save className="size-4" /> {update.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      {children}
    </div>
  );
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-cream rounded-2xl px-3 py-2.5 text-sm">
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
