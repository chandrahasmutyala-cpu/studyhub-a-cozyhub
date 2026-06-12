import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";
import { generatePlan } from "@/lib/planner.functions";
import { Sparkles, Trash2, Target } from "lucide-react";
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
    if (!career.trim() || !country.trim()) {
      toast.error("Dream career and country are required.");
      return;
    }
    setBusy(true);
    try {
      await gen({
        data: {
          career_goal: career,
          dream_country: country,
          dream_university: uni,
          current_grade: profile?.current_grade ?? "",
          notes: "",
        },
      });
      await update.mutateAsync({
        dream_career: career, dream_country: country, dream_university: uni || null,
      });
      qc.invalidateQueries({ queryKey: ["career_plans"] });
      toast.success("Your roadmap is ready");
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
      <div className="space-y-7 animate-fade-up">
        <header>
          <div className="section-label">Future Planner</div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-1">Your roadmap.</h1>
        </header>

        <form
          onSubmit={onGenerate}
          className="bg-brand-tint border border-border rounded-3xl p-5 space-y-3"
        >
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="size-4" /> AI Future Planner
          </div>
          <Input value={career} onChange={setCareer} placeholder="Dream career" />
          <Input value={country} onChange={setCountry} placeholder="Dream country" />
          <Input value={uni} onChange={setUni} placeholder="Dream university (optional)" />
          <button
            disabled={busy}
            className="w-full bg-primary text-primary-foreground rounded-full py-3.5 font-semibold text-sm disabled:opacity-60"
          >
            {busy ? "Building roadmap…" : "Generate roadmap"}
          </button>
        </form>

        <section className="space-y-4">
          {plansQ.isLoading && <div className="h-32 bg-muted animate-pulse rounded-3xl" />}
          {!plansQ.isLoading && (plansQ.data?.length ?? 0) === 0 && (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center">
              <div className="size-10 mx-auto rounded-full bg-muted grid place-items-center mb-3">
                <Target className="size-5 text-muted-foreground" />
              </div>
              <div className="font-semibold">No goals set yet</div>
              <div className="text-sm text-muted-foreground mt-1">Tell the planner where you're heading.</div>
            </div>
          )}
          {plansQ.data?.map((p) => <PlanCard key={p.id} row={p} onDelete={() => remove(p.id)} />)}
        </section>
      </div>
    </AppShell>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-card border border-border rounded-2xl px-4 py-3.5 outline-none text-sm focus:border-primary transition-colors"
    />
  );
}

function PlanCard({ row, onDelete }: { row: PlanRow; onDelete: () => void }) {
  const p = row.plan ?? {};
  return (
    <article className="bg-card border border-border rounded-3xl p-5 space-y-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold">{row.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{new Date(row.created_at).toLocaleDateString()}</p>
        </div>
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive p-2 rounded-full hover:bg-muted" aria-label="Delete">
          <Trash2 className="size-4" />
        </button>
      </header>
      {p.summary && <p className="text-sm text-foreground/80">{p.summary}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        <Section title="Subjects">
          {p.subjects?.map((s, i) => (
            <li key={i}><span className="font-semibold">{s.name}</span> — <span className="text-muted-foreground">{s.why}</span></li>
          ))}
        </Section>
        <Section title="Skills">
          {p.skills?.map((s, i) => (
            <li key={i}>
              <span className="font-semibold">{s.name}</span>
              <span className="ml-2 text-[10px] bg-muted px-2 py-0.5 rounded-full">{s.level}</span>
            </li>
          ))}
        </Section>
        <Section title="Exams">
          {p.exams?.map((e, i) => <li key={i}><span className="font-semibold">{e.name}</span> — <span className="text-muted-foreground">{e.when}</span></li>)}
        </Section>
        <Section title="Languages">
          {p.languages?.map((l, i) => <li key={i}>{l.name} → <span className="text-muted-foreground">{l.target_level}</span></li>)}
        </Section>
      </div>
      {p.timeline && p.timeline.length > 0 && (
        <div>
          <h4 className="font-bold text-sm mb-2">Timeline</h4>
          <ol className="space-y-2">
            {p.timeline.map((t, i) => (
              <li key={i} className="bg-muted rounded-2xl p-3">
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
      <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">{title}</h4>
      <ul className="text-sm space-y-1 list-disc list-inside">{children}</ul>
    </div>
  );
}
