import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tasks")({
  component: TasksPage,
});

type Task = {
  id: string; title: string; notes: string | null; category: string | null;
  priority: string | null; due_date: string | null; completed: boolean;
};

function TasksPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("study");
  const [due, setDue] = useState<string>(new Date().toISOString().slice(0, 10));
  const [filter, setFilter] = useState<"today" | "upcoming" | "all">("today");

  const q = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*").order("completed").order("due_date", { ascending: true, nullsFirst: false }).order("created_at");
      return (data ?? []) as Task[];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("tasks").insert({ title, category, due_date: due || null, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => { setTitle(""); qc.invalidateQueries({ queryKey: ["tasks"] }); qc.invalidateQueries({ queryKey: ["tasks", "today"] }); },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from("tasks").update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("tasks").delete().eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

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
          <p className="text-sm text-muted-foreground">Tiny tasks. Real progress.</p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); if (title.trim()) add.mutate(); }}
          className="bg-white border border-border rounded-3xl p-4 flex flex-col sm:flex-row gap-2 shadow-soft"
        >
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            className="flex-1 bg-cream rounded-2xl px-4 py-3 outline-none focus:border-primary border border-transparent" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-cream rounded-2xl px-3 py-3 text-sm font-semibold border border-transparent">
            {["study","japanese","coding","reading","exam","other"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="bg-cream rounded-2xl px-3 py-3 text-sm font-semibold border border-transparent" />
          <button className="bg-primary rounded-full px-4 py-2 font-bold flex items-center gap-1"><Plus className="size-4" />Add</button>
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
          {tasks.map((t) => (
            <div key={t.id} className="bg-white border border-border rounded-2xl p-3 flex items-center gap-3">
              <button
                onClick={() => toggle.mutate({ id: t.id, completed: !t.completed })}
                className={`size-6 rounded-full border-2 grid place-items-center ${t.completed ? "bg-primary border-primary" : "border-foreground/30"}`}
                aria-label="Toggle complete"
              >
                {t.completed && <span className="text-xs">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t.category}{t.due_date ? ` · ${t.due_date}` : ""}
                </div>
              </div>
              <button onClick={() => del.mutate(t.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete task">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
