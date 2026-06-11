import capybara from "@/assets/pet-capybara.png";
import cat from "@/assets/pet-cat.png";
import shiba from "@/assets/pet-shiba.png";
import rabbit from "@/assets/pet-rabbit.png";
import bear from "@/assets/pet-bear.png";
import redpanda from "@/assets/pet-redpanda.png";

export type PetId = "capybara" | "cat" | "shiba" | "rabbit" | "bear" | "redpanda";

export const PETS: { id: PetId; name: string; image: string; blurb: string }[] = [
  { id: "capybara", name: "Mochi the Capybara", image: capybara, blurb: "Calm, patient, loves long study sessions." },
  { id: "cat", name: "Yuzu the Cat", image: cat, blurb: "Naps when you focus, purrs when you finish." },
  { id: "shiba", name: "Hina the Shiba", image: shiba, blurb: "Cheerful, will absolutely cheer your streak." },
  { id: "rabbit", name: "Suki the Rabbit", image: rabbit, blurb: "Quick on flashcards, soft on bad days." },
  { id: "bear", name: "Kuma the Bear", image: bear, blurb: "Cozy companion for late-night reading." },
  { id: "redpanda", name: "Momo the Red Panda", image: redpanda, blurb: "Playful, curious, loves new languages." },
];

export const getPet = (id?: string | null) =>
  PETS.find((p) => p.id === (id as PetId)) ?? PETS[0];

export type ThemeId = "peach" | "matcha" | "lavender" | "honey";
export const THEMES: { id: ThemeId; name: string; swatch: string }[] = [
  { id: "peach", name: "Peach Sorbet", swatch: "#ffd5c2" },
  { id: "matcha", name: "Matcha Latte", swatch: "#d1e8d1" },
  { id: "lavender", name: "Lavender Mist", swatch: "#e6e6fa" },
  { id: "honey", name: "Honey Sun", swatch: "#fbe7a1" },
];
