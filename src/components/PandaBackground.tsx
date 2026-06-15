import pandaAsset from "@/assets/panda-bg.png.asset.json";

/**
 * Fixed full-screen panda wallpaper rendered behind every screen.
 * Subtle (≈22% opacity) so content stays readable.
 */
export function PandaBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-cream"
      style={{
        backgroundImage: `url(${pandaAsset.url})`,
        backgroundRepeat: "repeat",
        backgroundSize: "640px auto",
        opacity: 0.22,
      }}
    />
  );
}
