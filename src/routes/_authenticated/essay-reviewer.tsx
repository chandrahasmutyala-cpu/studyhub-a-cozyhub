import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useTutorAI } from "@/lib/use-tutor-ai";
import { FileText, Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/essay-reviewer")({
  component: EssayReviewer,
});

function EssayReviewer() {
  const [kind, setKind] = useState("Statement of Purpose");
  const [target, setTarget] = useState("");
  const [essay, setEssay] = useState("");
  const { loading, output, run } = useTutorAI();

  const words = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  function review() {
    if (!essay.trim()) return;
    const prompt = `You are an admissions officer reviewing a ${kind}${target ? ` for ${target}` : ""}.

Essay:
"""
${essay}
"""

Give a thorough review in this exact structure:

## Overall Score
A single line: X/10 with a one-sentence verdict.

## What's Working
3–5 bullets, specific, with quoted phrases.

## What's Hurting the Essay
3–5 bullets — weak claims, clichés, vague language, missing evidence, structural issues. Quote the offending phrase.

## Line-Level Suggestions
4–8 specific rewrites in the form: "Before: ... → After: ..."

## Rewrite of the Opening Paragraph
Show a stronger version of the first paragraph.

## Next Steps
3 prioritized actions before submission.

Be honest, kind, and concrete. No empty praise.`;
    run(prompt);
  }

  return (
    <AppShell>
      <div className="space-y-5 max-w-5xl">
        <header>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2"><FileText className="size-7" /> Essay Reviewer</h1>
          <p className="text-sm text-muted-foreground">Get an admissions-officer-style critique of your application essay.</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white border border-border p-5 shadow-soft space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Essay type">
                <select value={kind} onChange={e => setKind(e.target.value)} className="input">
                  <option>Statement of Purpose</option>
                  <option>Personal Statement</option>
                  <option>Study Plan</option>
                  <option>Scholarship Motivation</option>
                  <option>Research Proposal</option>
                </select>
              </Field>
              <Field label="Target program (optional)">
                <input value={target} onChange={e => setTarget(e.target.value)} className="input" placeholder="e.g. MEXT CS @ Tokyo Tech" />
              </Field>
            </div>
            <Field label={`Your essay  ·  ${words} words`}>
              <textarea value={essay} onChange={e => setEssay(e.target.value)} rows={18}
                placeholder="Paste your draft here..."
                className="input min-h-[400px] font-mono leading-relaxed" />
            </Field>
            <button onClick={review} disabled={loading || !essay.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold disabled:opacity-50">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Reviewing..." : "Review my essay"}
            </button>
          </div>
          <div className="rounded-3xl bg-white border border-border p-5 shadow-soft min-h-[400px] whitespace-pre-wrap text-sm leading-relaxed">
            {output || <p className="text-muted-foreground text-sm">Your review will appear here.</p>}
          </div>
        </div>
      </div>
      <style>{`.input{width:100%;border:1px solid hsl(var(--border));border-radius:14px;padding:8px 12px;font-size:14px;background:white}`}</style>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{label}</div>{children}</label>;
}
