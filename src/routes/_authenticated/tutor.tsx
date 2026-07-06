import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { tutorChat } from "@/lib/tutor.functions";
import { learningDnaAdvice, generateSemesterPlan } from "@/lib/learning-dna.functions";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Send, Sparkles, Trash2, Dna, CalendarRange, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tutor")({
  component: TutorPage,
});

type Msg = { role: "user" | "assistant"; content: string };
type Tab = "chat" | "dna" | "planner";
const STORAGE_KEY = "studyhub.tutor.history";

const SUGGESTIONS = [
  "Teach me the Japanese ~te form with 3 examples",
  "Quiz me on HSK 2 vocabulary",
  "Explain Korean 은/는 vs 이/가",
  "Help me plan a MEXT scholarship application",
  "Recommend universities in Japan for JLPT N3",
  "Write me a 30-day TOPIK II study plan",
];

function TutorPage() {
  const [tab, setTab] = useState<Tab>("chat");
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-4">
        <header>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">StudyHub</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1">AI Tutor</h1>
        </header>

        <div className="inline-flex gap-1 bg-card border border-border/60 p-1 rounded-full overflow-x-auto">
          {([
            { id: "chat" as Tab, label: "Chat", icon: Sparkles },
            { id: "dna" as Tab, label: "Learning DNA", icon: Dna },
            { id: "planner" as Tab, label: "Semester Planner", icon: CalendarRange },
          ]).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="size-3.5 stroke-[1.75]" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "chat" && <ChatTab />}
        {tab === "dna" && <LearningDnaTab />}
        {tab === "planner" && <SemesterPlannerTab />}
      </div>
    </AppShell>
  );
}

function ChatTab() {
  const chat = useServerFn(tutorChat);
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window === "undefined") return [];
    try { const raw = window.localStorage.getItem(STORAGE_KEY); return raw ? (JSON.parse(raw) as Msg[]) : []; } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40))); } catch { /* quota */ } }, [messages]);

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

  function clearChat() { setMessages([]); try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* */ } }

  return (
    <section className="rounded-[2rem] border border-border/60 bg-card overflow-hidden flex flex-col h-[68vh] min-h-[440px]">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-10 space-y-4">
            <div className="size-12 rounded-2xl bg-primary/20 grid place-items-center mx-auto"><Sparkles className="size-5" /></div>
            <div>
              <div className="font-display font-bold">Ask StudyHub anything</div>
              <p className="text-xs text-muted-foreground">Try one of these to get started.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="px-3 py-1.5 rounded-full bg-background border border-border text-xs font-semibold hover:bg-primary/15">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
              m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-background border border-border rounded-tl-sm"
            }`}>{m.content}</div>
          </div>
        ))}
        {loading && <div className="text-muted-foreground text-sm px-2 animate-pulse">StudyHub is thinking…</div>}
        <div ref={bottom} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-border bg-background/95 p-3 flex gap-2 items-end">
        <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask anything…" rows={1}
          className="flex-1 bg-muted rounded-2xl px-4 py-2.5 outline-none text-sm resize-none max-h-32" />
        {messages.length > 0 && (
          <button type="button" onClick={clearChat} className="size-10 rounded-full bg-muted grid place-items-center" aria-label="Clear"><Trash2 className="size-4" /></button>
        )}
        <button disabled={loading || !input.trim()} className="size-10 rounded-full bg-primary grid place-items-center disabled:opacity-40 shrink-0" aria-label="Send">
          <Send className="size-4" />
        </button>
      </form>
    </section>
  );
}

function LearningDnaTab() {
  const { profile } = useProfile();
  const advice = useServerFn(learningDnaAdvice);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  const weeklyQ = useQuery({
    queryKey: ["focus", "week"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { minutes: 0, lessons: 0 };
      const since = new Date(); since.setDate(since.getDate() - 7);
      const [fs, lp] = await Promise.all([
        supabase.from("focus_sessions").select("minutes,created_at").eq("user_id", user.id).gte("created_at", since.toISOString()),
        supabase.from("lesson_progress").select("id").eq("user_id", user.id).not("completed_at", "is", null),
      ]);
      const minutes = (fs.data ?? []).reduce((a, r) => a + (r.minutes ?? 0), 0);
      return { minutes, lessons: lp.data?.length ?? 0 };
    },
  });

  const memory = Math.min(100, Math.round(((profile?.total_minutes ?? 0) / 12) + (weeklyQ.data?.lessons ?? 0) * 3));
  const focusScore = Math.min(100, Math.round(((weeklyQ.data?.minutes ?? 0) / 7) * 1.2));
  const vocab = Math.min(100, Math.round((weeklyQ.data?.lessons ?? 0) * 4 + (profile?.xp ?? 0) / 50));
  const grammar = Math.min(100, Math.round((weeklyQ.data?.lessons ?? 0) * 3 + (profile?.current_streak ?? 0) * 2));
  const recommendedMinutes = profile?.daily_minutes_target ?? Math.max(20, Math.min(90, Math.round(focusScore * 0.9)));

  async function ask() {
    setLoading(true);
    try {
      const res = await advice({ data: { stats: {
        xp: profile?.xp ?? 0,
        streak: profile?.current_streak ?? 0,
        total_minutes: profile?.total_minutes ?? 0,
        japanese_level: profile?.japanese_level ?? null,
        weekly_minutes: weeklyQ.data?.minutes ?? 0,
        lessons_completed: weeklyQ.data?.lessons ?? 0,
      } } });
      setAiText(res.content);
    } catch (e) { toast.error(e instanceof Error ? e.message : "AI unavailable"); }
    finally { setLoading(false); }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-border/60 bg-card p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground mb-1">My Learning DNA</div>
        <div className="font-display text-2xl font-bold">Built from your real activity.</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <DnaScore label="Memory" value={memory} />
        <DnaScore label="Focus" value={focusScore} />
        <DnaScore label="Vocab" value={vocab} />
        <DnaScore label="Grammar" value={grammar} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <MiniStat label="This week" value={`${weeklyQ.data?.minutes ?? 0} min`} />
        <MiniStat label="Lessons completed" value={`${weeklyQ.data?.lessons ?? 0}`} />
        <MiniStat label="Streak" value={`${profile?.current_streak ?? 0} days`} />
        <MiniStat label="Recommended daily focus" value={`${recommendedMinutes} min`} />
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="font-display font-bold">Personalized AI advice</div>
          <button onClick={ask} disabled={loading} className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-bold disabled:opacity-40">
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5 stroke-[1.75]" />} Generate
          </button>
        </div>
        {aiText ? <div className="text-sm whitespace-pre-wrap leading-relaxed">{aiText}</div> : (
          <p className="text-xs text-muted-foreground">Uses your XP, streak, focus minutes and lesson history to suggest next steps.</p>
        )}
      </div>
    </section>
  );
}

function DnaScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-3xl font-bold mt-1">{value}</div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
        <div className="h-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 flex items-center justify-between">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

function SemesterPlannerTab() {
  const gen = useServerFn(generateSemesterPlan);
  const today = new Date().toISOString().slice(0, 10);
  const end = new Date(); end.setMonth(end.getMonth() + 4);
  const [startDate, setStart] = useState(today);
  const [endDate, setEnd] = useState(end.toISOString().slice(0, 10));
  const [exams, setExams] = useState("");
  const [assignments, setAssignments] = useState("");
  const [projects, setProjects] = useState("");
  const [holidays, setHolidays] = useState("");
  const [focusHours, setFocusHours] = useState(3);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const plansQ = useQuery({
    queryKey: ["semester_plans"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("semester_plans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setOutput("");
    try {
      const res = await gen({ data: { startDate, endDate, exams, assignments, projects, holidays, focusHours } });
      setOutput(res.content);
      plansQ.refetch();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Planner failed"); }
    finally { setLoading(false); }
  }

  return (
    <section className="space-y-5">
      <form onSubmit={submit} className="rounded-3xl border border-border/60 bg-card p-5 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Semester start"><input type="date" value={startDate} onChange={(e) => setStart(e.target.value)} className="w-full bg-muted rounded-xl px-3 py-2 text-sm" /></Field>
          <Field label="Semester end"><input type="date" value={endDate} onChange={(e) => setEnd(e.target.value)} className="w-full bg-muted rounded-xl px-3 py-2 text-sm" /></Field>
        </div>
        <Field label="Exams (e.g. Calc 2 · Dec 15, JLPT N4 · Jan 12)"><textarea value={exams} onChange={(e) => setExams(e.target.value)} rows={2} className="w-full bg-muted rounded-xl px-3 py-2 text-sm" /></Field>
        <Field label="Assignments"><textarea value={assignments} onChange={(e) => setAssignments(e.target.value)} rows={2} className="w-full bg-muted rounded-xl px-3 py-2 text-sm" /></Field>
        <Field label="Projects"><textarea value={projects} onChange={(e) => setProjects(e.target.value)} rows={2} className="w-full bg-muted rounded-xl px-3 py-2 text-sm" /></Field>
        <Field label="Holidays / breaks"><textarea value={holidays} onChange={(e) => setHolidays(e.target.value)} rows={1} className="w-full bg-muted rounded-xl px-3 py-2 text-sm" /></Field>
        <Field label={`Daily focus hours: ${focusHours}`}>
          <input type="range" min={0.5} max={8} step={0.5} value={focusHours} onChange={(e) => setFocusHours(parseFloat(e.target.value))} className="w-full accent-primary" />
        </Field>
        <button disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold disabled:opacity-40">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 stroke-[1.75]" />} Generate plan
        </button>
      </form>

      {output && (
        <div className="rounded-3xl border border-border/60 bg-card p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Your plan</div>
          <div className="text-sm whitespace-pre-wrap leading-relaxed">{output}</div>
        </div>
      )}

      {plansQ.data && plansQ.data.length > 0 && (
        <div className="rounded-3xl border border-border/60 bg-card p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Saved plans</div>
          <ul className="space-y-2 text-sm">
            {plansQ.data.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{p.start_date} → {p.end_date}</span>
                <span>{new Date(p.created_at as string).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  );
}

// tiny useMemo shim to silence unused-import warnings on some editors
export const __keepMemo = useMemo;
