import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile } from "@/lib/useProfile";
import { focusTimer, useFocusTimer } from "@/lib/focus-timer";

/**
 * Global focus-timer engine. Mounted once in the app shell so the timer keeps
 * running (and completes correctly) no matter which page the student is on.
 * Time is derived from timestamps, so navigation, re-renders and background
 * tabs never lose a second.
 */
export function useFocusEngine() {
  const timer = useFocusTimer();
  const { profile, update } = useProfile();
  const qc = useQueryClient();
  const busy = useRef(false);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    if (!timer.running || !timer.endsAt) return;

    async function complete(minutes: number) {
      if (busy.current) return;
      busy.current = true;
      const wasFocus = focusTimer.state.phase === "focus";
      focusTimer._complete();
      try {
        if (!wasFocus) { toast.success("Break over — ready when you are."); return; }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("focus_sessions").insert({
          user_id: user.id, minutes, mode: "focus", background: focusTimer.state.scene,
        });
        const p = profileRef.current;
        const today = new Date().toISOString().slice(0, 10);
        const y = new Date(); y.setDate(y.getDate() - 1);
        const yISO = y.toISOString().slice(0, 10);
        const last = p?.last_study_date;
        const streak = last === today
          ? (p?.current_streak ?? 1)
          : last === yISO ? (p?.current_streak ?? 0) + 1 : 1;
        await update.mutateAsync({
          xp: (p?.xp ?? 0) + minutes * 2,
          total_minutes: (p?.total_minutes ?? 0) + minutes,
          coins: (p?.coins ?? 0) + Math.round(minutes / 5),
          current_streak: streak,
          longest_streak: Math.max(p?.longest_streak ?? 0, streak),
          last_study_date: today,
        });
        qc.invalidateQueries({ queryKey: ["focus"] });
        toast.success(`+${minutes * 2} XP — ${minutes} focused minutes banked.`);
      } finally {
        busy.current = false;
      }
    }

    const check = () => {
      const s = focusTimer.state;
      if (!s.running || !s.endsAt) return;
      if (Date.now() >= s.endsAt) void complete(s.phase === "focus" ? s.focusMin : s.breakMin);
    };
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, [timer.running, timer.endsAt, qc, update]);
}
