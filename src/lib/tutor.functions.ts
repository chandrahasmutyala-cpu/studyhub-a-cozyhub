import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(50),
  mode: z.enum(["general", "japanese", "chinese", "korean", "university"]).default("general"),
});

const SYSTEM_GENERAL = `You are Mochi, the friendly all-in-one study tutor for StudyHub. You're warm, calm, encouraging, and never condescending. You explain things clearly with short paragraphs, tiny examples, and small step-by-step plans when helpful. Use markdown sparingly.

You handle EVERYTHING the student needs in one chat:
- Japanese, Chinese and Korean language learning (with examples in 日本語 + romaji, 中文 + pinyin with tones, or 한국어 + revised romanization, plus short literal glosses).
- JLPT (N5–N1), HSK (1–6) and TOPIK (I–II) preparation and study plans.
- University choice, admission requirements, application timelines and personal statements — especially for Japan, China and South Korea.
- Scholarship advice (MEXT, CSC, Korean Government Scholarship, private awards) and eligibility tips.
- Career planning, study planning, homework help, exam preparation.

When the student writes in another language, reply in their language. Detect the topic from context and switch tone naturally — don't ask which "mode" to use.`;

const SYSTEM_UNIVERSITY = `You are Mochi, a senior university admissions advisor specialized in Japan, China and South Korea. Speak clearly and concretely. When asked about a student's profile, return: (1) 3 fitting universities with reasoning, (2) realistic chance level for each, (3) 2 scholarships they could realistically apply for, (4) a focused 30-day prep plan. Always include concrete next steps and document checklists.`;

export const tutorChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("AI is not configured. Please contact support.");
    }
    const system = data.mode === "university" ? SYSTEM_UNIVERSITY : SYSTEM_GENERAL;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: system }, ...data.messages],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("AI is busy right now — try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in your workspace billing.");
      throw new Error(`AI error ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "(no response)";
    return { content };
  });
