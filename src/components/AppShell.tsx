import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, levelFromXp, xpForNextLevel } from "@/lib/useProfile";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard, ListTodo, Sparkles, User, Settings, Flame, LogOut,
  Compass, GraduationCap, Award, ClipboardList, Video,
  Calculator, Cat, MessagesSquare,
  Home, Search, Menu, X, ChevronRight, Timer,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { useFocusEngine } from "@/lib/useFocusEngine";
import { focusTimer, useFocusTimer, useTick, formatMs } from "@/lib/focus-timer";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Study",
    items: [
      { to: "/dashboard", label: "Home", icon: Home },
      { to: "/learning-academy", label: "Learning Academy", icon: GraduationCap },
      { to: "/tasks", label: "Planner", icon: ListTodo },
      { to: "/tutor", label: "AI Tutor", icon: Sparkles },
      { to: "/media-translator", label: "Media Translator", icon: Video },
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
    ],
  },
  {
    label: "Creative",
    items: [
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

/** Persistent mini timer so a running session is visible on every page. */
function FloatingFocusChip() {
  const t = useFocusTimer();
  useTick(1000, t.running);
  if (!t.running) return null;
  const left = focusTimer.remaining(Date.now(), t);
  return (
    <Link
      to="/tasks"
      className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2.5 rounded-full bg-foreground text-background pl-4 pr-5 py-3 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.5)] hover:opacity-95 active:scale-[0.98] transition"
    >
      <Timer className="size-4 stroke-[1.75]" />
      <span className="font-bold tabular-nums text-sm">{formatMs(left)}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{t.phase}</span>
    </Link>
  );
}

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
  useFocusEngine();

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
    return <div className="min-h-screen relative">{children}</div>;
  }

  return (
    <div className="min-h-screen relative bg-background">
      {/* MOBILE FIXED TOP BAR — menu only */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-background/90 backdrop-blur-xl flex items-center px-4">
        <button
          onClick={() => setDrawer(true)}
          className="size-10 -ml-2 rounded-2xl grid place-items-center hover:bg-muted transition"
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 9h16M4 15h10" />
          </svg>
        </button>
      </header>


      <div className="md:flex">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex md:w-72 lg:w-80 md:flex-col md:sticky md:top-0 md:h-screen p-5 gap-4 border-r border-border/60 bg-card/40">
          <Link to="/dashboard" className="flex items-center gap-2 px-2 py-1">
            <Logo className="size-10 text-base" />
            <span className="font-display font-bold text-xl tracking-tight">StudyHub</span>
          </Link>

          <ProfileCard xp={xp} level={level} next={next} pct={pct} name={profile?.display_name} avatarPath={profile?.avatar_url} />

          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground stroke-[1.75]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-muted/60 border border-border/60 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <NavList groups={navGroups} filtered={filtered} pathname={pathname} />

          <div className="rounded-2xl bg-card border border-border/60 p-3 flex items-center gap-2 text-sm">
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
          className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 pt-[72px] md:pt-8 pb-10 animate-fade-up"
        >
          {children}
        </main>
      </div>

      {pathname !== "/tasks" && <FloatingFocusChip />}



      {/* MOBILE DRAWER */}
      {drawer && (
        <div className="md:hidden fixed inset-0 z-40">
          <button
            className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
            onClick={() => setDrawer(false)}
            aria-label="Close menu"
          />
          <aside className="absolute inset-y-0 left-0 w-[86vw] max-w-sm bg-background flex flex-col animate-slide-in-left shadow-2xl">
            <div className="p-5 flex items-center justify-between border-b border-border/60">
              <Link to="/dashboard" className="flex items-center gap-2 font-display font-bold text-lg">
                <Logo className="size-9 text-sm" /> StudyHub
              </Link>
              <button onClick={() => setDrawer(false)} className="size-9 rounded-2xl hover:bg-muted grid place-items-center" aria-label="Close">
                <X className="size-5 stroke-[1.75]" />
              </button>
            </div>
            <div className="px-5 pt-4">
              <ProfileCard xp={xp} level={level} next={next} pct={pct} name={profile?.display_name} avatarPath={profile?.avatar_url} />
            </div>
            <div className="px-5 pt-3">
              <div className="relative">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground stroke-[1.75]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-muted/60 border border-border/60 text-sm outline-none"
                />
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <NavList groups={navGroups} filtered={filtered} pathname={pathname} onNavigate={() => setDrawer(false)} />
            </nav>
            <div className="p-4 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex size-2 rounded-full bg-mint" /> Synced
              <button onClick={signOut} className="ml-auto inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground">
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
  xp, level, next, pct, name, avatarPath,
}: { xp: number; level: number; next: number; pct: number; name?: string | null; avatarPath?: string | null }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!avatarPath) { setUrl(null); return; }
    supabase.storage.from("avatars").createSignedUrl(avatarPath, 60 * 60).then(({ data }) => {
      if (!cancelled) setUrl(data?.signedUrl ?? null);
    });
    return () => { cancelled = true; };
  }, [avatarPath]);
  return (
    <div className="rounded-2xl bg-card border border-border/60 p-4 flex items-center gap-3">
      <div className="size-12 rounded-2xl overflow-hidden gradient-primary grid place-items-center text-lg font-display font-bold text-white shrink-0">
        {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : (name?.[0] ?? "S").toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lvl {level}</div>
        <Progress value={pct} className="h-1.5 mt-1 bg-muted" />
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
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
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
      className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-primary/15 text-primary"
          : "text-foreground/75 hover:bg-muted/70 hover:text-foreground"
      }`}
    >
      <Icon className={`size-[18px] stroke-[1.75] ${active ? "text-primary" : "text-foreground/60"}`} />
      <span className="flex-1 truncate">{item.label}</span>
      <ChevronRight className={`size-4 transition ${active ? "opacity-70" : "opacity-0 group-hover:opacity-40"}`} />
    </Link>
  );
}
