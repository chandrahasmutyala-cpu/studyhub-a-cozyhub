import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";
import { THEMES } from "@/lib/themes";

export type Profile = {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  coins: number;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  total_minutes: number;
  onboarded: boolean;
  study_goal: string | null;
  subjects: string[] | null;
  exam_target: string | null;
  daily_minutes_target: number | null;
  preferred_time: string | null;
  languages: string[] | null;
  selected_pet: string | null;
  selected_theme: string | null;
  selected_wallpaper: string | null;
  custom_wallpaper_url: string | null;
  japanese_level: string | null;
  age_group: string | null;
  avatar_config: Record<string, number> | null;
  teacher_name: string | null;
  teacher_personality: string | null;
  teacher_voice: string | null;
  teacher_style: string | null;
  dream_career: string | null;
  dream_country: string | null;
  dream_university: string | null;
  current_grade: string | null;
};

/** Fields that carry user progress — never written by generic profile forms. */
const PROTECTED_FIELDS = [
  "id", "xp", "level", "coins", "current_streak", "longest_streak",
  "total_minutes", "last_study_date", "created_at", "updated_at",
] as const;

export function useProfile() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as unknown as Profile;

      // The signup trigger normally creates this row; self-heal if it is missing
      // so a first-time user never hits a dead profile page.
      const { data: created, error: insErr } = await supabase
        .from("profiles")
        .insert({ id: user.id, display_name: user.email?.split("@")[0] ?? null })
        .select("*")
        .maybeSingle();
      if (insErr) throw insErr;
      return (created as unknown as Profile) ?? null;
    },
    staleTime: 15_000,
    retry: 1,
  });

  // Apply theme to <html>
  useEffect(() => {
    const requested = q.data?.selected_theme;
    const theme = THEMES.some((item) => item.id === requested) ? requested : "peach";
    const root = document.documentElement;
    root.classList.remove(...THEMES.map((item) => `theme-${item.id}`));
    root.classList.add(`theme-${theme}`);
  }, [q.data?.selected_theme]);

  const update = useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You are signed out — sign in again to save.");
      // Only send keys that were explicitly provided: a partial UPDATE merges
      // into the existing row and can never blank out untouched progress fields.
      const clean = Object.fromEntries(
        Object.entries(patch).filter(([, v]) => v !== undefined),
      );
      if (Object.keys(clean).length === 0) return;
      const { data, error } = await supabase
        .from("profiles")
        .update(clean as never)
        .eq("id", user.id)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Could not save — profile row not found.");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
    onError: (e: Error) => toast.error(e.message || "Save failed"),
  });

  /** Progress writes (XP/coins/streak) go through here, always additive. */
  const addProgress = useMutation({
    mutationFn: async (delta: { xp?: number; coins?: number; total_minutes?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You are signed out — sign in again to save.");
      const { data: cur, error: readErr } = await supabase
        .from("profiles").select("xp,coins,total_minutes").eq("id", user.id).maybeSingle();
      if (readErr) throw readErr;
      const xp = (cur?.xp ?? 0) + (delta.xp ?? 0);
      const next = {
        xp,
        level: levelFromXp(xp),
        coins: (cur?.coins ?? 0) + (delta.coins ?? 0),
        total_minutes: (cur?.total_minutes ?? 0) + (delta.total_minutes ?? 0),
      };

      const { error } = await supabase.from("profiles").update(next as never).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
    onError: (e: Error) => toast.error(e.message || "Could not save progress"),
  });

  return { profile: q.data, isLoading: q.isLoading, error: q.error, refetch: q.refetch, update, addProgress, PROTECTED_FIELDS };
}

export function levelFromXp(xp: number) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 25)) + 1;
}
export function xpForNextLevel(level: number) {
  return (level * level) * 25;
}
