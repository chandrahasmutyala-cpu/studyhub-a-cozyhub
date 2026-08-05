import { useActiveWallpaper } from "@/lib/wallpaper";

/**
 * Global wallpaper. Mounted once inside AppShell so it is never remounted
 * on navigation — a live (video) wallpaper keeps playing between pages.
 */
export function WallpaperLayer() {
  const wp = useActiveWallpaper();
  if (!wp.url) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-50 overflow-hidden">
      {wp.live ? (
        <video
          src={wp.url}
          autoPlay
          muted
          loop
          playsInline
          className="size-full object-cover wallpaper-media"
        />
      ) : (
        <img src={wp.url} alt="" loading="lazy" decoding="async" className="size-full object-cover wallpaper-media" />
      )}
      <div className="absolute inset-0 wallpaper-scrim" />
    </div>
  );
}
