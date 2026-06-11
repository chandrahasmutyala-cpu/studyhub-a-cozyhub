import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { PetSprite } from "@/components/PetSprite";
import { useProfile } from "@/lib/useProfile";
import { Flame, Star, Coins, Clock, Sparkles, Timer, ListTodo, Languages } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function todayISO() { return new Date().toISOString().slice(0, 10); }

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
      <div className="space-y-6 max-w-6xl">
        {/* Greeting card */}
        <section className="bg-white rounded-[2rem] border border-border p-6 lg:p-8 shadow-soft flex flex-col sm:flex-row gap-6 items-center">
          <PetSprite petId={profile?.selected_pet} size={120} />
          <div className="flex-1 text-center sm:text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1">
              Hi {profile?.display_name ?? "friend"} 🌸
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {todayMin >= dailyTarget
                ? "You hit your daily goal — incredible work!"
                : `${dailyTarget - todayMin} min to today's goal. You've got this.`}
            </p>
            <div className="h-2 mt-3 bg-secondary rounded-full overflow-hidden max-w-sm mx-auto sm:mx-0">
              <div className="h-full bg-primary transition-all" style={{ width: `${dailyPct}%` }} />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={Flame} label="Streak" value={`${profile?.current_streak ?? 0}d`} tint="bg-peach-soft" />
          <Stat icon={Star} label="Level" value={profile?.level ?? 1} tint="bg-lavender-soft" />
          <Stat icon={Coins} label="Coins" value={profile?.coins ?? 0} tint="bg-honey/40" />
          <Stat icon={Clock} label="This week" value={`${Math.round(weekTotal / 60 * 10) / 10}h`} tint="bg-matcha-soft" />
        </section>

        {/* Today's tasks + Weekly chart */}
        <section className="grid lg:grid-cols-[1.3fr_1fr] gap-5">
          <Card title="Today's tasks" action={<Link to="/tasks" className="text-xs font-bold text-primary">Open planner →</Link>}>
            {tasksQ.isLoading ? (
              <Skeleton rows={3} />
            ) : tasksQ.data && tasksQ.data.length > 0 ? (
              <ul className="space-y-2">
                {tasksQ.data.slice(0, 6).map((t) => (
                  <li key={t.id} className="flex items-center gap-3 p-3 rounded-2xl bg-cream">
                    <span className={`size-5 rounded-full border-2 ${t.completed ? "bg-primary border-primary" : "border-foreground/30"}`} />
                    <span className={`flex-1 text-sm font-semibold ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.category}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyHint to="/tasks" label="Add your first task" desc="A planner that feels light, not heavy." />
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
            <div className="text-xs text-muted-foreground mt-3">Total: {weekTotal} min across the last 7 days</div>
          </Card>
        </section>

        {/* Quick actions */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction to="/focus" icon={Timer} title="Start a focus session" tint="bg-matcha-soft" />
          <QuickAction to="/tutor" icon={Sparkles} title="Ask your AI tutor" tint="bg-peach-soft" />
          <QuickAction to="/japanese" icon={Languages} title="Practice kana" tint="bg-lavender-soft" />
          <QuickAction to="/tasks" icon={ListTodo} title="Plan tomorrow" tint="bg-honey/40" />
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, tint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode; tint: string }) {
  return (
    <div className="bg-white rounded-3xl border border-border p-4 flex items-center gap-3">
      <div className={`size-10 rounded-2xl ${tint} grid place-items-center`}><Icon className="size-5" /></div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-display text-xl font-bold">{value}</div>
      </div>
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[2rem] border border-border p-5 shadow-soft">
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

function QuickAction({ to, icon: Icon, title, tint }: { to: string; icon: React.ComponentType<{ className?: string }>; title: string; tint: string }) {
  return (
    <Link to={to} className="bg-white rounded-3xl border border-border p-5 flex items-center gap-3 hover:shadow-pop hover:-translate-y-0.5 transition-all">
      <div className={`size-10 rounded-2xl ${tint} grid place-items-center`}><Icon className="size-5" /></div>
      <span className="text-sm font-bold">{title}</span>
    </Link>
  );
}
