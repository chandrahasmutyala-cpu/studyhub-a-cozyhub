import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { groqChat } from "./groq.server";

const DnaInput = z.object({
  stats: z.object({
    xp: z.number(),
    streak: z.number(),
    total_minutes: z.number(),
    japanese_level: z.string().nullable().optional(),
    weekly_minutes: z.number(),
    lessons_completed: z.number(),
  }),
});

export const learningDnaAdvice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => DnaInput.parse(i))
  .handler(async ({ data }) => {
    const s = data.stats;
    const prompt = `You are a warm study coach. Given this learner's real stats, give 4-6 short bullet insights + 3 concrete next actions. Keep it under 180 words.

STATS
- Total XP: ${s.xp}
- Current streak: ${s.streak} days
- Total study minutes: ${s.total_minutes}
- This week minutes: ${s.weekly_minutes}
- Lessons completed: ${s.lessons_completed}
- Japanese level: ${s.japanese_level ?? "unknown"}`;
    const content = await groqChat({
      messages: [
        { role: "system", content: "You are StudyHub's supportive learning coach. Be specific, honest, encouraging." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    });
    return { content };
  });

const PlanInput = z.object({
  startDate: z.string(),
  endDate: z.string(),
  exams: z.string().max(1500).optional().default(""),
  assignments: z.string().max(1500).optional().default(""),
  projects: z.string().max(1500).optional().default(""),
  holidays: z.string().max(500).optional().default(""),
  focusHours: z.number().min(0.5).max(12).default(3),
});

export const generateSemesterPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => PlanInput.parse(i))
  .handler(async ({ data, context }) => {
    const prompt = `Create a compact semester plan from ${data.startDate} to ${data.endDate}.

EVENTS
Exams: ${data.exams || "none listed"}
Assignments: ${data.assignments || "none listed"}
Projects: ${data.projects || "none listed"}
Holidays: ${data.holidays || "none listed"}
Target focus time per day: ${data.focusHours} hours

Return sections with clear headings and short bullets:
1. Daily rhythm (weekday vs weekend)
2. Weekly plan template
3. Monthly milestones
4. Revision calendar (2 weeks before each exam)
5. Pomodoro schedule
6. Exam countdown
7. Focus sessions vs rest days`;
    const content = await groqChat({
      messages: [
        { role: "system", content: "You are a pragmatic academic planner. Prefer concrete times and small daily habits over motivational fluff." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    });

    await context.supabase.from("semester_plans").insert({
      user_id: context.userId,
      start_date: data.startDate,
      end_date: data.endDate,
      events: [
        { type: "exams", text: data.exams },
        { type: "assignments", text: data.assignments },
        { type: "projects", text: data.projects },
        { type: "holidays", text: data.holidays },
      ] as unknown as never,
      plan: { text: content, focusHours: data.focusHours } as unknown as never,
    });

    return { content };
  });
