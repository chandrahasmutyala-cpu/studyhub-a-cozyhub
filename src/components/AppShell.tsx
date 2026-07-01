import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, levelFromXp, xpForNextLevel } from "@/lib/useProfile";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard, ListTodo, NotebookPen, Layers, Timer, Sparkles, Languages, User, Settings, Flame, LogOut,
  Compass, GraduationCap, Award, ClipboardList, Video,
  Calculator, FileText, Target, Cat, MessagesSquare, Map,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { PandaBackground } from "@/components/PandaBackground";
import { SplashScreen } from "@/components/SplashScreen";
import { Logo } from "@/components/Logo";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };
const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Study",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/tasks", label: "Planner", icon: ListTodo },
      { to: "/focus", label: "Focus", icon: Timer },
      { to: "/notes", label: "Notes", icon: NotebookPen },
      { to: "/flashcards", label: "Flashcards", icon: Layers },
      { to: "/tutor", label: "AI Tutor", icon: Sparkles },
      { to: "/japanese", label: "Japanese Academy", icon: Languages },
      { to: "/chinese", label: "Chinese Academy", icon: Languages },
      { to: "/korean", label: "Korean Academy", icon: Languages },
      { to: "/media-translator", label: "Media Translator", icon: Video },
      { to: "/language-goals", label: "Language Goals", icon: Target },
    ],
  },
  {
    label: "StudentHub",
    items: [
      { to: "/career", label: "Career Hub", icon: Compass },
      { to: "/university-advisor", label: "University Advisor", icon: MessagesSquare },
      { to: "/universities", label: "Universities", icon: GraduationCap },
      { to: "/scholarships", label: "Scholarships", icon: Award },
      { to: "/applications", label: "Applications", icon: ClipboardList },
      { to: "/admission-roadmap", label: "Admission Roadmap", icon: Compass },
      { to: "/scholarship-eligibility", label: "Scholarship Match", icon: Award },
      { to: "/cost-calculator", label: "Cost Calculator", icon: Calculator },
      { to: "/essay-reviewer", label: "Essay Reviewer", icon: FileText },
    ],
  },
  {
    label: "Creative",
    items: [
      { to: "/world-explorer", label: "World Explorer", icon: Map },
      { to: "/doodlekitty", label: "DoodleKitty", icon: Cat },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/profile", label: "Profile", icon: User },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

function Monogram({ className = "" }: { className?: string }) {
  return <Logo className={className} />;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const xp = profile?.xp ?? 0;
  const level = levelFromXp(xp);
  const next = xpForNextLevel(level);
  const prev = xpForNextLevel(level - 1);
  const pct = Math.max(0, Math.min(100, ((xp - prev) / (next - prev)) * 100));

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen relative">
      <SplashScreen />
      <PandaBackground />


      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 backdrop-blur bg-cream/80 border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/dashboard" className="flex items-center gap-2 font-display font-bold text-lg">
            <Monogram className="size-8 text-sm" />
            StudyHub
          </Link>
          <button onClick={() => setOpen((v) => !v)}
            className="size-9 rounded-full bg-white border border-border grid place-items-center"
            aria-label="Open menu">☰</button>
        </div>
        {open && (
          <nav className="px-3 pb-4 space-y-3 bg-cream/95 backdrop-blur">
            {navGroups.map((g) => (
              <div key={g.label}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">{g.label}</div>
                <div className="grid grid-cols-2 gap-2">
                  {g.items.map((n) => {
                    const Icon = n.icon;
                    const active = pathname.startsWith(n.to);
                    return (
                      <Link key={n.to} to={n.to as "/dashboard"} onClick={() => setOpen(false)}
                        className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${active ? "bg-primary text-primary-foreground" : "bg-white border border-border"}`}>
                        <Icon className="size-4" /> {n.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            <button onClick={signOut} className="w-full flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold bg-white border border-border">
              <LogOut className="size-4" /> Sign out
            </button>
          </nav>
        )}
      </header>

      <div className="md:flex">
        <aside className="hidden md:flex md:w-72 lg:w-80 md:flex-col md:sticky md:top-0 md:h-screen p-5 gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 px-2 py-1">
            <Monogram className="size-11 text-base" />
            <span className="font-display font-bold text-2xl tracking-tight">StudyHub</span>
          </Link>

          <div className="rounded-3xl bg-white/85 backdrop-blur border border-border p-4 flex items-center gap-3 shadow-soft">
            <div className="size-12 rounded-2xl bg-primary/30 grid place-items-center text-lg font-display font-bold">
              {(profile?.display_name?.[0] ?? "S").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lvl {level}</div>
              <Progress value={pct} className="h-2 mt-1 bg-secondary" />
              <div className="text-[11px] text-muted-foreground mt-1">{xp} / {next} XP</div>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
            {navGroups.map((g) => (
              <div key={g.label}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-1">{g.label}</div>
                <div className="flex flex-col gap-0.5">
                  {g.items.map((n) => {
                    const Icon = n.icon;
                    const active = pathname.startsWith(n.to);
                    return (
                      <Link key={n.to} to={n.to as "/dashboard"}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors ${
                          active ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground/70 hover:bg-white/70 hover:text-foreground"
                        }`}>
                        <Icon className="size-4" /> {n.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="rounded-2xl bg-white/85 backdrop-blur border border-border p-3 flex items-center gap-2 text-sm">
            <Flame className="size-4 text-primary" />
            <span className="font-bold">{profile?.current_streak ?? 0}</span>
            <span className="text-muted-foreground">day streak</span>
            <button onClick={signOut} className="ml-auto text-muted-foreground hover:text-foreground" aria-label="Sign out">
              <LogOut className="size-4" />
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {children}
        </main>
      </div>

    </div>
  );
}
