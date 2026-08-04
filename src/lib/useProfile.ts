import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

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
      return data as Profile | null;
    },
  });

  // Apply theme to <html>
  useEffect(() => {
    const theme = q.data?.selected_theme ?? "peach";
    const root = document.documentElement;
    root.classList.remove("theme-peach", "theme-matcha", "theme-lavender", "theme-honey");
    root.classList.add(`theme-${theme}`);
  }, [q.data?.selected_theme]);

  const update = useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .update(patch as never)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  return { profile: q.data, isLoading: q.isLoading, update };
}

export function levelFromXp(xp: number) {
  return Math.floor(Math.sqrt(xp / 25)) + 1;
}
export function xpForNextLevel(level: number) {
  return (level * level) * 25;
}
