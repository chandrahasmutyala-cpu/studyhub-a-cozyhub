import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/useProfile";
import {
  Home, Map, GraduationCap, Sparkles, User,
  LogOut, Menu, X, ListTodo, NotebookPen, Layers, Timer, Languages, Heart,
  Award, ClipboardList, Settings, Compass,
} from "lucide-react";
import { useState, type ReactNode } from "react";

type Tab = { to: string; label: string; icon: typeof Home };

// Primary 5-tab bottom nav (mobile + collapsed desktop)
const tabs: Tab[] = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/career", label: "Roadmap", icon: Map },
  { to: "/universities", label: "Finder", icon: GraduationCap },
  { to: "/teacher", label: "Teacher", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
];

// Secondary nav (drawer + desktop sidebar)
const moreLinks: Tab[] = [
  { to: "/tasks", label: "Planner", icon: ListTodo },
  { to: "/focus", label: "Focus", icon: Timer },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/tutor", label: "AI Tutor", icon: Sparkles },
  { to: "/japanese", label: "Japanese", icon: Languages },
  { to: "/companion", label: "Companion", icon: Heart },
  { to: "/scholarships", label: "Scholarships", icon: Award },
  { to: "/applications", label: "Applications", icon: ClipboardList },
  { to: "/avatar", label: "Avatar Studio", icon: Compass },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [drawer, setDrawer] = useState(false);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-surface text-foreground">
      {/* Desktop top bar */}
      <header className="hidden md:flex sticky top-0 z-30 backdrop-blur bg-surface/85 border-b border-border h-16 px-6 items-center gap-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="size-8 rounded-xl bg-primary text-primary-foreground grid place-items-center text-sm">SH</span>
          StudentHub
        </Link>
        <nav className="flex items-center gap-1 ml-4">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = pathname === t.to || (t.to !== "/dashboard" && pathname.startsWith(t.to));
            return (
              <Link
                key={t.to}
                to={t.to as "/dashboard"}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  active ? "bg-brand-soft text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="size-4" /> {t.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => setDrawer(true)}
          className="ml-auto flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Menu className="size-4" /> More
        </button>
        <button
          onClick={signOut}
          className="size-9 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Sign out"
        >
          <LogOut className="size-4" />
        </button>
      </header>

      {/* Mobile top spacer (no header — content goes edge-to-edge like the screenshots) */}
      <div className="md:hidden h-6" />

      {/* Page content */}
      <main className="mx-auto w-full max-w-5xl px-5 sm:px-6 pb-28 md:pb-12 pt-2 md:pt-8">
        {children}
      </main>

      {/* Mobile bottom tab nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border">
        <div className="grid grid-cols-5 max-w-md mx-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = pathname === t.to || (t.to !== "/dashboard" && pathname.startsWith(t.to));
            return (
              <Link
                key={t.to}
                to={t.to as "/dashboard"}
                className={`flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`size-6 ${active ? "fill-primary/10" : ""}`} strokeWidth={active ? 2.5 : 1.75} />
                {t.label}
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      {/* Drawer (more links) */}
      {drawer && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm" onClick={() => setDrawer(false)}>
          <aside
            className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="font-bold text-lg">More</div>
              <button onClick={() => setDrawer(false)} className="size-9 grid place-items-center rounded-full hover:bg-muted">
                <X className="size-5" />
              </button>
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Hello, {profile?.display_name ?? "Student"}
            </div>
            <nav className="flex flex-col gap-1 mt-3">
              {moreLinks.map((l) => {
                const Icon = l.icon;
                return (
                  <Link
                    key={l.to}
                    to={l.to as "/tasks"}
                    onClick={() => setDrawer(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <Icon className="size-4 text-muted-foreground" /> {l.label}
                  </Link>
                );
              })}
              <button
                onClick={signOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-muted mt-3"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
