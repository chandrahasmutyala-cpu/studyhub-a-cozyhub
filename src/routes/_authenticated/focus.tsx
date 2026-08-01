import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";
import { focusTimer, useFocusTimer, useTick, formatMs } from "@/lib/focus-timer";
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Timer as TimerIcon, Clock, Target, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/focus")({
  component: FocusPage,
});

type Scene = { id: string; label: string; bg: string; ink: string };
const SCENES: Scene[] = [
  { id: "sage",   label: "Sage",   bg: "linear-gradient(160deg, #f5f0e8 0%, #dce5d4 60%, #a8c0a0 100%)", ink: "#33422f" },
  { id: "cream",  label: "Cream",  bg: "linear-gradient(160deg, #faf6ee 0%, #efe8d8 100%)",              ink: "#3b3427" },
  { id: "meadow", label: "Meadow", bg: "linear-gradient(180deg, #dce5d4 0%, #a8c0a0 70%, #7d9b76 100%)", ink: "#2a3a26" },
  { id: "stone",  label: "Stone",  bg: "linear-gradient(160deg, #eeeae2 0%, #cfc9bd 100%)",              ink: "#3a362e" },
  { id: "mist",   label: "Mist",   bg: "linear-gradient(160deg, #edf1ea 0%, #cfdac8 100%)",              ink: "#2f3a2b" },
];

const DURATIONS = [
  { label: "25 / 5",  focus: 25, brk: 5  },
  { label: "50 / 10", focus: 50, brk: 10 },
  { label: "15 / 3",  focus: 15, brk: 3  },
  { label: "90 / 15", focus: 90, brk: 15 },
];

type Mode = "pomodoro" | "stopwatch";

function todayISO() { return new Date().toISOString().slice(0, 10); }

function FocusPage() {
  const { profile, update } = useProfile();
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timer = useFocusTimer();
  const scene = SCENES.find((s) => s.id === timer.scene) ?? SCENES[0];

  const todayQ = useQuery({
    queryKey: ["focus", "today"],
    queryFn: async () => {
      const since = new Date(); since.setHours(0, 0, 0, 0);
      const { data } = await supabase.from("focus_sessions").select("minutes").gte("completed_at", since.toISOString());
      return (data ?? []).reduce((a, b) => a + (b.minutes ?? 0), 0);
    },
  });

  const target = profile?.daily_minutes_target ?? 60;
  const doneToday = todayQ.data ?? 0;
  const goalPct = Math.min(100, (doneToday / Math.max(1, target)) * 100);

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.().then(() => setFullscreen(true)).catch(() => {});
    else document.exitFullscreen?.().then(() => setFullscreen(false)).catch(() => {});
  }
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Focus</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-2">A quiet room to think.</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Completely silent. The timer keeps running in the background while you move around StudyHub.
          </p>
        </header>

        {/* Mode pill */}
        <div className="inline-flex gap-1 bg-card border border-border/60 p-1 rounded-full">
          {([
            { id: "pomodoro" as Mode, label: "Pomodoro", icon: TimerIcon },
            { id: "stopwatch" as Mode, label: "Stopwatch", icon: Clock },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                mode === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="size-3.5 stroke-[1.75]" /> {t.label}
            </button>
          ))}
        </div>

        {/* Main scene card */}
        <div
          ref={containerRef}
          className="rounded-[2.5rem] p-8 sm:p-14 border border-border/60 shadow-[0_30px_60px_-30px_rgb(45_60_45/0.28)] relative overflow-hidden"
          style={{ background: scene.bg, color: scene.ink }}
        >
          <button
            onClick={toggleFullscreen}
            className="absolute top-5 right-5 size-10 rounded-full bg-white/70 backdrop-blur grid place-items-center hover:bg-white transition"
            aria-label="Fullscreen"
          >
            {fullscreen ? <Minimize2 className="size-[18px] stroke-[1.75]" /> : <Maximize2 className="size-[18px] stroke-[1.75]" />}
          </button>
          {mode === "pomodoro" ? <Pomodoro /> : <Stopwatch />}
        </div>

        {/* Daily goal */}
        <section className="rounded-3xl border border-border/60 bg-card p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Target className="size-3.5 stroke-[1.75]" /> Daily focus goal
              </div>
              <div className="font-display text-2xl font-bold mt-1">
                {doneToday}<span className="text-muted-foreground text-base font-medium"> / {target} min today</span>
              </div>
            </div>
            <GoalEditor value={target} onSave={(v) => update.mutate({ daily_minutes_target: v })} />
          </div>
          <div className="h-2 mt-5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${goalPct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {doneToday >= target ? "Goal reached — anything more is bonus." : `${target - doneToday} minutes to go on ${new Date(todayISO()).toLocaleDateString(undefined, { weekday: "long" })}.`}
          </p>
        </section>

        {/* Scene picker */}
        <section>
          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">Scene</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {SCENES.map((s) => {
              const active = scene.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => focusTimer.setScene(s.id)}
                  className={`group rounded-2xl overflow-hidden border transition ${active ? "border-primary ring-2 ring-primary/25" : "border-border/60 hover:border-primary/40"}`}
                >
                  <div className="h-16" style={{ background: s.bg }} />
                  <div className="px-3 py-2 bg-card text-left">
                    <div className="text-xs font-bold">{s.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function GoalEditor({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => { setDraft(String(value)); }, [value]);
  const n = Number(draft);
  const valid = Number.isFinite(n) && n >= 1 && n <= 1440;

  return (
    <div className="flex items-center gap-2">
      {[30, 60, 120, 180].map((p) => (
        <button
          key={p}
          onClick={() => { setDraft(String(p)); onSave(p); toast.success(`Daily goal set to ${p} min`); }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${value === p ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/60 hover:border-primary/40"}`}
        >
          {p}m
        </button>
      ))}
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={1}
          max={1440}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-20 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-bold outline-none focus:border-primary"
          aria-label="Custom daily goal in minutes"
        />
        <button
          disabled={!valid}
          onClick={() => { onSave(n); toast.success(`Daily goal set to ${n} min`); }}
          className="size-8 rounded-full bg-foreground text-background grid place-items-center disabled:opacity-40"
          aria-label="Save goal"
        >
          <Check className="size-4 stroke-[1.75]" />
        </button>
      </div>
    </div>
  );
}

function Pomodoro() {
  const t = useFocusTimer();
  useTick(500, t.running);

  const total = (t.phase === "focus" ? t.focusMin : t.breakMin) * 60_000;
  const left = focusTimer.remaining(Date.now(), t);
  const pct = total > 0 ? ((total - left) / total) * 100 : 0;

  return (
    <>
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70 mb-3">
        {t.phase === "focus" ? "Deep Focus" : "Break"}
      </div>
      <div className="font-display text-7xl sm:text-8xl font-bold tabular-nums leading-none">{formatMs(left)}</div>
      <div className="h-1.5 bg-white/40 rounded-full overflow-hidden mt-6 max-w-md">
        <div className="h-full bg-current/80 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-2 mt-7">
        <button
          onClick={() => focusTimer.toggle()}
          className="bg-white text-foreground rounded-full px-6 py-3 font-bold shadow-sm flex items-center gap-2 hover:shadow-md transition"
        >
          {t.running ? <><Pause className="size-4 stroke-[1.75]" />Pause</> : <><Play className="size-4 stroke-[1.75]" />Start</>}
        </button>
        <button
          onClick={() => focusTimer.reset()}
          className="bg-white/60 rounded-full px-4 py-3 font-bold flex items-center gap-2 hover:bg-white/80 transition"
        >
          <RotateCcw className="size-4 stroke-[1.75]" />Reset
        </button>
        <button
          onClick={() => focusTimer.setPhase(t.phase === "focus" ? "break" : "focus")}
          className="bg-white/40 rounded-full px-4 py-3 font-bold hover:bg-white/60 transition text-sm"
        >
          {t.phase === "focus" ? "Take a break" : "Back to focus"}
        </button>
      </div>
      <div className="flex gap-2 mt-5 flex-wrap">
        {DURATIONS.map((d) => (
          <button
            key={d.label}
            onClick={() => focusTimer.setDurations(d.focus, d.brk)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
              t.focusMin === d.focus && t.breakMin === d.brk ? "bg-white border-white" : "bg-white/30 border-white/50 hover:bg-white/50"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </>
  );
}

function Stopwatch() {
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const start = useRef<number | null>(null);
  const base = useRef(0);

  useEffect(() => {
    if (!running) return;
    start.current = performance.now();
    const id = setInterval(() => {
      if (start.current != null) setMs(base.current + (performance.now() - start.current));
    }, 50);
    return () => clearInterval(id);
  }, [running]);

  function toggle() {
    if (running) { base.current = ms; setRunning(false); } else setRunning(true);
  }
  function reset() { setRunning(false); base.current = 0; setMs(0); }

  const total = Math.floor(ms / 1000);
  const hh = String(Math.floor(total / 3600)).padStart(2, "0");
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");

  return (
    <>
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70 mb-3">Stopwatch</div>
      <div className="font-display text-7xl sm:text-8xl font-bold tabular-nums leading-none">{hh}:{mm}:{ss}</div>
      <div className="flex gap-2 mt-7">
        <button onClick={toggle} className="bg-white text-foreground rounded-full px-6 py-3 font-bold shadow-sm flex items-center gap-2 hover:shadow-md transition">
          {running ? <><Pause className="size-4 stroke-[1.75]" />Pause</> : <><Play className="size-4 stroke-[1.75]" />Start</>}
        </button>
        <button onClick={reset} className="bg-white/60 rounded-full px-4 py-3 font-bold flex items-center gap-2 hover:bg-white/80 transition">
          <RotateCcw className="size-4 stroke-[1.75]" />Reset
        </button>
      </div>
    </>
  );
}
