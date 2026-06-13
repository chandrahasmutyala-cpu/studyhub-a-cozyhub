import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const InputSchema = z.object({
  career_goal: z.string().min(2).max(200),
  dream_country: z.string().min(1).max(100),
  dream_university: z.string().max(200).optional().default(""),
  current_grade: z.string().min(1).max(100),
  notes: z.string().max(800).optional().default(""),
});

const SYSTEM = `You are an academic & career planner. Given a student's goal, return a STRICT JSON object (no prose, no markdown fences) with this shape:
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
Keep arrays focused (3-7 items). Be realistic and specific to the country/university where possible. Never invent scholarship names or URLs — only general categories under scholarships_hint. Output ONLY the JSON object, no markdown fences.`;

export const generatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured.");

    const userPrompt = `Student profile:
- Current grade/year: ${data.current_grade}
- Career goal: ${data.career_goal}
- Dream country: ${data.dream_country}
- Dream university: ${data.dream_university || "open"}
- Notes: ${data.notes || "none"}

Return the JSON plan now.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Lovable-API-Key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("AI is busy — try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace billing.");
      throw new Error(`AI error ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    let raw = json.choices?.[0]?.message?.content ?? "{}";
    // Strip code fences if present
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
