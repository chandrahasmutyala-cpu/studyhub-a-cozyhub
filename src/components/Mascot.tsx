type Props = { size?: number; waving?: boolean; className?: string };

/**
 * StudentHub mascot — friendly 2D bald character in a blue shirt.
 * Matches the look used across home, teacher, and profile screens.
 */
export function Mascot({ size = 160, waving = false, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {/* Body / shirt */}
      <path
        d="M30 220 Q30 165 70 152 L130 152 Q170 165 170 220 Z"
        fill="#0066FF"
      />
      {/* Neck */}
      <rect x="88" y="135" width="24" height="22" fill="#fde0c4" />
      {/* Head */}
      <circle cx="100" cy="100" r="52" fill="#fde0c4" />
      {/* Hair cap (thin) */}
      <path
        d="M52 96 Q60 56 100 54 Q140 56 148 96 L148 70 Q140 50 100 50 Q60 50 52 70 Z"
        fill="#1a1a1a"
      />
      {/* Cheeks */}
      <circle cx="70" cy="112" r="7" fill="#ffb0b0" opacity="0.65" />
      <circle cx="130" cy="112" r="7" fill="#ffb0b0" opacity="0.65" />
      {/* Eyes */}
      <circle cx="80" cy="100" r="5" fill="#1a1a1a" />
      <circle cx="120" cy="100" r="5" fill="#1a1a1a" />
      {/* Smile */}
      <path
        d="M84 122 Q100 134 116 122"
        stroke="#1a1a1a"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Waving arm */}
      {waving && (
        <g className="animate-float-soft" style={{ transformOrigin: "150px 175px" }}>
          <path
            d="M150 175 Q175 160 178 138"
            stroke="#0066FF"
            strokeWidth="22"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="178" cy="135" r="13" fill="#fde0c4" />
        </g>
      )}
    </svg>
  );
}
