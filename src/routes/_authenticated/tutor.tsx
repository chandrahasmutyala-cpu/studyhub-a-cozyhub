import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { tutorChat } from "@/lib/tutor.functions";
import { AppShell } from "@/components/AppShell";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tutor")({
  component: TutorPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "studyhub.tutor.history";

const SUGGESTIONS = [
  "Teach me the Japanese ~te form with 3 examples",
  "Quiz me on HSK 2 vocabulary",
  "Explain Korean 은/는 vs 이/가",
  "Help me plan a MEXT scholarship application",
  "Recommend universities in Japan for an Engineering student with JLPT N3",
  "Write me a 30-day TOPIK II study plan",
];

function TutorPage() {
  const chat = useServerFn(tutorChat);
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Msg[]) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      /* quota */
    }
  }, [messages]);

  async function send(prompt?: string) {
    const text = (prompt ?? input).trim();
    if (!text || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await chat({ data: { messages: next, mode: "general" } });
      setMessages([...next, { role: "assistant", content: res.content }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tutor unavailable");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function clearChat() {
    setMessages([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* */
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-4">
        <header className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">StudyHub</div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1">AI Tutor</h1>
            <p className="text-sm text-muted-foreground max-w-xl mt-1">
              One tutor for everything — languages, JLPT/HSK/TOPIK, universities, scholarships, exams and study planning.
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs font-bold inline-flex items-center gap-1 rounded-full bg-white border border-border px-3 py-1.5 hover:bg-secondary"
            >
              <Trash2 className="size-3.5" /> Clear
            </button>
          )}
        </header>

        <section className="rounded-[2rem] border border-border bg-white/85 backdrop-blur shadow-soft overflow-hidden flex flex-col h-[68vh] min-h-[440px]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-10 space-y-4">
                <div className="size-12 rounded-2xl bg-primary/30 grid place-items-center mx-auto">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <div className="font-display font-bold">Ask Mochi anything</div>
                  <p className="text-xs text-muted-foreground">Try one of these to get started.</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="px-3 py-1.5 rounded-full bg-white border border-border text-xs font-semibold hover:bg-primary/30"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-cream border border-border rounded-tl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-1 text-muted-foreground text-sm px-2">
                <span className="animate-pulse">Mochi is thinking</span>
                <span className="animate-pulse [animation-delay:120ms]">.</span>
                <span className="animate-pulse [animation-delay:240ms]">.</span>
                <span className="animate-pulse [animation-delay:360ms]">.</span>
              </div>
            )}
            <div ref={bottom} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-border bg-white/95 p-3 flex gap-2 items-end"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask anything — language, university, scholarship, study plan…"
              rows={1}
              className="flex-1 bg-cream rounded-2xl px-4 py-2.5 outline-none text-sm resize-none max-h-32"
            />
            <button
              disabled={loading || !input.trim()}
              className="size-10 rounded-full bg-primary grid place-items-center disabled:opacity-40 shrink-0"
              aria-label="Send"
            >
              <Send className="size-4" />
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
