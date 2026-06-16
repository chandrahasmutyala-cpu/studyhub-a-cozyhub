import bunny from "@/assets/studyhub-bunny.png.asset.json";

/** StudyHub bunny mark. */
export function Logo({ className = "size-10" }: { className?: string }) {
  return (
    <img
      src={bunny.url}
      alt="StudyHub"
      className={`${className} object-contain select-none`}
      draggable={false}
    />
  );
}
