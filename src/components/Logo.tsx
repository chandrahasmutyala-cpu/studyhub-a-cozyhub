import catIcon from "@/assets/studyhub-cat-icon.jpg.asset.json";

/** StudyHub cat mark supplied by the user. */
export function Logo({ className = "size-10" }: { className?: string }) {
  return (
    <img
      src={catIcon.url}
      alt="StudyHub"
      className={`${className} object-contain select-none`}
      draggable={false}
    />
  );
}
