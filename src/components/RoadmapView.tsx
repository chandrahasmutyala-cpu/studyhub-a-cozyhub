import { useMemo, useState } from "react";
import type { LanguageKey } from "@/lib/roadmap";
import { ROADMAPS, lessonState, type LessonNode } from "@/lib/roadmap";
import { useLessonProgress } from "@/lib/lesson-progress";
import { useProfile } from "@/lib/useProfile";
import { Check, Lock, Star, X, Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { tutorChat } from "@/lib/tutor.functions";
import { toast } from "sonner";
import { LanguageFusionPopup, type FusionTerm } from "@/components/LanguageFusionPopup";
import { HIRAGANA_BASIC, HIRAGANA_DAKUTEN, HIRAGANA_YOON, KATAKANA_BASIC, KATAKANA_DAKUTEN, KATAKANA_YOON } from "@/lib/japanese-data";
import { kanjiByLevel } from "@/lib/kanji-data";
import { JLPT_VOCAB, type JlptLevel } from "@/lib/jlpt-vocab";
import { HSK_VOCAB, PINYIN_INITIALS, PINYIN_FINALS, TONES, type HskLevel } from "@/lib/hsk-data";
import { HANGUL_VOWELS, HANGUL_CONSONANTS, TOPIK_STARTERS, KOREAN_GRAMMAR_POINTS, type TopikLevel } from "@/lib/korean-data";

/** Curriculum lookup — real, existing StudyHub data. */
function lessonContent(language: LanguageKey, node: LessonNode): { chips: FusionTerm[]; note?: string } {
  if (language === "japanese") {
    if (node.stage === "Hiragana") {
      const src = [...HIRAGANA_BASIC, ...HIRAGANA_DAKUTEN, ...HIRAGANA_YOON];
      return { chips: src.slice(0, 40).map((k) => ({ term: k.kana, reading: k.romaji, kind: "vocab" })) };
    }
    if (node.stage === "Katakana") {
      const src = [...KATAKANA_BASIC, ...KATAKANA_DAKUTEN, ...KATAKANA_YOON];
      return { chips: src.slice(0, 40).map((k) => ({ term: k.kana, reading: k.romaji, kind: "vocab" })) };
    }
    if (node.stage.startsWith("JLPT")) {
      const lvl = node.stage.split(" ")[1] as JlptLevel;
      const words = JLPT_VOCAB[lvl] ?? [];
      const src = node.kind === "vocabulary" || node.kind === "learn" ? words : words.slice(0, 30);
      return { chips: src.slice(0, 40).map((w) => ({ term: w.j, reading: w.r, meaning: w.m, level: lvl, kind: "vocab" })) };
    }
    if (node.stage === "Basic Kanji") {
      const src = kanjiByLevel("N5");
      return { chips: src.slice(0, 30).map((k) => ({ term: k.k, reading: [...k.on, ...k.kun].join("・"), meaning: k.m.join(", "), level: "N5", kind: "kanji" })) };
    }
  }
  if (language === "chinese") {
    if (node.stage === "Pinyin") {
      const chips: FusionTerm[] = [
        ...TONES.map((t) => ({ term: t.mark, meaning: t.name, kind: "vocab" as const })),
        ...PINYIN_INITIALS.slice(0, 12).map((s) => ({ term: s, kind: "vocab" as const })),
        ...PINYIN_FINALS.slice(0, 12).map((s) => ({ term: s, kind: "vocab" as const })),
      ];
      return { chips };
    }
    if (node.stage.startsWith("HSK")) {
      const lvl = Number(node.stage.split(" ")[1]) as HskLevel;
      const words = HSK_VOCAB[lvl] ?? [];
      return { chips: words.slice(0, 40).map((w) => ({ term: w.s, reading: w.p, level: `HSK ${lvl}`, kind: "hanzi" })) };
    }
  }
  if (language === "korean") {
    if (node.stage === "Hangul") {
      const src = [...HANGUL_VOWELS, ...HANGUL_CONSONANTS];
      return { chips: src.map((j) => ({ term: j.ko, reading: j.rom, kind: "vocab" })) };
    }
    if (node.stage.startsWith("TOPIK")) {
      const lvl: TopikLevel = node.stage.includes("Advanced") ? "TOPIK II" : node.stage.includes("Intermediate") ? "TOPIK II" : "TOPIK I";
      const words = TOPIK_STARTERS[lvl] ?? [];
      if (node.kind === "grammar") {
        return { chips: KOREAN_GRAMMAR_POINTS.slice(0, 8).map((g) => ({ term: g.title, meaning: g.body, kind: "grammar" })) };
      }
      return { chips: words.slice(0, 40).map((w) => ({ term: w.ko, reading: w.rom, meaning: w.en, level: lvl, kind: "vocab" })) };
    }
  }
  return { chips: [], note: "Content coming soon for this lesson." };
}

export function RoadmapView({ language }: { language: LanguageKey }) {
  const nodes = ROADMAPS[language];
  const { completedKeys, complete } = useLessonProgress(language);
  const { profile, update } = useProfile();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  const currentIdx = useMemo(() => nodes.findIndex((n) => !completedKeys.has(n.key)), [nodes, completedKeys]);

  return (
    <div className="relative">
      <div className="absolute left-1/2 top-6 bottom-6 w-0.5 bg-border/60 -translate-x-1/2 rounded-full" />
      <ol className="relative flex flex-col gap-6">
        {nodes.map((n, i) => {
          const state = lessonState(i, completedKeys, nodes);
          const zig = i % 2 === 0 ? "sm:-translate-x-20" : "sm:translate-x-20";
          return (
            <li key={n.key} className={`flex justify-center transition-transform ${zig}`}>
              <button
                onClick={() => {
                  if (state === "locked") { setPreviewIdx(i); return; }
                  setOpenIdx(i);
                }}
                className={`group relative flex items-center gap-3 w-full max-w-sm px-4 py-3 rounded-2xl border transition-all ${
                  state === "completed"
                    ? "bg-primary/10 border-primary/40 hover:bg-primary/15"
                    : state === "current"
                    ? "bg-card border-primary shadow-[0_0_0_4px_rgb(var(--primary-rgb,168_192_160)/0.15)] animate-pulse"
                    : "bg-card border-border/60 opacity-70 hover:opacity-90"
                }`}
              >
                <div className={`shrink-0 size-14 rounded-full grid place-items-center border-2 ${
                  state === "completed" ? "bg-primary text-primary-foreground border-primary" :
                  state === "current" ? "bg-primary/20 text-primary border-primary" :
                  "bg-muted text-muted-foreground border-border blur-[0.5px]"
                }`}>
                  {state === "completed" ? <Check className="size-6 stroke-[2]" />
                    : state === "locked" ? <Lock className="size-5 stroke-[1.75]" />
                    : <Star className="size-6 stroke-[1.75] fill-primary/40" />}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{n.stage}</div>
                  <div className={`font-display font-bold truncate ${state === "locked" ? "text-muted-foreground" : ""}`}>{n.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex gap-3">
                    <span>+{n.xp} XP</span>
                    <span>~{n.minutes}m</span>
                    <span>{"●".repeat(n.difficulty)}{"○".repeat(5 - n.difficulty)}</span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      {openIdx !== null && (
        <LessonSheet
          language={language}
          node={nodes[openIdx]}
          onClose={() => setOpenIdx(null)}
          onComplete={async () => {
            const n = nodes[openIdx];
            await complete.mutateAsync({ lessonKey: n.key, xp: n.xp, stars: 3 });
            await update.mutateAsync({ xp: (profile?.xp ?? 0) + n.xp, coins: (profile?.coins ?? 0) + Math.round(n.xp / 10) });
            toast.success(`+${n.xp} XP — lesson complete!`);
            setOpenIdx(null);
          }}
        />
      )}
      {previewIdx !== null && (
        <PreviewSheet
          node={nodes[previewIdx]}
          currentTitle={nodes[currentIdx]?.title ?? "the current lesson"}
          onClose={() => setPreviewIdx(null)}
        />
      )}
    </div>
  );
}

const LESSON_TABS = ["Learn", "Practice", "Reading", "Writing", "Listening", "Speaking", "Vocabulary", "Grammar", "Conversation", "AI Practice", "Review"] as const;

function LessonSheet({ language, node, onClose, onComplete }: {
  language: LanguageKey;
  node: LessonNode;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [tab, setTab] = useState<typeof LESSON_TABS[number]>("Learn");
  const content = useMemo(() => lessonContent(language, node), [language, node]);
  const [selected, setSelected] = useState<FusionTerm | null>(null);
  const chat = useServerFn(tutorChat);
  const [aiOut, setAiOut] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  async function askAI() {
    setAiLoading(true);
    try {
      const res = await chat({ data: {
        mode: language,
        messages: [{ role: "user", content: `Give me a short ${node.kind} exercise (3 questions with answers) for the lesson "${node.title}" in ${language}. Be encouraging and concise.` }],
      }});
      setAiOut(res.content);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI unavailable");
    } finally { setAiLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-background w-full sm:max-w-2xl rounded-t-[2rem] sm:rounded-[2rem] border border-border/60 max-h-[92vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-background/95 backdrop-blur px-5 py-3 flex items-center justify-between border-b border-border/60">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{node.stage}</div>
            <div className="font-display font-bold">{node.title}</div>
          </div>
          <button onClick={onClose} className="size-9 rounded-full hover:bg-muted grid place-items-center"><X className="size-[18px] stroke-[1.75]" /></button>
        </div>

        <div className="px-5 pt-3 overflow-x-auto">
          <div className="inline-flex gap-1 bg-card border border-border/60 p-1 rounded-full">
            {LESSON_TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {tab === "AI Practice" ? (
            <div className="space-y-3">
              <button onClick={askAI} disabled={aiLoading}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-40">
                {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 stroke-[1.75]" />}
                Generate practice
              </button>
              {aiOut && <div className="rounded-2xl bg-card border border-border/60 p-4 text-sm whitespace-pre-wrap">{aiOut}</div>}
            </div>
          ) : (
            <>
              {content.note && <p className="text-sm text-muted-foreground">{content.note}</p>}
              {content.chips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {content.chips.map((c, i) => (
                    <button key={i} onClick={() => setSelected(c)}
                      className="rounded-2xl border border-border/60 bg-card px-3 py-2 hover:border-primary/50 transition text-left min-w-[80px]">
                      <div className="font-bold">{c.term}</div>
                      {c.reading && <div className="text-[10px] text-muted-foreground">{c.reading}</div>}
                      {c.meaning && <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">{c.meaning}</div>}
                    </button>
                  ))}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Tap any item for meaning, pronunciation, examples and stroke order.
              </div>
            </>
          )}

          <button onClick={onComplete}
            className="w-full mt-4 rounded-2xl bg-primary text-primary-foreground py-3 font-bold hover:opacity-90">
            Mark lesson complete · +{node.xp} XP
          </button>
        </div>
      </div>

      <LanguageFusionPopup open={!!selected} onClose={() => setSelected(null)} language={language} term={selected} />
    </div>
  );
}

function PreviewSheet({ node, currentTitle, onClose }: { node: LessonNode; currentTitle: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4 animate-fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-background max-w-sm w-full rounded-3xl border border-border/60 p-6 text-center animate-scale-in">
        <div className="mx-auto size-14 rounded-full bg-muted grid place-items-center mb-3">
          <Lock className="size-6 text-muted-foreground" />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{node.stage}</div>
        <div className="font-display text-xl font-bold mt-1">{node.title}</div>
        <p className="text-sm text-muted-foreground mt-2">
          Locked — complete <strong>{currentTitle}</strong> first to unlock this lesson.
        </p>
        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <div>+{node.xp} XP · ~{node.minutes} min</div>
          <div>Difficulty {"●".repeat(node.difficulty)}{"○".repeat(5 - node.difficulty)}</div>
        </div>
        <button onClick={onClose} className="mt-5 w-full rounded-full bg-muted py-2.5 font-bold text-sm">Got it</button>
      </div>
    </div>
  );
}
