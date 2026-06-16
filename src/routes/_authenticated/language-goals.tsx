import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { loadGoals, saveGoals, loadLog, logProgress, type LanguageGoals, type GoalLog } from "@/lib/language-goals";
import { Target, Flame, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/language-goals")({
  component: LanguageGoalTracker,
});

function LanguageGoalTracker() {
  const [goals, setGoals] = useState<LanguageGoals>({ dailyWords: 10, dailyMinutes: 20, weeklySessions: 5 });
  const [log, setLog] = useState<GoalLog[]>([]);
  const [words, setWords] = useState(5);
  const [minutes, setMinutes] = useState(15);

  useEffect(() => { setGoals(loadGoals()); setLog(loadLog()); }, []);
  function patch(p: Partial<LanguageGoals>) { const g = { ...goals, ...p }; setGoals(g); saveGoals(g); }
  function add() { setLog(logProgress(words, minutes)); }

  const today = new Date().toISOString().slice(0, 10);
  const todayEntry = log.find(e => e.date === today);
  const wordsToday = todayEntry?.words ?? 0;
  const minutesToday = todayEntry?.minutes ?? 0;
  const week = log.slice(0, 7);
  const weekSessions = week.filter(e => e.session).length;
  const streak = computeStreak(log);

  return (
    <AppShell>
      <div className="space-y-5 max-w-4xl">
        <header>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2"><Target className="size-7" /> Language Goal Tracker</h1>
          <p className="text-sm text-muted-foreground">Tiny daily goals that compound. Track words learned, study minutes, and study sessions.</p>
        </header>

        <div className="grid sm:grid-cols-3 gap-3">
          <RingStat label="Words today" current={wordsToday} goal={goals.dailyWords} />
          <RingStat label="Minutes today" current={minutesToday} goal={goals.dailyMinutes} />
          <RingStat label="Sessions this week" current={weekSessions} goal={goals.weeklySessions} />
        </div>

        <div className="rounded-3xl bg-white border border-border p-5 shadow-soft">
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3 flex items-center gap-1"><Flame className="size-3" /> Current streak: <span className="text-foreground">{streak} {streak === 1 ? "day" : "days"}</span></div>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 30 }).map((_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (29 - i));
              const date = d.toISOString().slice(0, 10);
              const e = log.find(x => x.date === date);
              const intensity = e ? Math.min(1, e.words / goals.dailyWords) : 0;
              return <div key={date} title={`${date} · ${e?.words ?? 0} words`} className="aspect-square rounded-md" style={{ background: intensity > 0 ? `hsl(var(--primary) / ${0.3 + intensity * 0.7})` : "hsl(var(--secondary))" }} />;
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white border border-border p-5 shadow-soft space-y-3">
            <div className="text-sm font-bold flex items-center gap-1"><Plus className="size-4" /> Log progress</div>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Words learned" value={words} onChange={setWords} />
              <NumberField label="Study minutes" value={minutes} onChange={setMinutes} />
            </div>
            <button onClick={add} className="rounded-full bg-primary px-5 py-2 text-sm font-bold">Add to today</button>
          </div>
          <div className="rounded-3xl bg-white border border-border p-5 shadow-soft space-y-3">
            <div className="text-sm font-bold">Adjust goals</div>
            <NumberField label="Daily words" value={goals.dailyWords} onChange={(v) => patch({ dailyWords: v })} />
            <NumberField label="Daily minutes" value={goals.dailyMinutes} onChange={(v) => patch({ dailyMinutes: v })} />
            <NumberField label="Weekly sessions" value={goals.weeklySessions} onChange={(v) => patch({ weeklySessions: v })} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function computeStreak(log: GoalLog[]) {
  const set = new Set(log.filter(e => e.session).map(e => e.date));
  let s = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (set.has(d.toISOString().slice(0, 10))) s++; else break;
  }
  return s;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{label}</div>
      <input type="number" min={0} value={value} onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="w-full border border-border rounded-2xl px-3 py-2 text-sm bg-white" />
    </label>
  );
}

function RingStat({ label, current, goal }: { label: string; current: number; goal: number }) {
  const pct = Math.max(0, Math.min(1, goal === 0 ? 0 : current / goal));
  const r = 36; const c = 2 * Math.PI * r;
  return (
    <div className="rounded-3xl bg-white border border-border p-5 shadow-soft flex items-center gap-4">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} stroke="hsl(var(--secondary))" strokeWidth="8" fill="none" />
        <circle cx="45" cy="45" r={r} stroke="hsl(var(--primary))" strokeWidth="8" fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" transform="rotate(-90 45 45)" />
        <text x="45" y="50" textAnchor="middle" className="font-display font-bold" fontSize="18">{Math.round(pct * 100)}%</text>
      </svg>
      <div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{label}</div>
        <div className="font-display text-xl font-bold">{current} <span className="text-muted-foreground text-sm">/ {goal}</span></div>
      </div>
    </div>
  );
}
