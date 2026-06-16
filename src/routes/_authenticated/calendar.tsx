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

const KIND_COLORS: Record<string, string> = {
  university: "bg-sky-200 text-sky-900",
  scholarship: "bg-amber-200 text-amber-900",
  exam: "bg-rose-200 text-rose-900",
  personal: "bg-violet-200 text-violet-900",
  study: "bg-emerald-200 text-emerald-900",
  task: "bg-slate-200 text-slate-900",
};
function kindColor(k?: string | null) {
  if (!k) return "bg-slate-200 text-slate-900";
  return KIND_COLORS[k] ?? "bg-slate-200 text-slate-900";
}

function CalendarPage() {
  const qc = useQueryClient();
  const [view, setView] = useState<View>("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [adding, setAdding] = useState<string | null>(null); // ISO date

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
      <div className="max-w-6xl space-y-4 animate-fade-up">
        <header className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Calendar</div>
            <h1 className="font-display text-3xl font-bold">{headerLabel(anchor, view)}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-white/85 backdrop-blur p-1 rounded-full border border-border">
              {(["day","week","month","year"] as View[]).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${view === v ? "bg-primary" : "text-muted-foreground"}`}>{v}</button>
              ))}
            </div>
            <button onClick={() => setAnchor(new Date())} className="text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-border">Today</button>
            <div className="flex items-center gap-1">
              <button onClick={() => shift(-1)} className="size-9 rounded-full bg-white border border-border grid place-items-center"><ChevronLeft className="size-4" /></button>
              <button onClick={() => shift(1)} className="size-9 rounded-full bg-white border border-border grid place-items-center"><ChevronRight className="size-4" /></button>
            </div>
          </div>
        </header>

        {view === "month" && <MonthGrid anchor={anchor} byDate={byDate} onAdd={setAdding} />}
        {view === "week"  && <WeekList anchor={anchor} byDate={byDate} onAdd={setAdding} />}
        {view === "day"   && <DayList date={anchor} items={byDate.get(iso(anchor)) ?? []} onAdd={() => setAdding(iso(anchor))} />}
        {view === "year"  && <YearGrid anchor={anchor} byDate={byDate} onSelectMonth={(d) => { setAnchor(d); setView("month"); }} />}

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
    <div className="bg-white/90 backdrop-blur border border-border rounded-3xl p-3">
      <div className="grid grid-cols-7 text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-2 px-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d) => {
          const di = iso(d);
          const inMonth = d.getMonth() === anchor.getMonth();
          const dayItems = byDate.get(di) ?? [];
          return (
            <button key={di} onClick={() => onAdd(di)}
              className={`group relative aspect-square sm:aspect-[1.1/1] rounded-2xl p-1.5 text-left border ${inMonth ? "bg-white border-border hover:border-primary" : "bg-cream/40 border-transparent text-muted-foreground/60"}`}>
              <div className={`text-[11px] font-bold inline-grid place-items-center size-6 rounded-full ${di === today ? "bg-primary text-primary-foreground" : ""}`}>{d.getDate()}</div>
              <div className="mt-1 space-y-0.5 overflow-hidden">
                {dayItems.slice(0,2).map((it) => (
                  <div key={`${it.source}-${it.id}`} className={`truncate text-[10px] font-semibold rounded px-1 py-0.5 ${kindColor(it.kind)}`}>{it.title}</div>
                ))}
                {dayItems.length > 2 && <div className="text-[10px] text-muted-foreground">+{dayItems.length - 2}</div>}
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
  return (
    <div className="grid sm:grid-cols-7 gap-2">
      {days.map((d) => {
        const di = iso(d);
        const its = byDate.get(di) ?? [];
        return (
          <div key={di} className="bg-white/90 backdrop-blur border border-border rounded-2xl p-3 min-h-[140px]">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
              <div className="text-sm font-bold">{d.getDate()}</div>
            </div>
            <div className="mt-2 space-y-1">
              {its.map((it) => (
                <div key={`${it.source}-${it.id}`} className={`text-[11px] font-semibold rounded-md px-2 py-1 ${kindColor(it.kind)}`}>{it.title}</div>
              ))}
            </div>
            <button onClick={() => onAdd(di)} className="mt-2 text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1">
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
    <div className="bg-white/90 backdrop-blur border border-border rounded-3xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-lg font-bold">{date.toLocaleDateString(undefined, { weekday: "long" })}</div>
        <button onClick={onAdd} className="text-xs font-bold rounded-full bg-primary px-3 py-1.5 flex items-center gap-1"><Plus className="size-3" /> New</button>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-10">Nothing scheduled. Enjoy the day.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={`${it.source}-${it.id}`} className="flex items-start gap-3 rounded-2xl bg-cream/60 p-3">
              <span className={`inline-block size-2.5 rounded-full mt-1.5 ${kindColor(it.kind).split(" ")[0]}`} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{it.title}</div>
                <div className="text-[11px] text-muted-foreground capitalize">{it.kind ?? it.source}</div>
                {it.notes && <div className="text-xs text-muted-foreground mt-1">{it.notes}</div>}
              </div>
            </li>
          ))}
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
            className="bg-white/90 backdrop-blur border border-border rounded-2xl p-4 text-left hover:border-primary">
            <div className="font-display font-bold">{m.toLocaleString(undefined, { month: "long" })}</div>
            <div className="text-xs text-muted-foreground mt-1">{counts} event{counts === 1 ? "" : "s"}</div>
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

const KINDS = ["university","scholarship","exam","study","personal"];

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
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl border border-border max-w-md w-full p-6 shadow-pop">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">New event</div>
            <div className="font-display font-bold">{new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
          </div>
          <button onClick={onClose} className="size-9 rounded-full bg-cream grid place-items-center"><X className="size-4" /></button>
        </div>
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
          className="w-full bg-cream rounded-2xl px-4 py-2.5 text-sm outline-none mb-2" />
        <div className="flex flex-wrap gap-1.5 mb-2">
          {KINDS.map((k) => (
            <button key={k} onClick={() => setKind(k)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${kind === k ? "bg-primary border-primary" : "bg-white border-border"}`}>{k}</button>
          ))}
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)"
          className="w-full bg-cream rounded-2xl px-4 py-2.5 text-sm outline-none min-h-[80px] mb-3" />
        <button disabled={!title.trim() || save.isPending} onClick={() => save.mutate()}
          className="w-full bg-primary rounded-full py-2.5 font-bold text-sm disabled:opacity-40">
          {save.isPending ? "Saving…" : "Add to calendar"}
        </button>
      </div>
    </div>
  );
}
