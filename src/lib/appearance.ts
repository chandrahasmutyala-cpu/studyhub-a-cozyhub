import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

/* ------------------------------------------------------------------ */
/* Palettes — full re-skin (surfaces + accent)                         */
/* ------------------------------------------------------------------ */

export type PaletteVars = Record<string, string>;
export type Palette = {
  id: string;
  name: string;
  mode: "light" | "dark";
  swatch: string[];
  vars: PaletteVars;
};

function light(hue: number, chroma: number, opts?: { bgHue?: number; bgChroma?: number }): PaletteVars {
  const bh = opts?.bgHue ?? hue;
  const bc = opts?.bgChroma ?? 0.012;
  return {
    "--background": `oklch(0.972 ${bc} ${bh})`,
    "--foreground": `oklch(0.26 0.02 ${bh})`,
    "--card": `oklch(0.995 ${bc * 0.5} ${bh})`,
    "--card-foreground": `oklch(0.26 0.02 ${bh})`,
    "--popover": `oklch(0.995 ${bc * 0.5} ${bh})`,
    "--popover-foreground": `oklch(0.26 0.02 ${bh})`,
    "--primary": `oklch(0.56 ${chroma} ${hue})`,
    "--primary-foreground": `oklch(0.99 0.005 ${hue})`,
    "--secondary": `oklch(0.92 ${Math.min(chroma * 0.4, 0.05)} ${hue})`,
    "--secondary-foreground": `oklch(0.26 0.02 ${bh})`,
    "--muted": `oklch(0.94 ${bc * 1.4} ${bh})`,
    "--muted-foreground": `oklch(0.48 0.02 ${bh})`,
    "--accent": `oklch(0.86 ${Math.min(chroma * 0.6, 0.07)} ${hue})`,
    "--accent-foreground": `oklch(0.26 0.02 ${bh})`,
    "--border": `oklch(0.30 0.02 ${bh} / 0.10)`,
    "--input": `oklch(0.30 0.02 ${bh} / 0.14)`,
    "--ring": `oklch(0.56 ${chroma} ${hue})`,
    "--sidebar": `oklch(0.995 ${bc * 0.5} ${bh})`,
    "--sidebar-foreground": `oklch(0.26 0.02 ${bh})`,
    "--sidebar-primary": `oklch(0.56 ${chroma} ${hue})`,
    "--sidebar-primary-foreground": `oklch(0.99 0.005 ${hue})`,
    "--sidebar-accent": `oklch(0.945 ${Math.min(chroma * 0.35, 0.04)} ${hue})`,
    "--sidebar-accent-foreground": `oklch(0.26 0.02 ${bh})`,
    "--sidebar-border": `oklch(0.30 0.02 ${bh} / 0.10)`,
    "--sidebar-ring": `oklch(0.56 ${chroma} ${hue})`,
    "--glass-tint": "255 255 255",
  };
}

function dark(hue: number, chroma: number, opts?: { bgHue?: number; bgL?: number }): PaletteVars {
  const bh = opts?.bgHue ?? hue;
  const bl = opts?.bgL ?? 0.19;
  return {
    "--background": `oklch(${bl} 0.022 ${bh})`,
    "--foreground": `oklch(0.95 0.01 ${bh})`,
    "--card": `oklch(${bl + 0.045} 0.024 ${bh})`,
    "--card-foreground": `oklch(0.95 0.01 ${bh})`,
    "--popover": `oklch(${bl + 0.045} 0.024 ${bh})`,
    "--popover-foreground": `oklch(0.95 0.01 ${bh})`,
    "--primary": `oklch(0.78 ${chroma} ${hue})`,
    "--primary-foreground": `oklch(0.18 0.02 ${hue})`,
    "--secondary": `oklch(${bl + 0.09} 0.03 ${bh})`,
    "--secondary-foreground": `oklch(0.95 0.01 ${bh})`,
    "--muted": `oklch(${bl + 0.07} 0.02 ${bh})`,
    "--muted-foreground": `oklch(0.72 0.02 ${bh})`,
    "--accent": `oklch(${bl + 0.12} ${Math.min(chroma * 0.5, 0.08)} ${hue})`,
    "--accent-foreground": `oklch(0.95 0.01 ${bh})`,
    "--border": `oklch(0.95 0.01 ${bh} / 0.14)`,
    "--input": `oklch(0.95 0.01 ${bh} / 0.18)`,
    "--ring": `oklch(0.78 ${chroma} ${hue})`,
    "--sidebar": `oklch(${bl + 0.03} 0.024 ${bh})`,
    "--sidebar-foreground": `oklch(0.95 0.01 ${bh})`,
    "--sidebar-primary": `oklch(0.78 ${chroma} ${hue})`,
    "--sidebar-primary-foreground": `oklch(0.18 0.02 ${hue})`,
    "--sidebar-accent": `oklch(${bl + 0.08} 0.03 ${bh})`,
    "--sidebar-accent-foreground": `oklch(0.95 0.01 ${bh})`,
    "--sidebar-border": `oklch(0.95 0.01 ${bh} / 0.14)`,
    "--sidebar-ring": `oklch(0.78 ${chroma} ${hue})`,
    "--glass-tint": "12 14 20",
  };
}

const P = (
  id: string,
  name: string,
  mode: "light" | "dark",
  vars: PaletteVars,
  swatch: string[],
): Palette => ({ id, name, mode, vars, swatch });

export const PALETTES: Palette[] = [
  P("neutral", "Neutral", "light", light(250, 0.03, { bgChroma: 0.004 }), ["#f7f7f8", "#d7d9de", "#5c6068"]),
  P("matcha", "Matcha", "light", light(145, 0.08, { bgHue: 130 }), ["#f2f6ee", "#c3ddb8", "#4e7d52"]),
  P("sakura", "Sakura", "light", light(5, 0.09, { bgHue: 20 }), ["#fdf1f2", "#f7c9d2", "#b5546c"]),
  P("lavender", "Lavender", "light", light(295, 0.09, { bgHue: 290 }), ["#f5f1fb", "#d8cbf0", "#6e5aa8"]),
  P("ocean", "Ocean", "light", light(232, 0.11, { bgHue: 225 }), ["#eef4fb", "#bfd6f0", "#2f6fae"]),
  P("midnight", "Midnight", "dark", dark(255, 0.11, { bgL: 0.17 }), ["#12141c", "#242a3a", "#93a8ff"]),
  P("forest", "Forest", "dark", dark(155, 0.09, { bgL: 0.18 }), ["#121a17", "#1f2e28", "#8fd6ac"]),
  P("sand", "Sand", "light", light(70, 0.06, { bgHue: 78, bgChroma: 0.018 }), ["#f8f3e8", "#e4d5b8", "#8a7040"]),
  P("cream", "Cream", "light", light(90, 0.05, { bgHue: 92, bgChroma: 0.014 }), ["#f7f2e9", "#e6dcc9", "#8a7a56"]),
  P("coffee", "Coffee", "light", light(45, 0.07, { bgHue: 55, bgChroma: 0.016 }), ["#f5efe8", "#dcc7b0", "#7a4f30"]),
  P("mint", "Mint", "light", light(165, 0.08, { bgHue: 168 }), ["#eefaf5", "#bfe9d8", "#2f8a72"]),
  P("iceblue", "Ice Blue", "light", light(215, 0.07, { bgHue: 218 }), ["#f0f6fb", "#cbe2f2", "#39769f"]),
  P("coral", "Coral", "light", light(30, 0.12, { bgHue: 32 }), ["#fdf1ec", "#fac9b4", "#c65a34"]),
  P("peach", "Peach", "light", light(45, 0.10, { bgHue: 48 }), ["#fdf3ea", "#fadcbf", "#c07c39"]),
  P("slate", "Slate", "light", light(245, 0.045, { bgHue: 245, bgChroma: 0.008 }), ["#f3f5f8", "#ccd3de", "#4d5a6e"]),
  P("emerald", "Emerald", "light", light(160, 0.12, { bgHue: 158 }), ["#eefaf3", "#b6e6cd", "#12795a"]),
  P("indigo", "Indigo", "light", light(275, 0.13, { bgHue: 272 }), ["#f2f1fd", "#cbc7f5", "#4b45b8"]),
  P("rose", "Rose", "light", light(15, 0.11, { bgHue: 18 }), ["#fdf1f3", "#f7c8cf", "#b34a5e"]),
  P("cherry", "Cherry Blossom", "light", light(350, 0.08, { bgHue: 350 }), ["#fdf2f6", "#f6ccdd", "#ac5379"]),
  P("golden", "Golden Hour", "light", light(75, 0.12, { bgHue: 70 }), ["#fbf4e4", "#f2dba4", "#9a7413"]),
  P("mono", "Monochrome", "light", light(0, 0.0, { bgChroma: 0 }), ["#f6f6f6", "#d4d4d4", "#2b2b2b"]),
  P("paper", "Paper White", "light", light(95, 0.02, { bgHue: 95, bgChroma: 0.006 }), ["#fbfaf6", "#e7e5dc", "#5c5a52"]),
  P("softgray", "Soft Gray", "light", light(250, 0.02, { bgChroma: 0.005 }), ["#f4f4f6", "#dcdde1", "#55575e"]),
  P("sunset", "Sunset", "light", light(25, 0.13, { bgHue: 35 }), ["#fdf1e9", "#f9c9a8", "#c25330"]),
  P("aurora", "Aurora", "dark", dark(180, 0.12, { bgL: 0.18, bgHue: 250 }), ["#101725", "#1b2a3c", "#6ce7d4"]),
  P("mocha", "Mocha", "dark", dark(50, 0.07, { bgL: 0.19, bgHue: 40 }), ["#1b1613", "#2b231e", "#e0b98f"]),
  P("nord", "Nord", "dark", dark(225, 0.07, { bgL: 0.24, bgHue: 235 }), ["#2e3440", "#3b4252", "#88c0d0"]),
  P("cybermint", "Cyber Mint", "dark", dark(170, 0.15, { bgL: 0.16, bgHue: 200 }), ["#0c1618", "#15292c", "#4ffbc8"]),
  P("pixelgreen", "Pixel Green", "dark", dark(140, 0.16, { bgL: 0.15, bgHue: 150 }), ["#0b1410", "#16281d", "#5cf08a"]),
  P("tokyonight", "Tokyo Night", "dark", dark(280, 0.13, { bgL: 0.18, bgHue: 265 }), ["#1a1b26", "#24283b", "#bb9af7"]),
];

export function paletteById(id: string | undefined | null) {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

/* ------------------------------------------------------------------ */
/* Layouts                                                             */
/* ------------------------------------------------------------------ */

export type LayoutId =
  | "apple" | "cozy" | "bento" | "notion" | "arc"
  | "pixel" | "glass" | "material" | "magazine" | "dashboard";

export type LayoutPreset = {
  id: LayoutId;
  name: string;
  blurb: string;
  vars: Record<string, string>;
};

export const LAYOUTS: LayoutPreset[] = [
  { id: "apple", name: "Apple Minimal", blurb: "Generous whitespace, soft cards, quiet type.", vars: { "--radius": "1rem", "--layout-density": "1", "--layout-card-border": "1px", "--layout-shadow": "0 24px 50px -34px rgb(15 23 42 / 0.25)" } },
  { id: "cozy", name: "Japanese Cozy", blurb: "Warm paper surfaces, thin rules, calm rhythm.", vars: { "--radius": "1.4rem", "--layout-density": "1.1", "--layout-card-border": "1px", "--layout-shadow": "0 18px 40px -30px rgb(60 40 20 / 0.35)" } },
  { id: "bento", name: "Bento", blurb: "Asymmetric tiles, strong grid, compact.", vars: { "--radius": "1.25rem", "--layout-density": "0.9", "--layout-card-border": "1px", "--layout-shadow": "0 20px 44px -32px rgb(15 23 42 / 0.3)" } },
  { id: "notion", name: "Notion", blurb: "Flat, document-like, borderless blocks.", vars: { "--radius": "0.5rem", "--layout-density": "0.95", "--layout-card-border": "0px", "--layout-shadow": "none" } },
  { id: "arc", name: "Arc Browser", blurb: "Rounded chrome, colourful sidebar, floaty.", vars: { "--radius": "1.6rem", "--layout-density": "1", "--layout-card-border": "1px", "--layout-shadow": "0 30px 60px -34px rgb(40 20 80 / 0.35)" } },
  { id: "pixel", name: "Pixel UI", blurb: "Hard corners, crisp 2px outlines, retro.", vars: { "--radius": "0.15rem", "--layout-density": "0.85", "--layout-card-border": "2px", "--layout-shadow": "4px 4px 0 0 rgb(0 0 0 / 0.12)" } },
  { id: "glass", name: "Glassmorphism", blurb: "Frosted panels floating over the wallpaper.", vars: { "--radius": "1.5rem", "--layout-density": "1", "--layout-card-border": "1px", "--layout-shadow": "0 24px 60px -28px rgb(20 30 60 / 0.4)" } },
  { id: "material", name: "Material Minimal", blurb: "Elevation, medium radius, clear affordances.", vars: { "--radius": "0.75rem", "--layout-density": "0.95", "--layout-card-border": "0px", "--layout-shadow": "0 6px 16px -6px rgb(0 0 0 / 0.24)" } },
  { id: "magazine", name: "Magazine", blurb: "Editorial spacing, big headings, rules.", vars: { "--radius": "0.35rem", "--layout-density": "1.15", "--layout-card-border": "1px", "--layout-shadow": "none" } },
  { id: "dashboard", name: "Modern Dashboard", blurb: "Dense data cards, tight gutters.", vars: { "--radius": "0.85rem", "--layout-density": "0.8", "--layout-card-border": "1px", "--layout-shadow": "0 12px 30px -24px rgb(15 23 42 / 0.4)" } },
];

export function layoutById(id: string | undefined | null) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

/* ------------------------------------------------------------------ */
/* Appearance settings store                                           */
/* ------------------------------------------------------------------ */

export type Appearance = {
  palette: string;
  layout: LayoutId;
  wallpaperBlur: number;      // px
  wallpaperOpacity: number;   // 0-100
  wallpaperBrightness: number;// 40-140
  cardTransparency: number;   // 0-100 (0 = solid)
  glass: boolean;
  radius: number;             // rem * 100
  fontSize: number;           // %
  animationSpeed: number;     // %
  reducedMotion: boolean;
};

export const DEFAULT_APPEARANCE: Appearance = {
  palette: "matcha",
  layout: "apple",
  wallpaperBlur: 0,
  wallpaperOpacity: 100,
  wallpaperBrightness: 100,
  cardTransparency: 0,
  glass: true,
  radius: 100,
  fontSize: 100,
  animationSpeed: 100,
  reducedMotion: false,
};

const KEY = "studyhub-appearance-v2";
let state: Appearance = DEFAULT_APPEARANCE;
const listeners = new Set<() => void>();

function emit() { listeners.forEach((l) => l()); }

export function readLocalAppearance(): Appearance {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_APPEARANCE, ...(JSON.parse(raw) as Partial<Appearance>) } : DEFAULT_APPEARANCE;
  } catch { return DEFAULT_APPEARANCE; }
}

export const appearanceStore = {
  get: () => state,
  subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
  hydrate(next: Partial<Appearance>) {
    state = { ...state, ...next };
    apply(state);
    emit();
  },
  set(patch: Partial<Appearance>, persist = true) {
    state = { ...state, ...patch };
    apply(state);
    emit();
    if (typeof window !== "undefined") {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
    }
    if (persist) void persistRemote(state);
  },
  reset() { appearanceStore.set(DEFAULT_APPEARANCE); },
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;
async function persistRemote(next: Appearance) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("profiles").update({ appearance: next } as never).eq("id", user.id);
    } catch { /* offline is fine — localStorage keeps it */ }
  }, 700);
}

/** Write every appearance token onto <html>. */
export function apply(a: Appearance) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const pal = paletteById(a.palette);
  Object.entries(pal.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.classList.toggle("dark", pal.mode === "dark");

  const lay = layoutById(a.layout);
  Object.entries(lay.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.dataset["layout"] = lay.id;

  root.style.setProperty("--radius", `${(a.radius / 100) * parseFloat(lay.vars["--radius"] ?? "1")}rem`);
  root.style.setProperty("--wallpaper-blur", `${a.wallpaperBlur}px`);
  root.style.setProperty("--wallpaper-opacity", String(a.wallpaperOpacity / 100));
  root.style.setProperty("--wallpaper-brightness", String(a.wallpaperBrightness / 100));
  root.style.setProperty("--card-alpha", String(1 - a.cardTransparency / 100));
  root.style.setProperty("--glass-blur", a.glass ? "20px" : "0px");
  root.style.setProperty("--app-font-scale", String(a.fontSize / 100));
  root.style.setProperty("--motion-scale", a.reducedMotion ? "0" : String(a.animationSpeed / 100));
  root.classList.toggle("reduce-motion", a.reducedMotion);
}

export function useAppearance(): Appearance {
  return useSyncExternalStore(appearanceStore.subscribe, appearanceStore.get, () => DEFAULT_APPEARANCE);
}

/** Mount once (AppShell): hydrate from localStorage then the user's profile. */
export function useAppearanceSync(remote?: Partial<Appearance> | null) {
  useEffect(() => { appearanceStore.hydrate(readLocalAppearance()); }, []);
  useEffect(() => {
    if (remote && Object.keys(remote).length > 0) appearanceStore.hydrate(remote);
  }, [remote]);
}
