export type ThemeId =
  | "peach" | "matcha" | "lavender" | "honey" | "sky"
  | "sakura" | "ocean" | "midnight" | "burgundy" | "crimson"
  | "forest" | "citrus" | "mono" | "paper" | "cyber";

export const THEMES: { id: ThemeId; name: string; swatch: string; mood: string }[] = [
  { id: "peach", name: "Peach Sorbet", swatch: "#ffd5c2", mood: "Warm and gentle" },
  { id: "matcha", name: "Matcha Latte", swatch: "#d1e8d1", mood: "Calm and grounded" },
  { id: "lavender", name: "Lavender Mist", swatch: "#e6e6fa", mood: "Quiet and thoughtful" },
  { id: "honey", name: "Honey Sun", swatch: "#fbe7a1", mood: "Bright and optimistic" },
  { id: "sky", name: "Open Sky", swatch: "#b9ddf5", mood: "Clear and airy" },
  { id: "sakura", name: "Sakura", swatch: "#f6c7d8", mood: "Soft and poetic" },
  { id: "ocean", name: "Blue Hour", swatch: "#9ec7dc", mood: "Focused and cool" },
  { id: "midnight", name: "Midnight Study", swatch: "#29324d", mood: "Deep and immersive" },
  { id: "burgundy", name: "Burgundy Ink", swatch: "#672c3b", mood: "Rich and cinematic" },
  { id: "crimson", name: "Crimson Focus", swatch: "#a33d4d", mood: "Bold and energetic" },
  { id: "forest", name: "Forest Desk", swatch: "#52735e", mood: "Natural and steady" },
  { id: "citrus", name: "Citrus Note", swatch: "#d8b84f", mood: "Fresh and lively" },
  { id: "mono", name: "Monochrome", swatch: "#55585f", mood: "Minimal and precise" },
  { id: "paper", name: "Paper White", swatch: "#c9bca8", mood: "Editorial and quiet" },
  { id: "cyber", name: "Neon Desk", swatch: "#54b8b0", mood: "Modern and playful" },
];
