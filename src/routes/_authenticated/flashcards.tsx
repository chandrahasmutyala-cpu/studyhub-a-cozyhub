import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/flashcards")({
  component: FlashcardsPage,
});

type Card = {
  id: string; deck: string; front: string; back: string;
  ease: number; interval_days: number; due_date: string; reviews: number;
};

function FlashcardsPage() {
  const qc = useQueryClient();
  const [deck, setDeck] = useState<string>("All");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [newDeck, setNewDeck] = useState("General");
  const [showAnswer, setShowAnswer] = useState(false);
  const [index, setIndex] = useState(0);

  const q = useQuery({
    queryKey: ["flashcards"],
    queryFn: async () => {
      const { data } = await supabase.from("flashcards").select("*").order("due_date");
      return (data ?? []) as Card[];
    },
  });

  const decks = useMemo(() => Array.from(new Set(["All", ...(q.data ?? []).map((c) => c.deck)])), [q.data]);
  const today = new Date().toISOString().slice(0, 10);
  const dueCards = (q.data ?? []).filter((c) => (deck === "All" || c.deck === deck) && c.due_date <= today);
  const current = dueCards[index];

  const add = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error();
      const { error } = await supabase.from("flashcards").insert({ user_id: user.id, deck: newDeck || "General", front, back });
      if (error) throw error;
    },
    onSuccess: () => { setFront(""); setBack(""); qc.invalidateQueries({ queryKey: ["flashcards"] }); toast.success("Card added"); },
  });

  const review = useMutation({
    mutationFn: async ({ id, quality }: { id: string; quality: 0 | 1 | 2 | 3 }) => {
      const card = (q.data ?? []).find((c) => c.id === id);
      if (!card) return;
      // simple SM-2-ish
      let { ease, interval_days } = card;
      if (quality === 0) { interval_days = 1; ease = Math.max(1.3, ease - 0.2); }
      else if (quality === 1) { interval_days = Math.max(1, Math.round(interval_days * 1.2)); ease = Math.max(1.3, ease - 0.05); }
      else if (quality === 2) { interval_days = Math.max(1, Math.round(interval_days * ease)); }
      else { interval_days = Math.max(2, Math.round(interval_days * ease * 1.3)); ease += 0.1; }
      const next = new Date(); next.setDate(next.getDate() + interval_days);
      await supabase.from("flashcards").update({
        ease, interval_days, due_date: next.toISOString().slice(0, 10), reviews: card.reviews + 1,
      }).eq("id", id);
    },
    onSuccess: () => { setShowAnswer(false); setIndex((i) => i + 1); qc.invalidateQueries({ queryKey: ["flashcards"] }); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("flashcards").delete().eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flashcards"] }),
  });

  return (
    <AppShell>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Flashcards</h1>
          <p className="text-sm text-muted-foreground">Spaced repetition that remembers when you'll forget.</p>
        </div>

        {/* Review */}
        <section className="bg-white rounded-[2rem] border border-border p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 bg-cream p-1 rounded-full overflow-x-auto">
              {decks.map((d) => (
                <button key={d} onClick={() => { setDeck(d); setIndex(0); setShowAnswer(false); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${deck === d ? "bg-primary" : "text-muted-foreground"}`}>{d}</button>
              ))}
            </div>
            <div className="text-xs font-bold text-muted-foreground">{dueCards.length} due</div>
          </div>

          {current ? (
            <div>
              <div
                onClick={() => setShowAnswer((v) => !v)}
                className="min-h-[180px] bg-cream rounded-3xl p-6 grid place-items-center text-center cursor-pointer select-none"
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    {showAnswer ? "Answer" : "Question"} · tap to flip
                  </div>
                  <div className="font-display text-2xl font-bold whitespace-pre-wrap">
                    {showAnswer ? current.back : current.front}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[
                  { q: 0 as const, label: "Again", c: "bg-destructive/20" },
                  { q: 1 as const, label: "Hard", c: "bg-honey/40" },
                  { q: 2 as const, label: "Good", c: "bg-matcha-soft" },
                  { q: 3 as const, label: "Easy", c: "bg-lavender-soft" },
                ].map(({ q, label, c }) => (
                  <button key={label} disabled={!showAnswer} onClick={() => review.mutate({ id: current.id, quality: q })}
                    className={`py-3 rounded-2xl font-bold text-sm ${c} disabled:opacity-40`}>{label}</button>
                ))}
              </div>
              <button onClick={() => { setIndex(0); setShowAnswer(false); }} className="mt-3 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                <RotateCcw className="size-3" /> Restart deck
              </button>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <div className="text-5xl mb-3">🌸</div>
              All caught up. Add cards below or come back tomorrow.
            </div>
          )}
        </section>

        {/* Add */}
        <section className="bg-white rounded-[2rem] border border-border p-5 shadow-soft">
          <h2 className="font-display text-lg font-bold mb-3">Add a card</h2>
          <form onSubmit={(e) => { e.preventDefault(); if (front && back) add.mutate(); }} className="grid sm:grid-cols-2 gap-3">
            <input value={newDeck} onChange={(e) => setNewDeck(e.target.value)} placeholder="Deck (e.g. Japanese N5)"
              className="sm:col-span-2 bg-cream rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-primary" />
            <textarea value={front} onChange={(e) => setFront(e.target.value)} placeholder="Front (question)" rows={3}
              className="bg-cream rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-primary resize-none" />
            <textarea value={back} onChange={(e) => setBack(e.target.value)} placeholder="Back (answer)" rows={3}
              className="bg-cream rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-primary resize-none" />
            <button className="sm:col-span-2 bg-primary rounded-full px-4 py-2 font-bold flex items-center justify-center gap-1">
              <Plus className="size-4" />Add card
            </button>
          </form>
        </section>

        {/* List */}
        <section>
          <h2 className="font-display text-lg font-bold mb-3">All cards ({q.data?.length ?? 0})</h2>
          <div className="space-y-2">
            {(q.data ?? []).map((c) => (
              <div key={c.id} className="bg-white border border-border rounded-2xl p-3 flex items-center gap-3 text-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary px-2 py-0.5 rounded-lg">{c.deck}</span>
                <span className="font-semibold truncate flex-1">{c.front}</span>
                <span className="text-muted-foreground truncate hidden sm:block">{c.back}</span>
                <button onClick={() => del.mutate(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
