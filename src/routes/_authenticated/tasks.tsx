import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";
import { focusTimer, useFocusTimer, useTick, formatMs } from "@/lib/focus-timer";
import { CozyCat, cozyQuote } from "@/components/CozyCat";
import {
  Plus, Trash2, Bell, BellOff, CalendarDays, CloudSun, Timer, Flame,
  CheckCircle2, Circle, ArrowRight, Sparkles, ListTodo,
  ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Target, Check,
} from "lucide-react";
import { toast } from "sonner";


export const Route = createFileRoute("/_authenticated/tasks")({
  component: PlannerPage,
});

type Task = {
  id: string; title: string; notes: string | null; category: string | null;
  priority: string | null; due_date: string | null; completed: boolean;
};

type AlarmMap = Record<string, string>;
const ALARM_KEY = "task-alarms-v1";
const FIRED_KEY = "task-alarms-fired-v1";
const HABIT_KEY = "studyhub-habits-v1";

const CATEGORIES = ["study", "japanese", "chinese", "korean", "coding", "reading", "exam", "other"] as const;
const CATEGORY_TINT: Record<string, string> = {
  study: "bg-primary/10 text-primary",
  japanese: "bg-sky-100 text-sky-700",
  chinese: "bg-rose-100 text-rose-700",
  korean: "bg-violet-100 text-violet-700",
  coding: "bg-emerald-100 text-emerald-700",
  reading: "bg-amber-100 text-amber-700",
  exam: "bg-orange-100 text-orange-700",
  other: "bg-muted text-muted-foreground",
};

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const r = localStorage.getItem(key); return r ? (JSON.parse(r) as T) : fallback; } catch { return fallback; }
}
function saveJSON(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ }
}
function todayISO() { return new Date().toISOString().slice(0, 10); }

function PlannerPage() {
  const qc = useQueryClient();
  const { profile } = useProfile();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("study");
  const [due, setDue] = useState<string>(todayISO());
  const [alarm, setAlarm] = useState<string>("");
  const [filter, setFilter] = useState<"today" | "upcoming" | "done" | "all">("today");
  const [alarms, setAlarms] = useState<AlarmMap>(() => loadJSON<AlarmMap>(ALARM_KEY, {}));
  const [selected, setSelected] = useState<string>(todayISO());
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });


  const q = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*")
        .order("completed").order("due_date", { ascending: true, nullsFirst: false }).order("created_at");
      return (data ?? []) as Task[];
    },
  });

  const focusQ = useQuery({
    queryKey: ["focus", "week"],
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 6); since.setHours(0, 0, 0, 0);
      const { data } = await supabase.from("focus_sessions").select("minutes,completed_at").gte("completed_at", since.toISOString());
      return data ?? [];
    },
  });

  const deadlinesQ = useQuery({
    queryKey: ["deadlines", "planner"],
    queryFn: async () => {
      const { data } = await supabase.from("deadlines").select("id,title,date,kind").order("date");
      return data ?? [];
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Silent alarm polling — toast + system notification only, no sound.
  const tasksRef = useRef<Task[]>([]);
  tasksRef.current = q.data ?? [];
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const ymd = todayISO();
      const fired = loadJSON<Record<string, string>>(FIRED_KEY, {});
      const a = loadJSON<AlarmMap>(ALARM_KEY, {});
      for (const t of tasksRef.current) {
        if (t.completed) continue;
        const time = a[t.id];
        if (!time || time !== hhmm) continue;
        if (t.due_date && t.due_date !== ymd) continue;
        const key = `${t.id}-${ymd}`;
        if (fired[key]) continue;
        fired[key] = new Date().toISOString();
        saveJSON(FIRED_KEY, fired);
        toast(t.title, { description: `Reminder · ${time}`, duration: 12000 });
        if ("Notification" in window && Notification.permission === "granted") {
          try { new Notification("Task reminder", { body: t.title, tag: t.id, silent: true }); } catch { /* ignore */ }
        }
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const add = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase.from("tasks")
        .insert({ title, category, due_date: due || null, user_id: user.id }).select("id").single();
      if (error) throw error;
      if (alarm && data) {
        const next = { ...loadJSON<AlarmMap>(ALARM_KEY, {}), [data.id]: alarm };
        saveJSON(ALARM_KEY, next); setAlarms(next);
      }
    },
    onSuccess: () => {
      setTitle(""); setAlarm("");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["tasks", "today"] });
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from("tasks")
        .update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("tasks").delete().eq("id", id);
      const next = { ...loadJSON<AlarmMap>(ALARM_KEY, {}) }; delete next[id];
      saveJSON(ALARM_KEY, next); setAlarms(next);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  function setTaskAlarm(id: string, time: string) {
    const next = { ...loadJSON<AlarmMap>(ALARM_KEY, {}) };
    if (time) next[id] = time; else delete next[id];
    saveJSON(ALARM_KEY, next); setAlarms(next);
    toast.success(time ? `Reminder set for ${time}` : "Reminder cleared");
  }

  const today = todayISO();
  const all = q.data ?? [];
  const tasks = all.filter((t) => {
    if (filter === "today") return !t.completed && (!t.due_date || t.due_date === today);
    if (filter === "upcoming") return !t.completed && !!t.due_date && t.due_date > today;
    if (filter === "done") return t.completed;
    return true;
  });

  const todayAll = all.filter((t) => !t.due_date || t.due_date <= today);
  const todayDone = todayAll.filter((t) => t.completed).length;
  const donePct = todayAll.length ? Math.round((todayDone / todayAll.length) * 100) : 0;

  const week = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString(undefined, { weekday: "narrow" }), minutes: 0 };
    });
    for (const s of focusQ.data ?? []) {
      const day = days.find((d) => d.key === (s.completed_at as string).slice(0, 10));
      if (day) day.minutes += s.minutes ?? 0;
    }
    return days;
  }, [focusQ.data]);
  const maxMin = Math.max(60, ...week.map((d) => d.minutes));
  const weekTotal = week.reduce((a, b) => a + b.minutes, 0);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Planner</div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-2">
              Plan the day,<br />not the whole year.
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-md">
              {todayAll.length === 0
                ? "Nothing scheduled yet — add your first task below."
                : `${todayAll.length - todayDone} task${todayAll.length - todayDone === 1 ? "" : "s"} left today · ${donePct}% done.`}
            </p>
          </div>
          <div className="flex items-stretch gap-3">
            <LiveClock />
            <WeatherCard />
          </div>
        </header>

        {/* Overview strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Metric icon={ListTodo} label="Open today" value={`${todayAll.length - todayDone}`} />
          <Metric icon={CheckCircle2} label="Completed" value={`${todayDone}`} />
          <Metric icon={Timer} label="Focus this week" value={`${Math.round((weekTotal / 60) * 10) / 10}h`} />
          <Metric icon={Flame} label="Streak" value={`${profile?.current_streak ?? 0}d`} />
        </section>

        <div className="grid lg:grid-cols-[1.35fr_1fr] gap-5 items-start">
          {/* LEFT: tasks */}
          <div className="space-y-4">
            <form
              onSubmit={(e) => { e.preventDefault(); if (title.trim()) add.mutate(); }}
              className="rounded-3xl border border-border/60 bg-card p-4 shadow-[0_1px_0_0_rgb(0_0_0/0.02),0_20px_45px_-32px_rgb(15_23_42/0.2)] space-y-3"
            >
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs doing?"
                className="w-full bg-muted/60 rounded-2xl px-4 py-3.5 text-sm font-medium outline-none border border-transparent focus:border-primary/50 transition"
              />
              <div className="flex flex-wrap gap-2">
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="bg-muted/60 rounded-2xl px-3 py-2.5 text-xs font-bold capitalize border border-transparent outline-none">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
                  className="bg-muted/60 rounded-2xl px-3 py-2.5 text-xs font-bold border border-transparent outline-none" />
                <input type="time" value={alarm} onChange={(e) => setAlarm(e.target.value)} title="Reminder time"
                  className="bg-muted/60 rounded-2xl px-3 py-2.5 text-xs font-bold border border-transparent outline-none" />
                <button className="ml-auto bg-foreground text-background rounded-full px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition">
                  <Plus className="size-4 stroke-[1.75]" /> Add task
                </button>
              </div>
            </form>

            <div className="flex gap-1 bg-card p-1 rounded-full border border-border/60 w-fit">
              {(["today", "upcoming", "done", "all"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition ${
                    filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}>{f}</button>
              ))}
            </div>

            <div className="space-y-2">
              {q.isLoading && <div className="h-16 bg-card rounded-2xl border border-border/60 animate-pulse" />}
              {!q.isLoading && tasks.length === 0 && (
                <div className="rounded-3xl border border-border/60 bg-card p-10 text-center">
                  <div className="font-display text-lg font-bold">All clear.</div>
                  <p className="text-sm text-muted-foreground mt-1">Nothing in this view — add something small and finish it.</p>
                </div>
              )}
              {tasks.map((t) => {
                const taskAlarm = alarms[t.id] ?? "";
                const tint = CATEGORY_TINT[t.category ?? "other"] ?? CATEGORY_TINT.other;
                return (
                  <div key={t.id}
                    className="group rounded-2xl border border-border/60 bg-card p-3.5 flex items-center gap-3 hover:shadow-[0_18px_40px_-30px_rgb(15_23_42/0.35)] hover:-translate-y-[1px] transition-all">
                    <button
                      onClick={() => toggle.mutate({ id: t.id, completed: !t.completed })}
                      className="shrink-0 text-foreground/70 hover:text-primary transition"
                      aria-label="Toggle complete"
                    >
                      {t.completed
                        ? <CheckCircle2 className="size-6 stroke-[1.6] text-primary" />
                        : <Circle className="size-6 stroke-[1.6]" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm truncate ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tint}`}>{t.category ?? "other"}</span>
                        {t.due_date && <span className="text-[11px] text-muted-foreground">{new Date(t.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>}
                        {taskAlarm && <span className="text-[11px] text-muted-foreground">· {taskAlarm}</span>}
                      </div>
                    </div>
                    <label className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0" title="Set reminder">
                      {taskAlarm ? <Bell className="size-[18px] stroke-[1.75] text-primary" /> : <BellOff className="size-[18px] stroke-[1.75]" />}
                      <input type="time" value={taskAlarm} onChange={(e) => setTaskAlarm(t.id, e.target.value)} className="sr-only" />
                    </label>
                    <button onClick={() => del.mutate(t.id)} className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition" aria-label="Delete task">
                      <Trash2 className="size-[18px] stroke-[1.75]" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: rail */}
          <div className="space-y-4">
            <FocusCard />

            <Panel title="Focus this week" hint={`${weekTotal} min`}>
              <div className="flex items-end gap-2 h-28">
                {week.map((d) => (
                  <div key={d.key} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full bg-muted rounded-xl overflow-hidden flex items-end h-20">
                      <div className="w-full bg-primary rounded-xl transition-all" style={{ height: `${(d.minutes / maxMin) * 100}%` }} />
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">{d.label}</div>
                  </div>
                ))}
              </div>
            </Panel>

            <HabitTracker />

            <Panel
              title="Upcoming deadlines"
              hint={<Link to="/applications" className="text-xs font-bold text-primary">All →</Link>}
            >
              {deadlinesQ.data && deadlinesQ.data.some((d) => d.date >= todayISO()) ? (
                <ul className="space-y-1.5">
                  {deadlinesQ.data.filter((d) => d.date >= todayISO()).slice(0, 5).map((d) => {
                    const days = Math.max(0, Math.ceil((new Date(d.date).getTime() - Date.now()) / 86_400_000));
                    return (
                      <li key={d.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/60 transition">
                        <span className="size-9 rounded-2xl bg-muted grid place-items-center shrink-0">
                          <CalendarDays className="size-[18px] stroke-[1.75] text-foreground/70" />
                        </span>
                        <span className="flex-1 text-sm font-medium truncate">{d.title}</span>
                        <span className="text-[11px] font-bold text-muted-foreground shrink-0">{days}d</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No deadlines saved yet.</p>
              )}
            </Panel>

            <Link
              to="/tutor"
              className="block rounded-3xl border border-border/60 bg-card p-5 hover:-translate-y-[1px] hover:shadow-[0_20px_45px_-30px_rgb(15_23_42/0.3)] transition-all"
            >
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <Sparkles className="size-3.5 stroke-[1.75]" /> Ask StudyHub
              </div>
              <div className="font-display text-lg font-bold mt-1.5">Turn today into a plan.</div>
              <p className="text-xs text-muted-foreground mt-1">Tell the tutor what's on your plate and get a realistic order of attack.</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary">Open tutor <ArrowRight className="size-3.5" /></span>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof ListTodo; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <Icon className="size-3.5 stroke-[1.75]" /> {label}
      </div>
      <div className="font-display text-2xl font-bold mt-1.5">{value}</div>
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</div>
        {typeof hint === "string" ? <span className="text-xs text-muted-foreground font-semibold">{hint}</span> : hint}
      </div>
      {children}
    </section>
  );
}

/** Minimal card-flip style clock, updated once a second. */
function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return (
    <div className="rounded-3xl border border-border/60 bg-card px-5 py-4 min-w-[9.5rem]">
      <div className="flex items-center gap-1.5">
        <Digit value={hh} />
        <span className="font-display text-2xl font-bold pb-0.5">:</span>
        <Digit value={mm} />
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
        {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
      </div>
    </div>
  );
}
function Digit({ value }: { value: string }) {
  return (
    <span className="rounded-xl bg-muted px-2.5 py-1.5 font-display text-2xl font-bold tabular-nums transition-all">
      {value}
    </span>
  );
}

type Weather = { temp: number; code: number; city: string };
const WEATHER_KEY = "studyhub-weather-v1";

function weatherLabel(code: number) {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  return "Storm";
}

function WeatherCard() {
  const [w, setW] = useState<Weather | null>(() => loadJSON<Weather | null>(WEATHER_KEY, null));
  const [state, setState] = useState<"idle" | "loading" | "denied">("idle");

  async function load() {
    if (typeof navigator === "undefined" || !navigator.geolocation) { setState("denied"); return; }
    setState("loading");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude: lat, longitude: lon } = pos.coords;
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`);
        const j = await r.json();
        const next: Weather = {
          temp: Math.round(j?.current?.temperature_2m ?? 0),
          code: j?.current?.weather_code ?? 0,
          city: j?.timezone?.split("/").pop()?.replace(/_/g, " ") ?? "Local",
        };
        setW(next); saveJSON(WEATHER_KEY, next); setState("idle");
      } catch { setState("denied"); }
    }, () => setState("denied"), { timeout: 8000 });
  }

  useEffect(() => { if (!w) void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <button
      onClick={load}
      className="rounded-3xl border border-border/60 bg-card px-5 py-4 text-left min-w-[9.5rem] hover:border-primary/40 transition"
    >
      <div className="flex items-center gap-2">
        <CloudSun className="size-5 stroke-[1.75] text-primary" />
        <span className="font-display text-2xl font-bold">{w ? `${w.temp}°` : state === "loading" ? "…" : "--"}</span>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2 truncate">
        {w ? `${weatherLabel(w.code)} · ${w.city}` : state === "denied" ? "Tap to allow location" : "Loading weather"}
      </div>
    </button>
  );
}

/** Live view of the persistent global focus timer. */
function FocusCard() {
  const t = useFocusTimer();
  useTick(1000, t.running);
  const total = (t.phase === "focus" ? t.focusMin : t.breakMin) * 60_000;
  const left = focusTimer.remaining(Date.now(), t);
  const pct = total > 0 ? ((total - left) / total) * 100 : 0;

  return (
    <section className="rounded-3xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Timer className="size-3.5 stroke-[1.75]" /> {t.phase === "focus" ? "Focus session" : "Break"}
        </div>
        <Link to="/focus" className="text-xs font-bold text-primary">Open →</Link>
      </div>
      <div className="font-display text-4xl font-bold tabular-nums mt-2">{formatMs(left)}</div>
      <div className="h-2 mt-4 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={() => focusTimer.toggle()}
          className="flex-1 rounded-full bg-foreground text-background py-2.5 text-xs font-bold hover:opacity-90 active:scale-[0.98] transition">
          {t.running ? "Pause" : "Start"}
        </button>
        <button onClick={() => focusTimer.reset()}
          className="rounded-full border border-border/60 px-4 py-2.5 text-xs font-bold hover:bg-muted transition">
          Reset
        </button>
      </div>
    </section>
  );
}

const DEFAULT_HABITS = ["Vocabulary review", "Read 10 minutes", "Deep focus block"];
type HabitLog = Record<string, string[]>; // habit -> ISO dates

function HabitTracker() {
  const [habits, setHabits] = useState<string[]>(() => loadJSON<string[]>(`${HABIT_KEY}-list`, DEFAULT_HABITS));
  const [log, setLog] = useState<HabitLog>(() => loadJSON<HabitLog>(HABIT_KEY, {}));
  const [draft, setDraft] = useState("");
  const today = todayISO();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  function toggleHabit(h: string) {
    const dates = new Set(log[h] ?? []);
    dates.has(today) ? dates.delete(today) : dates.add(today);
    const next = { ...log, [h]: [...dates] };
    setLog(next); saveJSON(HABIT_KEY, next);
  }
  function addHabit(e: React.FormEvent) {
    e.preventDefault();
    const name = draft.trim();
    if (!name || habits.includes(name)) return;
    const next = [...habits, name];
    setHabits(next); saveJSON(`${HABIT_KEY}-list`, next); setDraft("");
  }
  function removeHabit(h: string) {
    const next = habits.filter((x) => x !== h);
    setHabits(next); saveJSON(`${HABIT_KEY}-list`, next);
  }

  return (
    <Panel title="Habits" hint={`${habits.filter((h) => (log[h] ?? []).includes(today)).length}/${habits.length} today`}>
      <ul className="space-y-2">
        {habits.map((h) => {
          const done = (log[h] ?? []).includes(today);
          return (
            <li key={h} className="group flex items-center gap-3">
              <button onClick={() => toggleHabit(h)} className="shrink-0 text-foreground/70 hover:text-primary transition" aria-label={`Toggle ${h}`}>
                {done ? <CheckCircle2 className="size-5 stroke-[1.6] text-primary" /> : <Circle className="size-5 stroke-[1.6]" />}
              </button>
              <span className={`flex-1 text-sm font-medium truncate ${done ? "text-muted-foreground line-through" : ""}`}>{h}</span>
              <span className="flex gap-1 shrink-0">
                {last7.map((d) => (
                  <span key={d} className={`size-2 rounded-full ${(log[h] ?? []).includes(d) ? "bg-primary" : "bg-muted"}`} />
                ))}
              </span>
              <button onClick={() => removeHabit(h)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition" aria-label={`Remove ${h}`}>
                <Trash2 className="size-4 stroke-[1.75]" />
              </button>
            </li>
          );
        })}
      </ul>
      <form onSubmit={addHabit} className="mt-3 flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="New habit"
          className="flex-1 bg-muted/60 rounded-2xl px-3 py-2 text-xs font-medium outline-none border border-transparent focus:border-primary/50" />
        <button className="rounded-full border border-border/60 px-3 py-2 text-xs font-bold hover:bg-muted transition">Add</button>
      </form>
    </Panel>
  );
}
