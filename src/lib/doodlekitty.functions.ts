import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { pixazoImageToImage } from "./pixazo.server";

const Input = z.object({
  imageBase64: z.string().min(40).max(8_000_000),
  mimeType: z.string(),
  prompt: z.string().max(800).optional(),
});

const SYSTEM_DOODLE = `Overlay only clean, hand-drawn WHITE ink doodles directly on top of the provided photo.
Strict rules:
- Preserve the original photo underneath completely — do not repaint, restyle, or recolor it.
- All added marks must be pure white (#FFFFFF), thin sketch lines, as if drawn with a white gel pen.
- No colors, no filters, no photo effects, no stickers, no emojis.
- Contextually add cute cat ears / whiskers on faces, sparkles in skies, little arrows and hand-written labels on interesting objects, hearts near cute subjects, and small math/study doodles near books or desks.
- Keep the composition, exposure, and background identical.
Return the edited image only.`;

function extFromMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  return "jpg";
}

export const doodleKittyEdit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({
    data,
    context,
  }): Promise<{ imageUrl: string; summary: { detected: string[]; doodles: string[]; annotations: string[] } }> => {
    const { supabase, userId } = context;

    // 1. Upload to private `doodle-uploads` bucket so Pixazo can fetch it via signed URL.
    const buf = Buffer.from(data.imageBase64, "base64");
    const ext = extFromMime(data.mimeType);
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const up = await supabase.storage
      .from("doodle-uploads")
      .upload(path, buf, { contentType: data.mimeType, upsert: false });
    if (up.error) throw new Error(`Upload failed: ${up.error.message}`);

    const signed = await supabase.storage
      .from("doodle-uploads")
      .createSignedUrl(path, 60 * 10); // 10 minutes
    if (signed.error || !signed.data?.signedUrl) {
      throw new Error(`Could not sign upload: ${signed.error?.message ?? "unknown"}`);
    }

    // 2. Send to Pixazo Nano Banana 2 image-to-image.
    const userPrompt = data.prompt?.trim();
    const finalPrompt = userPrompt
      ? `${SYSTEM_DOODLE}\n\nExtra instructions from the user: ${userPrompt}`
      : SYSTEM_DOODLE;

    let imageUrl: string;
    try {
      imageUrl = await pixazoImageToImage({
        prompt: finalPrompt,
        imageUrl: signed.data.signedUrl,
        aspectRatio: "auto",
        resolution: "1K",
        outputFormat: "png",
      });
    } finally {
      // Best-effort cleanup — original upload is no longer needed once Pixazo has produced output.
      supabase.storage.from("doodle-uploads").remove([path]).catch(() => {});
    }

    return {
      imageUrl,
      summary: {
        detected: userPrompt ? ["photo", "custom instructions"] : ["photo"],
        doodles: ["white ink overlay"],
        annotations: userPrompt ? [userPrompt] : ["auto-detected"],
      },
    };
  });
