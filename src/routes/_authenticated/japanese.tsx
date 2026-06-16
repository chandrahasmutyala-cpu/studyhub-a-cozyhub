import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";
import {
  HIRAGANA_BASIC, HIRAGANA_DAKUTEN, HIRAGANA_YOON,
  KATAKANA_BASIC, KATAKANA_DAKUTEN, KATAKANA_YOON,
  type Kana,
} from "@/lib/japanese-data";
import { kanjiByLevel, KANJI_COUNTS, KANJI_TOTAL } from "@/lib/kanji-data";
import { JLPT_VOCAB, JLPT_COUNTS, JLPT_TOTAL, type JlptLevel, type JlptWord } from "@/lib/jlpt-vocab";
import { tutorChat } from "@/lib/tutor.functions";
import { KanjiStrokeViewer } from "@/components/KanjiStrokeViewer";
import { BookOpen, Sparkles, Loader2, X, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/japanese")({
  component: JapanesePage,
});

type Tab = "hiragana" | "katakana" | "kanji" | "vocab" | "stories" | "quiz";
type Level = "N5" | "N4" | "N3" | "N2" | "N1";
const LEVELS: Level[] = ["N5","N4","N3","N2","N1"];

function JapanesePage() {
  const { profile, update } = useProfile();
  const [tab, setTab] = useState<Tab>("hiragana");
  const [jlptLevel, setJlptLevel] = useState<Level>("N5");

  return (
    <AppShell>
      <div className="max-w-5xl space-y-5 animate-fade-up">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Japanese Academy</h1>
          <p className="text-sm text-muted-foreground">Hiragana, katakana, {JLPT_TOTAL.toLocaleString()} JLPT vocab, {KANJI_TOTAL.toLocaleString()} Jōyō kanji — your level: {profile?.japanese_level ?? "beginner"}</p>
        </div>

        <div className="flex gap-1 bg-white/80 backdrop-blur p-1 rounded-full border border-border w-fit overflow-x-auto">
          {(["hiragana","katakana","kanji","vocab","stories","quiz"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap ${tab === t ? "bg-primary" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>

        {tab === "hiragana" && (
          <div className="space-y-6">
            <KanaSection title="Gojūon (basic)" items={HIRAGANA_BASIC} />
            <KanaSection title="Dakuten & Handakuten" items={HIRAGANA_DAKUTEN} />
            <KanaSection title="Yōon (combinations)" items={HIRAGANA_YOON} />
          </div>
        )}

        {tab === "katakana" && (
          <div className="space-y-6">
            <KanaSection title="Gojūon (basic)" items={KATAKANA_BASIC} />
            <KanaSection title="Dakuten & Handakuten" items={KATAKANA_DAKUTEN} />
            <KanaSection title="Yōon (combinations)" items={KATAKANA_YOON} />
          </div>
        )}

        {tab === "kanji" && (
          <KanjiTab level={jlptLevel} setLevel={(l) => { setJlptLevel(l); update.mutate({ japanese_level: l.toLowerCase() }); }} />
        )}

        {tab === "vocab" && <VocabTab defaultLevel={jlptLevel} onLevel={(l) => { setJlptLevel(l); update.mutate({ japanese_level: l.toLowerCase() }); }} />}
        {tab === "stories" && <StoriesTab defaultLevel={jlptLevel} />}
        {tab === "quiz" && <KanaQuiz />}
      </div>
    </AppShell>
  );
}

function LevelPicker({ level, onChange }: { level: Level; onChange: (l: Level) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {LEVELS.map((l) => (
        <button key={l} onClick={() => onChange(l)}
          className={`px-4 py-2 rounded-full text-sm font-bold border ${level === l ? "bg-primary border-primary" : "bg-white/85 border-border"}`}>{l}</button>
      ))}
    </div>
  );
}

function KanaSection({ title, items }: { title: string; items: Kana[] }) {
  return (
    <section>
      <h2 className="font-display text-lg font-bold mb-2">{title}</h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-2">
        {items.map((k) => (
          <div key={k.kana} className="bg-white/85 backdrop-blur border border-border rounded-2xl aspect-square grid place-items-center hover:bg-primary/30 transition-colors">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>{k.kana}</div>
              <div className="text-[10px] text-muted-foreground font-semibold">{k.romaji}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function KanjiTab({ level, setLevel }: { level: Level; setLevel: (l: Level) => void }) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<ReturnType<typeof kanjiByLevel>[number] | null>(null);
  const all = useMemo(() => kanjiByLevel(level), [level]);
  const filtered = useMemo(() => {
    if (!q.trim()) return all;
    const s = q.toLowerCase();
    return all.filter((k) =>
      k.k.includes(q) ||
      k.m.some((m) => m.toLowerCase().includes(s)) ||
      k.on.some((r) => r.includes(q)) ||
      k.kun.some((r) => r.includes(q)),
    );
  }, [all, q]);

  return (
    <div className="space-y-3">
      <LevelPicker level={level} onChange={setLevel} />
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search kanji, meaning, or reading"
          className="flex-1 min-w-[200px] bg-white/85 backdrop-blur border border-border rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
        <span className="text-xs text-muted-foreground">{filtered.length} / {KANJI_COUNTS[level]} kanji</span>
      </div>
      <p className="text-xs text-muted-foreground">Tap any kanji to see numbered stroke-order arrows.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {filtered.map((k) => (
          <button key={k.k} onClick={() => setSelected(k)}
            className="text-left bg-white/85 backdrop-blur border border-border rounded-2xl p-3 hover:shadow-soft hover:border-primary transition-all">
            <div className="flex items-baseline justify-between">
              <div className="text-4xl font-bold leading-none" style={{ fontFamily: "Noto Serif JP, Noto Sans JP, sans-serif" }}>{k.k}</div>
              <span className="text-[10px] font-bold text-muted-foreground">{k.s}画</span>
            </div>
            <div className="mt-2 text-xs font-semibold line-clamp-1">{k.m.join(", ")}</div>
            {k.on.length > 0 && <div className="text-[11px] text-muted-foreground truncate" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>音 {k.on.join("・")}</div>}
            {k.kun.length > 0 && <div className="text-[11px] text-muted-foreground truncate" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>訓 {k.kun.join("・")}</div>}
          </button>
        ))}
      </div>

      {selected && <KanjiDetail kanji={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function KanjiDetail({ kanji, onClose }: { kanji: ReturnType<typeof kanjiByLevel>[number]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur grid place-items-center p-4 animate-fade-up" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[2rem] border border-border max-w-md w-full p-6 shadow-pop max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-6xl font-bold leading-none mb-2" style={{ fontFamily: "Noto Serif JP, Noto Sans JP, sans-serif" }}>{kanji.k}</div>
            <div className="text-sm font-bold">{kanji.m.join(", ")}</div>
            <div className="text-xs text-muted-foreground mt-1">{kanji.s} strokes</div>
          </div>
          <button onClick={onClose} className="size-9 rounded-full bg-cream hover:bg-secondary grid place-items-center"><X className="size-4" /></button>
        </div>

        <div className="space-y-1 text-xs mb-4">
          {kanji.on.length > 0 && <div><span className="font-bold text-muted-foreground">On (音):</span> <span style={{ fontFamily: "Noto Sans JP, sans-serif" }}>{kanji.on.join("、")}</span></div>}
          {kanji.kun.length > 0 && <div><span className="font-bold text-muted-foreground">Kun (訓):</span> <span style={{ fontFamily: "Noto Sans JP, sans-serif" }}>{kanji.kun.join("、")}</span></div>}
        </div>

        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Stroke order</div>
        <KanjiStrokeViewer kanji={kanji.k} />
        <p className="text-[11px] text-muted-foreground mt-2 text-center">Numbered arrows show the order — follow them from 1 to {kanji.s}.</p>
      </div>
    </div>
  );
}

function StoriesTab({ defaultLevel }: { defaultLevel: Level }) {
  const chat = useServerFn(tutorChat);
  const [level, setLevel] = useState<Level>(defaultLevel);
  const [theme, setTheme] = useState("daily life");
  const [stories, setStories] = useState<{ level: Level; theme: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await chat({ data: {
        mode: "japanese",
        messages: [{ role: "user", content: `Write an original short story (8-14 sentences) in Japanese suitable for JLPT ${level} learners, on the theme "${theme}". Use vocabulary and grammar level-appropriate. After the Japanese text, add:\n\nROMAJI:\n(full romaji)\n\nTRANSLATION:\n(English translation)\n\nVOCAB:\n- word (romaji) — meaning\n(5-8 key new words)` }],
      }});
      setStories((s) => [{ level, theme, text: res.content }, ...s]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally { setLoading(false); }
  }

  const themes = ["daily life","school","travel in Japan","festival","food","friendship","mystery","ghost story","sci-fi","samurai"];

  return (
    <div className="space-y-4">
      <div className="bg-white/85 backdrop-blur border border-border rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          <h2 className="font-display text-lg font-bold">Story Generator</h2>
        </div>
        <p className="text-xs text-muted-foreground">Unlimited reading practice — pick a level &amp; theme.</p>
        <LevelPicker level={level} onChange={setLevel} />
        <div className="flex flex-wrap gap-2">
          {themes.map((t) => (
            <button key={t} onClick={() => setTheme(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${theme === t ? "bg-primary border-primary" : "bg-cream border-border"}`}>{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="custom theme"
            className="flex-1 bg-cream rounded-2xl px-4 py-2.5 text-sm outline-none" />
          <button onClick={generate} disabled={loading}
            className="inline-flex items-center gap-2 bg-primary rounded-full px-5 py-2.5 font-bold text-sm disabled:opacity-40">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            New story
          </button>
        </div>
      </div>

      {stories.length === 0 && (
        <div className="bg-white/85 backdrop-blur rounded-3xl border border-border p-8 text-center text-sm text-muted-foreground">
          No stories yet — tap "New story" to read your first one ✨
        </div>
      )}

      {stories.map((s, i) => (
        <article key={i} className="bg-white/85 backdrop-blur border border-border rounded-3xl p-6 shadow-soft">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{s.level} · {s.theme}</div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>{s.text}</div>
        </article>
      ))}
    </div>
  );
}

function KanaQuiz() {
  const pool = useMemo(
    () => [
      ...HIRAGANA_BASIC, ...HIRAGANA_DAKUTEN, ...HIRAGANA_YOON,
      ...KATAKANA_BASIC, ...KATAKANA_DAKUTEN, ...KATAKANA_YOON,
    ],
    [],
  );
  const [card, setCard] = useState(() => pool[Math.floor(Math.random() * pool.length)]);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<null | "right" | "wrong">(null);
  const [score, setScore] = useState({ right: 0, wrong: 0 });

  function next() { setCard(pool[Math.floor(Math.random() * pool.length)]); setGuess(""); setResult(null); }
  function check(e: React.FormEvent) {
    e.preventDefault();
    if (guess.trim().toLowerCase() === card.romaji) {
      setResult("right"); setScore((s) => ({ ...s, right: s.right + 1 }));
      setTimeout(next, 700);
    } else {
      setResult("wrong"); setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
    }
  }

  return (
    <div className="bg-white/85 backdrop-blur rounded-[2rem] border border-border p-8 shadow-soft text-center max-w-md mx-auto">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">What's this kana?</div>
      <div className="text-8xl font-bold my-4" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>{card.kana}</div>
      <form onSubmit={check}>
        <input autoFocus value={guess} onChange={(e) => setGuess(e.target.value)}
          className={`w-full bg-cream rounded-2xl px-4 py-3 outline-none text-center font-bold text-lg border-2 ${result === "right" ? "border-matcha" : result === "wrong" ? "border-destructive" : "border-transparent"}`}
          placeholder="type romaji" />
        {result === "wrong" && <div className="text-xs text-destructive mt-2">It's <strong>{card.romaji}</strong></div>}
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={next} className="flex-1 bg-white border border-border rounded-full py-2 font-bold">Skip</button>
          <button className="flex-1 bg-primary rounded-full py-2 font-bold">Check</button>
        </div>
      </form>
      <div className="text-xs text-muted-foreground mt-4">✅ {score.right} · ❌ {score.wrong}</div>
    </div>
  );
}

function VocabTab({ defaultLevel, onLevel }: { defaultLevel: Level; onLevel: (l: Level) => void }) {
  const [level, setLevel] = useState<Level>(defaultLevel);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<JlptWord | null>(null);

  const all = useMemo<JlptWord[]>(() => JLPT_VOCAB[level as JlptLevel] ?? [], [level]);
  const filtered = useMemo(() => {
    if (!q.trim()) return all;
    const s = q.toLowerCase();
    return all.filter((w) =>
      w.j.includes(q) || w.r.includes(q) || w.m.toLowerCase().includes(s),
    );
  }, [all, q]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {LEVELS.map((l) => (
          <button key={l} onClick={() => { setLevel(l); onLevel(l); }}
            className={`px-4 py-2 rounded-full text-sm font-bold border ${level === l ? "bg-primary border-primary" : "bg-white/85 border-border"}`}>
            {l} <span className="text-[10px] font-semibold text-muted-foreground ml-1">{JLPT_COUNTS[l as JlptLevel]}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Japanese, reading, or English meaning"
            className="w-full pl-9 bg-white/85 backdrop-blur border border-border rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length.toLocaleString()} words</span>
      </div>
      <p className="text-xs text-muted-foreground">Tap any word for unlimited AI-generated example sentences.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filtered.slice(0, 600).map((w, i) => (
          <button key={`${w.j}-${i}`} onClick={() => setSelected(w)}
            className="text-left bg-white/85 backdrop-blur border border-border rounded-2xl p-3 hover:shadow-soft hover:border-primary transition-all">
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-xl font-bold" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>{w.j}</div>
              {w.r && <div className="text-[11px] text-muted-foreground" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>{w.r}</div>}
            </div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{w.m}</div>
          </button>
        ))}
      </div>
      {filtered.length > 600 && (
        <p className="text-xs text-muted-foreground text-center">Showing first 600 — refine your search to see more.</p>
      )}
      {selected && <VocabDetail word={selected} level={level} onClose={() => setSelected(null)} />}
    </div>
  );
}

function VocabDetail({ word, level, onClose }: { word: JlptWord; level: Level; onClose: () => void }) {
  const chat = useServerFn(tutorChat);
  const [examples, setExamples] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await chat({ data: {
        mode: "japanese",
        messages: [{ role: "user", content: `Give me 5 fresh, original example sentences using the JLPT ${level} word 「${word.j}」 (${word.r} — ${word.m}).

For each sentence return EXACTLY this format on its own block:
JP: <Japanese sentence>
読み: <full reading in hiragana>
RO: <romaji>
EN: <English translation>

Use varied grammar suitable for ${level} learners. Do not repeat sentences from previous turns.` }],
      }});
      setExamples((prev) => (prev ? prev + "\n\n---\n\n" : "") + res.content);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur grid place-items-center p-4 animate-fade-up" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[2rem] border border-border max-w-lg w-full p-6 shadow-pop max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-4xl font-bold" style={{ fontFamily: "Noto Serif JP, Noto Sans JP, sans-serif" }}>{word.j}</div>
            {word.r && <div className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>{word.r}</div>}
            <div className="text-sm font-semibold mt-1">{word.m}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">{level}</div>
          </div>
          <button onClick={onClose} className="size-9 rounded-full bg-cream hover:bg-secondary grid place-items-center"><X className="size-4" /></button>
        </div>

        <button onClick={generate} disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary rounded-full px-5 py-2.5 font-bold text-sm disabled:opacity-40">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {examples ? "More examples" : "Generate examples"}
        </button>

        {examples && (
          <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed bg-cream/60 rounded-2xl p-4" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>
            {examples}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground mt-3 text-center">Powered by Lovable AI — examples are freshly generated each tap.</p>
      </div>
    </div>
  );
}
