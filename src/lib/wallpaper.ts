import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/useProfile";
import { wallpaperById } from "@/lib/shop";

export type ActiveWallpaper = {
  url: string | null;
  /** true when the source is a video (live wallpaper) */
  live: boolean;
  name: string;
};

/**
 * Resolves the wallpaper that should be showing everywhere:
 * a custom upload wins, otherwise the wallpaper picked in the Shop.
 */
export function useActiveWallpaper(): ActiveWallpaper {
  const { profile } = useProfile();
  const custom = (profile as unknown as { custom_wallpaper_url?: string | null })?.custom_wallpaper_url ?? null;
  const shopWall = wallpaperById(profile?.selected_wallpaper);
  const [signed, setSigned] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!custom) { setSigned(null); return; }
    supabase.storage.from("wallpapers").createSignedUrl(custom, 60 * 60 * 8).then(({ data }) => {
      if (!cancelled) setSigned(data?.signedUrl ?? null);
    });
    return () => { cancelled = true; };
  }, [custom]);

  if (custom) {
    return { url: signed, live: /\.(mp4|webm|mov)$/i.test(custom), name: "Your wallpaper" };
  }
  return { url: shopWall?.image ?? null, live: false, name: shopWall?.name ?? "Minimal" };
}
