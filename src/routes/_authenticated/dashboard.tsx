import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";

import { useProfile, levelFromXp } from "@/lib/useProfile";
import { focusTimer, useFocusTimer, useTick, formatMs } from "@/lib/focus-timer";
import { Flame, Star, Coins, Clock, Sparkles, Timer, ListTodo, Languages, ArrowRight, CalendarClock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function todayISO() { return new Date().toISOString().slice(0, 10); }
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Mirrors the persistent global focus timer on the home screen. */
function LiveFocus() {
  const t = useFocusTimer();
  useTick(1000, t.running);
  const left = focusTimer.remaining(Date.now(), t);
  return (
    <div className="shrink-0 flex items-center gap-3">
      {t.running && (
        <span className="font-display text-xl font-bold tabular-nums text-primary">{formatMs(left)}</span>
      )}
      <Link to="/tasks" className="inline-flex items-center gap-2 bg-foreground text-background rounded-full px-5 py-3 text-sm font-bold hover:opacity-90 active:scale-[0.98] transition">
        {t.running ? "Open timer" : "Start session"} <ArrowRight className="size-4 stroke-[1.75]" />
      </Link>
    </div>
  );
}

function Dashboard() {
  const { profile, isLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarded) navigate({ to: "/onboarding" });
  }, [profile, isLoading, navigate]);

  const tasksQ = useQuery({
    queryKey: ["tasks", "today"],
    queryFn: async () => {
      const today = todayISO();
      const { data } = await supabase.from("tasks").select("*").or(`due_date.is.null,due_date.eq.${today}`).order("completed").order("created_at");
      return data ?? [];
    },
  });

  const deadlinesQ = useQuery({
    queryKey: ["deadlines", "upcoming"],
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("id,name,deadline,kind").not("deadline","is",null).order("deadline").limit(5);
      return data ?? [];
    },
  });

  const focusQ = useQuery({
    queryKey: ["focus", "week"],
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 6);
      const { data } = await supabase.from("focus_sessions").select("minutes,completed_at").gte("completed_at", since.toISOString());
      return data ?? [];
    },
  });


  const weekly = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString(undefined, { weekday: "short" }), minutes: 0 };
    });
    for (const s of focusQ.data ?? []) {
      const k = (s.completed_at as string).slice(0, 10);
      const day = days.find((d) => d.key === k);
      if (day) day.minutes += s.minutes;
    }
    return days;
  }, [focusQ.data]);

  const maxMin = Math.max(60, ...weekly.map((d) => d.minutes));
  const weekTotal = weekly.reduce((a, b) => a + b.minutes, 0);
  const dailyTarget = profile?.daily_minutes_target ?? 60;
  const todayMin = weekly[weekly.length - 1]?.minutes ?? 0;
  const dailyPct = Math.min(100, (todayMin / dailyTarget) * 100);

  return (
    <AppShell>
      <div className="space-y-10 max-w-5xl mx-auto animate-fade-up">
        {/* Hero */}
        <section>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mt-3 tracking-tight leading-[1.05]">
            {greeting()},<br />
            <span className="text-primary">{profile?.display_name ?? "friend"}.</span>
          </h1>
          <p className="text-base text-muted-foreground mt-4 max-w-lg">
            {todayMin >= dailyTarget
              ? "You've already hit today's goal. Anything more is bonus."
              : `${dailyTarget - todayMin} minutes to today's goal. One small session at a time.`}
          </p>

          <div className="mt-8 rounded-3xl border border-border/60 bg-card p-6 md:p-7 shadow-[0_1px_0_0_rgb(0_0_0/0.02),0_20px_45px_-30px_rgb(15_23_42/0.18)]">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Today's focus</div>
                <div className="font-display text-2xl font-bold mt-1">{todayMin}<span className="text-muted-foreground text-base font-medium"> / {dailyTarget} min</span></div>
              </div>
              <LiveFocus />
            </div>
            <div className="h-2 mt-5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${dailyPct}%` }} />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={Flame} label="Streak" value={`${profile?.current_streak ?? 0}d`} />
          <Stat icon={Star} label="Level" value={levelFromXp(profile?.xp ?? 0)} />
          <Stat icon={Coins} label="Coins" value={profile?.coins ?? 0} />
          <Stat icon={Clock} label="This week" value={`${Math.round(weekTotal / 60 * 10) / 10}h`} />
        </section>

        {/* Tasks + week */}
        <section className="grid lg:grid-cols-[1.3fr_1fr] gap-4">
          <Card title="Upcoming tasks" action={<Link to="/tasks" className="text-xs font-bold text-primary">Open planner →</Link>}>
            {tasksQ.isLoading ? (
              <Skeleton rows={3} />
            ) : tasksQ.data && tasksQ.data.length > 0 ? (
              <ul className="space-y-1.5">
                {tasksQ.data.slice(0, 6).map((t) => (
                  <li key={t.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/60 transition">
                    <span className={`size-5 rounded-full border-2 shrink-0 ${t.completed ? "bg-primary border-primary" : "border-foreground/25"}`} />
                    <span className={`flex-1 text-sm font-medium truncate ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">{t.category}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyHint to="/tasks" label="Add your first task" desc="Your planner is clear." />
            )}
          </Card>

          <Card title="This week">
            <div className="flex items-end gap-2 h-32">
              {weekly.map((d) => (
                <div key={d.key} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full bg-muted rounded-xl overflow-hidden flex items-end h-24">
                    <div className="w-full bg-primary rounded-xl transition-all" style={{ height: `${(d.minutes / maxMin) * 100}%` }} />
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground">{d.label}</div>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-3">Total: {weekTotal} min · last 7 days</div>
          </Card>
        </section>

        {/* Deadlines + continue */}
        <section className="grid lg:grid-cols-2 gap-4">
          <Card title="Upcoming deadlines" action={<Link to="/applications" className="text-xs font-bold text-primary">All →</Link>}>
            {deadlinesQ.data && deadlinesQ.data.length > 0 ? (
              <ul className="space-y-1.5">
                {deadlinesQ.data.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/60 transition">
                    <span className="size-9 rounded-2xl bg-muted grid place-items-center shrink-0">
                      <CalendarClock className="size-[18px] stroke-[1.75] text-foreground/70" />
                    </span>
                    <span className="flex-1 text-sm font-medium truncate">{d.name}</span>
                    <span className="text-[11px] text-muted-foreground shrink-0">{d.deadline && new Date(d.deadline).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyHint to="/universities" label="Track a university" desc="No deadlines saved yet." />
            )}
          </Card>

          <Card title="Keep the streak" action={<Link to="/learning-academy" className="text-xs font-bold text-primary">Academy →</Link>}>
            <div className="rounded-2xl bg-muted/60 p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Today's suggestion</div>
              <div className="font-display text-xl font-bold mt-1">A 25 min sage-quiet session.</div>
              <p className="text-xs text-muted-foreground mt-1.5">Short, doable, and enough to bank a win before the day gets loud.</p>
              <Link to="/tasks" className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-xs font-bold">
                Start focus <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </Card>
        </section>


        {/* Quick actions */}
        <section>
          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">Quick actions</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickAction to="/tasks" icon={Timer} title="Focus session" />
            <QuickAction to="/tutor" icon={Sparkles} title="Ask AI Tutor" />
            <QuickAction to="/japanese" icon={Languages} title="Japanese practice" />
            <QuickAction to="/tasks" icon={ListTodo} title="Plan tomorrow" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-4 flex items-center gap-3">
      <div className="size-10 rounded-2xl bg-muted grid place-items-center shrink-0">
        <Icon className="size-[18px] stroke-[1.75] text-foreground/75" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-display text-xl font-bold truncate">{value}</div>
      </div>
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-base font-bold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Skeleton({ rows = 3 }) {
  return <div className="space-y-2">{Array.from({ length: rows }).map((_, i) => <div key={i} className="h-11 bg-muted rounded-2xl animate-pulse" />)}</div>;
}

function EmptyHint({ to, label, desc }: { to: string; label: string; desc: string }) {
  return (
    <div className="text-center py-8 text-sm text-muted-foreground">
      {desc}
      <div className="mt-3">
        <Link to={to} className="inline-block px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-xs">{label}</Link>
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, title }: { to: string; icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <Link to={to} className="rounded-3xl border border-border/60 bg-card p-5 flex items-center gap-3 hover:border-primary/40 hover:-translate-y-0.5 transition-all">
      <div className="size-10 rounded-2xl bg-muted grid place-items-center shrink-0">
        <Icon className="size-[18px] stroke-[1.75] text-foreground/75" />
      </div>
      <span className="text-sm font-semibold truncate">{title}</span>
    </Link>
  );
}

