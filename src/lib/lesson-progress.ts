import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LanguageKey } from "./roadmap";

export type LessonProgressRow = {
  id: string;
  user_id: string;
  language: string;
  lesson_key: string;
  xp: number;
  stars: number;
  completed_at: string | null;
};

export function useLessonProgress(language: LanguageKey) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["lesson_progress", language],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [] as LessonProgressRow[];
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("language", language);
      if (error) throw error;
      return (data ?? []) as LessonProgressRow[];
    },
  });

  const complete = useMutation({
    mutationFn: async (args: { lessonKey: string; xp: number; stars: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          language,
          lesson_key: args.lessonKey,
          xp: args.xp,
          stars: args.stars,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,language,lesson_key" },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lesson_progress", language] }),
  });

  const completedKeys = new Set((q.data ?? []).filter((r) => r.completed_at).map((r) => r.lesson_key));
  return { rows: q.data ?? [], completedKeys, complete, isLoading: q.isLoading };
}
