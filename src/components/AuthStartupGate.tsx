import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

/**
 * Startup routing gate for public entry screens.
 * Checks the persisted session before the Landing Page is visible:
 *  - authenticated -> straight to /dashboard
 *  - anonymous     -> Landing Page renders
 * Works in browser, PWA and native shells since it relies on the
 * persisted local session, not on network availability.
 */
export function AuthStartupGate() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        if (data.session) {
          navigate({ to: "/dashboard", replace: true });
          return;
        }
        setChecking(false);
      })
      .catch(() => active && setChecking(false));
    return () => { active = false; };
  }, [navigate]);

  if (!checking) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
        <Logo className="size-16" />
        <span className="font-display text-xl font-bold tracking-tight">StudyHub</span>
        <span className="size-5 rounded-full border-2 border-muted border-t-primary animate-spin" />
      </div>
    </div>
  );
}
