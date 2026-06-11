export type AvatarConfig = {
  hair: number;     // 0..3
  eyes: number;     // 0..3
  mouth: number;    // 0..3
  outfit: number;   // 0..3
  accessory: number;// 0..3
  bg: number;       // 0..4
  skin: number;     // 0..3
};

export const DEFAULT_AVATAR: AvatarConfig = { hair: 0, eyes: 0, mouth: 0, outfit: 0, accessory: 0, bg: 0, skin: 0 };

const BG = ["#ffd5c2", "#d1e8d1", "#e5d4ff", "#ffe9b0", "#fde2e7"];
const SKIN = ["#fde0c4", "#f3c79b", "#d9a06b", "#8b5a3c"];
const HAIR = ["#5d3a1f", "#1a1a1a", "#d18b48", "#e6a3c4"];
const OUTFIT = ["#ff9e7a", "#9bd49b", "#b69cff", "#ffd76a"];

export function Avatar({ config, size = 160 }: { config?: AvatarConfig | null; size?: number }) {
  const c = { ...DEFAULT_AVATAR, ...(config ?? {}) };
  const bg = BG[c.bg % BG.length];
  const skin = SKIN[c.skin % SKIN.length];
  const hair = HAIR[c.hair % HAIR.length];
  const outfit = OUTFIT[c.outfit % OUTFIT.length];

  // Hair shapes
  const hairShapes = [
    <path key="h" d="M30 55 Q50 10 95 25 Q120 28 130 55 Q132 75 120 75 L40 75 Q28 75 30 55Z" fill={hair} />,
    <path key="h" d="M28 65 Q40 20 80 18 Q120 16 132 60 L120 80 L40 80 Z" fill={hair} />,
    <path key="h" d="M30 60 Q50 15 80 15 Q110 15 130 60 L130 75 L30 75Z M25 60 L25 110 L35 95Z M135 60 L135 110 L125 95Z" fill={hair} />,
    <g key="h"><circle cx="80" cy="40" r="38" fill={hair} /><circle cx="50" cy="60" r="22" fill={hair} /><circle cx="110" cy="60" r="22" fill={hair} /></g>,
  ];
  // Eyes
  const eyes = [
    <g key="e"><circle cx="60" cy="90" r="5" fill="#3a2a1a" /><circle cx="100" cy="90" r="5" fill="#3a2a1a" /><circle cx="62" cy="88" r="1.5" fill="#fff" /><circle cx="102" cy="88" r="1.5" fill="#fff" /></g>,
    <g key="e" stroke="#3a2a1a" strokeWidth="3" fill="none" strokeLinecap="round"><path d="M54 90 Q60 84 66 90" /><path d="M94 90 Q100 84 106 90" /></g>,
    <g key="e"><ellipse cx="60" cy="90" rx="4" ry="6" fill="#3a2a1a" /><ellipse cx="100" cy="90" rx="4" ry="6" fill="#3a2a1a" /></g>,
    <g key="e" stroke="#3a2a1a" strokeWidth="3" fill="none" strokeLinecap="round"><path d="M54 92 L66 88" /><path d="M94 88 L106 92" /></g>,
  ];
  // Mouths
  const mouths = [
    <path key="m" d="M70 110 Q80 118 90 110" stroke="#a14a3a" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
    <ellipse key="m" cx="80" cy="112" rx="6" ry="4" fill="#a14a3a" />,
    <path key="m" d="M72 110 Q80 116 88 110 L88 113 Q80 118 72 113Z" fill="#a14a3a" />,
    <path key="m" d="M74 112 L86 112" stroke="#a14a3a" strokeWidth="2.5" strokeLinecap="round" />,
  ];
  // Accessories
  const accessories = [
    null,
    <g key="a"><rect x="46" y="84" width="24" height="14" rx="6" fill="none" stroke="#3a2a1a" strokeWidth="2.5" /><rect x="90" y="84" width="24" height="14" rx="6" fill="none" stroke="#3a2a1a" strokeWidth="2.5" /><path d="M70 91 L90 91" stroke="#3a2a1a" strokeWidth="2.5" /></g>,
    <g key="a"><path d="M55 50 L80 30 L105 50 Z" fill="#ff7e94" /><circle cx="80" cy="42" r="4" fill="#fff" /></g>,
    <circle key="a" cx="120" cy="100" r="6" fill="#ffd76a" stroke="#3a2a1a" strokeWidth="1.5" />,
  ];

  return (
    <svg viewBox="0 0 160 200" width={size} height={size} className="block">
      <rect width="160" height="200" rx="24" fill={bg} />
      {/* Body / outfit */}
      <path d="M30 200 Q30 160 60 150 L100 150 Q130 160 130 200 Z" fill={outfit} />
      {/* Head */}
      <circle cx="80" cy="95" r="42" fill={skin} />
      {/* Ears */}
      <circle cx="38" cy="100" r="6" fill={skin} />
      <circle cx="122" cy="100" r="6" fill={skin} />
      {/* Hair */}
      {hairShapes[c.hair % hairShapes.length]}
      {/* Cheeks */}
      <circle cx="55" cy="105" r="5" fill="#ffb0b0" opacity="0.55" />
      <circle cx="105" cy="105" r="5" fill="#ffb0b0" opacity="0.55" />
      {/* Eyes */}
      {eyes[c.eyes % eyes.length]}
      {/* Mouth */}
      {mouths[c.mouth % mouths.length]}
      {/* Accessory */}
      {accessories[c.accessory % accessories.length]}
    </svg>
  );
}

export const AVATAR_OPTIONS = {
  hair: 4, eyes: 4, mouth: 4, outfit: 4, accessory: 4, bg: 5, skin: 4,
} as const;
