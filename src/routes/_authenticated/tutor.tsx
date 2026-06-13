import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { tutorChat } from "@/lib/tutor.functions";
import { AppShell } from "@/components/AppShell";
import { Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tutor")({
  component: TutorPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function TutorPage() {
  
  const chat = useServerFn(tutorChat);
  const [mode, setMode] = useState<"general" | "japanese">("general");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function send(prompt?: string) {
    const text = (prompt ?? input).trim();
    if (!text || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await chat({ data: { messages: next, mode } });
      setMessages([...next, { role: "assistant", content: res.content }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tutor unavailable");
      setMessages(next);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = mode === "japanese"
    ? ["Teach me ~te form with 3 examples", "Quiz me on JLPT N5 vocabulary", "Translate: I will study tomorrow"]
    : ["Explain photosynthesis like I'm 12", "Make 5 flashcards on the French Revolution", "Plan a 2-week study schedule for finals"];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2"><Sparkles className="size-6 text-primary" />AI Tutor</h1>
            <p className="text-sm text-muted-foreground">Mochi-sensei is here to help.</p>
          </div>
          <div className="flex gap-1 bg-white p-1 rounded-full border border-border">
            <button onClick={() => setMode("general")} className={`px-3 py-1.5 rounded-full text-xs font-bold ${mode === "general" ? "bg-primary" : "text-muted-foreground"}`}>General</button>
            <button onClick={() => setMode("japanese")} className={`px-3 py-1.5 rounded-full text-xs font-bold ${mode === "japanese" ? "bg-primary" : "text-muted-foreground"}`}>Japanese</button>
          </div>
        </div>

        <div className="flex-1 bg-white border border-border rounded-3xl p-4 overflow-y-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <div className="size-24 rounded-[2rem] bg-gradient-to-br from-lavender to-primary grid place-items-center text-5xl mx-auto">✨</div>
              <p className="text-muted-foreground text-sm mt-3">Ask anything — homework, plans, languages…</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="px-3 py-2 rounded-full bg-cream text-xs font-semibold hover:bg-secondary">{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && <div className="size-8 shrink-0 bg-lavender rounded-xl grid place-items-center text-sm">✨</div>}
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary rounded-tr-none" : "bg-cream rounded-tl-none"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="size-8 bg-lavender rounded-xl grid place-items-center text-sm">✨</div>
              <div className="bg-cream p-3 rounded-2xl text-sm flex gap-1">
                <span className="animate-pulse">•</span><span className="animate-pulse [animation-delay:120ms]">•</span><span className="animate-pulse [animation-delay:240ms]">•</span>
              </div>
            </div>
          )}
          <div ref={bottom} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex gap-2 bg-white border border-border rounded-full p-2 shadow-soft">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "japanese" ? "聞いてみよう…" : "Ask anything…"}
            className="flex-1 bg-transparent px-3 outline-none" />
          <button disabled={loading || !input.trim()} className="size-10 rounded-full bg-primary grid place-items-center disabled:opacity-40">
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
