import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useTutorAI } from "@/lib/use-tutor-ai";
import { Award, Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/scholarship-eligibility")({
  component: ScholarshipEligibility,
});

function ScholarshipEligibility() {
  const [country, setCountry] = useState("Japan");
  const [level, setLevel] = useState("Undergraduate");
  const [nationality, setNationality] = useState("");
  const [gpa, setGpa] = useState("");
  const [field, setField] = useState("");
  const [langTest, setLangTest] = useState("");
  const { loading, output, run } = useTutorAI();

  function check() {
    const prompt = `Match this student to real, verified scholarships for studying in ${country}.
Profile:
- Nationality: ${nationality || "not specified"}
- Degree level: ${level}
- Field of study: ${field || "open"}
- GPA / academic record: ${gpa || "not specified"}
- Language test scores: ${langTest || "none yet"}

Return:
1) Top 5–8 scholarships they are likely eligible for (e.g. MEXT, CSC, KGSP/GKS, Mitsui Bussan, ADB-JSP, Korean Government, Chinese Government). For each list: name, who funds it, coverage (tuition/stipend/airfare), eligibility fit (why this student qualifies), key deadline window, official URL keyword to search.
2) Gaps to close in the next 3–6 months to unlock more scholarships.
3) 2–3 "stretch" scholarships worth preparing for.

Be honest about eligibility. Use clean bullet points.`;
    run(prompt);
  }

  return (
    <AppShell>
      <div className="space-y-5 max-w-4xl">
        <header>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2"><Award className="size-7" /> Scholarship Eligibility</h1>
          <p className="text-sm text-muted-foreground">Match your profile to real scholarships for Japan, China, and South Korea.</p>
        </header>

        <div className="rounded-3xl bg-white border border-border p-5 grid sm:grid-cols-2 gap-3 shadow-soft">
          <Field label="Destination"><select value={country} onChange={e => setCountry(e.target.value)} className="input"><option>Japan</option><option>China</option><option>South Korea</option></select></Field>
          <Field label="Degree level"><select value={level} onChange={e => setLevel(e.target.value)} className="input"><option>Undergraduate</option><option>Masters</option><option>PhD</option><option>Research</option></select></Field>
          <Field label="Nationality"><input value={nationality} onChange={e => setNationality(e.target.value)} className="input" placeholder="e.g. Indonesian" /></Field>
          <Field label="Field of study"><input value={field} onChange={e => setField(e.target.value)} className="input" placeholder="e.g. Engineering" /></Field>
          <Field label="GPA / grades"><input value={gpa} onChange={e => setGpa(e.target.value)} className="input" placeholder="e.g. 3.7 / 4.0" /></Field>
          <Field label="Language tests"><input value={langTest} onChange={e => setLangTest(e.target.value)} className="input" placeholder="e.g. JLPT N3, IELTS 6.5" /></Field>
          <div className="sm:col-span-2">
            <button onClick={check} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold disabled:opacity-50">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Matching scholarships..." : "Find scholarships"}
            </button>
          </div>
        </div>

        {output && (
          <article className="rounded-3xl bg-white border border-border p-6 shadow-soft whitespace-pre-wrap text-sm leading-relaxed">{output}</article>
        )}
      </div>
      <style>{`.input{width:100%;border:1px solid hsl(var(--border));border-radius:14px;padding:8px 12px;font-size:14px;background:white}`}</style>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{label}</div>{children}</label>;
}
