import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";
import { focusTimer, useFocusTimer, useTick, formatMs } from "@/lib/focus-timer";

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
          {/* LEFT: calendar + tasks */}
          <div className="space-y-4">
            <MonthCalendar
              cursor={cursor}
              setCursor={setCursor}
              selected={selected}
              onSelect={(d) => { setSelected(d); setDue(d); }}
              tasks={all}
              deadlines={(deadlinesQ.data ?? []).map((d: { date: string }) => d.date)}
            />

            <Panel
              title={jpFullDate(new Date(selected))}
              hint={`${all.filter((t) => t.due_date === selected).length} scheduled`}
            >
              <ul className="space-y-1.5">
                {all.filter((t) => t.due_date === selected).map((t) => (
                  <li key={t.id} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-muted/60 transition">
                    <button onClick={() => toggle.mutate({ id: t.id, completed: !t.completed })} aria-label="Toggle complete" className="shrink-0 text-foreground/70 hover:text-primary transition">
                      {t.completed ? <CheckCircle2 className="size-5 stroke-[1.6] text-primary" /> : <Circle className="size-5 stroke-[1.6]" />}
                    </button>
                    <span className={`flex-1 text-sm font-medium truncate ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                    {alarms[t.id] && <span className="text-[11px] font-bold text-muted-foreground shrink-0">{alarms[t.id]}</span>}
                  </li>
                ))}
                {(deadlinesQ.data ?? []).filter((d) => d.date === selected).map((d) => (
                  <li key={d.id} className="flex items-center gap-3 p-2.5 rounded-2xl bg-muted/40">
                    <CalendarDays className="size-5 stroke-[1.6] text-foreground/60 shrink-0" />
                    <span className="flex-1 text-sm font-medium truncate">{d.title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">deadline</span>
                  </li>
                ))}
                {all.filter((t) => t.due_date === selected).length === 0 &&
                  (deadlinesQ.data ?? []).filter((d) => d.date === selected).length === 0 && (
                    <li className="text-sm text-muted-foreground py-3">Nothing scheduled — a good day for a focus block.</li>
                  )}
              </ul>
            </Panel>

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
            <FocusSection />



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

type Weather = { temp: number; code: number };
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
        {w ? weatherLabel(w.code) : state === "denied" ? "Tap to allow location" : "Loading weather"}
      </div>
    </button>
  );
}


/** Month calendar with task/deadline markers. */
function MonthCalendar({
  cursor, setCursor, selected, onSelect, tasks, deadlines,
}: {
  cursor: Date;
  setCursor: (d: Date) => void;
  selected: string;
  onSelect: (iso: string) => void;
  tasks: Task[];
  deadlines: string[];
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }),
  ];
  const today = todayISO();
  const shift = (n: number) => setCursor(new Date(year, month + n, 1));

  return (
    <section className="rounded-3xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="font-display text-lg font-bold tracking-tight">
          {jpYearMonth(first)}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => shift(-1)} aria-label="Previous month"
            className="size-9 rounded-full grid place-items-center hover:bg-muted transition">
            <ChevronLeft className="size-[18px] stroke-[1.75]" />
          </button>
          <button onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); onSelect(today); }}
            className="px-3 h-9 rounded-full text-xs font-bold hover:bg-muted transition">Today</button>
          <button onClick={() => shift(1)} aria-label="Next month"
            className="size-9 rounded-full grid place-items-center hover:bg-muted transition">
            <ChevronRight className="size-[18px] stroke-[1.75]" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
        {JP_WEEKDAYS_MON_FIRST.map((d, i) => <div key={i} className={i === 5 ? "text-sky-500" : i === 6 ? "text-rose-400" : ""}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((iso, i) => {
          if (!iso) return <div key={`p${i}`} />;
          const dayTasks = tasks.filter((t) => t.due_date === iso);
          const open = dayTasks.filter((t) => !t.completed).length;
          const hasDeadline = deadlines.includes(iso);
          const isToday = iso === today;
          const isSel = iso === selected;
          return (
            <button
              key={iso}
              onClick={() => onSelect(iso)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 text-sm font-semibold transition ${
                isSel ? "bg-foreground text-background"
                  : isToday ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}
            >
              <span className="tabular-nums">{Number(iso.slice(8))}</span>
              <span className="flex gap-0.5 h-1">
                {open > 0 && <span className={`size-1 rounded-full ${isSel ? "bg-background" : "bg-primary"}`} />}
                {hasDeadline && <span className={`size-1 rounded-full ${isSel ? "bg-background/70" : "bg-foreground/50"}`} />}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

const FOCUS_PRESETS = [
  { label: "25 / 5", focus: 25, brk: 5 },
  { label: "50 / 10", focus: 50, brk: 10 },
  { label: "15 / 3", focus: 15, brk: 3 },
  { label: "90 / 15", focus: 90, brk: 15 },
];

/** Full focus mode, folded into the planner. */
function FocusSection() {
  const t = useFocusTimer();
  useTick(500, t.running);
  const { profile, update } = useProfile();
  const total = (t.phase === "focus" ? t.focusMin : t.breakMin) * 60_000;
  const left = focusTimer.remaining(Date.now(), t);
  const pct = total > 0 ? ((total - left) / total) * 100 : 0;

  const todayQ = useQuery({
    queryKey: ["focus", "today"],
    queryFn: async () => {
      const since = new Date(); since.setHours(0, 0, 0, 0);
      const { data } = await supabase.from("focus_sessions").select("minutes").gte("completed_at", since.toISOString());
      return (data ?? []).reduce((a, b) => a + (b.minutes ?? 0), 0);
    },
  });
  const target = profile?.daily_minutes_target ?? 60;
  const done = todayQ.data ?? 0;
  const goalPct = Math.min(100, (done / Math.max(1, target)) * 100);

  return (
    <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-[0_1px_0_0_rgb(0_0_0/0.02),0_24px_50px_-34px_rgb(15_23_42/0.25)]">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Timer className="size-3.5 stroke-[1.75]" /> {t.phase === "focus" ? "Deep focus" : "Break"}
        </div>
        <button
          onClick={() => focusTimer.setPhase(t.phase === "focus" ? "break" : "focus")}
          className="text-xs font-bold text-primary"
        >
          {t.phase === "focus" ? "Take a break" : "Back to focus"}
        </button>
      </div>

      <div className="font-display text-6xl font-bold tabular-nums leading-none mt-3">{formatMs(left)}</div>
      <div className="h-1.5 mt-5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex gap-2 mt-5">
        <button onClick={() => focusTimer.toggle()}
          className="flex-1 rounded-full bg-foreground text-background py-3 text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition">
          {t.running ? <><Pause className="size-4 stroke-[1.75]" />Pause</> : <><Play className="size-4 stroke-[1.75]" />Start</>}
        </button>
        <button onClick={() => focusTimer.reset()}
          className="rounded-full border border-border/60 px-4 py-3 text-sm font-bold flex items-center gap-2 hover:bg-muted transition">
          <RotateCcw className="size-4 stroke-[1.75]" />Reset
        </button>
      </div>

      <div className="flex gap-2 mt-4 flex-wrap">
        {FOCUS_PRESETS.map((d) => (
          <button key={d.label} onClick={() => focusTimer.setDurations(d.focus, d.brk)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
              t.focusMin === d.focus && t.breakMin === d.brk
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/60 hover:bg-muted"
            }`}>{d.label}</button>
        ))}
      </div>

      <div className="mt-6 pt-5 border-t border-border/60">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Target className="size-3.5 stroke-[1.75]" /> Daily goal
          </div>
          <GoalEditor value={target} onSave={(v) => update.mutate({ daily_minutes_target: v })} />
        </div>
        <div className="font-display text-xl font-bold mt-2">
          {done}<span className="text-muted-foreground text-sm font-medium"> / {target} min today</span>
        </div>
        <div className="h-2 mt-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${goalPct}%` }} />
        </div>
      </div>
    </section>
  );
}

function GoalEditor({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => { setDraft(String(value)); }, [value]);
  const n = Number(draft);
  const valid = Number.isFinite(n) && n >= 1 && n <= 1440;
  return (
    <div className="flex items-center gap-1.5">
      {[30, 60, 120].map((p) => (
        <button key={p} onClick={() => { setDraft(String(p)); onSave(p); toast.success(`Daily goal set to ${p} min`); }}
          className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition ${
            value === p ? "bg-primary text-primary-foreground border-primary" : "border-border/60 hover:bg-muted"
          }`}>{p}m</button>
      ))}
      <input type="number" min={1} max={1440} value={draft} onChange={(e) => setDraft(e.target.value)}
        aria-label="Custom daily goal in minutes"
        className="w-16 rounded-full border border-border/60 bg-card px-2.5 py-1.5 text-[11px] font-bold outline-none focus:border-primary" />
      <button disabled={!valid} onClick={() => { onSave(n); toast.success(`Daily goal set to ${n} min`); }}
        aria-label="Save goal"
        className="size-7 rounded-full bg-foreground text-background grid place-items-center disabled:opacity-40">
        <Check className="size-3.5 stroke-[1.75]" />
      </button>
    </div>
  );
}

/* ---------- Japanese calendar formatting (Planner calendar only) ---------- */
/** Monday-first weekday labels, matching the calendar grid order. */
const JP_WEEKDAYS_MON_FIRST = ["月", "火", "水", "木", "金", "土", "日"] as const;
const JP_WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** 2026年8月 */
function jpYearMonth(d: Date) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

/** 2026年8月2日（日） */
function jpFullDate(d: Date) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${JP_WEEKDAYS[d.getDay()]}）`;
}
