import { type ReactNode } from "react";
import { useActiveWallpaper } from "@/lib/wallpaper";

/**
 * Premium hero band shown at the top of every major page.
 * Shows the active wallpaper with a readable scrim and page-specific overlay content.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  right,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  right?: ReactNode;
  compact?: boolean;
}) {
  const wp = useActiveWallpaper();
  return (
    <section
      className={`relative isolate overflow-hidden rounded-3xl border border-border/50 ${compact ? "p-5" : "p-6 md:p-8"}`}
    >
      {wp.url ? (
        wp.live ? (
          <video src={wp.url} autoPlay muted loop playsInline className="absolute inset-0 -z-20 size-full object-cover wallpaper-media" />
        ) : (
          <img src={wp.url} alt="" loading="lazy" decoding="async" className="absolute inset-0 -z-20 size-full object-cover wallpaper-media" />
        )
      ) : (
        <div className="absolute inset-0 -z-20 gradient-primary" />
      )}
      <div className="absolute inset-0 -z-10 hero-scrim" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/60">{eyebrow}</div>
          )}
          <h1 className={`font-display font-bold tracking-tight ${compact ? "text-2xl" : "text-3xl md:text-4xl"} mt-1`}>
            {title}
          </h1>
          {subtitle && <p className="text-sm text-foreground/70 mt-1.5 max-w-xl">{subtitle}</p>}
        </div>
        {right}
      </div>

      {children && <div className="mt-5">{children}</div>}
    </section>
  );
}

/** Small stat pill used inside heroes. */
export function HeroStat({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-card/70 backdrop-blur-md border border-border/50 px-3.5 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {icon}{label}
      </div>
      <div className="font-display text-lg font-bold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
