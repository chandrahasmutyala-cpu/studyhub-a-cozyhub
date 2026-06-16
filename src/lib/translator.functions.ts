import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Lang = z.enum(["japanese", "chinese", "korean"]);

const TranscriptSchema = z.object({
  text: z.string().min(1).max(60000),
  language: Lang,
});

const ImageSchema = z.object({
  imageBase64: z.string().min(20).max(8_000_000), // raw base64 (no data: prefix)
  mimeType: z.string().regex(/^image\/(png|jpeg|jpg|webp|gif)$/),
  language: Lang,
});

const SYSTEM_TRANSCRIPT = (lang: string) =>
  `You translate spoken-language transcripts for language learners.
Source language: ${lang}. Target: English.

Output STRICT JSON with shape:
{"sentences":[{"i":1,"src":"…","en":"…","reading":"…","notes":"…"}, …]}

- "src" is the original sentence in ${lang} script.
- "en" is a natural English translation.
- "reading" is romaji (Japanese), pinyin with tone marks (Chinese), or revised romanization (Korean).
- "notes" briefly highlights one key vocab or grammar point. Keep under 80 chars.
- Split the input into sensible learning-sized sentences (1-2 clauses each).
- Preserve original line breaks as separate sentences when present.
- Do NOT add commentary outside the JSON object.`;

const SYSTEM_IMAGE = (lang: string) =>
  `You are reading text from a screenshot.
Source language: ${lang}.

Output STRICT JSON with shape:
{"sentences":[{"src":"…","en":"…","reading":"…"}],"vocab":[{"w":"…","reading":"…","en":"…"}],"grammar":["short bullet …"]}

- Extract ONLY ${lang} text visible in the image (skip UI chrome unless it carries meaning).
- "sentences" is each readable line/sentence with a natural English translation and reading
  (romaji / pinyin with tone marks / revised romanization).
- "vocab" is 4-8 key new words with their reading and English meaning.
- "grammar" is 1-3 short bullets explaining notable grammar patterns.
- If no ${lang} text is visible, return {"sentences":[],"vocab":[],"grammar":["No ${lang} text detected"]}.
- Do NOT add commentary outside the JSON object.`;

async function callGateway(body: object) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI is not configured. Please contact support.");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Lovable-API-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("AI is busy right now — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits to continue.");
    throw new Error(`AI error ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}

function tryParseJson(content: string): unknown {
  const m = content.match(/\{[\s\S]*\}$/m) ?? content.match(/\{[\s\S]*\}/);
  const raw = m ? m[0] : content;
  try { return JSON.parse(raw); } catch { return { raw: content }; }
}

export const translateTranscript = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TranscriptSchema.parse(input))
  .handler(async ({ data }) => {
    const content = await callGateway({
      model: "google/gemini-3-flash-preview",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_TRANSCRIPT(data.language) },
        { role: "user", content: data.text },
      ],
    });
    return { result: tryParseJson(content) };
  });

export const translateScreenshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ImageSchema.parse(input))
  .handler(async ({ data }) => {
    const content = await callGateway({
      model: "google/gemini-3-flash-preview",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_IMAGE(data.language) },
        {
          role: "user",
          content: [
            { type: "text", text: `Extract and translate the ${data.language} text in this image.` },
            { type: "image_url", image_url: { url: `data:${data.mimeType};base64,${data.imageBase64}` } },
          ],
        },
      ],
    });
    return { result: tryParseJson(content) };
  });
