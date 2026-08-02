/** Original StudyHub mascot — a calm minimalist cat peeking over a line. Decorative only. */
export function CozyCat({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 120"
      role="img"
      aria-label="StudyHub cat mascot"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* head + ears */}
      <path d="M56 100V72c0-20 18-34 44-34s44 14 44 34v28" />
      <path d="M62 78 58 50l24 12" />
      <path d="M138 78l4-28-24 12" />
      {/* eyes */}
      <circle cx="84" cy="76" r="3.4" fill="currentColor" stroke="none" />
      <circle cx="116" cy="76" r="3.4" fill="currentColor" stroke="none" />
      {/* nose / mouth */}
      <path d="M96 88c2 2.4 6 2.4 8 0" />
      {/* whiskers */}
      <path d="M56 80H36M56 88H38M144 80h20M144 88h18" opacity=".75" />
      {/* resting line + paws */}
      <path d="M14 100h172" />
      <path d="M70 100c0-5 4-8 9-8s9 3 9 8" />
      <path d="M112 100c0-5 4-8 9-8s9 3 9 8" />
      <path d="M75 96v4M84 96v4M117 96v4M126 96v4" opacity=".6" />
    </svg>
  );
}

const QUOTES = [
  "One small task at a time.",
  "Small progress is still progress.",
  "You get what you plan for.",
  "Every page begins with one word.",
  "Slow is smooth, smooth is fast.",
  "Finish something small today.",
];

/** Rotates gently by the day + hour so it feels alive without re-render churn. */
export function cozyQuote(seed = Date.now()) {
  return QUOTES[Math.floor(seed / 3_600_000) % QUOTES.length];
}
