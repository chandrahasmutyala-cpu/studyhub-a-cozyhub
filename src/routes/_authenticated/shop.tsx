import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  SHOP_ITEMS, CATEGORY_LABELS, useShop, useCustomWallpaper, useActiveWallpaper,
  CUSTOM_WALLPAPER_ID, type ShopCategory, type ShopItem,
} from "@/lib/shop";
import { Coins, Search, Check, Lock, X, Sparkles, Upload, Trash2, Loader2 } from "lucide-react";


export const Route = createFileRoute("/_authenticated/shop")({
  component: ShopPage,
  head: () => ({
    meta: [
      { title: "Study Coin Shop — StudyHub" },
      { name: "description", content: "Spend the Study Coins you earn from focus sessions on wallpapers, planner themes, desk decorations and badges." },
      { property: "og:title", content: "Study Coin Shop — StudyHub" },
      { property: "og:description", content: "Unlock focus wallpapers, planner themes and badges with coins earned while studying." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const TABS: ({ id: "all" } | { id: ShopCategory })[] = [
  { id: "all" }, { id: "wallpapers" }, { id: "themes" }, { id: "decor" }, { id: "badges" },
];

function ShopPage() {
  const { coins, owned, buy, purchases, selectedWallpaper, setWallpaper } = useShop();
  const [tab, setTab] = useState<"all" | ShopCategory>("all");
  const [q, setQ] = useState("");
  const [preview, setPreview] = useState<ShopItem | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const custom = useCustomWallpaper();
  const activeWall = useActiveWallpaper();
  const fileRef = useRef<HTMLInputElement>(null);


  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    return SHOP_ITEMS.filter((i) => (tab === "all" || i.category === tab) &&
      (!s || i.name.toLowerCase().includes(s) || i.description.toLowerCase().includes(s)));
  }, [tab, q]);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <header className="sticky top-0 z-20 -mx-4 px-4 py-3 backdrop-blur-xl bg-background/75 border-b border-border/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Shop</h1>
              <p className="text-xs text-muted-foreground">Earned by focusing. Spent on good company.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2">
              <Coins className="size-4 stroke-[1.75] text-primary" />
              <span className="font-display font-bold tabular-nums">{coins}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2">
              <Search className="size-4 stroke-[1.75] text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the shop"
                className="flex-1 bg-transparent outline-none text-sm font-medium" />
            </div>
            <button onClick={() => setShowHistory((v) => !v)}
              className="rounded-full border border-border/60 px-4 py-2 text-xs font-bold hover:bg-muted transition">
              History
            </button>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id as "all" | ShopCategory)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition ${
                  tab === t.id ? "bg-foreground text-background border-foreground" : "border-border/60 hover:bg-muted"
                }`}>
                {t.id === "all" ? "All" : CATEGORY_LABELS[t.id as ShopCategory]}
              </button>
            ))}
          </div>
        </header>

        {showHistory && (
          <section className="rounded-3xl border border-border/60 bg-card p-5">
            <h2 className="font-display text-base font-bold">Purchase history</h2>
            {purchases.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-2">Nothing bought yet.</p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {purchases.map((p) => {
                  const item = SHOP_ITEMS.find((i) => i.id === p.item_id);
                  return (
                    <li key={p.item_id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/60 transition">
                      <span className="flex-1 text-sm font-medium truncate">{item?.name ?? p.item_id}</span>
                      <span className="text-xs text-muted-foreground">{new Date(p.created_at as string).toLocaleDateString()}</span>
                      <span className="text-xs font-bold tabular-nums">−{p.price}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {(tab === "all" || tab === "wallpapers") && (
          <section className="rounded-3xl border border-border/60 bg-card p-5 flex items-center gap-4">
            <div className="size-16 shrink-0 rounded-2xl overflow-hidden bg-muted grid place-items-center">
              {activeWall.isCustom && activeWall.url
                ? <img src={activeWall.url} alt="Your wallpaper" className="size-full object-cover" />
                : <Upload className="size-5 stroke-[1.75] text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-base font-bold">Your own wallpaper</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload an image once — it follows you to every device you sign in on.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) custom.upload.mutate(f);
                    if (fileRef.current) fileRef.current.value = "";
                  }} />
                <button onClick={() => fileRef.current?.click()} disabled={custom.upload.isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-xs font-bold disabled:opacity-50 hover:opacity-90 transition">
                  {custom.upload.isPending
                    ? <><Loader2 className="size-3.5 animate-spin" /> Uploading…</>
                    : <><Upload className="size-3.5 stroke-[1.75]" /> {custom.path ? "Replace image" : "Upload image"}</>}
                </button>
                {custom.path && (
                  <>
                    <button onClick={() => setWallpaper(CUSTOM_WALLPAPER_ID)}
                      className="rounded-full border border-border/60 px-4 py-2 text-xs font-bold hover:bg-muted transition">
                      {selectedWallpaper === CUSTOM_WALLPAPER_ID ? "In use" : "Use in Focus"}
                    </button>
                    <button onClick={() => custom.remove.mutate()} disabled={custom.remove.isPending}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-xs font-bold text-destructive hover:bg-muted transition disabled:opacity-50">
                      <Trash2 className="size-3.5 stroke-[1.75]" /> Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        )}


        {/* Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-3 gap-3 pb-10">
          {items.map((item) => {
            const isOwned = owned(item.id);
            const active = item.category === "wallpapers" && selectedWallpaper === item.id;
            return (
              <button key={item.id} onClick={() => setPreview(item)}
                className="group text-left rounded-3xl border border-border/60 bg-card overflow-hidden hover:-translate-y-[2px] hover:shadow-[0_24px_50px_-34px_rgb(15_23_42/0.35)] transition-all">
                <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                  {item.image ? (
                    <img src={item.image} alt={item.name} loading="lazy" width={1536} height={1024}
                      className="size-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                  ) : (
                    <div className="size-full" style={{ background: item.swatch }} />
                  )}
                  {active && (
                    <span className="absolute top-2 left-2 rounded-full bg-background/85 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">In use</span>
                  )}
                </div>
                <div className="p-3.5">
                  <div className="font-display text-sm font-bold truncate">{item.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{CATEGORY_LABELS[item.category]}</div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold">
                    {isOwned ? (
                      <><Check className="size-3.5 stroke-[2] text-primary" /> Owned</>
                    ) : (
                      <><Coins className="size-3.5 stroke-[1.75] text-primary" /> {item.price}</>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </section>
      </div>

      {/* Preview sheet */}
      {preview && (
        <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-foreground/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreview(null)}>
          <div onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-card border border-border/60 rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden animate-scale-in">
            <div className="aspect-[16/10] bg-muted relative">
              {preview.image
                ? <img src={preview.image} alt={preview.name} className="size-full object-cover" width={1536} height={1024} />
                : <div className="size-full" style={{ background: preview.swatch }} />}
              <button onClick={() => setPreview(null)} aria-label="Close"
                className="absolute top-3 right-3 size-9 grid place-items-center rounded-full bg-background/80 backdrop-blur">
                <X className="size-4 stroke-[1.75]" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{CATEGORY_LABELS[preview.category]}</div>
              <h3 className="font-display text-2xl font-bold mt-1">{preview.name}</h3>
              <p className="text-sm text-muted-foreground mt-2">{preview.description}</p>

              <div className="mt-6 flex gap-2">
                {owned(preview.id) ? (
                  preview.category === "wallpapers" ? (
                    <button onClick={() => { setWallpaper(preview.id); setPreview(null); }}
                      className="flex-1 rounded-full bg-foreground text-background py-3 text-sm font-bold hover:opacity-90 active:scale-[0.98] transition">
                      Use in Focus
                    </button>
                  ) : (
                    <div className="flex-1 rounded-full bg-muted py-3 text-sm font-bold text-center">Owned</div>
                  )
                ) : (
                  <button disabled={buy.isPending || coins < preview.price}
                    onClick={() => buy.mutate(preview, { onSuccess: () => setPreview(null) })}
                    className="flex-1 rounded-full bg-primary text-primary-foreground py-3 text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 active:scale-[0.98] transition">
                    {coins < preview.price ? <><Lock className="size-4 stroke-[1.75]" /> Need {preview.price - coins} more</> : <><Sparkles className="size-4 stroke-[1.75]" /> Unlock for {preview.price}</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
