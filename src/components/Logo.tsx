import logoAsset from "@/assets/studyhub-logo.png.asset.json";

/** StudyHub bunny logo. */
export function Logo({ className = "size-10" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="StudyHub"
      className={`${className} object-contain select-none`}
      draggable={false}
    />
  );
}
