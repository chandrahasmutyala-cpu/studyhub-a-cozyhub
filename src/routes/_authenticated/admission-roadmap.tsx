import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useTutorAI } from "@/lib/use-tutor-ai";
import { Compass, Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admission-roadmap")({
  component: AdmissionRoadmap,
});

function AdmissionRoadmap() {
  const [country, setCountry] = useState<"Japan" | "China" | "South Korea">("Japan");
  const [level, setLevel] = useState<"Undergraduate" | "Masters" | "PhD">("Undergraduate");
  const [field, setField] = useState("Computer Science");
  const [timeline, setTimeline] = useState("12 months");
  const [grades, setGrades] = useState("");
  const { loading, output, run } = useTutorAI();

  function generate() {
    const prompt = `Build a step-by-step university admission roadmap for a student.
Destination: ${country}
Degree level: ${level}
Field of study: ${field}
Timeline available: ${timeline}
Academic background: ${grades || "not specified"}

Return a clear roadmap with:
1) Month-by-month timeline (research, language tests, exams, documents, applications, visa)
2) Required language tests (JLPT/EJU for Japan, HSK/Gaokao for China, TOPIK/CSAT for Korea) with target levels
3) Required documents (transcripts, SOP, LORs, financial proof, etc.)
4) Top 5 realistic universities to target with brief reasons
5) Key deadlines and dates to watch
6) Common mistakes to avoid

Use short bullet points and clear month headings. Be specific and practical.`;
    run(prompt);
  }

  return (
    <AppShell>
      <div className="space-y-5 max-w-4xl">
        <header>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2"><Compass className="size-7" /> Admission Roadmap</h1>
          <p className="text-sm text-muted-foreground">A personalized month-by-month plan to get into your dream university abroad.</p>
        </header>

        <div className="rounded-3xl bg-white border border-border p-5 space-y-3 shadow-soft">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Destination">
              <select value={country} onChange={(e) => setCountry(e.target.value as any)} className="input">
                <option>Japan</option><option>China</option><option>South Korea</option>
              </select>
            </Field>
            <Field label="Degree level">
              <select value={level} onChange={(e) => setLevel(e.target.value as any)} className="input">
                <option>Undergraduate</option><option>Masters</option><option>PhD</option>
              </select>
            </Field>
            <Field label="Field of study">
              <input value={field} onChange={(e) => setField(e.target.value)} className="input" />
            </Field>
            <Field label="Timeline available">
              <select value={timeline} onChange={(e) => setTimeline(e.target.value)} className="input">
                <option>6 months</option><option>12 months</option><option>18 months</option><option>24 months</option>
              </select>
            </Field>
          </div>
          <Field label="Current grades / background (optional)">
            <textarea value={grades} onChange={(e) => setGrades(e.target.value)} rows={2}
              placeholder="e.g. GPA 3.6, IELTS 7.0, finished high school in 2024"
              className="input min-h-[60px]" />
          </Field>
          <button onClick={generate} disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold disabled:opacity-50">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Generating your roadmap..." : "Generate roadmap"}
          </button>
        </div>

        {output && (
          <article className="rounded-3xl bg-white border border-border p-6 shadow-soft prose prose-sm max-w-none whitespace-pre-wrap">
            {output}
          </article>
        )}
      </div>
      <style>{`.input{width:100%;border:1px solid hsl(var(--border));border-radius:14px;padding:8px 12px;font-size:14px;background:white}`}</style>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  );
}
