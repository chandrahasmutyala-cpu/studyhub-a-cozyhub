import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Plus, Trash2, Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tasks")({
  component: TasksPage,
});

type Task = {
  id: string; title: string; notes: string | null; category: string | null;
  priority: string | null; due_date: string | null; completed: boolean;
};

type AlarmMap = Record<string, string>; // taskId -> "HH:MM"
const ALARM_KEY = "task-alarms-v1";
const FIRED_KEY = "task-alarms-fired-v1";

function loadAlarms(): AlarmMap {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(ALARM_KEY) ?? "{}"); } catch { return {}; }
}
function saveAlarms(a: AlarmMap) { localStorage.setItem(ALARM_KEY, JSON.stringify(a)); }
function loadFired(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(FIRED_KEY) ?? "{}"); } catch { return {}; }
}
function saveFired(f: Record<string, string>) { localStorage.setItem(FIRED_KEY, JSON.stringify(f)); }

function TasksPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("study");
  const [due, setDue] = useState<string>(new Date().toISOString().slice(0, 10));
  const [alarm, setAlarm] = useState<string>("");
  const [filter, setFilter] = useState<"today" | "upcoming" | "all">("today");
  const [alarms, setAlarms] = useState<AlarmMap>(() => loadAlarms());

  const q = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*").order("completed").order("due_date", { ascending: true, nullsFirst: false }).order("created_at");
      return (data ?? []) as Task[];
    },
  });

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Poll every 15s and fire alarms
  const tasksRef = useRef<Task[]>([]);
  tasksRef.current = q.data ?? [];
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const ymd = now.toISOString().slice(0, 10);
      const fired = loadFired();
      const a = loadAlarms();
      for (const t of tasksRef.current) {
        if (t.completed) continue;
        const time = a[t.id];
        if (!time) continue;
        if (t.due_date && t.due_date !== ymd) continue;
        if (time !== hhmm) continue;
        const key = `${t.id}-${ymd}`;
        if (fired[key]) continue;
        fired[key] = new Date().toISOString();
        saveFired(fired);
        toast(`⏰ ${t.title}`, { description: `Scheduled for ${time}`, duration: 12000 });
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try { new Notification("Task reminder", { body: t.title, tag: t.id }); } catch { /* ignore */ }
        }
        try {
          const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = 880; g.gain.value = 0.05;
          o.start(); setTimeout(() => { o.stop(); ctx.close(); }, 500);
        } catch { /* ignore */ }
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const add = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase.from("tasks").insert({ title, category, due_date: due || null, user_id: user.id }).select("id").single();
      if (error) throw error;
      if (alarm && data) {
        const next = { ...loadAlarms(), [data.id]: alarm };
        saveAlarms(next); setAlarms(next);
      }
    },
    onSuccess: () => { setTitle(""); setAlarm(""); qc.invalidateQueries({ queryKey: ["tasks"] }); qc.invalidateQueries({ queryKey: ["tasks", "today"] }); },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from("tasks").update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("tasks").delete().eq("id", id);
      const next = { ...loadAlarms() }; delete next[id]; saveAlarms(next); setAlarms(next);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  function setTaskAlarm(id: string, time: string) {
    const next = { ...loadAlarms() };
    if (time) next[id] = time; else delete next[id];
    saveAlarms(next); setAlarms(next);
    toast.success(time ? `Alarm set for ${time}` : "Alarm cleared");
  }

  const today = new Date().toISOString().slice(0, 10);
  const tasks = (q.data ?? []).filter((t) => {
    if (filter === "today") return !t.due_date || t.due_date === today;
    if (filter === "upcoming") return t.due_date && t.due_date > today;
    return true;
  });

  return (
    <AppShell>
      <div className="max-w-3xl space-y-5">
        <div>
          <h1 className="font-display text-3xl font-bold">Planner</h1>
          <p className="text-sm text-muted-foreground">Tiny tasks. Real progress. Now with alarms ⏰</p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); if (title.trim()) add.mutate(); }}
          className="bg-white border border-border rounded-3xl p-4 grid sm:grid-cols-[1fr_auto_auto_auto_auto] gap-2 shadow-soft items-center"
        >
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            className="bg-cream rounded-2xl px-4 py-3 outline-none focus:border-primary border border-transparent" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-cream rounded-2xl px-3 py-3 text-sm font-semibold border border-transparent">
            {["study","japanese","coding","reading","exam","other"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="bg-cream rounded-2xl px-3 py-3 text-sm font-semibold border border-transparent" />
          <input type="time" value={alarm} onChange={(e) => setAlarm(e.target.value)} title="Alarm time" className="bg-cream rounded-2xl px-3 py-3 text-sm font-semibold border border-transparent" />
          <button className="bg-primary rounded-full px-4 py-2 font-bold flex items-center gap-1 justify-center"><Plus className="size-4" />Add</button>
        </form>

        <div className="flex gap-1 bg-white p-1 rounded-full border border-border w-fit">
          {(["today","upcoming","all"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize ${filter === f ? "bg-primary" : "text-muted-foreground"}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {q.isLoading && <div className="h-12 bg-white rounded-2xl animate-pulse" />}
          {!q.isLoading && tasks.length === 0 && (
            <div className="bg-white border border-border rounded-3xl p-8 text-center text-muted-foreground text-sm">
              All clear — add a task to begin 🌱
            </div>
          )}
          {tasks.map((t) => {
            const taskAlarm = alarms[t.id] ?? "";
            return (
              <div key={t.id} className="bg-white border border-border rounded-2xl p-3 flex items-center gap-3">
                <button
                  onClick={() => toggle.mutate({ id: t.id, completed: !t.completed })}
                  className={`size-6 rounded-full border-2 grid place-items-center shrink-0 ${t.completed ? "bg-primary border-primary" : "border-foreground/30"}`}
                  aria-label="Toggle complete"
                >
                  {t.completed && <span className="text-xs">✓</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm truncate ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t.category}{t.due_date ? ` · ${t.due_date}` : ""}{taskAlarm ? ` · ⏰ ${taskAlarm}` : ""}
                  </div>
                </div>
                <label className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0" title="Set alarm">
                  {taskAlarm ? <Bell className="size-4 text-primary" /> : <BellOff className="size-4" />}
                  <input type="time" value={taskAlarm} onChange={(e) => setTaskAlarm(t.id, e.target.value)}
                    className="sr-only" />
                </label>
                <button onClick={() => del.mutate(t.id)} className="text-muted-foreground hover:text-destructive shrink-0" aria-label="Delete task">
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
