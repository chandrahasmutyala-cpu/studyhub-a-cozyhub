import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/useProfile";
import { focusTimer, useFocusTimer, useTick, formatMs } from "@/lib/focus-timer";
import {
  useShop, useActiveWallpaper, WALLPAPERS, CUSTOM_WALLPAPER_ID,
} from "@/lib/shop";
import {
  Play, Pause, RotateCcw, X, Images, Timer, Target, Minimize2, Maximize2, Check,
} from "lucide-react";

const PRESETS = [
  { label: "25 / 5", focus: 25, brk: 5 },
  { label: "50 / 10", focus: 50, brk: 10 },
  { label: "90 / 20", focus: 90, brk: 20 },
];

/**
 * Immersive, full-screen focus experience: the chosen wallpaper fills the
 * viewport and every control floats above it on frosted glass.
 */
export function FocusImmersive({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useFocusTimer();
  useTick(500, t.running && open);
  const { profile, update } = useProfile();
  const { owned, setWallpaper } = useShop();
  const active = useActiveWallpaper();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const hideTimer = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const total = (t.phase === "focus" ? t.focusMin : t.breakMin) * 60_000;
  const left = focusTimer.remaining(Date.now(), t);
  const pct = total > 0 ? ((total - left) / total) * 100 : 0;

  const todayQ = useQuery({
    queryKey: ["focus", "today"],
    enabled: open,
    queryFn: async () => {
      const since = new Date(); since.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("focus_sessions").select("minutes").gte("completed_at", since.toISOString());
      return (data ?? []).reduce((a, b) => a + (b.minutes ?? 0), 0);
    },
  });
  const target = profile?.daily_minutes_target ?? 60;
  const done = todayQ.data ?? 0;
  const goalPct = Math.min(100, (done / Math.max(1, target)) * 100);

  const ownedWalls = useMemo(
    () => WALLPAPERS.filter((w) => owned(w.id)),
    [owned],
  );

  // Lock page scroll while immersive.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Escape closes; space toggles the timer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { pickerOpen ? setPickerOpen(false) : onClose(); }
      if (e.code === "Space" && !(e.target as HTMLElement)?.closest("input,textarea,button")) {
        e.preventDefault(); focusTimer.toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pickerOpen, onClose]);

  // Auto-hide the controls while the timer runs, reveal them on any movement.
  useEffect(() => {
    if (!open) return;
    const wake = () => {
      setChromeVisible(true);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      if (t.running && !pickerOpen) {
        hideTimer.current = window.setTimeout(() => setChromeVisible(false), 4000);
      }
    };
    wake();
    window.addEventListener("pointermove", wake);
    window.addEventListener("keydown", wake);
    return () => {
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("keydown", wake);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [open, t.running, pickerOpen]);

  async function toggleNative() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { /* browser refused — the overlay is still full-bleed */ }
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden bg-neutral-950 text-white animate-fade-in">
      {/* Wallpaper */}
      {active.url ? (
        <img
          key={active.url}
          src={active.url}
          alt={active.name}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,#2b3a4a_0%,#0d1117_70%)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/65" />

      {/* Top bar */}
      <div className={`absolute inset-x-0 top-0 p-4 sm:p-6 flex items-center justify-between gap-2 transition-opacity duration-500 ${chromeVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/12 backdrop-blur-xl border border-white/20 px-4 py-2">
          <Timer className="size-3.5 stroke-[1.75]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
            {t.phase === "focus" ? "Deep focus" : "Break"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton onClick={() => setPickerOpen(true)} label="Change wallpaper">
            <Images className="size-4 stroke-[1.75]" />
          </GlassButton>
          <GlassButton onClick={toggleNative} label="Toggle full screen">
            {typeof document !== "undefined" && document.fullscreenElement
              ? <Minimize2 className="size-4 stroke-[1.75]" />
              : <Maximize2 className="size-4 stroke-[1.75]" />}
          </GlassButton>
          <GlassButton onClick={onClose} label="Exit focus mode">
            <X className="size-4 stroke-[1.75]" />
          </GlassButton>
        </div>
      </div>

      {/* Centre timer */}
      <div className="absolute inset-0 grid place-items-center px-6">
        <div className="text-center">
          <div className="font-display font-bold tabular-nums leading-none tracking-tight text-[clamp(4rem,18vw,11rem)] drop-shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
            {formatMs(left)}
          </div>
          <div className="mx-auto mt-8 h-1.5 w-[min(28rem,80vw)] rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>

          <div className={`mt-8 flex items-center justify-center gap-3 transition-opacity duration-500 ${chromeVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <button
              onClick={() => focusTimer.toggle()}
              className="rounded-full bg-white text-neutral-900 px-9 py-3.5 text-sm font-bold inline-flex items-center gap-2 hover:opacity-90 active:scale-[0.97] transition shadow-lg"
            >
              {t.running ? <><Pause className="size-4 stroke-[2]" />Pause</> : <><Play className="size-4 stroke-[2]" />Start</>}
            </button>
            <GlassButton onClick={() => focusTimer.reset()} label="Reset timer">
              <RotateCcw className="size-4 stroke-[1.75]" />
            </GlassButton>
            <button
              onClick={() => focusTimer.setPhase(t.phase === "focus" ? "break" : "focus")}
              className="rounded-full bg-white/12 backdrop-blur-xl border border-white/20 px-5 py-3 text-xs font-bold hover:bg-white/20 transition"
            >
              {t.phase === "focus" ? "Break" : "Focus"}
            </button>
          </div>

          <div className={`mt-4 flex items-center justify-center gap-2 transition-opacity duration-500 ${chromeVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => focusTimer.setDurations(p.focus, p.brk)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
                  t.focusMin === p.focus && t.breakMin === p.brk
                    ? "bg-white text-neutral-900 border-white"
                    : "border-white/25 bg-white/10 backdrop-blur-xl hover:bg-white/20"
                }`}
              >{p.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom goal card */}
      <div className={`absolute inset-x-0 bottom-0 p-4 sm:p-6 transition-opacity duration-500 ${chromeVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="mx-auto max-w-md rounded-3xl bg-white/12 backdrop-blur-xl border border-white/20 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] inline-flex items-center gap-1.5 text-white/80">
              <Target className="size-3.5 stroke-[1.75]" /> Daily goal
            </span>
            <span className="text-xs font-bold tabular-nums">{done} / {target} min</span>
          </div>
          <div className="h-2 mt-3 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${goalPct}%` }} />
          </div>
          <div className="mt-3 flex gap-1.5">
            {[30, 60, 90, 120].map((v) => (
              <button
                key={v}
                onClick={() => update.mutate({ daily_minutes_target: v })}
                className={`flex-1 rounded-full py-1.5 text-[11px] font-bold border transition ${
                  target === v ? "bg-white text-neutral-900 border-white" : "border-white/25 hover:bg-white/15"
                }`}
              >{v}m</button>
            ))}
          </div>
        </div>
      </div>

      {/* Wallpaper picker sheet */}
      {pickerOpen && (
        <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm grid place-items-end sm:place-items-center animate-fade-in"
          onClick={() => setPickerOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-2xl max-h-[75vh] overflow-y-auto bg-neutral-900/85 backdrop-blur-2xl border border-white/15 rounded-t-[2rem] sm:rounded-[2rem] p-5 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold">Your wallpapers</h3>
              <GlassButton onClick={() => setPickerOpen(false)} label="Close"><X className="size-4 stroke-[1.75]" /></GlassButton>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {profile?.custom_wallpaper_url && (
                <WallTile
                  label="Your upload"
                  image={active.isCustom ? active.url : null}
                  selected={active.id === CUSTOM_WALLPAPER_ID}
                  onClick={() => { setWallpaper(CUSTOM_WALLPAPER_ID); setPickerOpen(false); }}
                />
              )}
              {ownedWalls.map((w) => (
                <WallTile
                  key={w.id}
                  label={w.name}
                  image={w.image ?? null}
                  swatch={w.swatch}
                  selected={active.id === w.id}
                  onClick={() => { setWallpaper(w.id); setPickerOpen(false); }}
                />
              ))}
            </div>
            <p className="text-xs text-white/60 mt-4">
              Unlock more scenes in the Shop, or upload your own from Settings.
            </p>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}

function GlassButton({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="size-11 grid place-items-center rounded-full bg-white/12 backdrop-blur-xl border border-white/20 hover:bg-white/22 active:scale-95 transition"
    >
      {children}
    </button>
  );
}

function WallTile({ label, image, swatch, selected, onClick }: {
  label: string; image: string | null; swatch?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`text-left rounded-2xl overflow-hidden border transition ${selected ? "border-white ring-2 ring-white/70" : "border-white/15 hover:border-white/40"}`}>
      <div className="aspect-[4/3] bg-white/10 relative">
        {image
          ? <img src={image} alt={label} loading="lazy" className="size-full object-cover" />
          : <div className="size-full" style={{ background: swatch ?? "rgba(255,255,255,0.12)" }} />}
        {selected && (
          <span className="absolute top-2 right-2 size-6 grid place-items-center rounded-full bg-white text-neutral-900">
            <Check className="size-3.5 stroke-[2.5]" />
          </span>
        )}
      </div>
      <div className="px-3 py-2 text-[11px] font-bold truncate">{label}</div>
    </button>
  );
}
