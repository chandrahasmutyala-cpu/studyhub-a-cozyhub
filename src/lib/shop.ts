import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/useProfile";
import { toast } from "sonner";

import wpCozyBedroom from "@/assets/wp/cozy-bedroom.jpg";
import wpJapaneseShrine from "@/assets/wp/japanese-shrine.jpg";
import wpRainyCafe from "@/assets/wp/rainy-cafe.jpg";
import wpSakuraStreet from "@/assets/wp/sakura-street.jpg";
import wpKyotoEvening from "@/assets/wp/kyoto-evening.jpg";
import wpTokyoNight from "@/assets/wp/tokyo-night.jpg";
import wpTatamiRoom from "@/assets/wp/tatami-room.jpg";
import wpAnimeLibrary from "@/assets/wp/anime-library.jpg";
import wpPixelCity from "@/assets/wp/pixel-city.jpg";
import wpMountainCabin from "@/assets/wp/mountain-cabin.jpg";
import wpMoonlitStudy from "@/assets/wp/moonlit-study.jpg";
import wpSunsetClassroom from "@/assets/wp/sunset-classroom.jpg";
import wpFantasyAcademy from "@/assets/wp/fantasy-academy.jpg";
import wpLofiBedroom from "@/assets/wp/lofi-bedroom.jpg";
import wpSakuraPark from "@/assets/wp/sakura-park.jpg";
import wpBambooForest from "@/assets/wp/bamboo-forest.jpg";
import wpTrainWindow from "@/assets/wp/train-window.jpg";
import wpOceanSunset from "@/assets/wp/ocean-sunset.jpg";
import wpSnowyVillage from "@/assets/wp/snowy-village.jpg";
import wpLanternFestival from "@/assets/wp/lantern-festival.jpg";

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

/** Custom uploaded wallpaper sentinel id. */
export const CUSTOM_WALLPAPER_ID = "wp-custom";
export const DEFAULT_WALLPAPER_ID = "wp-minimal";

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: DEFAULT_WALLPAPER_ID,
    name: "Minimal Workspace",
    description: "Clean, distraction-free focus canvas.",
    category: "wallpapers",
    price: 0,
    free: true,
    swatch: "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--card)) 100%)",
  },

  // --- Anime-inspired study wallpapers (original artwork) ---
  { id: "wp-cozy-bedroom", name: "Cozy Anime Bedroom", description: "Warm lamp, open books, city lights outside.", category: "wallpapers", price: 0, free: true, image: wpCozyBedroom },
  { id: "wp-lofi-bedroom", name: "Lo-fi Bedroom", description: "Records, plants and string lights.", category: "wallpapers", price: 0, free: true, image: wpLofiBedroom },
  { id: "wp-rainy-cafe", name: "Rainy Café", description: "Rain on the glass, coffee steaming.", category: "wallpapers", price: 100, image: wpRainyCafe },
  { id: "wp-sakura-street", name: "Cherry Blossom Street", description: "Petals drifting down a quiet lane.", category: "wallpapers", price: 100, image: wpSakuraStreet },
  { id: "wp-sakura-park", name: "Sakura Park", description: "Blossoms mirrored in a still pond.", category: "wallpapers", price: 100, image: wpSakuraPark },
  { id: "wp-tatami-room", name: "Traditional Japanese Room", description: "Tatami, shoji screens, garden light.", category: "wallpapers", price: 120, image: wpTatamiRoom },
  { id: "wp-japanese-shrine", name: "Japanese Shrine", description: "Torii gate under autumn maples.", category: "wallpapers", price: 120, image: wpJapaneseShrine },
  { id: "wp-bamboo-forest", name: "Bamboo Forest", description: "Green light through tall stalks.", category: "wallpapers", price: 120, image: wpBambooForest },
  { id: "wp-sunset-classroom", name: "Sunset Classroom", description: "Golden hour on empty desks.", category: "wallpapers", price: 130, image: wpSunsetClassroom },
  { id: "wp-train-window", name: "Train Window", description: "Countryside rolling by at dusk.", category: "wallpapers", price: 130, image: wpTrainWindow },
  { id: "wp-ocean-sunset", name: "Ocean Sunset", description: "Waves under an orange sky.", category: "wallpapers", price: 130, image: wpOceanSunset },
  { id: "wp-mountain-cabin", name: "Mountain Cabin", description: "Fire in the hearth, snow outside.", category: "wallpapers", price: 150, image: wpMountainCabin },
  { id: "wp-snowy-village", name: "Snowy Village", description: "Warm windows in falling snow.", category: "wallpapers", price: 150, image: wpSnowyVillage },
  { id: "wp-anime-library", name: "Anime Library", description: "Tall shelves and one long sunbeam.", category: "wallpapers", price: 150, image: wpAnimeLibrary },
  { id: "wp-moonlit-study", name: "Moonlit Study Room", description: "A huge moon over a quiet desk.", category: "wallpapers", price: 160, image: wpMoonlitStudy },
  { id: "wp-kyoto-evening", name: "Kyoto Evening", description: "Lanterns glowing along old machiya.", category: "wallpapers", price: 170, image: wpKyotoEvening },
  { id: "wp-tokyo-night", name: "Tokyo Night", description: "Neon skyline under a starry sky.", category: "wallpapers", price: 170, image: wpTokyoNight },
  { id: "wp-lantern-festival", name: "Lantern Festival", description: "A river of floating paper lanterns.", category: "wallpapers", price: 180, image: wpLanternFestival },
  { id: "wp-fantasy-academy", name: "Fantasy Academy", description: "A magic school on a lantern-lit hill.", category: "wallpapers", price: 180, image: wpFantasyAcademy },
  { id: "wp-pixel-city", name: "Pixel City", description: "16-bit rooftops at dusk.", category: "wallpapers", price: 110, image: wpPixelCity },

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

export function wallpaperById(id: string | null | undefined) {
  return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0]!;
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
      const { data, error } = await supabase
        .from("shop_purchases")
        .select("item_id,price,created_at")
        .order("created_at", { ascending: false });
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
      if (!user) throw new Error("You need to be signed in to buy this.");
      // Read the freshest coin balance so a stale cache can never over-spend.
      const { data: fresh, error: readErr } = await supabase
        .from("profiles").select("coins").eq("id", user.id).maybeSingle();
      if (readErr) throw readErr;
      const coins = fresh?.coins ?? 0;
      if (coins < item.price) throw new Error("Not enough Study Coins yet.");
      const { error } = await supabase
        .from("shop_purchases")
        .insert({ user_id: user.id, item_id: item.id, price: item.price });
      if (error) throw error;
      await update.mutateAsync({ coins: coins - item.price });
      return item;
    },
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: ["shop", "purchases"] });
      toast.success(`${item.name} unlocked.`);
    },
    onError: (e: Error) => toast.error(e.message || "Purchase failed"),
  });

  return {
    coins: profile?.coins ?? 0,
    purchases: purchasesQ.data ?? [],
    isLoading: purchasesQ.isLoading,
    error: purchasesQ.error,
    owned: (id: string) => ownedIds.has(id),
    ownedIds,
    buy,
    selectedWallpaper: profile?.selected_wallpaper ?? DEFAULT_WALLPAPER_ID,
    setWallpaper: (id: string) => {
      wallpaperPrefs.pushRecent(id);
      update.mutate({ selected_wallpaper: id });
    },
  };
}

/**
 * Resolves the wallpaper that should render behind Focus mode, including a
 * user-uploaded custom wallpaper (stored privately in the `wallpapers` bucket).
 */
export function useActiveWallpaper() {
  const { profile } = useProfile();
  const selected = profile?.selected_wallpaper ?? DEFAULT_WALLPAPER_ID;
  const customPath = profile?.custom_wallpaper_url ?? null;

  const signed = useQuery({
    queryKey: ["wallpaper", "signed", customPath],
    enabled: Boolean(customPath) && selected === CUSTOM_WALLPAPER_ID,
    staleTime: 45 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("wallpapers")
        .createSignedUrl(customPath!, 60 * 60);
      if (error) throw error;
      return data?.signedUrl ?? null;
    },
  });

  if (selected === CUSTOM_WALLPAPER_ID && customPath) {
    return { id: CUSTOM_WALLPAPER_ID, name: "Your wallpaper", url: signed.data ?? null, isCustom: true as const };
  }
  const item = wallpaperById(selected);
  return { id: item.id, name: item.name, url: item.image ?? null, isCustom: false as const };
}

/** Upload / remove a personal wallpaper. */
export function useCustomWallpaper() {
  const { profile, update } = useProfile();
  const qc = useQueryClient();

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You need to be signed in.");
      if (!file.type.startsWith("image/")) throw new Error("Please pick an image file.");
      if (file.size > 8 * 1024 * 1024) throw new Error("Image must be under 8MB.");
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/wallpaper-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("wallpapers")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const previous = profile?.custom_wallpaper_url;
      await update.mutateAsync({ custom_wallpaper_url: path, selected_wallpaper: CUSTOM_WALLPAPER_ID });
      if (previous && previous !== path) {
        await supabase.storage.from("wallpapers").remove([previous]);
      }
      return path;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallpaper"] });
      toast.success("Wallpaper uploaded.");
    },
    onError: (e: Error) => toast.error(e.message || "Upload failed"),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const path = profile?.custom_wallpaper_url;
      if (!path) return;
      await supabase.storage.from("wallpapers").remove([path]);
      await update.mutateAsync({ custom_wallpaper_url: null, selected_wallpaper: DEFAULT_WALLPAPER_ID });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallpaper"] });
      toast.success("Custom wallpaper removed.");
    },
    onError: (e: Error) => toast.error(e.message || "Could not remove wallpaper"),
  });

  return { path: profile?.custom_wallpaper_url ?? null, upload, remove };
}
