import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";

import { useProfile } from "@/lib/useProfile";
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

  const recentNotesQ = useQuery({
    queryKey: ["notes", "recent"],
    queryFn: async () => {
      const { data } = await supabase.from("notes").select("id,title,updated_at").order("updated_at",{ascending:false}).limit(3);
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
      <div className="space-y-8 max-w-6xl animate-fade-up">
        {/* Minimalist welcome */}
        <section className="bg-white/85 backdrop-blur rounded-[2rem] border border-border p-6 lg:p-10 shadow-soft">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold mt-2 tracking-tight">
            {greeting()}, {profile?.display_name ?? "friend"}.
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            {todayMin >= dailyTarget
              ? "You've already hit today's goal. Anything more is bonus."
              : `${dailyTarget - todayMin} minutes to today's goal. One small session at a time.`}
          </p>
          <div className="mt-6 grid sm:grid-cols-[1fr_auto] items-end gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Today's focus</div>
              <div className="h-2 mt-1.5 bg-secondary rounded-full overflow-hidden max-w-md">
                <div className="h-full bg-primary transition-all" style={{ width: `${dailyPct}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">{todayMin} / {dailyTarget} min</div>
            </div>
            <Link to="/focus" className="inline-flex items-center gap-2 bg-foreground text-background rounded-full px-5 py-2.5 text-sm font-bold w-fit">
              Start a session <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={Flame} label="Streak" value={`${profile?.current_streak ?? 0}d`} />
          <Stat icon={Star} label="Level" value={profile?.level ?? 1} />
          <Stat icon={Coins} label="Coins" value={profile?.coins ?? 0} />
          <Stat icon={Clock} label="This week" value={`${Math.round(weekTotal / 60 * 10) / 10}h`} />
        </section>

        <section className="grid lg:grid-cols-[1.3fr_1fr] gap-5">
          <Card title="Upcoming tasks" action={<Link to="/tasks" className="text-xs font-bold text-primary">Open planner →</Link>}>
            {tasksQ.isLoading ? (
              <Skeleton rows={3} />
            ) : tasksQ.data && tasksQ.data.length > 0 ? (
              <ul className="space-y-2">
                {tasksQ.data.slice(0, 6).map((t) => (
                  <li key={t.id} className="flex items-center gap-3 p-3 rounded-2xl bg-cream/70">
                    <span className={`size-5 rounded-full border-2 ${t.completed ? "bg-primary border-primary" : "border-foreground/30"}`} />
                    <span className={`flex-1 text-sm font-semibold ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.category}</span>
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
                  <div className="w-full bg-secondary rounded-xl overflow-hidden flex items-end h-24">
                    <div className="w-full bg-primary rounded-xl transition-all" style={{ height: `${(d.minutes / maxMin) * 100}%` }} />
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground">{d.label}</div>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-3">Total: {weekTotal} min · last 7 days</div>
          </Card>
        </section>

        <section className="grid lg:grid-cols-2 gap-5">
          <Card title="Upcoming deadlines" action={<Link to="/applications" className="text-xs font-bold text-primary">All →</Link>}>
            {deadlinesQ.data && deadlinesQ.data.length > 0 ? (
              <ul className="space-y-2">
                {deadlinesQ.data.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 p-3 rounded-2xl bg-cream/70">
                    <CalendarClock className="size-4 text-primary" />
                    <span className="flex-1 text-sm font-semibold truncate">{d.name}</span>
                    <span className="text-[11px] text-muted-foreground">{d.deadline && new Date(d.deadline).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyHint to="/universities" label="Track a university" desc="No deadlines saved yet." />
            )}
          </Card>

          <Card title="Continue learning" action={<Link to="/notes" className="text-xs font-bold text-primary">Notes →</Link>}>
            {recentNotesQ.data && recentNotesQ.data.length > 0 ? (
              <ul className="space-y-2">
                {recentNotesQ.data.map((n) => (
                  <li key={n.id} className="p-3 rounded-2xl bg-cream/70">
                    <div className="text-sm font-semibold truncate">{n.title || "Untitled note"}</div>
                    <div className="text-[11px] text-muted-foreground">{new Date(n.updated_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyHint to="/notes" label="Open notes" desc="Pick up where you left off." />
            )}
          </Card>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction to="/focus" icon={Timer} title="Focus session" />
          <QuickAction to="/tutor" icon={Sparkles} title="Ask AI Tutor" />
          <QuickAction to="/japanese" icon={Languages} title="Japanese practice" />
          <QuickAction to="/tasks" icon={ListTodo} title="Plan tomorrow" />
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white/85 backdrop-blur rounded-3xl border border-border p-4 flex items-center gap-3">
      <div className="size-10 rounded-2xl bg-secondary grid place-items-center"><Icon className="size-5" /></div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-display text-xl font-bold">{value}</div>
      </div>
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white/85 backdrop-blur rounded-[2rem] border border-border p-5 lg:p-6 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Skeleton({ rows = 3 }) {
  return <div className="space-y-2">{Array.from({ length: rows }).map((_, i) => <div key={i} className="h-10 bg-cream rounded-2xl animate-pulse" />)}</div>;
}

function EmptyHint({ to, label, desc }: { to: string; label: string; desc: string }) {
  return (
    <div className="text-center py-6 text-sm text-muted-foreground">
      {desc}
      <div className="mt-3"><Link to={to} className="inline-block px-4 py-2 rounded-full bg-primary font-bold text-foreground">{label}</Link></div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, title }: { to: string; icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <Link to={to} className="bg-white/85 backdrop-blur rounded-3xl border border-border p-5 flex items-center gap-3 hover:shadow-pop hover:-translate-y-0.5 transition-all">
      <div className="size-10 rounded-2xl bg-secondary grid place-items-center"><Icon className="size-5" /></div>
      <span className="text-sm font-bold">{title}</span>
    </Link>
  );
}
