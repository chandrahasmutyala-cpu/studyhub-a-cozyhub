import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { loadMined, addMined, removeMined, reviewMined, type MinedWord } from "@/lib/vocab-mine";
import { Pickaxe, Plus, Trash2, Check, X, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/vocab-mining")({
  component: VocabMining,
});

function VocabMining() {
  const [list, setList] = useState<MinedWord[]>([]);
  const [lang, setLang] = useState<MinedWord["lang"]>("ja");
  const [native, setNative] = useState("");
  const [reading, setReading] = useState("");
  const [meaning, setMeaning] = useState("");
  const [source, setSource] = useState("");
  const [filter, setFilter] = useState<"all" | "due" | MinedWord["lang"]>("all");

  useEffect(() => { setList(loadMined()); }, []);

  function add() {
    if (!native.trim() || !meaning.trim()) return;
    setList(addMined({ lang, native: native.trim(), reading: reading.trim(), meaning: meaning.trim(), source: source.trim() || undefined }));
    setNative(""); setReading(""); setMeaning(""); setSource("");
  }

  const filtered = useMemo(() => {
    const now = Date.now();
    return list.filter((w) => {
      if (filter === "all") return true;
      if (filter === "due") return w.nextReview <= now;
      return w.lang === filter;
    });
  }, [list, filter]);

  const dueCount = list.filter(w => w.nextReview <= Date.now()).length;

  return (
    <AppShell>
      <div className="space-y-5 max-w-5xl">
        <header>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2"><Pickaxe className="size-7" /> Vocab Mining</h1>
          <p className="text-sm text-muted-foreground">Save any word you encounter — anime, drama, articles, lectures. Review with built-in spaced repetition.</p>
        </header>

        <div className="grid sm:grid-cols-4 gap-3">
          <Stat label="Total saved" value={list.length} />
          <Stat label="Due now" value={dueCount} highlight={dueCount > 0} />
          <Stat label="Japanese" value={list.filter(w => w.lang === "ja").length} />
          <Stat label="Chinese / Korean" value={list.filter(w => w.lang === "zh" || w.lang === "ko").length} />
        </div>

        <div className="rounded-3xl bg-white border border-border p-5 shadow-soft">
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2 flex items-center gap-1"><Plus className="size-3" /> Add a word</div>
          <div className="grid sm:grid-cols-5 gap-2">
            <select value={lang} onChange={e => setLang(e.target.value as any)} className="input">
              <option value="ja">日本語</option><option value="zh">中文</option><option value="ko">한국어</option>
            </select>
            <input value={native} onChange={e => setNative(e.target.value)} placeholder="Word" className="input" />
            <input value={reading} onChange={e => setReading(e.target.value)} placeholder="Reading / pinyin / romaja" className="input" />
            <input value={meaning} onChange={e => setMeaning(e.target.value)} placeholder="Meaning" className="input" />
            <div className="flex gap-2">
              <input value={source} onChange={e => setSource(e.target.value)} placeholder="Source (opt.)" className="input flex-1" />
              <button onClick={add} className="rounded-full bg-primary px-4 text-sm font-bold">Add</button>
            </div>
          </div>
        </div>

        <div className="flex gap-1 flex-wrap">
          {(["all", "due", "ja", "zh", "ko"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${filter === f ? "bg-primary" : "bg-white border border-border"}`}>
              {f === "all" ? "All" : f === "due" ? `Due (${dueCount})` : f === "ja" ? "日本語" : f === "zh" ? "中文" : "한국어"}
            </button>
          ))}
        </div>

        <div className="grid gap-2">
          {filtered.length === 0 && (
            <div className="rounded-3xl bg-white border border-border p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <BookOpen className="size-8 opacity-50" />
              No words yet. Add one above to start mining.
            </div>
          )}
          {filtered.map(w => {
            const due = w.nextReview <= Date.now();
            return (
              <div key={w.id} className={`rounded-2xl border p-3 flex items-center gap-3 ${due ? "bg-primary/10 border-primary" : "bg-white border-border"}`}>
                <div className="text-[10px] font-bold uppercase rounded-full bg-secondary px-2 py-0.5">{w.lang}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg">{w.native} <span className="text-xs text-muted-foreground font-sans">{w.reading}</span></div>
                  <div className="text-xs text-muted-foreground truncate">{w.meaning}{w.source ? ` · ${w.source}` : ""} · streak {w.streak}</div>
                </div>
                {due && (
                  <>
                    <button onClick={() => setList(reviewMined(w.id, false))} className="size-8 rounded-full bg-white border border-border grid place-items-center" title="Forgot"><X className="size-4" /></button>
                    <button onClick={() => setList(reviewMined(w.id, true))} className="size-8 rounded-full bg-primary grid place-items-center" title="Got it"><Check className="size-4" /></button>
                  </>
                )}
                <button onClick={() => setList(removeMined(w.id))} className="size-8 rounded-full bg-white border border-border grid place-items-center text-muted-foreground" title="Delete"><Trash2 className="size-3.5" /></button>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`.input{width:100%;border:1px solid hsl(var(--border));border-radius:14px;padding:8px 12px;font-size:14px;background:white}`}</style>
    </AppShell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-3xl border p-4 shadow-soft ${highlight ? "bg-primary/15 border-primary" : "bg-white border-border"}`}>
      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{label}</div>
      <div className="font-display text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
