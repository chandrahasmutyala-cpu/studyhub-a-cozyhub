import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  imageBase64: z.string().min(40).max(8_000_000),
  mimeType: z.string().regex(/^image\/(png|jpe?g|webp)$/),
  style: z.enum(["cat-girl", "kawaii", "sketchbook", "math-notes", "scrapbook", "dreamy", "anime"]),
  density: z.enum(["light", "medium", "heavy"]).default("medium"),
  customPrompt: z.string().max(500).optional(),
});

const STYLE_PROMPTS: Record<string, string> = {
  "cat-girl": "Add cute hand-drawn cat ears on top of any human heads, soft whiskers across cheeks, a tiny cat nose, blush marks, heart-cheek doodles, and small floating pink hearts and sparkles. Pen strokes should feel hand-drawn and imperfect, like a girl doodling on a polaroid.",
  "kawaii": "Add kawaii Japanese sticker doodles: bows, ribbons, sparkles, tiny clouds, smiling stars, pastel hearts, and a small handwritten word like 'kawaii✨' in soft pink ink. Keep doodles light and around the subject, not covering faces.",
  "sketchbook": "Add hand-drawn sketchbook doodles in dark ink: small arrows pointing to objects with handwritten English notes, scribbles, asterisks, doodled flowers, butterflies, and a torn-paper journal vibe.",
  "math-notes": "Overlay aesthetic white-pen mathematical and geometric doodles: dashed coordinate axes, an ellipse or parabola curve, measurement annotations, handwritten equations (e.g. y=ax²+bx+c), tiny angle marks, and small notebook-style annotations. Subtle, white ink, like a study aesthetic Instagram post.",
  "scrapbook": "Add a scrapbook / polaroid frame look: white tape pieces, washi tape, paperclips, handwritten date in cursive, tiny stars, and a small caption like 'best day ✿'.",
  "dreamy": "Add dreamy hand-drawn stars, crescent moons, tiny constellations, sparkles, swirling clouds, and small light streaks. White and pale pastel inks. Magical, soft, ethereal feel.",
  "anime": "Add expressive anime doodles: large sparkle stars, sweat drops, blush marks, manga-style focus lines around the subject, tiny chibi hearts, and one handwritten 'kyaa~' or '✧' sticker.",
};

const DENSITY_HINT: Record<string, string> = {
  light: "Place only 3-5 small doodles total. Very minimal.",
  medium: "Place about 8-12 doodles around the subject. Balanced.",
  heavy: "Fill the empty space generously with 15+ doodles, but never cover the main subject's face or eyes.",
};

export const doodleKittyEdit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured. Please contact support.");

    const stylePrompt = STYLE_PROMPTS[data.style];
    const densityHint = DENSITY_HINT[data.density];
    const fullPrompt =
`Add aesthetic hand-drawn doodles to this photo, keeping the original image fully intact underneath.

${stylePrompt}

${densityHint}

Rules:
- NEVER replace, repaint, or distort the original photo — only draw on top of it.
- Detect faces, pets, food, and objects, and place doodles around them naturally.
- Avoid covering eyes, mouths, or important details.
- Follow contours of subjects gently.
- Use imperfect, hand-drawn strokes — not vector-perfect lines.
- Maintain the original lighting and composition.
- Result must look like a real artist doodled on the photo by hand.

${data.customPrompt ? `Extra request from user: ${data.customPrompt}` : ""}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Lovable-API-Key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: fullPrompt },
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
    const imgUrl = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imgUrl) {
      throw new Error("AI did not return an image. Please try again with a different photo.");
    }
    return { imageUrl: imgUrl };
  });
