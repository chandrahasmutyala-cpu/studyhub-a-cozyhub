import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { HANGUL_VOWELS, HANGUL_CONSONANTS, TOPIK_STARTERS, TOPIK_LEVELS, KOREAN_GRAMMAR_POINTS, type TopikLevel } from "@/lib/korean-data";
import { tutorChat } from "@/lib/tutor.functions";
import { BookOpen, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/korean")({
  component: KoreanPage,
});

type Tab = "hangul" | "vocab" | "grammar" | "stories" | "quiz";


function KoreanPage() {
  const [tab, setTab] = useState<Tab>("hangul");
  return (
    <AppShell>
      <div className="max-w-5xl space-y-5 animate-fade-up">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Korean Academy</h1>
          <p className="text-sm text-muted-foreground">Hangul, TOPIK vocabulary, grammar, stories & quizzes.</p>
        </div>

        <div className="flex gap-1 bg-white/80 backdrop-blur p-1 rounded-full border border-border w-fit overflow-x-auto">
          {(["hangul","vocab","grammar","stories","quiz"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap ${tab === t ? "bg-primary" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>

        {tab === "hangul" && <HangulTab />}
        {tab === "vocab" && <VocabTab />}
        {tab === "grammar" && <GrammarTab />}
        {tab === "stories" && <StoriesTab />}
        {tab === "quiz" && <QuizTab />}
      </div>
    </AppShell>
  );
}

function HangulTab() {
  return (
    <div className="space-y-5">
      <section>
        <h2 className="font-display text-lg font-bold mb-2">Vowels (모음)</h2>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {HANGUL_VOWELS.map((j) => (
            <div key={j.ko}
              className="bg-white/85 backdrop-blur border border-border rounded-2xl aspect-square grid place-items-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{j.ko}</div>
                <div className="text-[10px] text-muted-foreground font-semibold">{j.rom}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="font-display text-lg font-bold mb-2">Consonants (자음)</h2>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {HANGUL_CONSONANTS.map((j) => (
            <div key={j.ko}
              className="bg-white/85 backdrop-blur border border-border rounded-2xl aspect-square grid place-items-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{j.ko}</div>
                <div className="text-[10px] text-muted-foreground font-semibold">{j.rom}</div>
                {j.note && <div className="text-[9px] text-primary-foreground bg-primary rounded-full px-1.5 mt-0.5">{j.note}</div>}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">Ask the AI Tutor about batchim (받침) rules.</p>
      </section>
    </div>
  );
}

function VocabTab() {
  const [level, setLevel] = useState<TopikLevel>("TOPIK I");
  const list = TOPIK_STARTERS[level];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {TOPIK_LEVELS.map((l) => (
          <button key={l} onClick={() => setLevel(l)}
            className={`px-4 py-2 rounded-full text-sm font-bold border ${level === l ? "bg-primary border-primary" : "bg-white/85 border-border"}`}>{l}</button>
        ))}
      </div>
      {list.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {list.map((w) => (
            <div key={w.ko}
              className="text-left bg-white/85 backdrop-blur border border-border rounded-2xl p-3 flex items-start gap-3">
              <div className="flex-1">
                <div className="font-bold text-lg">{w.ko}</div>
                <div className="text-[11px] text-muted-foreground">{w.rom}</div>
                <div className="text-xs mt-1">{w.en}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/85 backdrop-blur rounded-3xl border border-border p-8 text-center text-sm text-muted-foreground">
          {level} vocabulary is generated on demand. Open the AI Tutor and ask for a "{level} word list".
        </div>
      )}
    </div>
  );
}

function GrammarTab() {
  return (
    <div className="space-y-2">
      {KOREAN_GRAMMAR_POINTS.map((g) => (
        <article key={g.id} className="bg-white/85 backdrop-blur border border-border rounded-2xl p-4">
          <div className="font-display font-bold">{g.title}</div>
          <p className="text-sm text-muted-foreground mt-1">{g.body}</p>
        </article>
      ))}
      <p className="text-[11px] text-muted-foreground">Want more depth? Ask the AI Tutor for examples and practice questions.</p>
    </div>
  );
}

function StoriesTab() {
  const chat = useServerFn(tutorChat);
  const [level, setLevel] = useState<TopikLevel>("TOPIK I");
  const [theme, setTheme] = useState("daily life");
  const [stories, setStories] = useState<{ level: TopikLevel; theme: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const themes = ["daily life","school","travel","K-drama scene","food","friendship","mystery"];

  async function generate() {
    setLoading(true);
    try {
      const res = await chat({ data: {
        mode: "korean",
        messages: [{ role: "user", content:
          `Write an original short story (8-14 sentences) in Korean (한글) suitable for ${level} learners, on the theme "${theme}". Use level-appropriate vocabulary and grammar. After the Korean text add:\n\nROMANIZATION:\n(revised romanization)\n\nTRANSLATION:\n(English translation)\n\nVOCAB:\n- 단어 (romanization) — meaning\n(5-8 key new words)` }],
      }});
      setStories((s) => [{ level, theme, text: res.content }, ...s]);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Generation failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/85 backdrop-blur border border-border rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2"><BookOpen className="size-5 text-primary" /><h2 className="font-display text-lg font-bold">Story Generator</h2></div>
        <div className="flex flex-wrap gap-2">
          {TOPIK_LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${level === l ? "bg-primary border-primary" : "bg-cream border-border"}`}>{l}</button>
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
          No stories yet — tap "New story" ✨
        </div>
      )}
      {stories.map((s, i) => (
        <article key={i} className="bg-white/85 backdrop-blur border border-border rounded-3xl p-6 shadow-soft">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{s.level} · {s.theme}</div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{s.text}</div>
        </article>
      ))}
    </div>
  );
}

function QuizTab() {
  const pool = useMemo(() => [...HANGUL_VOWELS, ...HANGUL_CONSONANTS], []);
  const [card, setCard] = useState(() => pool[Math.floor(Math.random() * pool.length)]);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<null | "right" | "wrong">(null);
  const [score, setScore] = useState({ right: 0, wrong: 0 });
  function next() { setCard(pool[Math.floor(Math.random() * pool.length)]); setGuess(""); setResult(null); }
  function check(e: React.FormEvent) {
    e.preventDefault();
    if (card.rom.split("/").map((s) => s.trim().toLowerCase()).includes(guess.trim().toLowerCase())) {
      setResult("right"); setScore((s)=>({...s,right:s.right+1})); setTimeout(next, 700);
    } else { setResult("wrong"); setScore((s)=>({...s,wrong:s.wrong+1})); }
  }
  return (
    <div className="bg-white/85 backdrop-blur rounded-[2rem] border border-border p-8 shadow-soft text-center max-w-md mx-auto">
      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">What's this jamo?</div>
      <div className="text-8xl font-bold my-4">{card.ko}</div>
      <form onSubmit={check}>
        <input autoFocus value={guess} onChange={(e) => setGuess(e.target.value)}
          className={`w-full bg-cream rounded-2xl px-4 py-3 outline-none text-center font-bold text-lg border-2 ${result === "right" ? "border-matcha" : result === "wrong" ? "border-destructive" : "border-transparent"}`}
          placeholder="type romanization" />
        {result === "wrong" && <div className="text-xs text-destructive mt-2">It's <strong>{card.rom}</strong></div>}
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={next} className="flex-1 bg-white border border-border rounded-full py-2 font-bold">Skip</button>
          <button className="flex-1 bg-primary rounded-full py-2 font-bold">Check</button>
        </div>
      </form>
      <div className="text-xs text-muted-foreground mt-4">✅ {score.right} · ❌ {score.wrong}</div>
    </div>
  );
}
