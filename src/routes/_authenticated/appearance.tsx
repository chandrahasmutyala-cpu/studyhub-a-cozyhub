import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHero } from "@/components/PageHero";
import {
  PALETTES, LAYOUTS, appearanceStore, useAppearance, paletteById, layoutById,
} from "@/lib/appearance";
import { useProfile } from "@/lib/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Upload, RotateCcw, ImageIcon, Sparkles, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/appearance")({
  component: AppearancePage,
  head: () => ({
    meta: [
      { title: "Appearance — StudyHub" },
      { name: "description", content: "Choose from 10 UI layouts and 30 accent palettes, upload a custom or live wallpaper, and fine-tune blur, transparency and motion." },
      { property: "og:title", content: "Appearance — StudyHub" },
      { property: "og:description", content: "Make StudyHub yours: layouts, palettes, wallpapers and motion controls with live preview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-5 md:p-6">
      <div className="mb-4">
        <h2 className="font-display text-base font-bold">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Slider({ label, value, min, max, suffix, onChange }: {
  label: string; value: number; min: number; max: number; suffix?: string; onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between text-xs font-bold">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-2 accent-[var(--primary)]" />
    </label>
  );
}

/** Tiny wireframe that shows how a layout arranges content. */
function LayoutPreview({ id }: { id: string }) {
  const l = layoutById(id);
  const r = l.vars["--radius"] ?? "1rem";
  const box = (extra: string) => ({ borderRadius: r, border: `${l.vars["--layout-card-border"]} solid color-mix(in oklch, var(--border) 100%, transparent)`, className: extra });
  const b = box("").border;
  const common: React.CSSProperties = { borderRadius: r, border: b as string };
  return (
    <div className="aspect-[4/3] w-full bg-muted/50 p-2.5 grid gap-1.5"
      style={{ gridTemplateColumns: id === "dashboard" ? "1fr 1fr 1fr" : id === "magazine" ? "1fr" : "1.4fr 1fr", gridAutoRows: "minmax(0,1fr)" }}>
      <div style={{ ...common, background: "var(--primary)", gridColumn: id === "magazine" || id === "arc" ? "1 / -1" : undefined, opacity: 0.85 }} />
      <div style={{ ...common, background: "var(--card)" }} />
      <div style={{ ...common, background: "var(--card)" }} />
      <div style={{ ...common, background: "var(--accent)" }} />
      {id === "dashboard" && <div style={{ ...common, background: "var(--card)" }} />}
      {id === "bento" && <div style={{ ...common, background: "var(--card)", gridColumn: "1 / -1" }} />}
    </div>
  );
}

function AppearancePage() {
  const a = useAppearance();
  const { profile, update } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const customPath = (profile as unknown as { custom_wallpaper_url?: string | null })?.custom_wallpaper_url ?? null;

  // Pull saved appearance from the profile once it loads.
  const remote = (profile as unknown as { appearance?: Record<string, unknown> | null })?.appearance ?? null;
  useEffect(() => {
    if (remote && typeof remote === "object") appearanceStore.hydrate(remote as never);
  }, [remote]);

  async function onUpload(file: File) {
    if (file.size > 25 * 1024 * 1024) { toast.error("Keep it under 25 MB."); return; }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${user.id}/wallpaper-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("wallpapers").upload(path, file, { upsert: true });
      if (error) throw error;
      await update.mutateAsync({ custom_wallpaper_url: path } as never);
      toast.success("Wallpaper applied everywhere.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-5 pb-10 animate-fade-in">
        <PageHero
          eyebrow="StudyHub 2.0"
          title="Appearance"
          subtitle="Everything below previews instantly — the whole app re-skins as you tap."
          right={
            <button onClick={() => { appearanceStore.reset(); toast.success("Back to defaults."); }}
              className="shrink-0 rounded-full border border-border/60 bg-card/70 backdrop-blur px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5">
              <RotateCcw className="size-3.5 stroke-[1.75]" /> Reset
            </button>
          }
        />

        <Section title="Layout" hint="Ten ways to arrange StudyHub. Tap to apply.">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {LAYOUTS.map((l) => (
              <button key={l.id} onClick={() => appearanceStore.set({ layout: l.id })}
                className={`text-left rounded-2xl overflow-hidden border transition-all hover:-translate-y-[2px] ${
                  a.layout === l.id ? "border-primary ring-2 ring-primary/25" : "border-border/60"
                }`}>
                <LayoutPreview id={l.id} />
                <div className="p-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-sm font-bold truncate">{l.name}</span>
                    {a.layout === l.id && <Check className="size-3.5 stroke-[2.5] text-primary shrink-0" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{l.blurb}</p>
                </div>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Palette" hint="30 palettes. Each one re-tints surfaces, text and accents.">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {PALETTES.map((p) => (
              <button key={p.id} onClick={() => appearanceStore.set({ palette: p.id })}
                className={`rounded-2xl border p-2.5 text-left transition hover:-translate-y-[2px] ${
                  a.palette === p.id ? "border-primary ring-2 ring-primary/25" : "border-border/60"
                }`}>
                <div className="flex gap-1">
                  {p.swatch.map((c) => <span key={c} className="h-7 flex-1 rounded-md" style={{ background: c }} />)}
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[11px] font-bold truncate">{p.name}</span>
                  {a.palette === p.id && <Check className="size-3 stroke-[3] text-primary shrink-0" />}
                </div>
                <span className="text-[10px] text-muted-foreground">{p.mode === "dark" ? "Dark" : "Light"}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Wallpaper" hint="Used as the app background and on every page hero. Images or looping video.">
          <div className="flex flex-wrap items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUpload(f); e.target.value = ""; }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold inline-flex items-center gap-2 disabled:opacity-50">
              <Upload className="size-4 stroke-[1.75]" /> {uploading ? "Uploading…" : "Upload wallpaper"}
            </button>
            {customPath && (
              <button onClick={() => update.mutate({ custom_wallpaper_url: null } as never)}
                className="rounded-full border border-border/60 px-5 py-2.5 text-sm font-bold inline-flex items-center gap-2">
                <Trash2 className="size-4 stroke-[1.75]" /> Use shop wallpaper
              </button>
            )}
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <ImageIcon className="size-3.5 stroke-[1.75]" /> {customPath ? "Custom wallpaper active" : "Shop wallpaper active"}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <Slider label="Wallpaper blur" value={a.wallpaperBlur} min={0} max={30} suffix="px" onChange={(v) => appearanceStore.set({ wallpaperBlur: v })} />
            <Slider label="Wallpaper opacity" value={a.wallpaperOpacity} min={10} max={100} suffix="%" onChange={(v) => appearanceStore.set({ wallpaperOpacity: v })} />
            <Slider label="Brightness" value={a.wallpaperBrightness} min={40} max={140} suffix="%" onChange={(v) => appearanceStore.set({ wallpaperBrightness: v })} />
            <Slider label="Card transparency" value={a.cardTransparency} min={0} max={70} suffix="%" onChange={(v) => appearanceStore.set({ cardTransparency: v })} />
          </div>
        </Section>

        <Section title="Feel" hint="Corner softness, type scale and motion.">
          <div className="grid sm:grid-cols-2 gap-4">
            <Slider label="Corner radius" value={a.radius} min={0} max={180} suffix="%" onChange={(v) => appearanceStore.set({ radius: v })} />
            <Slider label="Text size" value={a.fontSize} min={85} max={125} suffix="%" onChange={(v) => appearanceStore.set({ fontSize: v })} />
            <Slider label="Animation speed" value={a.animationSpeed} min={50} max={150} suffix="%" onChange={(v) => appearanceStore.set({ animationSpeed: v })} />
            <div className="space-y-3">
              <Toggle label="Frosted glass panels" on={a.glass} onChange={(v) => appearanceStore.set({ glass: v })} />
              <Toggle label="Reduce motion" on={a.reducedMotion} onChange={(v) => appearanceStore.set({ reducedMotion: v })} />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 inline-flex items-center gap-1.5">
            <Sparkles className="size-3.5 stroke-[1.75]" /> Saved to your account — it follows you to any device.
          </p>
        </Section>

        <p className="text-center text-[11px] text-muted-foreground">
          Current: {layoutById(a.layout).name} · {paletteById(a.palette).name}
        </p>
      </div>
    </AppShell>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className="w-full flex items-center justify-between gap-3 text-xs font-bold">
      <span>{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition ${on ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-background transition-all ${on ? "left-[1.375rem]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
