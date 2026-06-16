import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { WORLD_POIS, COUNTRY_VIEWS, type Country, type POI } from "@/lib/world-pois";
import { Globe2, MapPin, KeyRound, Plane, GraduationCap, Landmark, Sparkles, ExternalLink } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export const Route = createFileRoute("/_authenticated/world")({
  component: WorldExplorer,
});

const TOKEN_KEY = "studyhub.mapbox.token";

function WorldExplorer() {
  const [token, setToken] = useState<string>(() =>
    (typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : "") ?? ""
  );
  const [tokenDraft, setTokenDraft] = useState(token);
  const [country, setCountry] = useState<Country>("japan");
  const [active, setActive] = useState<POI | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const pois = WORLD_POIS.filter((p) => p.country === country);

  // Initialize map when token is provided
  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = token;
    const v = COUNTRY_VIEWS[country];
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: [v.lng, v.lat],
      zoom: v.zoom,
      pitch: 62,
      bearing: -10,
      antialias: true,
    });
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.on("style.load", () => {
      try {
        map.setConfigProperty("basemap", "lightPreset", "dawn");
        map.setConfigProperty("basemap", "show3dObjects", true);
      } catch { /* style may not support config */ }
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render markers + fly when country changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    pois.forEach((p) => {
      const el = document.createElement("button");
      el.className = "size-8 rounded-full grid place-items-center bg-white border-2 border-primary shadow-pop text-xs font-bold cursor-pointer hover:scale-110 transition-transform";
      el.title = p.name;
      el.innerText = p.kind === "university" ? "🎓" : p.kind === "culture" ? "⛩" : p.kind === "landmark" ? "🗼" : "🏙";
      el.onclick = (e) => { e.stopPropagation(); flyTo(p); };
      const marker = new mapboxgl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
      markersRef.current.push(marker);
    });
    const v = COUNTRY_VIEWS[country];
    map.flyTo({ center: [v.lng, v.lat], zoom: v.zoom, pitch: 62, bearing: -10, duration: 1800 });
  }, [country, token]); // eslint-disable-line react-hooks/exhaustive-deps

  function flyTo(p: POI) {
    setActive(p);
    mapRef.current?.flyTo({ center: [p.lng, p.lat], zoom: 16.5, pitch: 70, bearing: 30, duration: 2200, essential: true });
  }

  function saveToken() {
    const t = tokenDraft.trim();
    if (!t) return;
    window.localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2"><Globe2 className="size-7" /> World Explorer</h1>
            <p className="text-sm text-muted-foreground">Walk through Japan, China, and Korea in 3D. Discover universities, landmarks, and learn a phrase at every stop.</p>
          </div>
          <div className="flex gap-1 bg-white p-1 rounded-full border border-border">
            {(Object.keys(COUNTRY_VIEWS) as Country[]).map((c) => (
              <button key={c} onClick={() => setCountry(c)}
                className={`px-4 py-2 rounded-full text-xs font-bold ${country === c ? "bg-primary" : "text-muted-foreground"}`}>
                {COUNTRY_VIEWS[c].label}
              </button>
            ))}
          </div>
        </header>

        {!token ? (
          <div className="rounded-3xl border border-border bg-white p-8 max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="size-5" />
              <h2 className="font-display text-xl font-bold">Add your Mapbox token</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              The 3D world uses Mapbox's photorealistic Standard style with real buildings and terrain.
              Get a free public token at{" "}
              <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                account.mapbox.com <ExternalLink className="size-3" />
              </a>
              {" "}— the free tier covers 50,000 map loads / month.
            </p>
            <div className="flex gap-2">
              <input value={tokenDraft} onChange={(e) => setTokenDraft(e.target.value)}
                placeholder="pk.eyJ1Ijo..."
                className="flex-1 rounded-2xl border border-border px-4 py-2.5 text-sm font-mono" />
              <button onClick={saveToken} disabled={!tokenDraft.trim()}
                className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold disabled:opacity-50">Connect</button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Stored locally in your browser. You can remove it any time from this page.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-4">
            <div ref={containerRef} className="h-[70vh] min-h-[480px] rounded-3xl overflow-hidden border-4 border-white shadow-pop bg-secondary" />
            <aside className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {active && (
                <div className="rounded-3xl bg-white border border-border p-4 shadow-soft">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3" /> {active.city}
                  </div>
                  <h3 className="font-display text-lg font-bold mt-0.5">{active.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{active.blurb}</p>
                  <div className="mt-3 rounded-2xl bg-primary/15 p-3">
                    <div className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1"><Sparkles className="size-3" /> Phrase of the place</div>
                    <div className="font-display text-2xl mt-1">{active.phrase.native}</div>
                    <div className="text-xs font-mono text-muted-foreground">{active.phrase.romaji}</div>
                    <div className="text-xs mt-1">"{active.phrase.meaning}"</div>
                  </div>
                </div>
              )}
              <div className="rounded-3xl bg-white/80 backdrop-blur border border-border p-3">
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1 mb-2 flex items-center gap-1"><Plane className="size-3" /> Stops</div>
                <ul className="space-y-1">
                  {pois.map((p) => {
                    const Icon = p.kind === "university" ? GraduationCap : Landmark;
                    return (
                      <li key={p.id}>
                        <button onClick={() => flyTo(p)}
                          className={`w-full text-left flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${active?.id === p.id ? "bg-primary" : "hover:bg-secondary"}`}>
                          <Icon className="size-4 shrink-0" />
                          <span className="min-w-0 flex-1 truncate">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground">{p.city}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <button onClick={() => { window.localStorage.removeItem(TOKEN_KEY); setToken(""); setTokenDraft(""); }}
                className="w-full text-xs text-muted-foreground hover:text-foreground underline">
                Remove Mapbox token
              </button>
            </aside>
          </div>
        )}
      </div>
    </AppShell>
  );
}
