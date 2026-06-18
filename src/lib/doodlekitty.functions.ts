import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  imageBase64: z.string().min(40).max(8_000_000),
  mimeType: z.string().regex(/^image\/(png|jpe?g|webp)$/),
  prompt: z.string().max(800).optional(),
});

const SYSTEM_PROMPT = `You are DoodleKitty — an AI artist that annotates photographs with WHITE hand-drawn doodles, exactly like a concept-art design sheet.

ABSOLUTE RULES (do not break):
- Output must be the ORIGINAL photo unchanged underneath, with white sketch doodles drawn on top.
- ONLY white ink / white sketch lines / white hand-drawn doodles. No color, no fill, no stickers, no emoji, no backgrounds, no text frames.
- Lines must look imperfect and hand-drawn, like a fine white gel pen on a photo.
- Never repaint, distort, recolor, blur or restyle the photo. Faces, eyes, mouths, and skin stay untouched.
- Keep the doodles minimal — quality over quantity. Leave breathing room.

AVAILABLE DOODLE VOCABULARY (pick what fits):
- Cat elements: cat ears, whiskers, cat face outline, sleepy cat face, happy cat face, tiny paws, tiny tails
- Symbols: hearts, sparkles, stars, arrows, tiny clouds, motion lines, wind lines
- Academic: math equations, math symbols, geometry shapes (triangles, circles, cubes), tiny graph sketches, physics/chemistry formulas
- Annotations: short handwritten labels, arrows pointing to subjects, small notes, tiny captions

INTELLIGENT DOODLE RECOGNITION:
1. If the user gave specific instructions, FOLLOW them first.
2. Otherwise, analyze the photo and place context-aware white doodles:
   - Human face → cat ears on the head, light whiskers across cheeks, a few hearts and sparkles
   - Hair in motion → wind lines + arrow → handwritten label "windy"
   - Running / fast subject → motion lines, speed arrows
   - Study desk / books / notes → small equations, a tiny geometry sketch, a "study time" arrow
   - Landscape / sky → small stars, sparkles, tiny clouds
   - Animals → hearts, paw prints, a cute label
   - Food → sparkles + a small cute label
3. Use arrows + tiny handwritten words to annotate features (e.g. arrow → smile labelled "cute").

After generating the image, return a short JSON block in your text response (and ONLY this JSON, no prose) describing what you did:
{
  "detected": ["face", "hair", "smile"],
  "doodles": ["cat ears", "whiskers", "sparkles", "arrow"],
  "annotations": ["windy", "cute"]
}`;

type DoodleSummary = {
  detected: string[];
  doodles: string[];
  annotations: string[];
};

function parseSummary(text: string | undefined): DoodleSummary {
  const empty: DoodleSummary = { detected: [], doodles: [], annotations: [] };
  if (!text) return empty;
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return empty;
  try {
    const j = JSON.parse(m[0]);
    return {
      detected: Array.isArray(j.detected) ? j.detected.map(String).slice(0, 12) : [],
      doodles: Array.isArray(j.doodles) ? j.doodles.map(String).slice(0, 12) : [],
      annotations: Array.isArray(j.annotations) ? j.annotations.map(String).slice(0, 12) : [],
    };
  } catch {
    return empty;
  }
}

export const doodleKittyEdit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured. Please contact support.");

    const userPrompt = data.prompt?.trim()
      ? `User instructions (follow these first):\n${data.prompt.trim()}`
      : `No specific instructions — analyze the photo and add intelligent contextual white doodles automatically.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Lovable-API-Key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        modalities: ["image", "text"],
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: `data:${data.mimeType};base64,${data.imageBase64}` } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("AI is busy right now — try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in your workspace billing.");
      throw new Error(`AI error ${res.status}: ${text.slice(0, 300)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { images?: { image_url?: { url?: string } }[]; content?: string } }[];
    };
    const msg = json.choices?.[0]?.message;
    const imgUrl = msg?.images?.[0]?.image_url?.url;
    if (!imgUrl) throw new Error("AI did not return an image. Please try again with a different photo.");
    return { imageUrl: imgUrl, summary: parseSummary(msg?.content) };
  });
