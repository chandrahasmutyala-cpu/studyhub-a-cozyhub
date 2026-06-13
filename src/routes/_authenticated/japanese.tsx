import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";
import {
  HIRAGANA_BASIC, HIRAGANA_DAKUTEN, HIRAGANA_YOON,
  KATAKANA_BASIC, KATAKANA_DAKUTEN, KATAKANA_YOON,
  JLPT, LESSONS, CHANNEL_URL,
  type Kana,
} from "@/lib/japanese-data";
import { ExternalLink, Youtube } from "lucide-react";

export const Route = createFileRoute("/_authenticated/japanese")({
  component: JapanesePage,
});

type Tab = "hiragana" | "katakana" | "jlpt" | "lessons" | "quiz";

function JapanesePage() {
  const { profile, update } = useProfile();
  const [tab, setTab] = useState<Tab>("hiragana");
  const [jlptLevel, setJlptLevel] = useState<keyof typeof JLPT>("N5");

  return (
    <AppShell>
      <div className="max-w-5xl space-y-5">
        <div>
          <h1 className="font-display text-3xl font-bold">Japanese Academy</h1>
          <p className="text-sm text-muted-foreground">From あ to JLPT N1 — your level: {profile?.japanese_level ?? "beginner"}</p>
        </div>

        <div className="flex gap-1 bg-white p-1 rounded-full border border-border w-fit overflow-x-auto">
          {(["hiragana","katakana","jlpt","lessons","quiz"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap ${tab === t ? "bg-primary" : "text-muted-foreground"}`}>{t}</button>
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

        {tab === "jlpt" && (
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(JLPT) as (keyof typeof JLPT)[]).map((l) => (
                <button key={l} onClick={() => { setJlptLevel(l); update.mutate({ japanese_level: l.toLowerCase() }); }}
                  className={`px-4 py-2 rounded-full text-sm font-bold border ${jlptLevel === l ? "bg-primary border-primary" : "bg-white border-border"}`}>{l}</button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {JLPT[jlptLevel].map((v) => (
                <div key={v.j} className="bg-white border border-border rounded-3xl p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <div className="text-3xl font-bold" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>{v.j}</div>
                      <div className="text-sm font-semibold mt-1">{v.r}</div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">{v.m}</div>
                  </div>
                  {v.ex && (
                    <div className="mt-3 pt-3 border-t border-border/70 text-sm space-y-0.5">
                      <div style={{ fontFamily: "Noto Sans JP, sans-serif" }}>{v.ex}</div>
                      <div className="text-xs text-muted-foreground italic">{v.exR}</div>
                      <div className="text-xs">{v.exM}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "lessons" && <LessonsTab />}
        {tab === "quiz" && <KanaQuiz />}
      </div>
    </AppShell>
  );
}

function KanaSection({ title, items }: { title: string; items: Kana[] }) {
  return (
    <section>
      <h2 className="font-display text-lg font-bold mb-2">{title}</h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-2">
        {items.map((k) => (
          <div key={k.kana} className="bg-white border border-border rounded-2xl aspect-square grid place-items-center hover:bg-primary/30 transition-colors">
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

function LessonsTab() {
  const groups: { label: string; key: keyof typeof LESSONS }[] = [
    { label: "Hiragana", key: "hiragana" },
    { label: "Katakana", key: "katakana" },
    { label: "JLPT N5", key: "N5" },
    { label: "JLPT N4", key: "N4" },
    { label: "JLPT N3", key: "N3" },
    { label: "JLPT N2", key: "N2" },
    { label: "JLPT N1", key: "N1" },
  ];
  return (
    <div className="space-y-4">
      <section className="bg-white rounded-[2rem] border border-border p-5 shadow-soft flex items-center gap-4">
        <div className="size-12 rounded-2xl bg-destructive/10 grid place-items-center"><Youtube className="size-6 text-destructive" /></div>
        <div className="flex-1">
          <div className="font-display text-lg font-bold">Learn Japanese Channel</div>
          <p className="text-xs text-muted-foreground">Curated video lessons hosted on YouTube. Opens externally.</p>
        </div>
        <a href={CHANNEL_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold bg-primary rounded-full px-3 py-2">
          Visit channel <ExternalLink className="size-3" />
        </a>
      </section>

      <div className="grid sm:grid-cols-2 gap-3">
        {groups.map((g) => (
          <div key={g.key} className="bg-white border border-border rounded-3xl p-5">
            <div className="font-display text-base font-bold mb-2">{g.label}</div>
            <ul className="space-y-2">
              {LESSONS[g.key].map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline">
                    <Youtube className="size-4 text-destructive" /> {l.title}
                  </a>
                  {l.note && <div className="text-[11px] text-muted-foreground ml-6">{l.note}</div>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
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
    <div className="bg-white rounded-[2rem] border border-border p-8 shadow-soft text-center max-w-md mx-auto">
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
