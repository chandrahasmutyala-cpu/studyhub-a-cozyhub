import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { groqChat } from "./groq.server";

const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(50),
  mode: z.enum(["general", "japanese", "chinese", "korean", "university", "npc"]).default("general"),
  systemOverride: z.string().max(4000).optional(),
});

const SYSTEM_GENERAL = `You are StudyHub, the friendly all-in-one study tutor for the StudyHub app. You're warm, calm, encouraging, and never condescending. You explain clearly with short paragraphs, tiny examples, and small step-by-step plans.

You handle EVERYTHING the student needs in one chat:
- Japanese, Chinese and Korean language learning (with examples in 日本語 + romaji, 中文 + pinyin with tones, or 한국어 + revised romanization, plus short literal glosses).
- JLPT (N5–N1), HSK (1–6) and TOPIK (I–II) preparation and study plans.
- University choice, admission requirements, application timelines and personal statements — especially for Japan, China and South Korea.
- Scholarship advice (MEXT, CSC, Korean Government Scholarship, private awards) and eligibility tips.
- Career planning, study planning, homework help, exam preparation.

Reply in the student's language. Detect the topic from context and switch tone naturally.`;

const SYSTEM_UNIVERSITY = `You are StudyHub, a senior university admissions advisor specialized in Japan, China and South Korea. Return: (1) 3 fitting universities with reasoning, (2) realistic chance level for each, (3) 2 scholarships they could realistically apply for, (4) a focused 30-day prep plan. Include concrete next steps and document checklists.`;

export const tutorChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const system =
      data.systemOverride ??
      (data.mode === "university" ? SYSTEM_UNIVERSITY : SYSTEM_GENERAL);

    const content = await groqChat({
      messages: [{ role: "system", content: system }, ...data.messages],
      temperature: 0.6,
    });
    return { content };
  });
