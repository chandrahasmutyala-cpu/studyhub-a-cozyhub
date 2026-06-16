import splashAsset from "@/assets/studyhub-splash.png.asset.json";

/**
 * Fixed full-screen StudyHub splash wallpaper rendered behind every screen.
 * Uses the full uncropped image, faded to keep content readable.
 */
export function PandaBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-cream">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${splashAsset.url})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          opacity: 0.22,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-cream/40 via-cream/20 to-cream/60" />
    </div>
  );
}
