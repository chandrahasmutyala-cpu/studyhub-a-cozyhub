import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { groqChat } from "./groq.server";

const InputSchema = z.object({
  career_goal: z.string().min(2).max(200),
  dream_country: z.string().min(1).max(100),
  dream_university: z.string().max(200).optional().default(""),
  current_grade: z.string().min(1).max(100),
  notes: z.string().max(800).optional().default(""),
});

const SYSTEM = `You are an academic & career planner. Return a STRICT JSON object (no prose, no markdown fences) with this shape:
{
  "summary": string,
  "subjects": [{"name": string, "why": string}],
  "skills": [{"name": string, "level": "beginner|intermediate|advanced", "resources": [string]}],
  "exams": [{"name": string, "when": string, "notes": string}],
  "languages": [{"name": string, "target_level": string}],
  "portfolio": [string],
  "scholarships_hint": [string],
  "timeline": [{"phase": string, "when": string, "actions": [string]}]
}
Keep arrays focused (3-7 items). Be realistic and specific. Never invent scholarship names/URLs. Output ONLY the JSON object.`;

export const generatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const userPrompt = `Student profile:
- Current grade/year: ${data.current_grade}
- Career goal: ${data.career_goal}
- Dream country: ${data.dream_country}
- Dream university: ${data.dream_university || "open"}
- Notes: ${data.notes || "none"}

Return the JSON plan now.`;

    let raw = await groqChat({
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt },
      ],
      jsonMode: true,
      temperature: 0.4,
    });
    raw = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();

    let plan: unknown;
    try { plan = JSON.parse(raw); } catch { throw new Error("Planner returned invalid JSON."); }

    const { data: row, error } = await context.supabase
      .from("career_plans")
      .insert({
        user_id: context.userId,
        title: `${data.career_goal} → ${data.dream_country}`,
        career_goal: data.career_goal,
        dream_country: data.dream_country,
        dream_university: data.dream_university || null,
        current_grade: data.current_grade,
        plan: plan as never,
        is_active: true,
      })
      .select()
      .single();
    if (error) throw error;
    return { plan: row };
  });
