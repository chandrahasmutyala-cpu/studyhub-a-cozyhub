import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";

export const Route = createFileRoute("/_authenticated/japanese")({
  component: JapanesePage,
});

const HIRAGANA: { kana: string; romaji: string }[] = [
  ["あ","a"],["い","i"],["う","u"],["え","e"],["お","o"],
  ["か","ka"],["き","ki"],["く","ku"],["け","ke"],["こ","ko"],
  ["さ","sa"],["し","shi"],["す","su"],["せ","se"],["そ","so"],
  ["た","ta"],["ち","chi"],["つ","tsu"],["て","te"],["と","to"],
  ["な","na"],["に","ni"],["ぬ","nu"],["ね","ne"],["の","no"],
  ["は","ha"],["ひ","hi"],["ふ","fu"],["へ","he"],["ほ","ho"],
  ["ま","ma"],["み","mi"],["む","mu"],["め","me"],["も","mo"],
  ["や","ya"],["ゆ","yu"],["よ","yo"],
  ["ら","ra"],["り","ri"],["る","ru"],["れ","re"],["ろ","ro"],
  ["わ","wa"],["を","wo"],["ん","n"],
].map(([kana, romaji]) => ({ kana, romaji }));

const KATAKANA: { kana: string; romaji: string }[] = [
  ["ア","a"],["イ","i"],["ウ","u"],["エ","e"],["オ","o"],
  ["カ","ka"],["キ","ki"],["ク","ku"],["ケ","ke"],["コ","ko"],
  ["サ","sa"],["シ","shi"],["ス","su"],["セ","se"],["ソ","so"],
  ["タ","ta"],["チ","chi"],["ツ","tsu"],["テ","te"],["ト","to"],
  ["ナ","na"],["ニ","ni"],["ヌ","nu"],["ネ","ne"],["ノ","no"],
  ["ハ","ha"],["ヒ","hi"],["フ","fu"],["ヘ","he"],["ホ","ho"],
  ["マ","ma"],["ミ","mi"],["ム","mu"],["メ","me"],["モ","mo"],
  ["ヤ","ya"],["ユ","yu"],["ヨ","yo"],
  ["ラ","ra"],["リ","ri"],["ル","ru"],["レ","re"],["ロ","ro"],
  ["ワ","wa"],["ヲ","wo"],["ン","n"],
].map(([kana, romaji]) => ({ kana, romaji }));

const JLPT = {
  N5: [{ j: "学校", r: "gakkou", m: "school" }, { j: "食べる", r: "taberu", m: "to eat" }, { j: "猫", r: "neko", m: "cat" }, { j: "犬", r: "inu", m: "dog" }, { j: "水", r: "mizu", m: "water" }, { j: "本", r: "hon", m: "book" }],
  N4: [{ j: "約束", r: "yakusoku", m: "promise" }, { j: "経験", r: "keiken", m: "experience" }, { j: "意味", r: "imi", m: "meaning" }, { j: "図書館", r: "toshokan", m: "library" }],
  N3: [{ j: "適当", r: "tekitou", m: "suitable / random" }, { j: "想像", r: "souzou", m: "imagination" }, { j: "比較", r: "hikaku", m: "comparison" }],
  N2: [{ j: "矛盾", r: "mujun", m: "contradiction" }, { j: "概念", r: "gainen", m: "concept" }],
  N1: [{ j: "曖昧", r: "aimai", m: "ambiguous" }, { j: "葛藤", r: "kattou", m: "inner conflict" }],
};

function JapanesePage() {
  const { profile, update } = useProfile();
  const [tab, setTab] = useState<"hiragana" | "katakana" | "jlpt" | "quiz">("hiragana");
  const [jlptLevel, setJlptLevel] = useState<keyof typeof JLPT>("N5");

  return (
    <AppShell>
      <div className="max-w-4xl space-y-5">
        <div>
          <h1 className="font-display text-3xl font-bold">Japanese Academy</h1>
          <p className="text-sm text-muted-foreground">From あ to JLPT N1 — your level: {profile?.japanese_level ?? "beginner"}</p>
        </div>

        <div className="flex gap-1 bg-white p-1 rounded-full border border-border w-fit overflow-x-auto">
          {(["hiragana","katakana","jlpt","quiz"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full text-xs font-bold capitalize ${tab === t ? "bg-primary" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>

        {tab === "hiragana" && <KanaGrid items={HIRAGANA} />}
        {tab === "katakana" && <KanaGrid items={KATAKANA} />}
        {tab === "jlpt" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              {(Object.keys(JLPT) as (keyof typeof JLPT)[]).map((l) => (
                <button key={l} onClick={() => { setJlptLevel(l); update.mutate({ japanese_level: l.toLowerCase() }); }}
                  className={`px-4 py-2 rounded-full text-sm font-bold border ${jlptLevel === l ? "bg-primary border-primary" : "bg-white border-border"}`}>{l}</button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {JLPT[jlptLevel].map((v) => (
                <div key={v.j} className="bg-white border border-border rounded-3xl p-5">
                  <div className="text-3xl font-bold" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>{v.j}</div>
                  <div className="text-sm font-semibold mt-1">{v.r}</div>
                  <div className="text-xs text-muted-foreground">{v.m}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "quiz" && <KanaQuiz />}
      </div>
    </AppShell>
  );
}

function KanaGrid({ items }: { items: { kana: string; romaji: string }[] }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-2">
      {items.map((k) => (
        <div key={k.kana} className="bg-white border border-border rounded-2xl aspect-square grid place-items-center hover:bg-primary/30 transition-colors cursor-default">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>{k.kana}</div>
            <div className="text-[10px] text-muted-foreground font-semibold">{k.romaji}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function KanaQuiz() {
  const pool = useMemo(() => [...HIRAGANA, ...KATAKANA], []);
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
