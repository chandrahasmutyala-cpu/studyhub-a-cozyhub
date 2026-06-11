import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";
import { generatePlan } from "@/lib/planner.functions";
import { Sparkles, Compass, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/career")({
  component: CareerPage,
});

type PlanRow = {
  id: string; title: string; career_goal: string | null; dream_country: string | null;
  dream_university: string | null; current_grade: string | null; is_active: boolean;
  plan: PlanShape; created_at: string;
};
type PlanShape = {
  summary?: string;
  subjects?: { name: string; why: string }[];
  skills?: { name: string; level: string; resources: string[] }[];
  exams?: { name: string; when: string; notes: string }[];
  languages?: { name: string; target_level: string }[];
  portfolio?: string[];
  scholarships_hint?: string[];
  timeline?: { phase: string; when: string; actions: string[] }[];
};

function CareerPage() {
  const { profile, update } = useProfile();
  const qc = useQueryClient();
  const gen = useServerFn(generatePlan);
  const [busy, setBusy] = useState(false);

  const [career, setCareer] = useState(profile?.dream_career ?? "");
  const [country, setCountry] = useState(profile?.dream_country ?? "");
  const [uni, setUni] = useState(profile?.dream_university ?? "");
  const [grade, setGrade] = useState(profile?.current_grade ?? "");
  const [notes, setNotes] = useState("");

  const plansQ = useQuery({
    queryKey: ["career_plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_plans").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PlanRow[];
    },
  });

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!career.trim() || !country.trim() || !grade.trim()) {
      toast.error("Career, country and current grade are required.");
      return;
    }
    setBusy(true);
    try {
      await gen({ data: { career_goal: career, dream_country: country, dream_university: uni, current_grade: grade, notes } });
      await update.mutateAsync({
        dream_career: career, dream_country: country, dream_university: uni || null, current_grade: grade,
      });
      qc.invalidateQueries({ queryKey: ["career_plans"] });
      toast.success("Your roadmap is ready ✨");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate plan");
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    await supabase.from("career_plans").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["career_plans"] });
  }

  return (
    <AppShell>
      <div className="max-w-5xl space-y-6">
        <header>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Career Hub</div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2 mt-1">
            <Compass className="size-7 text-primary" /> Plan your future
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Tell us your dream — we'll build a personalized roadmap.</p>
        </header>

        <form onSubmit={onGenerate} className="bg-white border border-border rounded-[2rem] p-5 shadow-soft grid sm:grid-cols-2 gap-3">
          <Field label="Career goal" value={career} onChange={setCareer} placeholder="Software engineer, Doctor, Animator…" />
          <Field label="Dream country" value={country} onChange={setCountry} placeholder="Japan, USA, Germany…" />
          <Field label="Dream university (optional)" value={uni} onChange={setUni} placeholder="University of Tokyo…" />
          <Field label="Current grade / year" value={grade} onChange={setGrade} placeholder="Grade 11, 1st year uni…" />
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Strengths, interests, constraints…"
              className="mt-1 w-full bg-cream rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-primary text-sm resize-none" />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button disabled={busy} className="inline-flex items-center gap-2 bg-primary rounded-full px-5 py-2.5 font-bold text-sm disabled:opacity-60">
              <Sparkles className="size-4" /> {busy ? "Building roadmap…" : "Generate roadmap"}
            </button>
          </div>
        </form>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">Your roadmaps</h2>
          {plansQ.isLoading && <div className="h-24 bg-cream animate-pulse rounded-3xl" />}
          {plansQ.data?.length === 0 && (
            <div className="text-sm text-muted-foreground bg-white rounded-3xl border border-border p-6 text-center">
              No roadmaps yet. Fill the form above to create your first plan.
            </div>
          )}
          {plansQ.data?.map((p) => <PlanCard key={p.id} row={p} onDelete={() => remove(p.id)} />)}
        </section>
      </div>
    </AppShell>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full bg-cream rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-primary text-sm" />
    </div>
  );
}

function PlanCard({ row, onDelete }: { row: PlanRow; onDelete: () => void }) {
  const p = row.plan ?? {};
  return (
    <article className="bg-white border border-border rounded-[2rem] p-5 shadow-soft space-y-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-bold">{row.title}</h3>
          <p className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</p>
        </div>
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive p-2" aria-label="Delete">
          <Trash2 className="size-4" />
        </button>
      </header>
      {p.summary && <p className="text-sm">{p.summary}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        <Section title="Subjects">
          {p.subjects?.map((s, i) => (
            <li key={i}><span className="font-semibold">{s.name}</span> — <span className="text-muted-foreground">{s.why}</span></li>
          ))}
        </Section>
        <Section title="Skills">
          {p.skills?.map((s, i) => (
            <li key={i}>
              <span className="font-semibold">{s.name}</span>
              <span className="ml-2 text-[10px] bg-secondary px-2 py-0.5 rounded-full">{s.level}</span>
              {s.resources?.length ? <div className="text-xs text-muted-foreground">{s.resources.join(" · ")}</div> : null}
            </li>
          ))}
        </Section>
        <Section title="Exams">
          {p.exams?.map((e, i) => <li key={i}><span className="font-semibold">{e.name}</span> — <span className="text-muted-foreground">{e.when}</span><div className="text-xs text-muted-foreground">{e.notes}</div></li>)}
        </Section>
        <Section title="Languages">
          {p.languages?.map((l, i) => <li key={i}>{l.name} → <span className="text-muted-foreground">{l.target_level}</span></li>)}
        </Section>
        <Section title="Portfolio">
          {p.portfolio?.map((x, i) => <li key={i}>{x}</li>)}
        </Section>
        <Section title="Scholarship directions">
          {p.scholarships_hint?.map((x, i) => <li key={i}>{x}</li>)}
        </Section>
      </div>
      {p.timeline && p.timeline.length > 0 && (
        <div>
          <h4 className="font-display font-bold text-sm mb-2">Timeline</h4>
          <ol className="space-y-2">
            {p.timeline.map((t, i) => (
              <li key={i} className="bg-cream rounded-2xl p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">{t.phase}</span>
                  <span className="text-muted-foreground">{t.when}</span>
                </div>
                <ul className="mt-1 text-sm list-disc list-inside space-y-0.5">
                  {t.actions?.map((a, j) => <li key={j}>{a}</li>)}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      )}
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const arr = Array.isArray(children) ? children : [children];
  if (!arr || arr.length === 0 || arr.every((x) => !x)) return null;
  return (
    <div>
      <h4 className="font-display font-bold text-sm mb-1.5">{title}</h4>
      <ul className="text-sm space-y-1 list-disc list-inside">{children}</ul>
    </div>
  );
}
