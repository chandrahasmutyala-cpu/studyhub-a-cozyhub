import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLessonProgress } from "@/lib/lesson-progress";
import { useProfile } from "@/lib/useProfile";
import { ROADMAPS, type LanguageKey } from "@/lib/roadmap";
import { ChevronRight, Award, Flame, Star, Trophy, Lock, Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/learning-academy")({
  component: LearningAcademyPage,
});

const academies: { key: LanguageKey; to: string; name: string; native: string; tag: string; ink: string }[] = [
  { key: "japanese", to: "/japanese", name: "Japanese", native: "日本語", tag: "Hiragana · Katakana · Kanji · JLPT", ink: "#7d9b76" },
  { key: "chinese", to: "/chinese", name: "Chinese", native: "中文", tag: "Pinyin · Hanzi · HSK 1–6", ink: "#a8c0a0" },
  { key: "korean", to: "/korean", name: "Korean", native: "한국어", tag: "Hangul · TOPIK · Vocabulary", ink: "#7d9b76" },
];

function LearningAcademyPage() {
  const [tab, setTab] = useState<"roadmap" | "museum">("roadmap");
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Learning Academy</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mt-2">Three languages, one journey.</h1>
        </header>

        <div className="inline-flex gap-1 bg-card border border-border/60 p-1 rounded-full">
          {(["roadmap", "museum"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "museum" ? "Achievement Museum" : "Roadmap"}
            </button>
          ))}
        </div>

        {tab === "roadmap" ? <RoadmapPicker /> : <Museum />}
      </div>
    </AppShell>
  );
}

function RoadmapPicker() {
  return (
    <section className="grid gap-4">
      {academies.map((a) => (
        <AcademyCard key={a.key} {...a} />
      ))}
    </section>
  );
}

function AcademyCard(props: { key: LanguageKey; to: string; name: string; native: string; tag: string; ink: string }) {
  const { completedKeys } = useLessonProgress(props.key);
  const total = ROADMAPS[props.key].length;
  const pct = Math.round((completedKeys.size / total) * 100);
  return (
    <Link to={props.to as "/japanese"}
      className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-25px_rgb(0_0_0/0.25)] transition-all">
      <div className="flex items-center gap-5">
        <div className="size-16 rounded-2xl bg-primary/15 grid place-items-center font-display text-2xl font-bold" style={{ color: props.ink }}>
          {props.native}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-xl font-bold">{props.name}</div>
          <div className="text-xs text-muted-foreground">{props.tag}</div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2 max-w-[220px]">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">{completedKeys.size}/{total} · {pct}%</div>
        </div>
        <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

function Museum() {
  const { profile } = useProfile();
  const jp = useLessonProgress("japanese");
  const cn = useLessonProgress("chinese");
  const kr = useLessonProgress("korean");
  const rooms = [
    { title: "Japanese Museum", native: "日本館", data: jp, language: "Japanese" as const },
    { title: "Chinese Museum", native: "中国馆", data: cn, language: "Chinese" as const },
    { title: "Korean Museum", native: "한국관", data: kr, language: "Korean" as const },
  ];

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatTile icon={Flame} label="Streak" value={profile?.current_streak ?? 0} />
        <StatTile icon={Star} label="XP" value={profile?.xp ?? 0} />
        <StatTile icon={Trophy} label="Longest" value={profile?.longest_streak ?? 0} />
      </div>

      {rooms.map((r) => {
        const unlocked = r.data.completedKeys.size > 0;
        const totalLessons = r.language === "Japanese" ? ROADMAPS.japanese.length : r.language === "Chinese" ? ROADMAPS.chinese.length : ROADMAPS.korean.length;
        const done = r.data.completedKeys.size;
        return (
          <div key={r.title} className={`rounded-3xl border border-border/60 bg-card p-5 ${!unlocked ? "opacity-70" : ""}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{r.native}</div>
                <div className="font-display text-lg font-bold flex items-center gap-2">
                  {r.title}
                  {!unlocked && <Lock className="size-4 text-muted-foreground" />}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{done}/{totalLessons} lessons</div>
            </div>

            {unlocked ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Badge icon={Award} label={`${done} lessons`} unlocked />
                <Badge icon={Star} label="First step" unlocked={done >= 1} />
                <Badge icon={Sparkles} label="10 lessons" unlocked={done >= 10} />
                <Badge icon={Trophy} label="Mastery" unlocked={done >= totalLessons} />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Complete your first {r.language} lesson to unlock this room.</p>
            )}
          </div>
        );
      })}
    </section>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: typeof Award; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 flex flex-col items-center gap-1">
      <Icon className="size-5 text-primary stroke-[1.75]" />
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function Badge({ icon: Icon, label, unlocked }: { icon: typeof Award; label: string; unlocked: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 flex flex-col items-center gap-1 ${unlocked ? "border-primary/40 bg-primary/10" : "border-border/60 bg-muted opacity-60"}`}>
      <Icon className={`size-5 stroke-[1.75] ${unlocked ? "text-primary" : "text-muted-foreground"}`} />
      <div className="text-[10px] font-bold text-center leading-tight">{label}</div>
    </div>
  );
}
