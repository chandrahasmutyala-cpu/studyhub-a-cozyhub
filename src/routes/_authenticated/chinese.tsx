import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { HSK_VOCAB, HSK_COUNTS, HSK_TOTAL, PINYIN_INITIALS, PINYIN_FINALS, TONES, type HskLevel } from "@/lib/hsk-data";
import { tutorChat } from "@/lib/tutor.functions";
import { BookOpen, Sparkles, Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chinese")({
  component: ChinesePage,
});

type Tab = "pinyin" | "vocab" | "stories" | "quiz";
const LEVELS: HskLevel[] = [1, 2, 3, 4, 5, 6];

function speak(text: string, lang = "zh-CN") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  window.speechSynthesis.speak(u);
}

function ChinesePage() {
  const [tab, setTab] = useState<Tab>("pinyin");

  return (
    <AppShell>
      <div className="max-w-5xl space-y-5 animate-fade-up">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Chinese Academy</h1>
          <p className="text-sm text-muted-foreground">Pinyin, tones, all {HSK_TOTAL.toLocaleString()} HSK 1–6 vocabulary, stories & quizzes.</p>
        </div>

        <div className="flex gap-1 bg-white/80 backdrop-blur p-1 rounded-full border border-border w-fit overflow-x-auto">
          {(["pinyin","vocab","stories","quiz"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap ${tab === t ? "bg-primary" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>

        {tab === "pinyin" && <PinyinTab />}
        {tab === "vocab" && <VocabTab />}
        {tab === "stories" && <StoriesTab />}
        {tab === "quiz" && <QuizTab />}
      </div>
    </AppShell>
  );
}

function PinyinTab() {
  return (
    <div className="space-y-5">
      <section className="bg-white/85 backdrop-blur border border-border rounded-3xl p-5">
        <h2 className="font-display text-lg font-bold mb-2">Tones</h2>
        <div className="grid sm:grid-cols-5 gap-2">
          {TONES.map((t) => (
            <div key={t.mark} className="bg-cream rounded-2xl p-3 text-center">
              <div className="text-3xl font-bold">{t.mark}</div>
              <div className="text-[11px] font-bold mt-1">{t.arrow}</div>
              <div className="text-[10px] text-muted-foreground">{t.name}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-white/85 backdrop-blur border border-border rounded-3xl p-5">
        <h2 className="font-display text-lg font-bold mb-2">Initials</h2>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
          {PINYIN_INITIALS.map((i) => (
            <button key={i} onClick={() => speak(i + "a")}
              className="bg-cream hover:bg-primary/30 rounded-xl py-2 font-bold text-sm">{i}</button>
          ))}
        </div>
      </section>
      <section className="bg-white/85 backdrop-blur border border-border rounded-3xl p-5">
        <h2 className="font-display text-lg font-bold mb-2">Finals</h2>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {PINYIN_FINALS.map((f) => (
            <button key={f} onClick={() => speak(f)}
              className="bg-cream hover:bg-primary/30 rounded-xl py-2 font-bold text-sm">{f}</button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">Tap any sound to hear it (uses your browser's zh-CN voice).</p>
      </section>
    </div>
  );
}

function VocabTab() {
  const [level, setLevel] = useState<HskLevel>(1);
  const [q, setQ] = useState("");
  const list = useMemo(() => HSK_VOCAB[level], [level]);
  const filtered = useMemo(
    () => q.trim() ? list.filter((w) => w.s.includes(q) || w.p.toLowerCase().includes(q.toLowerCase())) : list,
    [list, q],
  );
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <button key={l} onClick={() => setLevel(l)}
            className={`px-4 py-2 rounded-full text-sm font-bold border ${level === l ? "bg-primary border-primary" : "bg-white/85 border-border"}`}>
            HSK {l}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search character or pinyin"
          className="flex-1 min-w-[200px] bg-white/85 backdrop-blur border border-border rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
        <span className="text-xs text-muted-foreground">{filtered.length} / {HSK_COUNTS[level]} words</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {filtered.slice(0, 400).map((w) => (
          <button key={w.s + w.p} onClick={() => speak(w.s)}
            className="text-left bg-white/85 backdrop-blur border border-border rounded-2xl p-3 hover:shadow-soft hover:border-primary transition-all">
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl font-bold leading-none">{w.s}</div>
              <Volume2 className="size-3.5 text-muted-foreground" />
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">{w.p}</div>
          </button>
        ))}
      </div>
      {filtered.length > 400 && (
        <p className="text-[11px] text-muted-foreground text-center">Showing first 400 — refine your search to narrow.</p>
      )}
      <p className="text-[11px] text-muted-foreground">Tap a word to hear it. Ask the AI Tutor for English meanings & example sentences.</p>
    </div>
  );
}

function StoriesTab() {
  const chat = useServerFn(tutorChat);
  const [level, setLevel] = useState<HskLevel>(2);
  const [theme, setTheme] = useState("daily life");
  const [stories, setStories] = useState<{ level: HskLevel; theme: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const themes = ["daily life","school","travel","food","festival","friendship","mystery","sci-fi"];

  async function generate() {
    setLoading(true);
    try {
      const res = await chat({ data: {
        mode: "chinese",
        messages: [{ role: "user", content:
          `Write an original short story (8-14 sentences) in Simplified Chinese suitable for HSK ${level} learners, on the theme "${theme}". Use level-appropriate vocabulary and grammar. After the Chinese text add:\n\nPINYIN:\n(full pinyin with tone marks)\n\nTRANSLATION:\n(English translation)\n\nVOCAB:\n- 词 (pinyin) — meaning\n(5-8 key new words)` }],
      }});
      setStories((s) => [{ level, theme, text: res.content }, ...s]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/85 backdrop-blur border border-border rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2"><BookOpen className="size-5 text-primary" /><h2 className="font-display text-lg font-bold">Story Generator</h2></div>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${level === l ? "bg-primary border-primary" : "bg-cream border-border"}`}>HSK {l}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {themes.map((t) => (
            <button key={t} onClick={() => setTheme(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${theme === t ? "bg-primary border-primary" : "bg-cream border-border"}`}>{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input value={theme} onChange={(e) => setTheme(e.target.value)} className="flex-1 bg-cream rounded-2xl px-4 py-2.5 text-sm outline-none" />
          <button onClick={generate} disabled={loading} className="inline-flex items-center gap-2 bg-primary rounded-full px-5 py-2.5 font-bold text-sm disabled:opacity-40">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} New story
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
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">HSK {s.level} · {s.theme}</div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{s.text}</div>
        </article>
      ))}
    </div>
  );
}

function QuizTab() {
  const pool = useMemo(() => [...HSK_VOCAB[1], ...HSK_VOCAB[2]], []);
  const [card, setCard] = useState(() => pool[Math.floor(Math.random() * pool.length)]);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<null | "right" | "wrong">(null);
  const [score, setScore] = useState({ right: 0, wrong: 0 });
  function next() { setCard(pool[Math.floor(Math.random() * pool.length)]); setGuess(""); setResult(null); }
  function check(e: React.FormEvent) {
    e.preventDefault();
    const want = card.p.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (c) => "aeiouüaeiouüaeiouüaeiouüaeiouü"[Math.floor("āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ".indexOf(c)/4)] || c).toLowerCase().replace(/\s+/g,"");
    const got = guess.toLowerCase().replace(/[1-5\s]/g,"");
    if (got === want) { setResult("right"); setScore((s)=>({...s,right:s.right+1})); setTimeout(next, 700); }
    else { setResult("wrong"); setScore((s)=>({...s,wrong:s.wrong+1})); }
  }
  return (
    <div className="bg-white/85 backdrop-blur rounded-[2rem] border border-border p-8 shadow-soft text-center max-w-md mx-auto">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">What's the pinyin?</div>
      <div className="text-7xl font-bold my-4">{card.s}</div>
      <button onClick={() => speak(card.s)} className="inline-flex items-center gap-1 text-xs bg-cream rounded-full px-3 py-1 mb-3"><Volume2 className="size-3" /> Hear it</button>
      <form onSubmit={check}>
        <input autoFocus value={guess} onChange={(e) => setGuess(e.target.value)}
          className={`w-full bg-cream rounded-2xl px-4 py-3 outline-none text-center font-bold text-lg border-2 ${result === "right" ? "border-matcha" : result === "wrong" ? "border-destructive" : "border-transparent"}`}
          placeholder="type pinyin (no tones ok)" />
        {result === "wrong" && <div className="text-xs text-destructive mt-2">It's <strong>{card.p}</strong></div>}
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={next} className="flex-1 bg-white border border-border rounded-full py-2 font-bold">Skip</button>
          <button className="flex-1 bg-primary rounded-full py-2 font-bold">Check</button>
        </div>
      </form>
      <div className="text-xs text-muted-foreground mt-4">✅ {score.right} · ❌ {score.wrong}</div>
    </div>
  );
}
