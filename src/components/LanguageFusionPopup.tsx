import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { tutorChat } from "@/lib/tutor.functions";
import { KanjiStrokeViewer } from "@/components/KanjiStrokeViewer";
import { X, Volume2, Bookmark, BookmarkCheck, Loader2, Sparkles } from "lucide-react";

export type FusionLang = "japanese" | "chinese" | "korean";
export type FusionKind = "vocab" | "grammar" | "kanji" | "hanzi" | "hanja";

export type FusionTerm = {
  term: string;
  reading?: string;
  meaning?: string;
  level?: string; // JLPT N5, HSK 1, TOPIK I…
  kind?: FusionKind;
};

const LANG_TAG: Record<FusionLang, { locale: string; label: string; fontClass: string }> = {
  japanese: { locale: "ja-JP", label: "Japanese", fontClass: "" },
  chinese: { locale: "zh-CN", label: "Chinese", fontClass: "" },
  korean: { locale: "ko-KR", label: "Korean", fontClass: "" },
};

function speak(text: string, locale: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale;
  window.speechSynthesis.speak(u);
}

export function LanguageFusionPopup({
  open,
  onClose,
  language,
  term,
}: {
  open: boolean;
  onClose: () => void;
  language: FusionLang;
  term: FusionTerm | null;
}) {
  const chat = useServerFn(tutorChat);
  const [ai, setAi] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !term) { setAi(""); return; }
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("word_bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("language", language)
        .eq("kind", term.kind ?? "vocab")
        .eq("term", term.term)
        .maybeSingle();
      if (cancelled) return;
      setBookmarked(!!data);
      setBookmarkId(data?.id ?? null);
    })();
    return () => { cancelled = true; };
  }, [open, term, language]);

  if (!open || !term) return null;
  const meta = LANG_TAG[language];

  async function toggleBookmark() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (bookmarked && bookmarkId) {
      await supabase.from("word_bookmarks").delete().eq("id", bookmarkId);
      setBookmarked(false); setBookmarkId(null);
    } else {
      const { data } = await supabase.from("word_bookmarks").insert({
        user_id: user.id,
        language,
        term: term!.term,
        kind: term!.kind ?? "vocab",
        meta: { reading: term!.reading, meaning: term!.meaning, level: term!.level },
      }).select("id").single();
      if (data) { setBookmarked(true); setBookmarkId(data.id); }
    }
  }

  async function askAI() {
    setLoading(true);
    try {
      const prompt = `For the ${meta.label} ${term!.kind ?? "word"} 「${term!.term}」${term!.reading ? ` (${term!.reading})` : ""}${term!.meaning ? ` — ${term!.meaning}` : ""}, provide:

1. Meaning & nuance (1-2 lines)
2. Pronunciation (romanization / pinyin / romaja)
3. Grammar / usage note (1-2 lines)
4. 3 example sentences with reading + English
5. Synonyms (up to 4)
6. Antonyms (up to 3)
7. Related words (up to 5)
8. Frequency & typical level

Keep it tight and formatted with clear headings.`;
      const res = await chat({ data: { mode: language, messages: [{ role: "user", content: prompt }] } });
      setAi(res.content);
    } finally {
      setLoading(false);
    }
  }

  const isCJKChar = term.kind === "kanji" || term.kind === "hanzi" || term.kind === "hanja";

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-background w-full sm:max-w-lg sm:rounded-[2rem] rounded-t-[2rem] border border-border/60 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.35)] max-h-[92vh] overflow-y-auto animate-scale-in"
      >
        <div className="sticky top-0 bg-background/95 backdrop-blur px-5 py-3 flex items-center justify-between border-b border-border/60">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            {meta.label} · {term.kind ?? "vocab"}{term.level ? ` · ${term.level}` : ""}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleBookmark} className="size-9 rounded-full hover:bg-muted grid place-items-center" aria-label="Bookmark">
              {bookmarked ? <BookmarkCheck className="size-[18px] stroke-[1.75] text-primary" /> : <Bookmark className="size-[18px] stroke-[1.75]" />}
            </button>
            <button onClick={onClose} className="size-9 rounded-full hover:bg-muted grid place-items-center" aria-label="Close">
              <X className="size-[18px] stroke-[1.75]" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="text-center">
            <div className="text-6xl sm:text-7xl font-bold leading-none">{term.term}</div>
            {term.reading && <div className="text-sm text-muted-foreground mt-3">{term.reading}</div>}
            {term.meaning && <div className="text-base font-semibold mt-1">{term.meaning}</div>}
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => speak(term.term, meta.locale)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:opacity-90"
              >
                <Volume2 className="size-3.5 stroke-[1.75]" /> Native audio
              </button>
              <button
                onClick={askAI}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-4 py-2 text-xs font-bold hover:bg-muted disabled:opacity-40"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5 stroke-[1.75]" />}
                Ask AI
              </button>
            </div>
          </div>

          {isCJKChar && language === "japanese" && (
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Stroke order</div>
              <KanjiStrokeViewer kanji={term.term} />
            </div>
          )}

          {ai && (
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">AI insight</div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{ai}</div>
            </div>
          )}

          {!ai && !loading && (
            <p className="text-xs text-muted-foreground text-center">
              Tap Ask AI for meaning, examples, synonyms, related words and grammar notes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
