import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(50),
  mode: z.enum(["general", "japanese"]).default("general"),
});

const SYSTEM_GENERAL = `You are Mochi, a calm, encouraging study tutor for the Study app. You explain things clearly with short paragraphs and tiny examples. You are warm, kind, and never condescending. When helpful, you make tiny flashcards or step-by-step plans. Use markdown sparingly.`;
const SYSTEM_JAPANESE = `You are Mochi-sensei, a friendly Japanese tutor. Respond in clear English with Japanese examples in 日本語 plus romaji and a short literal gloss. Correct mistakes kindly. Adapt to the learner's level (beginner → JLPT N1).`;

export const tutorChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured. Add it in project secrets.");
    }
    const system = data.mode === "japanese" ? SYSTEM_JAPANESE : SYSTEM_GENERAL;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.6,
        messages: [{ role: "system", content: system }, ...data.messages],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 401) throw new Error("OpenAI rejected the API key. Update OPENAI_API_KEY.");
      if (res.status === 429) throw new Error("OpenAI rate limit hit. Please try again in a moment.");
      throw new Error(`OpenAI error ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "(no response)";
    return { content };
  });
