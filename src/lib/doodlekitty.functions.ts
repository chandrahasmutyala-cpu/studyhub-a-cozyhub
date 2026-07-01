import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  imageBase64: z.string().min(40).max(8_000_000),
  mimeType: z.string(),
  prompt: z.string().max(800).optional(),
});

// DoodleKitty needs an image-to-image model. The current AI provider (Groq) is text-only,
// so we return a clear "coming soon" error until an image provider is wired.
export const doodleKittyEdit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async () => {
    throw new Error(
      "DoodleKitty is temporarily disabled — the current AI provider doesn't support image generation. It'll return once an image model is connected.",
    );
  });
