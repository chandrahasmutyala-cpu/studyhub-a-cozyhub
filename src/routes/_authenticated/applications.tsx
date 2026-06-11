import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ClipboardList, Plus, Trash2, ExternalLink, CalendarClock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/applications")({
  component: ApplicationsPage,
});

type App = {
  id: string; kind: "university" | "scholarship" | "other"; name: string;
  country: string | null; url: string | null; status: string; deadline: string | null;
  notes: string | null;
};
type Deadline = { id: string; title: string; kind: string | null; date: string; notes: string | null };

const STATUSES = ["interested", "preparing", "applied", "accepted", "rejected"] as const;

function ApplicationsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"university" | "scholarship" | "other">("university");
  const [deadline, setDeadline] = useState("");
  const [dlTitle, setDlTitle] = useState("");
  const [dlDate, setDlDate] = useState("");
  const [dlKind, setDlKind] = useState("");

  const apps = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as App[];
    },
  });

  const dls = useQuery({
    queryKey: ["deadlines"],
    queryFn: async () => {
      const { data, error } = await supabase.from("deadlines").select("*").order("date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Deadline[];
    },
  });

  async function addApp(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("applications").insert({
      user_id: user.id, kind, name, status: "interested", deadline: deadline || null,
    });
    if (error) return toast.error(error.message);
    setName(""); setDeadline("");
    qc.invalidateQueries({ queryKey: ["applications"] });
  }

  async function setStatus(id: string, status: string) {
    await supabase.from("applications").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["applications"] });
  }

  async function removeApp(id: string) {
    await supabase.from("applications").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["applications"] });
  }

  async function addDl(e: React.FormEvent) {
    e.preventDefault();
    if (!dlTitle.trim() || !dlDate) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("deadlines").insert({ user_id: user.id, title: dlTitle, kind: dlKind || null, date: dlDate });
    setDlTitle(""); setDlDate(""); setDlKind("");
    qc.invalidateQueries({ queryKey: ["deadlines"] });
  }
  async function removeDl(id: string) {
    await supabase.from("deadlines").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["deadlines"] });
  }

  function daysUntil(date: string) {
    const d = new Date(date); d.setHours(0,0,0,0);
    const now = new Date(); now.setHours(0,0,0,0);
    return Math.round((d.getTime() - now.getTime()) / 86400000);
  }

  return (
    <AppShell>
      <div className="max-w-5xl space-y-6">
        <header>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tracker</div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2 mt-1">
            <ClipboardList className="size-7 text-primary" /> Applications & deadlines
          </h1>
        </header>

        {/* Deadlines */}
        <section className="bg-white border border-border rounded-[2rem] p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-3"><CalendarClock className="size-5 text-primary" /><h2 className="font-display font-bold text-lg">Countdowns</h2></div>
          <form onSubmit={addDl} className="grid sm:grid-cols-[1.5fr_1fr_1fr_auto] gap-2 mb-3">
            <input value={dlTitle} onChange={(e) => setDlTitle(e.target.value)} placeholder="JLPT N5 exam…" className="bg-cream rounded-2xl px-3 py-2.5 text-sm outline-none" />
            <input value={dlKind} onChange={(e) => setDlKind(e.target.value)} placeholder="Kind (exam, app…)" className="bg-cream rounded-2xl px-3 py-2.5 text-sm outline-none" />
            <input type="date" value={dlDate} onChange={(e) => setDlDate(e.target.value)} className="bg-cream rounded-2xl px-3 py-2.5 text-sm outline-none" />
            <button className="bg-primary rounded-full px-4 font-bold text-sm inline-flex items-center gap-1"><Plus className="size-4" /> Add</button>
          </form>
          {dls.data?.length === 0 && <p className="text-sm text-muted-foreground">No countdowns yet.</p>}
          <ul className="grid sm:grid-cols-2 gap-2">
            {dls.data?.map((d) => {
              const left = daysUntil(d.date);
              return (
                <li key={d.id} className="flex items-center gap-3 bg-cream rounded-2xl p-3">
                  <div className={`size-12 rounded-2xl grid place-items-center font-display font-bold text-sm ${left <= 7 ? "bg-destructive/30" : left <= 30 ? "bg-honey/60" : "bg-secondary"}`}>
                    {left >= 0 ? `${left}d` : "past"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{d.title}</div>
                    <div className="text-xs text-muted-foreground">{d.kind ? `${d.kind} · ` : ""}{new Date(d.date).toLocaleDateString()}</div>
                  </div>
                  <button onClick={() => removeDl(d.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="size-4" /></button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Applications */}
        <section className="bg-white border border-border rounded-[2rem] p-5 shadow-soft">
          <h2 className="font-display font-bold text-lg mb-3">Applications</h2>
          <form onSubmit={addApp} className="grid sm:grid-cols-[1.5fr_auto_auto_auto] gap-2 mb-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="University or scholarship name" className="bg-cream rounded-2xl px-3 py-2.5 text-sm outline-none" />
            <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="bg-cream rounded-2xl px-3 py-2.5 text-sm">
              <option value="university">University</option><option value="scholarship">Scholarship</option><option value="other">Other</option>
            </select>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="bg-cream rounded-2xl px-3 py-2.5 text-sm outline-none" />
            <button className="bg-primary rounded-full px-4 font-bold text-sm inline-flex items-center gap-1"><Plus className="size-4" /> Add</button>
          </form>

          {apps.data?.length === 0 && <p className="text-sm text-muted-foreground">No applications tracked yet — save ones from Universities or Scholarships.</p>}

          <div className="grid gap-2">
            {STATUSES.map((s) => {
              const rows = (apps.data ?? []).filter((a) => a.status === s);
              if (rows.length === 0) return null;
              return (
                <div key={s}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-2 mb-1">{s}</div>
                  <ul className="space-y-2">
                    {rows.map((a) => (
                      <li key={a.id} className="flex items-center gap-2 bg-cream rounded-2xl p-3">
                        <span className="text-xs uppercase font-bold bg-lavender-soft rounded-full px-2 py-0.5">{a.kind}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm truncate">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{a.country ?? ""}{a.deadline ? ` · 📅 ${new Date(a.deadline).toLocaleDateString()}` : ""}</div>
                        </div>
                        <select value={a.status} onChange={(e) => setStatus(a.id, e.target.value)} className="bg-white rounded-full px-2 py-1 text-xs border border-border">
                          {STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}
                        </select>
                        {a.url && <a href={a.url} target="_blank" rel="noreferrer" className="text-primary-foreground bg-primary rounded-full p-1.5" aria-label="Open"><ExternalLink className="size-3" /></a>}
                        <button onClick={() => removeApp(a.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="size-4" /></button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
