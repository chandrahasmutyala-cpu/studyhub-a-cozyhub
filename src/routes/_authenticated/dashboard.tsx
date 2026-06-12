import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Mascot } from "@/components/Mascot";
import { useProfile } from "@/lib/useProfile";
import {
  BookOpen, Flame, CheckCircle2, Target, ArrowRight, ShieldCheck,
  GraduationCap, Sparkles,
} from "lucide-react";

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
      const { data } = await supabase
        .from("tasks").select("*")
        .or(`due_date.is.null,due_date.eq.${today}`)
        .order("completed").order("created_at");
      return data ?? [];
    },
  });

  const planQ = useQuery({
    queryKey: ["career_plans", "active"],
    queryFn: async () => {
      const { data } = await supabase
        .from("career_plans").select("id,title,plan,career_goal,dream_country")
        .order("created_at", { ascending: false }).limit(1);
      return data?.[0] ?? null;
    },
  });

  const unisQ = useQuery({
    queryKey: ["universities", "countries"],
    queryFn: async () => {
      const { data } = await supabase.from("universities").select("country");
      return Array.from(new Set((data ?? []).map((u) => u.country))).length;
    },
  });

  const tasksDoneToday = useMemo(
    () => (tasksQ.data ?? []).filter((t) => t.completed).length,
    [tasksQ.data],
  );
  const lessonsCount = profile?.total_minutes
    ? Math.round((profile.total_minutes ?? 0) / 25)
    : 0;
  const streak = profile?.current_streak ?? 0;
  const totalMilestones = Array.isArray(planQ.data?.plan && (planQ.data.plan as { timeline?: unknown[] })?.timeline)
    ? ((planQ.data!.plan as { timeline: unknown[] }).timeline.length)
    : 0;
  const progressPct = totalMilestones > 0 ? 0 : 0; // future: track per milestone

  const displayName = profile?.display_name?.split(" ")[0] ?? "friend";

  return (
    <AppShell>
      <div className="space-y-7 animate-fade-up">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="section-label">StudentHub</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-1">Welcome.</h1>
            <p className="text-muted-foreground mt-3 max-w-md">
              {profile?.display_name
                ? `Welcome back, ${displayName}. Let's keep building your future.`
                : "Welcome to StudentHub. Let's start building your future."}
            </p>
          </div>
          <Link
            to="/profile"
            className="size-14 rounded-full bg-brand-soft grid place-items-center shrink-0 overflow-hidden border border-border"
            aria-label="Profile"
          >
            <Mascot size={56} />
          </Link>
        </header>

        {/* Stat grid */}
        <section className="grid grid-cols-2 gap-3">
          <Stat icon={BookOpen} label="Lessons" value={lessonsCount} />
          <Stat icon={Flame} label="Study streak" value={streak} />
          <Stat icon={CheckCircle2} label="Tasks" value={tasksDoneToday} />
          <Stat icon={Target} label="Progress" value={`${progressPct}%`} />
        </section>

        {/* AI Teacher card */}
        <section className="bg-brand-tint border border-border rounded-3xl p-6 relative overflow-hidden">
          <div className="max-w-[60%] space-y-3">
            <Badge tone="brand" dot>AI Teacher</Badge>
            <h2 className="text-2xl font-bold tracking-tight">Meet your AI teacher.</h2>
            <p className="text-sm text-muted-foreground">A 2D companion that explains, quizzes, and plans with you.</p>
            <Link
              to="/teacher"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-2.5 font-semibold text-sm"
            >
              Set up Teacher <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="absolute -right-2 bottom-0 pointer-events-none">
            <Mascot size={170} />
          </div>
        </section>

        {/* Today's tasks */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-lg font-bold">Today's tasks</h2>
            <Link to="/tasks" className="text-sm font-semibold text-primary">Plan</Link>
          </div>
          {tasksQ.data && tasksQ.data.length > 0 ? (
            <ul className="space-y-2">
              {tasksQ.data.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
                  <span className={`size-5 rounded-full border-2 ${t.completed ? "bg-primary border-primary" : "border-border"}`} />
                  <span className={`flex-1 text-sm font-medium ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="Nothing scheduled yet"
              desc="Tasks you set will appear here. No fake to-dos."
            />
          )}
        </section>

        {/* Future roadmap */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-lg font-bold">Future roadmap</h2>
            <Link to="/career" className="text-sm font-semibold text-primary">Open</Link>
          </div>
          <Link
            to="/career"
            className="block bg-card border border-border rounded-3xl p-5"
          >
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-brand-soft grid place-items-center shrink-0">
                <Target className="size-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold">
                  {planQ.data?.title ?? "Set a career goal"}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {planQ.data?.career_goal
                    ? `${planQ.data.career_goal}${planQ.data.dream_country ? ` · ${planQ.data.dream_country}` : ""}`
                    : "Pick a country or university"}
                </div>
              </div>
              <ArrowRight className="size-5 text-muted-foreground shrink-0" />
            </div>
            <div className="h-1.5 bg-muted rounded-full mt-5 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex items-center justify-between mt-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Milestone 0 / {totalMilestones}</span>
              <span>{progressPct}% complete</span>
            </div>
          </Link>
        </section>

        {/* Discover */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Discover</h2>
            <Badge tone="verified" icon={ShieldCheck}>Verified only</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/universities" className="bg-card border border-border rounded-3xl p-5 hover:border-primary/30 transition-colors">
              <GraduationCap className="size-6 text-primary mb-3" />
              <div className="font-bold">Universities</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {unisQ.data ?? 0} {unisQ.data === 1 ? "country" : "countries"}
              </div>
            </Link>
            <Link to="/scholarships" className="bg-card border border-border rounded-3xl p-5 hover:border-primary/30 transition-colors">
              <Sparkles className="size-6 text-primary mb-3" />
              <div className="font-bold">Scholarships</div>
              <div className="text-xs text-muted-foreground mt-0.5">Verified sources</div>
            </Link>
          </div>
        </section>

        {/* Focus CTA */}
        <Link
          to="/focus"
          className="block w-full bg-foreground text-background rounded-full py-4 text-center font-semibold"
        >
          Enter Focus Mode
        </Link>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-5">
      <Icon className="size-5 text-muted-foreground mb-6" strokeWidth={1.75} />
      <div className="section-label">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border p-8 text-center">
      <div className="size-10 mx-auto rounded-full bg-muted grid place-items-center mb-3">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">{desc}</div>
    </div>
  );
}

function Badge({
  children, tone = "brand", icon: Icon, dot,
}: {
  children: React.ReactNode;
  tone?: "brand" | "verified";
  icon?: React.ComponentType<{ className?: string }>;
  dot?: boolean;
}) {
  const styles = tone === "verified"
    ? "bg-verified-soft text-verified"
    : "bg-card border border-border text-primary";
  return (
    <span className={`inline-flex items-center gap-1.5 ${styles} rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider`}>
      {dot && <span className="size-1.5 rounded-full bg-emerald-500" />}
      {Icon && <Icon className="size-3.5" />}
      {children}
    </span>
  );
}
