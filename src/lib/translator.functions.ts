import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { groqChat } from "./groq.server";
import { pixazoImageToImage } from "./pixazo.server";

const Lang = z.enum(["japanese", "chinese", "korean"]);

const TranscriptSchema = z.object({
  text: z.string().min(1).max(60000),
  language: Lang,
});

// Groq (Llama) powers text transcript translation.
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

// Screenshot mode: use Pixazo Nano Banana 2 image-to-image to render an English-overlaid version.
const ImageSchema = z.object({
  imageBase64: z.string().min(20).max(8_000_000),
  mimeType: z.string(),
  language: Lang,
});

function extFromMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  return "jpg";
}

export const translateScreenshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ImageSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ result: { overlayUrl: string; note: string } }> => {
    const { supabase, userId } = context;

    const buf = Buffer.from(data.imageBase64, "base64");
    const ext = extFromMime(data.mimeType);
    const path = `${userId}/xlat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const up = await supabase.storage
      .from("doodle-uploads")
      .upload(path, buf, { contentType: data.mimeType, upsert: false });
    if (up.error) throw new Error(`Upload failed: ${up.error.message}`);

    const signed = await supabase.storage
      .from("doodle-uploads")
      .createSignedUrl(path, 60 * 10);
    if (signed.error || !signed.data?.signedUrl) {
      throw new Error(`Could not sign upload: ${signed.error?.message ?? "unknown"}`);
    }

    const langName = data.language === "japanese" ? "Japanese" : data.language === "chinese" ? "Chinese" : "Korean";
    const prompt = `Read every ${langName} text block in this screenshot and overlay a clean, minimal English translation directly next to (or just below) each original text block. Use a small, readable sans-serif font with a semi-transparent white pill background so the translation is legible on any surface. Keep the original screenshot untouched underneath — do not repaint, blur, or restyle it. Do not remove or cover the original ${langName} text.`;

    let overlayUrl: string;
    try {
      overlayUrl = await pixazoImageToImage({
        prompt,
        imageUrl: signed.data.signedUrl,
        aspectRatio: "auto",
        resolution: "1K",
        outputFormat: "png",
      });
    } finally {
      supabase.storage.from("doodle-uploads").remove([path]).catch(() => {});
    }

    return {
      result: {
        overlayUrl,
        note: `English overlay added by Pixazo Nano Banana 2. For sentence-by-sentence breakdowns, paste the ${langName} text into the Transcript tab.`,
      },
    };
  });
