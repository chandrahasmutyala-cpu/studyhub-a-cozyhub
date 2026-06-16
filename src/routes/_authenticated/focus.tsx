import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Timer as TimerIcon, Clock, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/focus")({
  component: FocusPage,
});

type Scene = { id: string; label: string; bg: string };
const SCENES: Scene[] = [
  { id: "minimal",   label: "Minimal Workspace", bg: "linear-gradient(135deg, #f5f1ea, #e8e1d3)" },
  { id: "library",   label: "Japanese Library",  bg: "linear-gradient(135deg, #ece4d8, #c8b89a)" },
  { id: "study",     label: "Study Room",        bg: "linear-gradient(135deg, #fff3e6, #ffd9bb)" },
  { id: "rain",      label: "Rainy Window",      bg: "linear-gradient(135deg, #dde7f0, #99b0c8)" },
  { id: "mountain",  label: "Mountain View",     bg: "linear-gradient(180deg, #cfe2f3, #f1f5ea 60%, #d6c8a8)" },
];

type Ambience = "off" | "rain" | "forest" | "river" | "wind";
const AMBIENCE_OPTS: { id: Ambience; label: string }[] = [
  { id: "off",    label: "Silence" },
  { id: "rain",   label: "Rain" },
  { id: "forest", label: "Forest" },
  { id: "river",  label: "River" },
  { id: "wind",   label: "Wind" },
];

const DURATIONS = [
  { label: "25 / 5",  focus: 25, brk: 5  },
  { label: "50 / 10", focus: 50, brk: 10 },
  { label: "15 / 3",  focus: 15, brk: 3  },
];

type Mode = "pomodoro" | "stopwatch";

function FocusPage() {
  const qc = useQueryClient();
  const { profile, update } = useProfile();
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [scene, setScene] = useState<Scene>(SCENES[0]);
  const [ambience, setAmbience] = useState<Ambience>("off");
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setFullscreen(false)).catch(() => {});
    }
  }
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  return (
    <AppShell>
      <div className="max-w-3xl space-y-5">
        <div>
          <h1 className="font-display text-3xl font-bold">Focus</h1>
          <p className="text-sm text-muted-foreground">Pomodoro, stopwatch, fullscreen mode — pure productivity. No music, ambient only.</p>
        </div>

        <div className="flex gap-1 bg-white/80 backdrop-blur p-1 rounded-full border border-border w-fit">
          {([
            { id: "pomodoro" as Mode, label: "Pomodoro", icon: TimerIcon },
            { id: "stopwatch" as Mode, label: "Stopwatch", icon: Clock },
          ]).map((t) => (
            <button key={t.id} onClick={() => setMode(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 ${mode === t.id ? "bg-primary" : "text-muted-foreground"}`}>
              <t.icon className="size-3.5" /> {t.label}
            </button>
          ))}
        </div>

        <div ref={containerRef}
          className="rounded-[2.5rem] p-8 sm:p-12 border-8 border-white shadow-pop relative overflow-hidden"
          style={{ background: scene.bg }}>
          <button onClick={toggleFullscreen} className="absolute top-4 right-4 size-9 rounded-full bg-white/80 grid place-items-center" aria-label="Fullscreen">
            {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
          {mode === "pomodoro"
            ? <Pomodoro scene={scene} profile={profile} update={update} qc={qc} />
            : <Stopwatch />
          }
        </div>

        <section className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white border border-border rounded-3xl p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Scene</div>
            <div className="flex gap-2 flex-wrap">
              {SCENES.map((b) => (
                <button key={b.id} onClick={() => setScene(b)}
                  className={`px-3 py-2 rounded-full text-xs font-bold border ${scene.id === b.id ? "border-primary" : "border-border"}`}
                  style={{ background: b.bg }}>{b.label}</button>
              ))}
            </div>
          </div>
          <div className="bg-white border border-border rounded-3xl p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              {ambience === "off" ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />} Ambient sound
            </div>
            <div className="flex gap-2 flex-wrap">
              {AMBIENCE_OPTS.map((a) => (
                <button key={a.id} onClick={() => setAmbience(a.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border ${ambience === a.id ? "bg-primary border-primary" : "bg-white border-border"}`}>
                  {a.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Procedurally generated — no music, no playlists.</p>
          </div>
        </section>
      </div>
      <AmbiencePlayer ambience={ambience} />
    </AppShell>
  );
}

function Pomodoro({ scene, profile, update, qc }: {
  scene: Scene;
  profile: ReturnType<typeof useProfile>["profile"];
  update: ReturnType<typeof useProfile>["update"];
  qc: ReturnType<typeof useQueryClient>;
}) {
  const [config, setConfig] = useState(DURATIONS[0]);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [seconds, setSeconds] = useState(DURATIONS[0].focus * 60);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setSeconds((mode === "focus" ? config.focus : config.brk) * 60); }, [config, mode]);

  useEffect(() => {
    if (!running) { if (timer.current) clearInterval(timer.current); return; }
    timer.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { handleComplete(); return 0; }
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
        await supabase.from("focus_sessions").insert({ user_id: user.id, minutes, mode: "focus", background: scene.id });
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
    <>
      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/70 mb-2">
        {mode === "focus" ? "Deep Focus" : "Break"}
      </div>
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
      <div className="flex gap-2 mt-4 flex-wrap">
        {DURATIONS.map((d) => (
          <button key={d.label} onClick={() => setConfig(d)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${config.label === d.label ? "bg-white" : "bg-white/40"}`}>{d.label}</button>
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
    if (running) { base.current = ms; setRunning(false); }
    else { setRunning(true); }
  }
  function reset() { setRunning(false); base.current = 0; setMs(0); }

  const total = Math.floor(ms / 1000);
  const hh = String(Math.floor(total / 3600)).padStart(2, "0");
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");

  return (
    <>
      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/70 mb-2">Stopwatch</div>
      <div className="font-display text-7xl sm:text-8xl font-bold tabular-nums">{hh}:{mm}:{ss}</div>
      <div className="flex gap-2 mt-6">
        <button onClick={toggle} className="bg-white rounded-full px-6 py-3 font-bold shadow-soft flex items-center gap-2">
          {running ? <><Pause className="size-4" />Pause</> : <><Play className="size-4" />Start</>}
        </button>
        <button onClick={reset} className="bg-white/70 rounded-full px-4 py-3 font-bold flex items-center gap-2">
          <RotateCcw className="size-4" />Reset
        </button>
      </div>
    </>
  );
}

/** Procedural ambience using Web Audio API — no music files. */
function AmbiencePlayer({ ambience }: { ambience: Ambience }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    nodesRef.current?.stop();
    nodesRef.current = null;
    if (ambience === "off") return;

    const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    if (!AC) return;
    let ctx = ctxRef.current;
    if (!ctx) { ctx = new AC(); ctxRef.current = ctx; }
    void ctx.resume();

    // Pink-ish noise generator
    const bufSize = 2 * ctx.sampleRate;
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const out = noiseBuf.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < bufSize; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886*b0 + w*0.0555179;
      b1 = 0.99332*b1 + w*0.0750759;
      b2 = 0.96900*b2 + w*0.1538520;
      b3 = 0.86650*b3 + w*0.3104856;
      b4 = 0.55000*b4 + w*0.5329522;
      b5 = -0.7616*b5 - w*0.0168980;
      out[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362) * 0.11;
      b6 = w * 0.115926;
    }
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;

    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    // Per-ambience tuning
    switch (ambience) {
      case "rain":   filter.type = "bandpass"; filter.frequency.value = 1800; filter.Q.value = 0.6; gain.gain.value = 0.22; break;
      case "wind":   filter.type = "lowpass";  filter.frequency.value = 600;  filter.Q.value = 0.4; gain.gain.value = 0.20; break;
      case "forest": filter.type = "highpass"; filter.frequency.value = 700;  filter.Q.value = 0.7; gain.gain.value = 0.10; break;
      case "river":  filter.type = "bandpass"; filter.frequency.value = 900;  filter.Q.value = 0.5; gain.gain.value = 0.18; break;
    }

    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();

    // Subtle LFO on filter to feel organic
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = ambience === "wind" ? 0.15 : 0.4;
    lfoGain.gain.value = ambience === "wind" ? 200 : 120;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    nodesRef.current = {
      stop: () => { try { src.stop(); lfo.stop(); } catch { /* already stopped */ } },
    };
    return () => { nodesRef.current?.stop(); nodesRef.current = null; };
  }, [ambience]);

  useEffect(() => () => { ctxRef.current?.close().catch(() => {}); }, []);
  return null;
}
