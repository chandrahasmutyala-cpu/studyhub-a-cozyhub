import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ChevronRight, Languages } from "lucide-react";

export const Route = createFileRoute("/_authenticated/learning-academy")({
  component: LearningAcademyPage,
});

const academies = [
  {
    to: "/japanese",
    name: "Japanese Academy",
    native: "日本語",
    tag: "Hiragana · Katakana · Kanji · JLPT",
    gradient: "from-sky-200/60 to-blue-300/50",
    dot: "#8FB8F5",
  },
  {
    to: "/chinese",
    name: "Chinese Academy",
    native: "中文",
    tag: "Pinyin · Hanzi · HSK 1–6",
    gradient: "from-rose-200/50 to-orange-200/50",
    dot: "#F5B8A0",
  },
  {
    to: "/korean",
    name: "Korean Academy",
    native: "한국어",
    tag: "Hangul · TOPIK · Vocabulary",
    gradient: "from-violet-200/60 to-indigo-200/50",
    dot: "#B9A9F0",
  },
] as const;

const pillars = ["Lessons", "Vocabulary", "Grammar", "Writing", "Reading", "Listening", "Speaking", "Flashcards", "Quiz", "Progress"];

function LearningAcademyPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Languages className="size-3.5" /> Learning Academy
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Pick a language, master it.</h1>
          <p className="text-muted-foreground max-w-xl">Three full academies — same premium curriculum, tailored to each script and system.</p>
        </header>

        <section className="grid gap-4">
          {academies.map((a) => (
            <Link
              key={a.to}
              to={a.to as "/japanese"}
              className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 md:p-7 shadow-[0_1px_0_0_rgb(0_0_0/0.02),0_10px_30px_-20px_rgb(15_23_42/0.15)] hover:shadow-[0_20px_45px_-25px_rgb(15_23_42/0.25)] transition-all hover:-translate-y-0.5`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${a.gradient} opacity-40 group-hover:opacity-60 transition-opacity`} />
              <div className="relative flex items-center gap-5">
                <div className="size-16 md:size-20 rounded-2xl bg-white/80 backdrop-blur grid place-items-center font-display text-2xl md:text-3xl font-bold" style={{ color: a.dot }}>
                  {a.native}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-xl md:text-2xl font-bold truncate">{a.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{a.tag}</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </section>

        <section className="rounded-3xl border border-border/60 bg-card p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Every academy includes</div>
          <div className="flex flex-wrap gap-2">
            {pillars.map((p) => (
              <span key={p} className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground/80">{p}</span>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
