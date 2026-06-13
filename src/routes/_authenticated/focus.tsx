import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";

import { useProfile } from "@/lib/useProfile";
import { Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/focus")({
  component: FocusPage,
});

const BACKGROUNDS = [
  { id: "study-room", label: "Study Room", bg: "linear-gradient(135deg, #fff3e6, #ffe0d1)" },
  { id: "sakura", label: "Sakura", bg: "linear-gradient(135deg, #ffe4ec, #ffd0e0)" },
  { id: "cafe", label: "Cafe", bg: "linear-gradient(135deg, #f5e9d8, #e6d4b8)" },
  { id: "rain", label: "Rainy Window", bg: "linear-gradient(135deg, #dde7f0, #c8d6e6)" },
  { id: "library", label: "Library", bg: "linear-gradient(135deg, #ece4d8, #d6c8b0)" },
];

const DURATIONS = [
  { label: "25 / 5", focus: 25, brk: 5 },
  { label: "50 / 10", focus: 50, brk: 10 },
  { label: "15 / 3", focus: 15, brk: 3 },
];

function FocusPage() {
  const qc = useQueryClient();
  const { profile, update } = useProfile();
  const [config, setConfig] = useState(DURATIONS[0]);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [seconds, setSeconds] = useState(DURATIONS[0].focus * 60);
  const [running, setRunning] = useState(false);
  const [bg, setBg] = useState(BACKGROUNDS[0]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setSeconds((mode === "focus" ? config.focus : config.brk) * 60); }, [config, mode]);

  useEffect(() => {
    if (!running) { if (timer.current) clearInterval(timer.current); return; }
    timer.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          handleComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timer.current) clearInterval(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  async function handleComplete() {
    setRunning(false);
    if (mode === "focus") {
      const minutes = config.focus;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("focus_sessions").insert({ user_id: user.id, minutes, mode: "focus", background: bg.id });
        const gainedXp = (profile?.xp ?? 0) + minutes * 2;
        const today = new Date().toISOString().slice(0, 10);
        const last = profile?.last_study_date;
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const yISO = yesterday.toISOString().slice(0, 10);
        const newStreak = last === today
          ? (profile?.current_streak ?? 1)
          : last === yISO ? (profile?.current_streak ?? 0) + 1 : 1;
        await update.mutateAsync({
          xp: gainedXp,
          total_minutes: (profile?.total_minutes ?? 0) + minutes,
          coins: (profile?.coins ?? 0) + Math.round(minutes / 5),
          current_streak: newStreak,
          longest_streak: Math.max(profile?.longest_streak ?? 0, newStreak),
          last_study_date: today,
        });
        qc.invalidateQueries({ queryKey: ["focus", "week"] });
        toast.success(`+${minutes * 2} XP — nice focus!`);
      }
      setMode("break");
    } else {
      toast.success("Break done. Ready when you are.");
      setMode("focus");
    }
  }

  function reset() {
    setRunning(false);
    setSeconds((mode === "focus" ? config.focus : config.brk) * 60);
  }

  const total = (mode === "focus" ? config.focus : config.brk) * 60;
  const pct = ((total - seconds) / total) * 100;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <AppShell>
      <div className="max-w-3xl space-y-5">
        <div>
          <h1 className="font-display text-3xl font-bold">Focus</h1>
          <p className="text-sm text-muted-foreground">Pick a session length, let your buddy join in.</p>
        </div>

        <div className="rounded-[2.5rem] p-8 sm:p-12 border-8 border-white shadow-pop relative overflow-hidden" style={{ background: bg.bg }}>
          <div className="absolute top-4 right-4 text-5xl animate-float-soft select-none" aria-hidden>✨</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/70 mb-2">{mode === "focus" ? "Deep Focus" : "Break"}</div>
          <div className="font-display text-7xl sm:text-8xl font-bold tabular-nums">{mm}:{ss}</div>
          <div className="h-2 bg-white/50 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-foreground/70 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={() => setRunning((r) => !r)} className="bg-white rounded-full px-6 py-3 font-bold shadow-soft flex items-center gap-2">
              {running ? <><Pause className="size-4" />Pause</> : <><Play className="size-4" />Start</>}
            </button>
            <button onClick={reset} className="bg-white/70 rounded-full px-4 py-3 font-bold flex items-center gap-2">
              <RotateCcw className="size-4" />Reset
            </button>
          </div>
        </div>

        <section className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white border border-border rounded-3xl p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Duration</div>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map((d) => (
                <button key={d.label} onClick={() => setConfig(d)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border ${config.label === d.label ? "bg-primary border-primary" : "bg-white border-border"}`}>{d.label}</button>
              ))}
            </div>
          </div>
          <div className="bg-white border border-border rounded-3xl p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Background</div>
            <div className="flex gap-2 flex-wrap">
              {BACKGROUNDS.map((b) => (
                <button key={b.id} onClick={() => setBg(b)}
                  className={`px-3 py-2 rounded-full text-xs font-bold border ${bg.id === b.id ? "border-primary" : "border-border"}`}
                  style={{ background: b.bg }}>{b.label}</button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
