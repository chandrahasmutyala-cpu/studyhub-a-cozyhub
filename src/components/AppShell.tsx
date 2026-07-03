import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, levelFromXp, xpForNextLevel } from "@/lib/useProfile";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard, ListTodo, NotebookPen, Layers, Timer, Sparkles, Languages, User, Settings, Flame, LogOut,
  Compass, GraduationCap, Award, ClipboardList, Video,
  Calculator, FileText, Target, Cat, MessagesSquare, Map,
  Home, BookOpen, Search, Menu, X, ChevronRight,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
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

const allItems = navGroups.flatMap((g) => g.items);

function Monogram({ className = "" }: { className?: string }) {
  return <Logo className={className} />;
}

// Hide the standard AppShell chrome when a full-screen module (World Explorer) wants it.
function isImmersiveRoute(pathname: string) {
  return pathname.startsWith("/world-explorer");
}

export function AppShell({ children }: { children: ReactNode }) {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState("");
  const immersive = isImmersiveRoute(pathname);

  const xp = profile?.xp ?? 0;
  const level = levelFromXp(xp);
  const next = xpForNextLevel(level);
  const prev = xpForNextLevel(level - 1);
  const pct = Math.max(0, Math.min(100, ((xp - prev) / (next - prev)) * 100));

  useEffect(() => { setDrawer(false); }, [pathname]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const filtered = search.trim()
    ? allItems.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()))
    : null;

  if (immersive) {
    // World Explorer renders its own full-screen HUD.
    return (
      <div className="min-h-screen relative">
        <SplashScreen />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <SplashScreen />
      <PandaBackground />

      {/* MOBILE TOP BAR — floating glass */}
      <header className="md:hidden fixed top-3 inset-x-3 z-30 h-14 rounded-3xl floating-pill flex items-center justify-between px-3">
        <button
          onClick={() => setDrawer(true)}
          className="size-10 rounded-2xl grid place-items-center bg-white/60 hover:bg-white transition"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2 font-display font-bold">
          <Monogram className="size-7 text-xs" />
          <span className="tracking-tight">StudyHub</span>
        </Link>
        <Link to="/profile" className="size-10 rounded-2xl bg-white/60 hover:bg-white grid place-items-center transition" aria-label="Profile">
          <User className="size-5" />
        </Link>
      </header>

      <div className="md:flex">
        {/* DESKTOP — floating glass sidebar */}
        <aside className="hidden md:flex md:w-72 lg:w-80 md:flex-col md:sticky md:top-0 md:h-screen p-5 gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 px-2 py-1">
            <Monogram className="size-11 text-base" />
            <span className="font-display font-bold text-2xl tracking-tight">StudyHub</span>
          </Link>

          <ProfileCard xp={xp} level={level} next={next} pct={pct} name={profile?.display_name} />

          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl glass-panel text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <NavList
            groups={navGroups}
            filtered={filtered}
            pathname={pathname}
          />

          <div className="rounded-3xl glass-panel p-3 flex items-center gap-2 text-sm">
            <Flame className="size-4 text-primary" />
            <span className="font-bold">{profile?.current_streak ?? 0}</span>
            <span className="text-muted-foreground">day streak</span>
            <button onClick={signOut} className="ml-auto text-muted-foreground hover:text-foreground" aria-label="Sign out">
              <LogOut className="size-4" />
            </button>
          </div>
        </aside>

        <main
          data-appshell-main
          className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 pt-20 md:pt-6 pb-8 md:pb-10 animate-fade-up"
        >
          {children}
        </main>
      </div>

      {/* MOBILE — floating glass drawer */}
      {drawer && (
        <div className="md:hidden fixed inset-0 z-40">
          <button
            className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
            onClick={() => setDrawer(false)}
            aria-label="Close menu"
          />
          <aside className="absolute inset-y-3 left-3 w-[86vw] max-w-sm rounded-3xl glass-panel flex flex-col animate-slide-in-left overflow-hidden">
            <div className="p-5 flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center gap-2 font-display font-bold text-xl">
                <Monogram className="size-9 text-sm" /> StudyHub
              </Link>
              <button onClick={() => setDrawer(false)} className="size-9 rounded-2xl bg-white/70 grid place-items-center" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            <div className="px-5">
              <ProfileCard xp={xp} level={level} next={next} pct={pct} name={profile?.display_name} />
            </div>
            <div className="px-5 pt-3">
              <div className="relative">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white/70 border border-border text-sm outline-none"
                />
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <NavList
                groups={navGroups}
                filtered={filtered}
                pathname={pathname}
                onNavigate={() => setDrawer(false)}
              />
            </nav>
            <div className="p-4 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex size-2 rounded-full bg-mint" /> Synced
              <button onClick={signOut} className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-foreground">
                <LogOut className="size-3.5" /> Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

    </div>
  );
}

function ProfileCard({
  xp, level, next, pct, name,
}: { xp: number; level: number; next: number; pct: number; name?: string | null }) {
  return (
    <div className="rounded-3xl glass-panel p-4 flex items-center gap-3">
      <div className="size-12 rounded-2xl gradient-primary grid place-items-center text-lg font-display font-bold text-white">
        {(name?.[0] ?? "S").toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lvl {level}</div>
        <Progress value={pct} className="h-1.5 mt-1 bg-white/60" />
        <div className="text-[11px] text-muted-foreground mt-1">{xp} / {next} XP</div>
      </div>
    </div>
  );
}

function NavList({
  groups, filtered, pathname, onNavigate,
}: {
  groups: { label: string; items: NavItem[] }[];
  filtered: NavItem[] | null;
  pathname: string;
  onNavigate?: () => void;
}) {
  if (filtered) {
    return (
      <div className="flex flex-col gap-1">
        {filtered.length === 0 && (
          <div className="text-xs text-muted-foreground px-3 py-2">No matches.</div>
        )}
        {filtered.map((n) => (
          <NavRow key={n.to} item={n} active={pathname.startsWith(n.to)} onNavigate={onNavigate} />
        ))}
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
      {groups.map((g) => (
        <div key={g.label}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-1.5">{g.label}</div>
          <div className="flex flex-col gap-0.5">
            {g.items.map((n) => (
              <NavRow key={n.to} item={n} active={pathname.startsWith(n.to)} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function NavRow({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to as "/dashboard"}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all ${
        active
          ? "gradient-primary text-white shadow-soft"
          : "text-foreground/70 hover:bg-white/70 hover:text-foreground"
      }`}
    >
      <span className={`size-8 rounded-xl grid place-items-center transition ${active ? "bg-white/20" : "bg-white/60 group-hover:bg-white"}`}>
        <Icon className="size-4" />
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      <ChevronRight className={`size-4 transition ${active ? "opacity-80" : "opacity-0 group-hover:opacity-40"}`} />
    </Link>
  );
}
