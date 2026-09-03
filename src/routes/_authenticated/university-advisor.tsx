import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { tutorChat } from "@/lib/tutor.functions";
import { AppShell } from "@/components/AppShell";
import { AlertCircle, GraduationCap, RotateCcw, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/university-advisor")({
  component: AdvisorPage,
});

type Msg = { role: "user" | "assistant"; content: string };
const STORAGE_KEY = "studyhub.uni-advisor.history";

const SUGGESTIONS = [
  "I have GPA 3.5, IELTS 7.0, JLPT N3 — recommend 3 Japanese universities for Engineering",
  "What's the difference between MEXT and JASSO scholarships?",
  "Walk me through applying to Tsinghua as an international student",
  "Build me a 6-month timeline for applying to Korean universities for Fall intake",
  "Which Chinese universities accept English-taught programs in Business?",
];

function AdvisorPage() {
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
  const [error, setError] = useState<string | null>(null);
  const [retryMessages, setRetryMessages] = useState<Msg[] | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), [messages, loading]);
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      /* */
    }
  }, [messages]);

  async function send(prompt?: string) {
    const text = (prompt ?? input).trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    setRetryMessages(null);
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await chat({ data: { messages: next, mode: "university" } });
      setMessages([...next, { role: "assistant", content: res.content }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "The University Advisor is unavailable right now.";
      setError(message);
      setRetryMessages(next);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function retry() {
    if (!retryMessages || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await chat({ data: { messages: retryMessages, mode: "university" } });
      setMessages([...retryMessages, { role: "assistant", content: res.content }]);
      setRetryMessages(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "The University Advisor is unavailable right now.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
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
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">StudentHub</div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1 flex items-center gap-2">
              <GraduationCap className="size-7" /> University Advisor
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl mt-1">
              A senior admissions advisor for Japan, China and Korea — university choice,
              scholarships, timelines, document checklists.
            </p>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="text-xs font-bold inline-flex items-center gap-1 rounded-full bg-white border border-border px-3 py-1.5 hover:bg-secondary">
              <Trash2 className="size-3.5" /> Clear
            </button>
          )}
        </header>

        <section className="rounded-[2rem] border border-border bg-white/85 backdrop-blur shadow-soft overflow-hidden flex flex-col h-[68vh] min-h-[440px]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-10 space-y-4">
                <div className="size-12 rounded-2xl bg-primary/30 grid place-items-center mx-auto">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <div className="font-display font-bold">Ask your advisor</div>
                  <p className="text-xs text-muted-foreground">Try one of these.</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="px-3 py-1.5 rounded-full bg-white border border-border text-xs font-semibold hover:bg-primary/30 text-left">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-cream border border-border rounded-tl-sm"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-sm text-muted-foreground px-2 animate-pulse">Advisor is thinking…</div>
            )}
            {error && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
                <div className="flex min-w-0 items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <button type="button" onClick={retry} disabled={loading} className="inline-flex shrink-0 items-center gap-1.5 font-bold hover:underline disabled:opacity-50">
                  <RotateCcw className="size-3.5" /> Retry
                </button>
              </div>
            )}
            <div ref={bottom} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-border bg-white/95 p-3 flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Tell the advisor about your profile, target country, or question…"
              rows={1}
              className="flex-1 bg-cream rounded-2xl px-4 py-2.5 outline-none text-sm resize-none max-h-32"
            />
            <button disabled={loading || !input.trim()} className="size-10 rounded-full bg-primary grid place-items-center disabled:opacity-40 shrink-0" aria-label="Send">
              <Send className="size-4" />
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
