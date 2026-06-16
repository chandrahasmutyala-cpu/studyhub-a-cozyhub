import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { tutorChat } from "@/lib/tutor.functions";
import { AppShell } from "@/components/AppShell";
import { Send, GraduationCap, Award, ExternalLink, Building2, FileText, Wallet, Lightbulb, BookMarked, Compass } from "lucide-react";
import { toast } from "sonner";
import { JAPAN_UNIS, JAPAN_SCHOLARSHIPS, ADMISSION_REQS, COST_ESTIMATE, OFFICIAL_RESOURCES } from "@/lib/japan-resources";

export const Route = createFileRoute("/_authenticated/tutor")({
  component: TutorPage,
});

type Tab = "general" | "japanese" | "chinese" | "korean" | "universities" | "scholarships";
type Msg = { role: "user" | "assistant"; content: string };

function TutorPage() {
  const [tab, setTab] = useState<Tab>("general");

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-5">
        <header>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">StudyHub</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1">AI Tutor</h1>
          <p className="text-sm text-muted-foreground max-w-2xl mt-1">
            Your personal guide for Japanese universities, scholarships, admissions, careers and language learning.
          </p>
        </header>

        <div className="flex gap-1 bg-white/70 backdrop-blur p-1 rounded-full border border-border w-fit overflow-x-auto">
          {([
            { id: "general", label: "General AI" },
            { id: "japanese", label: "Japanese 日本語" },
            { id: "chinese", label: "Chinese 中文" },
            { id: "korean", label: "Korean 한국어" },
            { id: "universities", label: "Universities" },
            { id: "scholarships", label: "Scholarships" },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${tab === t.id ? "bg-primary" : "text-muted-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {(tab === "general" || tab === "japanese" || tab === "chinese" || tab === "korean") && (
          <ChatPanel mode={tab} key={tab} />
        )}

        {tab === "universities" && <UniversitiesPanel />}
        {tab === "scholarships" && <ScholarshipsPanel />}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdmissionsCard />
          <CostCard />
          <RecommendationsCard />
        </div>

        <ResourcesCard />
      </div>
    </AppShell>
  );
}

function GlassCard({ title, icon: Icon, children, accent }: { title: string; icon: typeof GraduationCap; children: React.ReactNode; accent?: string }) {
  return (
    <section className={`rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-xl p-5 shadow-soft ${accent ?? ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="size-9 rounded-2xl bg-primary/40 grid place-items-center"><Icon className="size-4" /></div>
        <h2 className="font-display text-base font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

type ChatMode = "general" | "japanese" | "chinese" | "korean";
function ChatPanel({ mode }: { mode: ChatMode }) {
  const chat = useServerFn(tutorChat);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { inputRef.current?.focus(); }, [loading]);

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
    } finally { setLoading(false); }
  }

  const suggestionMap: Record<ChatMode, string[]> = {
    japanese: ["Teach me ~te form with 3 examples", "Quiz me on JLPT N5 vocabulary", "Translate: I will study tomorrow"],
    chinese: ["Teach me the 了 particle with 3 examples", "Quiz me on HSK 2 vocabulary", "Translate: I will study tomorrow"],
    korean: ["Teach me 은/는 vs 이/가", "Quiz me on TOPIK I vocabulary", "Translate: I will study tomorrow"],
    general: ["Help me plan my Japan study application", "Suggest a 30-day study schedule", "What documents do I need for MEXT?"],
  };
  const titleMap: Record<ChatMode, string> = {
    japanese: "Japanese Study Chat 日本語",
    chinese: "Chinese Study Chat 中文",
    korean: "Korean Study Chat 한국어",
    general: "Ask anything",
  };
  const placeholderMap: Record<ChatMode, string> = {
    japanese: "聞いてみよう…",
    chinese: "问问看…",
    korean: "물어보세요…",
    general: "Ask anything…",
  };
  const suggestions = suggestionMap[mode];

  return (
    <GlassCard title={titleMap[mode]} icon={Lightbulb}>
      <div className="bg-cream/60 rounded-2xl p-3 h-[380px] overflow-y-auto space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Try one of these prompts</p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="px-3 py-1.5 rounded-full bg-white border border-border text-xs font-semibold hover:bg-primary">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-white border border-border rounded-tl-sm"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-1 text-muted-foreground text-sm px-2">
            <span className="animate-pulse">Thinking</span>
            <span className="animate-pulse [animation-delay:120ms]">.</span>
            <span className="animate-pulse [animation-delay:240ms]">.</span>
            <span className="animate-pulse [animation-delay:360ms]">.</span>
          </div>
        )}
        <div ref={bottom} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex gap-2 bg-white border border-border rounded-full p-1.5 shadow-soft">
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={placeholderMap[mode]}
          className="flex-1 bg-transparent px-3 outline-none text-sm" />
        <button disabled={loading || !input.trim()} className="size-9 rounded-full bg-primary grid place-items-center disabled:opacity-40">
          <Send className="size-4" />
        </button>
      </form>
    </GlassCard>
  );
}

function UniversitiesPanel() {
  return (
    <GlassCard title="Japan University Explorer" icon={Building2}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {JAPAN_UNIS.map((u) => (
          <div key={u.name} className="bg-white border border-border rounded-2xl p-4 flex flex-col gap-1.5">
            <div className="font-display font-bold">{u.name}</div>
            <div className="text-[11px] text-muted-foreground">{u.location}</div>
            <div className="text-xs"><strong>Tuition:</strong> ¥{u.tuitionJpy}</div>
            <div className="text-xs"><strong>Apply:</strong> {u.applicationPeriod}</div>
            <div className="text-xs flex gap-1.5 flex-wrap mt-1">
              {u.englishPrograms && <span className="bg-matcha-soft rounded-full px-2 py-0.5">English programs</span>}
              <span className={`rounded-full px-2 py-0.5 ${u.entranceExam ? "bg-honey/60" : "bg-lavender-soft"}`}>
                {u.entranceExam ? "Entrance exam" : "No entrance exam"}
              </span>
            </div>
            <a href={u.website} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 self-start font-bold text-xs bg-primary rounded-full px-3 py-1.5">
              Official website <ExternalLink className="size-3" />
            </a>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs">
        <Link to="/universities" className="font-bold underline">Full directory →</Link>
      </div>
    </GlassCard>
  );
}

function ScholarshipsPanel() {
  return (
    <GlassCard title="Scholarship Finder" icon={Award}>
      <div className="grid sm:grid-cols-2 gap-3">
        {JAPAN_SCHOLARSHIPS.map((s) => (
          <div key={s.name} className="bg-white border border-border rounded-2xl p-4 flex flex-col gap-1.5">
            <div className="font-display font-bold">{s.name}</div>
            <div className="text-xs"><strong>Coverage:</strong> {s.coverage}</div>
            <div className="text-xs"><strong>Stipend:</strong> ¥{s.monthlyStipendJpy} / month</div>
            <div className="text-xs"><strong>Deadline:</strong> {s.deadline}</div>
            <div className="text-xs text-muted-foreground"><strong className="text-foreground">Eligibility:</strong> {s.eligibility}</div>
            <a href={s.website} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 self-start font-bold text-xs bg-primary rounded-full px-3 py-1.5">
              Official website <ExternalLink className="size-3" />
            </a>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs">
        <Link to="/scholarships" className="font-bold underline">Saved scholarships →</Link>
      </div>
    </GlassCard>
  );
}

function AdmissionsCard() {
  return (
    <GlassCard title="Admission Requirements" icon={FileText}>
      <ul className="space-y-2 text-sm">
        {ADMISSION_REQS.map((r) => (
          <li key={r.label} className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{r.label}</span>
            <span>{r.value}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

function CostCard() {
  const total = COST_ESTIMATE.reduce((s, c) => s + c.jpy, 0);
  return (
    <GlassCard title="Cost Calculator (yearly, JPY)" icon={Wallet}>
      <ul className="space-y-1.5 text-sm">
        {COST_ESTIMATE.map((c) => (
          <li key={c.label} className="flex items-center justify-between">
            <span className="text-muted-foreground">{c.label}</span>
            <span className="font-bold">¥{c.jpy.toLocaleString()}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider">Total / year</span>
        <span className="font-display text-lg font-bold">¥{total.toLocaleString()}</span>
      </div>
    </GlassCard>
  );
}

function RecommendationsCard() {
  const chat = useServerFn(tutorChat);
  const [grades, setGrades] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  async function recommend() {
    if (!grades.trim()) { toast.error("Tell me your grades / background first"); return; }
    setLoading(true);
    try {
      const res = await chat({ data: {
        mode: "general",
        messages: [{ role: "user", content: `I'm an international student considering universities in Japan. My background: ${grades}.\n\nRecommend: (1) 3 fitting Japanese universities with reasoning, (2) 2 scholarships I could realistically apply for, (3) my admission chances (low/medium/high) for each, (4) a 30-day suggested study plan. Be concrete and concise.` }],
      }});
      setOut(res.content);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate recommendations");
    } finally { setLoading(false); }
  }

  return (
    <GlassCard title="AI Recommendations" icon={Compass}>
      <textarea value={grades} onChange={(e) => setGrades(e.target.value)}
        placeholder="e.g. GPA 3.6, IELTS 7.0, JLPT N3, want Engineering, budget ¥1M/yr"
        className="w-full bg-white border border-border rounded-2xl p-3 text-sm outline-none min-h-[80px]" />
      <button onClick={recommend} disabled={loading}
        className="mt-2 bg-primary rounded-full px-4 py-2 font-bold text-sm disabled:opacity-40">
        {loading ? "Thinking…" : "Get recommendations"}
      </button>
      {out && <div className="mt-3 text-sm whitespace-pre-wrap bg-white/70 rounded-2xl p-3 border border-border">{out}</div>}
    </GlassCard>
  );
}

function ResourcesCard() {
  return (
    <GlassCard title="Official Resources" icon={BookMarked}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {OFFICIAL_RESOURCES.map((r) => (
          <a key={r.url} href={r.url} target="_blank" rel="noreferrer"
            className="bg-white border border-border rounded-2xl px-3 py-2.5 text-sm font-semibold flex items-center justify-between hover:bg-primary/30">
            <span>{r.title}</span>
            <ExternalLink className="size-3.5 text-muted-foreground" />
          </a>
        ))}
      </div>
    </GlassCard>
  );
}
