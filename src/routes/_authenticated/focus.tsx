import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Timer as TimerIcon, Clock, Volume2, VolumeX, CloudRain, Trees, Coffee, Music2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/focus")({
  component: FocusPage,
});

type Scene = { id: string; label: string; bg: string; ink: string };
const SCENES: Scene[] = [
  { id: "sage",    label: "Sage",    bg: "linear-gradient(160deg, #f5f0e8 0%, #dce5d4 60%, #a8c0a0 100%)", ink: "#33422f" },
  { id: "cream",   label: "Cream",   bg: "linear-gradient(160deg, #faf6ee 0%, #efe8d8 100%)",              ink: "#3b3427" },
  { id: "meadow",  label: "Meadow",  bg: "linear-gradient(180deg, #dce5d4 0%, #a8c0a0 70%, #7d9b76 100%)",  ink: "#2a3a26" },
  { id: "stone",   label: "Stone",   bg: "linear-gradient(160deg, #eeeae2 0%, #cfc9bd 100%)",              ink: "#3a362e" },
  { id: "mist",    label: "Mist",    bg: "linear-gradient(160deg, #edf1ea 0%, #cfdac8 100%)",              ink: "#2f3a2b" },
];

type SoundId = "off" | "rain" | "forest" | "cafe" | "lofi";
type Sound = { id: SoundId; label: string; icon: typeof CloudRain; src?: string };
// Hotlink-friendly public loop URLs. If any 404, only that pack fails; UI still works.
const SOUNDS: Sound[] = [
  { id: "off",    label: "Silence",   icon: VolumeX },
  { id: "rain",   label: "Rain",      icon: CloudRain, src: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73e3a.mp3" },
  { id: "forest", label: "Forest",    icon: Trees,     src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1808fbf07a.mp3" },
  { id: "cafe",   label: "Café",      icon: Coffee,    src: "https://cdn.pixabay.com/download/audio/2021/10/25/audio_ff02b1b880.mp3" },
  { id: "lofi",   label: "Lo-fi",     icon: Music2,    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

const DURATIONS = [
  { label: "25 / 5",  focus: 25, brk: 5  },
  { label: "50 / 10", focus: 50, brk: 10 },
  { label: "15 / 3",  focus: 15, brk: 3  },
];

type Mode = "pomodoro" | "stopwatch" | "desk";

function FocusPage() {
  const qc = useQueryClient();
  const { profile, update } = useProfile();
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [scene, setScene] = useState<Scene>(SCENES[0]);
  const [sound, setSound] = useState<SoundId>("off");
  const [volume, setVolume] = useState(0.5);
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
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Focus</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-2">A quiet room to think.</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">Pomodoro or stopwatch, five sage scenes, four ambient packs. No noise, no clutter.</p>
        </header>

        {/* Mode pill */}
        <div className="inline-flex gap-1 bg-card border border-border/60 p-1 rounded-full overflow-x-auto">
          {([
            { id: "pomodoro" as Mode, label: "Pomodoro", icon: TimerIcon },
            { id: "stopwatch" as Mode, label: "Stopwatch", icon: Clock },
            { id: "desk" as Mode, label: "Study Desk", icon: Coffee },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
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
            className="absolute top-5 right-5 size-10 rounded-full bg-white/70 backdrop-blur grid place-items-center hover:bg-white transition z-10"
            aria-label="Fullscreen"
          >
            {fullscreen ? <Minimize2 className="size-[18px] stroke-[1.75]" /> : <Maximize2 className="size-[18px] stroke-[1.75]" />}
          </button>
          {mode === "pomodoro" && <Pomodoro scene={scene} profile={profile} update={update} qc={qc} />}
          {mode === "stopwatch" && <Stopwatch />}
          {mode === "desk" && <SmartStudyDesk />}
        </div>

        {/* Scene picker */}
        <section>
          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">Scene</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {SCENES.map((s) => {
              const active = scene.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setScene(s)}
                  className={`group rounded-2xl overflow-hidden border transition ${active ? "border-primary ring-2 ring-primary/25" : "border-border/60 hover:border-primary/40"}`}
                >
                  <div className="h-16" style={{ background: s.bg }} />
                  <div className="px-3 py-2 bg-card text-left">
                    <div className="text-xs font-bold" style={{ color: active ? undefined : undefined }}>{s.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Sound picker */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Ambient sound</div>
            {sound !== "off" && (
              <div className="flex items-center gap-2">
                <Volume2 className="size-3.5 stroke-[1.75] text-muted-foreground" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-28 accent-primary"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {SOUNDS.map((s) => {
              const Icon = s.icon;
              const active = sound === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSound(s.id)}
                  className={`rounded-2xl border p-4 flex flex-col items-center gap-2 transition ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 bg-card hover:border-primary/40 text-foreground/80"
                  }`}
                >
                  <Icon className="size-5 stroke-[1.75]" />
                  <span className="text-xs font-bold">{s.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
      <SoundPlayer sound={sound} volume={volume} />
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
        if (s <= 1) { void handleComplete(); return 0; }
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
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70 mb-3">
        {mode === "focus" ? "Deep Focus" : "Break"}
      </div>
      <div className="font-display text-7xl sm:text-8xl font-bold tabular-nums leading-none">{mm}:{ss}</div>
      <div className="h-1.5 bg-white/40 rounded-full overflow-hidden mt-6 max-w-md">
        <div className="h-full bg-current/80 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-2 mt-7">
        <button
          onClick={() => setRunning((r) => !r)}
          className="bg-white text-foreground rounded-full px-6 py-3 font-bold shadow-sm flex items-center gap-2 hover:shadow-md transition"
        >
          {running ? <><Pause className="size-4 stroke-[1.75]" />Pause</> : <><Play className="size-4 stroke-[1.75]" />Start</>}
        </button>
        <button
          onClick={reset}
          className="bg-white/60 rounded-full px-4 py-3 font-bold flex items-center gap-2 hover:bg-white/80 transition"
        >
          <RotateCcw className="size-4 stroke-[1.75]" />Reset
        </button>
      </div>
      <div className="flex gap-2 mt-5 flex-wrap">
        {DURATIONS.map((d) => (
          <button
            key={d.label}
            onClick={() => setConfig(d)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
              config.label === d.label ? "bg-white border-white" : "bg-white/30 border-white/50 hover:bg-white/50"
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

/** HTML5 loop player for ambient packs. */
function SoundPlayer({ sound, volume }: { sound: SoundId; volume: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const s = SOUNDS.find((x) => x.id === sound);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    if (!s?.src) { el.pause(); el.removeAttribute("src"); return; }
    if (el.src !== s.src) el.src = s.src;
    el.loop = true;
    el.play().catch(() => { /* autoplay blocked until user gesture; the button click counts */ });
  }, [sound, volume, s?.src]);

  return <audio ref={audioRef} preload="none" />;
}
