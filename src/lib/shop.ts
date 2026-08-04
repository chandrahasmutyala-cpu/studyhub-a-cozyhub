import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/useProfile";
import { toast } from "sonner";

import wpJapaneseRoom from "@/assets/wp-japanese-room.jpg";
import wpRainyCafe from "@/assets/wp-rainy-cafe.jpg";
import wpLibrary from "@/assets/wp-library.jpg";
import wpForestCabin from "@/assets/wp-forest-cabin.jpg";
import wpNightCity from "@/assets/wp-night-city.jpg";
import wpSakura from "@/assets/wp-sakura.jpg";

export type ShopCategory = "wallpapers" | "themes" | "decor" | "badges";

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  price: number;
  /** wallpaper image (wallpapers only) */
  image?: string;
  /** preview swatch for non-image items */
  swatch?: string;
  free?: boolean;
};

export const CATEGORY_LABELS: Record<ShopCategory, string> = {
  wallpapers: "Focus wallpapers",
  themes: "Planner themes",
  decor: "Desk decorations",
  badges: "Badges",
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "wp-minimal",
    name: "Minimal Workspace",
    description: "Clean, distraction-free focus canvas.",
    category: "wallpapers",
    price: 0,
    free: true,
    swatch: "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--card)) 100%)",
  },
  { id: "wp-japanese-room", name: "Japanese Study Room", description: "Pixel-art tatami room, lamp on, night outside.", category: "wallpapers", price: 120, image: wpJapaneseRoom },
  { id: "wp-rainy-cafe", name: "Rainy Café", description: "Warm lights, rain on the window, coffee steaming.", category: "wallpapers", price: 120, image: wpRainyCafe },
  { id: "wp-library", name: "Old Library", description: "Tall shelves and a single beam of daylight.", category: "wallpapers", price: 150, image: wpLibrary },
  { id: "wp-forest-cabin", name: "Forest Cabin", description: "Pines through the glass, fire in the hearth.", category: "wallpapers", price: 150, image: wpForestCabin },
  { id: "wp-night-city", name: "Night City", description: "Neon skyline from a quiet desk.", category: "wallpapers", price: 180, image: wpNightCity },
  { id: "wp-sakura", name: "Sakura Garden", description: "Cherry blossom study nook in full bloom.", category: "wallpapers", price: 180, image: wpSakura },

  { id: "theme-sage", name: "Sage Planner", description: "Soft green planner accents.", category: "themes", price: 90, swatch: "linear-gradient(135deg,#a8c0a0,#7d9b76)" },
  { id: "theme-sky", name: "Sky Planner", description: "Light blue planner accents.", category: "themes", price: 90, swatch: "linear-gradient(135deg,#b8d4e8,#6ba3c8)" },
  { id: "theme-sakura", name: "Sakura Planner", description: "Pastel pink planner accents.", category: "themes", price: 110, swatch: "linear-gradient(135deg,#f8c8d8,#e88aab)" },
  { id: "theme-ink", name: "Ink Planner", description: "High-contrast monochrome planner.", category: "themes", price: 110, swatch: "linear-gradient(135deg,#2d2d2d,#0d0d0d)" },

  { id: "decor-lamp", name: "Desk Lamp", description: "A warm glow for your study desk.", category: "decor", price: 60, swatch: "linear-gradient(135deg,#f7d488,#e8a94a)" },
  { id: "decor-plant", name: "Small Plant", description: "Low maintenance, high morale.", category: "decor", price: 60, swatch: "linear-gradient(135deg,#9fd6a5,#4f8f5c)" },
  { id: "decor-cassette", name: "Cassette Deck", description: "Retro decoration for the desk shelf.", category: "decor", price: 80, swatch: "linear-gradient(135deg,#c9c2b8,#7c756c)" },
  { id: "decor-cat", name: "Sleeping Cat", description: "Curled up beside your notes.", category: "decor", price: 100, swatch: "linear-gradient(135deg,#e3c7a5,#a67c52)" },

  { id: "badge-earlybird", name: "Early Bird", description: "Show off your morning sessions.", category: "badges", price: 70, swatch: "linear-gradient(135deg,#ffe6a7,#f2a65a)" },
  { id: "badge-nightowl", name: "Night Owl", description: "For the late-night grinders.", category: "badges", price: 70, swatch: "linear-gradient(135deg,#5b6ee1,#1d2b64)" },
  { id: "badge-scholar", name: "Scholar", description: "A quiet mark of consistency.", category: "badges", price: 130, swatch: "linear-gradient(135deg,#c9a84c,#8a6d16)" },
];

export const WALLPAPERS = SHOP_ITEMS.filter((i) => i.category === "wallpapers");
export const DEFAULT_WALLPAPER_ID = "wp-minimal";

export function wallpaperById(id: string | null | undefined) {
  return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
}

const FAV_KEY = "studyhub-wallpaper-favs-v1";
const RECENT_KEY = "studyhub-wallpaper-recent-v1";

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) ?? "[]") as string[]; } catch { return []; }
}
function writeList(key: string, v: string[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ }
}

export const wallpaperPrefs = {
  favorites: () => readList(FAV_KEY),
  toggleFavorite(id: string) {
    const cur = readList(FAV_KEY);
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    writeList(FAV_KEY, next);
    return next;
  },
  recents: () => readList(RECENT_KEY),
  pushRecent(id: string) {
    const next = [id, ...readList(RECENT_KEY).filter((x) => x !== id)].slice(0, 8);
    writeList(RECENT_KEY, next);
    return next;
  },
};

export function useShop() {
  const qc = useQueryClient();
  const { profile, update } = useProfile();

  const purchasesQ = useQuery({
    queryKey: ["shop", "purchases"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shop_purchases").select("item_id,price,created_at").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const ownedIds = new Set([
    ...SHOP_ITEMS.filter((i) => i.free).map((i) => i.id),
    ...(purchasesQ.data ?? []).map((p) => p.item_id),
  ]);

  const buy = useMutation({
    mutationFn: async (item: ShopItem) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const coins = profile?.coins ?? 0;
      if (coins < item.price) throw new Error("Not enough Study Coins yet.");
      const { error } = await supabase.from("shop_purchases").insert({ user_id: user.id, item_id: item.id, price: item.price });
      if (error) throw error;
      await update.mutateAsync({ coins: coins - item.price });
      return item;
    },
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: ["shop", "purchases"] });
      toast.success(`${item.name} unlocked.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    coins: profile?.coins ?? 0,
    purchases: purchasesQ.data ?? [],
    isLoading: purchasesQ.isLoading,
    owned: (id: string) => ownedIds.has(id),
    ownedIds,
    buy,
    selectedWallpaper: (profile?.selected_wallpaper as string | null) ?? DEFAULT_WALLPAPER_ID,
    setWallpaper: (id: string) => {
      wallpaperPrefs.pushRecent(id);
      update.mutate({ selected_wallpaper: id } as never);
    },
  };
}
