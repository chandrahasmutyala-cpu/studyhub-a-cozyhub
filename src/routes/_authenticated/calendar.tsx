import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/calendar")({
  component: CalendarPage,
});

type View = "day" | "week" | "month" | "year";
type Item = { id: string; title: string; date: string; kind: string | null; notes: string | null; source: "deadline" | "task" };

// Minimal Apple-inspired palette — soft dot + soft tint
const KIND_TINT: Record<string, { dot: string; chip: string }> = {
  university:  { dot: "bg-sky-400",     chip: "bg-sky-50 text-sky-900" },
  scholarship: { dot: "bg-amber-400",   chip: "bg-amber-50 text-amber-900" },
  exam:        { dot: "bg-rose-400",    chip: "bg-rose-50 text-rose-900" },
  personal:    { dot: "bg-violet-400",  chip: "bg-violet-50 text-violet-900" },
  study:       { dot: "bg-emerald-400", chip: "bg-emerald-50 text-emerald-900" },
  language:    { dot: "bg-indigo-400",  chip: "bg-indigo-50 text-indigo-900" },
  task:        { dot: "bg-slate-400",   chip: "bg-slate-50 text-slate-900" },
};
function tint(k?: string | null) {
  if (!k) return KIND_TINT.task;
  return KIND_TINT[k] ?? KIND_TINT.task;
}

function CalendarPage() {
  const qc = useQueryClient();
  const [view, setView] = useState<View>("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [adding, setAdding] = useState<string | null>(null);

  const { data: items = [] } = useQuery({
    queryKey: ["calendar-items"],
    queryFn: async (): Promise<Item[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const [d, t] = await Promise.all([
        supabase.from("deadlines").select("id,title,date,kind,notes").eq("user_id", user.id),
        supabase.from("tasks").select("id,title,due_date,category,notes,completed").eq("user_id", user.id).not("due_date","is",null),
      ]);
      const a: Item[] = (d.data ?? []).map((r) => ({ id: r.id, title: r.title, date: r.date, kind: r.kind, notes: r.notes, source: "deadline" }));
      const b: Item[] = (t.data ?? []).map((r) => ({ id: r.id, title: r.title, date: r.due_date as string, kind: r.category ?? "task", notes: r.notes, source: "task" }));
      return [...a, ...b];
    },
  });

  const byDate = useMemo(() => {
    const m = new Map<string, Item[]>();
    for (const it of items) {
      const k = it.date;
      const a = m.get(k) ?? [];
      a.push(it); m.set(k, a);
    }
    return m;
  }, [items]);

  function shift(delta: number) {
    const d = new Date(anchor);
    if (view === "day") d.setDate(d.getDate() + delta);
    else if (view === "week") d.setDate(d.getDate() + delta * 7);
    else if (view === "month") d.setMonth(d.getMonth() + delta);
    else d.setFullYear(d.getFullYear() + delta);
    setAnchor(d);
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-up">
        <header className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Calendar</div>
            <h1 className="font-display text-4xl font-bold tracking-tight mt-1">{headerLabel(anchor, view)}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 bg-white/90 backdrop-blur p-1 rounded-full border border-border">
              {(["day","week","month","year"] as View[]).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold capitalize transition ${view === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>{v}</button>
              ))}
            </div>
            <button onClick={() => setAnchor(new Date())} className="text-[11px] font-bold px-3.5 py-2 rounded-full bg-white border border-border hover:bg-secondary">Today</button>
            <div className="flex items-center gap-1">
              <button onClick={() => shift(-1)} className="size-9 rounded-full bg-white border border-border grid place-items-center hover:bg-secondary"><ChevronLeft className="size-4" /></button>
              <button onClick={() => shift(1)} className="size-9 rounded-full bg-white border border-border grid place-items-center hover:bg-secondary"><ChevronRight className="size-4" /></button>
            </div>
          </div>
        </header>

        {view === "month" && <MonthGrid anchor={anchor} byDate={byDate} onAdd={setAdding} />}
        {view === "week"  && <WeekList anchor={anchor} byDate={byDate} onAdd={setAdding} />}
        {view === "day"   && <DayList date={anchor} items={byDate.get(iso(anchor)) ?? []} onAdd={() => setAdding(iso(anchor))} />}
        {view === "year"  && <YearGrid anchor={anchor} byDate={byDate} onSelectMonth={(d) => { setAnchor(d); setView("month"); }} />}

        <Legend />

        {adding && (
          <AddDialog
            date={adding}
            onClose={() => setAdding(null)}
            onSaved={() => { setAdding(null); qc.invalidateQueries({ queryKey: ["calendar-items"] }); }}
          />
        )}
      </div>
    </AppShell>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
      {Object.entries(KIND_TINT).filter(([k]) => k !== "task").map(([k, v]) => (
        <div key={k} className="inline-flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${v.dot}`} />
          <span className="capitalize">{k}</span>
        </div>
      ))}
    </div>
  );
}

function headerLabel(d: Date, v: View) {
  if (v === "year") return String(d.getFullYear());
  if (v === "month") return d.toLocaleString(undefined, { month: "long", year: "numeric" });
  if (v === "week") {
    const s = startOfWeek(d), e = new Date(s); e.setDate(s.getDate() + 6);
    return `${s.toLocaleString(undefined,{ month:"short", day:"numeric" })} – ${e.toLocaleString(undefined,{ month:"short", day:"numeric", year:"numeric" })}`;
  }
  return d.toLocaleString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function iso(d: Date) { return d.toISOString().slice(0, 10); }
function startOfWeek(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate() - x.getDay()); return x; }

function MonthGrid({ anchor, byDate, onAdd }: { anchor: Date; byDate: Map<string, Item[]>; onAdd: (iso: string) => void }) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = startOfWeek(first);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); cells.push(d); }
  const today = iso(new Date());

  return (
    <div className="bg-white/95 backdrop-blur border border-border rounded-[2rem] p-4 shadow-soft">
      <div className="grid grid-cols-7 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground pb-3 px-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border/40 rounded-2xl overflow-hidden">
        {cells.map((d) => {
          const di = iso(d);
          const inMonth = d.getMonth() === anchor.getMonth();
          const dayItems = byDate.get(di) ?? [];
          const isToday = di === today;
          return (
            <button key={di} onClick={() => onAdd(di)}
              className={`group relative min-h-[92px] sm:min-h-[110px] p-2 text-left transition ${inMonth ? "bg-white hover:bg-cream/60" : "bg-cream/30 text-muted-foreground/50"}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[12px] font-semibold inline-grid place-items-center size-7 rounded-full ${isToday ? "bg-foreground text-background" : ""}`}>{d.getDate()}</span>
                {dayItems.length > 0 && !isToday && <span className="text-[9px] font-semibold text-muted-foreground">{dayItems.length}</span>}
              </div>
              <div className="mt-1.5 space-y-0.5 overflow-hidden">
                {dayItems.slice(0,3).map((it) => {
                  const t = tint(it.kind);
                  return (
                    <div key={`${it.source}-${it.id}`} className="flex items-center gap-1 truncate">
                      <span className={`size-1.5 rounded-full shrink-0 ${t.dot}`} />
                      <span className="truncate text-[11px] font-medium text-foreground/80">{it.title}</span>
                    </div>
                  );
                })}
                {dayItems.length > 3 && <div className="text-[10px] text-muted-foreground">+{dayItems.length - 3} more</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekList({ anchor, byDate, onAdd }: { anchor: Date; byDate: Map<string, Item[]>; onAdd: (iso: string) => void }) {
  const s = startOfWeek(anchor);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(s); d.setDate(s.getDate() + i); return d; });
  const today = iso(new Date());
  return (
    <div className="grid sm:grid-cols-7 gap-2">
      {days.map((d) => {
        const di = iso(d);
        const its = byDate.get(di) ?? [];
        const isToday = di === today;
        return (
          <div key={di} className="bg-white/95 backdrop-blur border border-border rounded-3xl p-4 min-h-[160px] shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
              <div className={`text-lg font-display font-bold inline-grid place-items-center size-8 rounded-full ${isToday ? "bg-foreground text-background" : ""}`}>{d.getDate()}</div>
            </div>
            <div className="space-y-1.5">
              {its.map((it) => {
                const t = tint(it.kind);
                return (
                  <div key={`${it.source}-${it.id}`} className={`text-[11px] font-medium rounded-lg px-2 py-1 ${t.chip}`}>{it.title}</div>
                );
              })}
            </div>
            <button onClick={() => onAdd(di)} className="mt-3 text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Plus className="size-3" /> Add
            </button>
          </div>
        );
      })}
    </div>
  );
}

function DayList({ date, items, onAdd }: { date: Date; items: Item[]; onAdd: () => void }) {
  return (
    <div className="bg-white/95 backdrop-blur border border-border rounded-[2rem] p-6 sm:p-8 shadow-soft">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{date.toLocaleDateString(undefined, { weekday: "long" })}</div>
          <div className="font-display text-2xl font-bold mt-1">{date.toLocaleDateString(undefined, { month: "long", day: "numeric" })}</div>
        </div>
        <button onClick={onAdd} className="text-xs font-bold rounded-full bg-foreground text-background px-4 py-2 flex items-center gap-1 hover:opacity-90">
          <Plus className="size-3" /> New
        </button>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-16">Nothing scheduled. Enjoy the day.</div>
      ) : (
        <ul className="space-y-1">
          {items.map((it) => {
            const t = tint(it.kind);
            return (
              <li key={`${it.source}-${it.id}`} className="flex items-start gap-3 rounded-2xl px-3 py-3 hover:bg-cream/60 transition">
                <span className={`inline-block size-2 rounded-full mt-2 ${t.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{it.title}</div>
                  <div className="text-[11px] text-muted-foreground capitalize mt-0.5">{it.kind ?? it.source}</div>
                  {it.notes && <div className="text-xs text-muted-foreground mt-1.5">{it.notes}</div>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function YearGrid({ anchor, byDate, onSelectMonth }: { anchor: Date; byDate: Map<string, Item[]>; onSelectMonth: (d: Date) => void }) {
  const months = Array.from({ length: 12 }, (_, i) => new Date(anchor.getFullYear(), i, 1));
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {months.map((m) => {
        const counts = countMonth(m, byDate);
        return (
          <button key={m.getMonth()} onClick={() => onSelectMonth(m)}
            className="bg-white/95 backdrop-blur border border-border rounded-3xl p-5 text-left hover:shadow-soft transition group">
            <div className="font-display text-lg font-bold">{m.toLocaleString(undefined, { month: "long" })}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{counts} event{counts === 1 ? "" : "s"}</div>
          </button>
        );
      })}
    </div>
  );
}
function countMonth(m: Date, byDate: Map<string, Item[]>) {
  const y = m.getFullYear(), mo = m.getMonth();
  let c = 0;
  for (const [k, v] of byDate) { const d = new Date(k); if (d.getFullYear() === y && d.getMonth() === mo) c += v.length; }
  return c;
}

const KINDS = ["university","scholarship","exam","study","language","personal"];

function AddDialog({ date, onClose, onSaved }: { date: string; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("personal");
  const [notes, setNotes] = useState("");
  const save = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("deadlines").insert({ user_id: user.id, title, date, kind, notes: notes || null });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Added to calendar"); onSaved(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to add"),
  });

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[2rem] border border-border max-w-md w-full p-6 shadow-pop">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">New event</div>
            <div className="font-display font-bold text-lg mt-0.5">{new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
          </div>
          <button onClick={onClose} className="size-9 rounded-full bg-cream grid place-items-center hover:bg-secondary"><X className="size-4" /></button>
        </div>
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
          className="w-full bg-cream rounded-2xl px-4 py-3 text-sm outline-none mb-3" />
        <div className="flex flex-wrap gap-1.5 mb-3">
          {KINDS.map((k) => {
            const t = tint(k);
            return (
              <button key={k} onClick={() => setKind(k)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border capitalize inline-flex items-center gap-1.5 transition ${kind === k ? "bg-foreground text-background border-foreground" : "bg-white border-border hover:bg-secondary"}`}>
                <span className={`size-1.5 rounded-full ${t.dot}`} /> {k}
              </button>
            );
          })}
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)"
          className="w-full bg-cream rounded-2xl px-4 py-3 text-sm outline-none min-h-[80px] mb-4" />
        <button disabled={!title.trim() || save.isPending} onClick={() => save.mutate()}
          className="w-full bg-foreground text-background rounded-full py-3 font-bold text-sm disabled:opacity-40 hover:opacity-90 transition">
          {save.isPending ? "Saving…" : "Add to calendar"}
        </button>
      </div>
    </div>
  );
}
