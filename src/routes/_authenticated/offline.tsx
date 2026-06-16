import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { JLPT_VOCAB, type JlptLevel } from "@/lib/jlpt-vocab";
import { HSK_VOCAB, type HskLevel } from "@/lib/hsk-data";
import { TOPIK_STARTERS, type TopikLevel } from "@/lib/korean-data";
import { CloudDownload, Check, Wifi, WifiOff, HardDrive } from "lucide-react";

export const Route = createFileRoute("/_authenticated/offline")({
  component: OfflineLearning,
});

type Pack = { id: string; label: string; lang: string; size: number; data: unknown };

function buildPacks(): Pack[] {
  const packs: Pack[] = [];
  (Object.keys(JLPT_VOCAB) as JlptLevel[]).forEach(l => {
    packs.push({ id: `ja-${l}`, label: `Japanese · JLPT ${l}`, lang: "Japanese", size: JLPT_VOCAB[l].length, data: JLPT_VOCAB[l] });
  });
  ([1, 2, 3, 4, 5, 6] as HskLevel[]).forEach(l => {
    packs.push({ id: `zh-${l}`, label: `Chinese · HSK ${l}`, lang: "Chinese", size: HSK_VOCAB[l].length, data: HSK_VOCAB[l] });
  });
  (Object.keys(TOPIK_STARTERS) as TopikLevel[]).forEach(l => {
    packs.push({ id: `ko-${l.replace(/\s/g, "-")}`, label: `Korean · ${l}`, lang: "Korean", size: TOPIK_STARTERS[l].length, data: TOPIK_STARTERS[l] });
  });
  return packs;
}

const STORE_KEY = "studyhub.offline.packs.v1";

function OfflineLearning() {
  const [installed, setInstalled] = useState<Record<string, number>>({});
  const [online, setOnline] = useState(true);
  const packs = buildPacks();

  useEffect(() => {
    try { setInstalled(JSON.parse(localStorage.getItem(STORE_KEY) || "{}")); } catch { /* noop */ }
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  function install(p: Pack) {
    try {
      localStorage.setItem(`studyhub.pack.${p.id}`, JSON.stringify(p.data));
      const next = { ...installed, [p.id]: p.size };
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
      setInstalled(next);
    } catch {
      alert("Storage full — remove a pack first.");
    }
  }
  function remove(id: string) {
    localStorage.removeItem(`studyhub.pack.${id}`);
    const next = { ...installed }; delete next[id];
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    setInstalled(next);
  }
  function installAll() { packs.forEach(install); }

  const totalInstalled = Object.values(installed).reduce((a, b) => a + b, 0);

  return (
    <AppShell>
      <div className="space-y-5 max-w-4xl">
        <header>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2"><CloudDownload className="size-7" /> Offline Learning</h1>
          <p className="text-sm text-muted-foreground">Download vocabulary packs to study without an internet connection — perfect for flights, commutes, and rural areas.</p>
        </header>

        <div className="grid sm:grid-cols-3 gap-3">
          <Stat label="Connection" value={online ? "Online" : "Offline"} icon={online ? Wifi : WifiOff} highlight={!online} />
          <Stat label="Words installed" value={totalInstalled.toLocaleString()} icon={HardDrive} />
          <Stat label="Packs installed" value={Object.keys(installed).length} icon={Check} />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Available packs</div>
          <button onClick={installAll} className="text-xs font-bold rounded-full bg-primary px-3 py-1.5">Install all</button>
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          {packs.map(p => {
            const has = installed[p.id] != null;
            return (
              <div key={p.id} className={`rounded-2xl border p-3 flex items-center gap-3 ${has ? "bg-primary/10 border-primary" : "bg-white border-border"}`}>
                <div className="size-9 rounded-2xl bg-white border border-border grid place-items-center text-xs font-bold">{p.lang[0]}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm">{p.label}</div>
                  <div className="text-xs text-muted-foreground">{p.size.toLocaleString()} words</div>
                </div>
                {has ? (
                  <button onClick={() => remove(p.id)} className="rounded-full bg-white border border-border px-3 py-1.5 text-xs font-bold">Remove</button>
                ) : (
                  <button onClick={() => install(p)} className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold">Install</button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">Packs are stored in your browser. AI features (tutor, translator, examples) still require an internet connection.</p>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, icon: Icon, highlight }: { label: string; value: string | number; icon: typeof Wifi; highlight?: boolean }) {
  return (
    <div className={`rounded-3xl border p-4 shadow-soft flex items-center gap-3 ${highlight ? "bg-primary/15 border-primary" : "bg-white border-border"}`}>
      <Icon className="size-5" />
      <div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{label}</div>
        <div className="font-display text-xl font-bold">{value}</div>
      </div>
    </div>
  );
}
