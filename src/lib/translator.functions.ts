import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { groqChat } from "./groq.server";

const Lang = z.enum(["japanese", "chinese", "korean"]);

const TranscriptSchema = z.object({
  text: z.string().min(1).max(60000),
  language: Lang,
});

// Groq (Llama) is text-only — screenshot OCR is not supported without a vision model.
const SYSTEM_TRANSCRIPT = (lang: string) =>
  `You translate ${lang} transcripts for language learners into English.

Output STRICT JSON:
{"sentences":[{"i":1,"src":"…","en":"…","reading":"…","notes":"…"}]}

- "src" is the original ${lang} sentence.
- "en" is a natural English translation.
- "reading" is romaji (Japanese) / pinyin with tone marks (Chinese) / revised romanization (Korean).
- "notes" briefly highlights one vocab or grammar point (<80 chars).
- Split input into learning-sized sentences.
- No commentary outside the JSON.`;

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };
function tryParseJson(content: string): JsonValue {
  const m = content.match(/\{[\s\S]*\}$/m) ?? content.match(/\{[\s\S]*\}/);
  const raw = m ? m[0] : content;
  try { return JSON.parse(raw) as JsonValue; } catch { return { raw: content }; }
}

export const translateTranscript = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TranscriptSchema.parse(input))
  .handler(async ({ data }) => {
    const content = await groqChat({
      messages: [
        { role: "system", content: SYSTEM_TRANSCRIPT(data.language) },
        { role: "user", content: data.text },
      ],
      jsonMode: true,
      temperature: 0.3,
    });
    return { result: tryParseJson(content) };
  });

// Screenshot OCR requires a vision model. Groq's Llama text models don't accept images,
// so we return a clear, actionable message instead of silently failing.
const ImageSchema = z.object({
  imageBase64: z.string().min(20).max(8_000_000),
  mimeType: z.string(),
  language: Lang,
});
export const translateScreenshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ImageSchema.parse(input))
  .handler(async () => {
    throw new Error(
      "Screenshot translation is temporarily unavailable — the current AI provider (Groq) doesn't support image input. Paste the text into the transcript translator instead.",
    );
  });
