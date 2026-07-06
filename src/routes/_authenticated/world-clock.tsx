import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useMemo, useState } from "react";
import { Clock, Sun, Sunrise, Sunset, CloudSun, GraduationCap, Award } from "lucide-react";

export const Route = createFileRoute("/_authenticated/world-clock")({
  component: WorldClockPage,
});

type City = {
  id: string;
  country: string;
  city: string;
  tz: string;
  flag: string;
  lat: number;
  lon: number;
  office: string;
  scholarshipDeadline: string;
};

const CITIES: City[] = [
  { id: "jp", country: "Japan",       city: "Tokyo",  tz: "Asia/Tokyo",  flag: "🇯🇵", lat: 35.68, lon: 139.69, office: "9:00 – 17:00 JST",     scholarshipDeadline: "MEXT · May 15" },
  { id: "cn", country: "China",       city: "Beijing", tz: "Asia/Shanghai", flag: "🇨🇳", lat: 39.90, lon: 116.40, office: "8:30 – 17:00 CST",   scholarshipDeadline: "CSC · March 31" },
  { id: "kr", country: "South Korea", city: "Seoul",  tz: "Asia/Seoul",  flag: "🇰🇷", lat: 37.57, lon: 126.98, office: "9:00 – 18:00 KST",     scholarshipDeadline: "KGSP · Feb 28" },
];

function WorldClockPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">StudentHub</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">World Clock</h1>
          <p className="text-sm text-muted-foreground mt-2">Live time, weather and university office hours for the three student hubs.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {CITIES.map((c) => <CityCard key={c.id} city={c} />)}
        </div>
      </div>
    </AppShell>
  );
}

function CityCard({ city }: { city: City }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = useMemo(() => new Intl.DateTimeFormat("en-GB", { timeZone: city.tz, hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now), [now, city.tz]);
  const date = useMemo(() => new Intl.DateTimeFormat("en-US", { timeZone: city.tz, weekday: "long", month: "short", day: "numeric" }).format(now), [now, city.tz]);
  const localOffset = -new Date().getTimezoneOffset() / 60;
  const cityOffsetMin = -new Date(new Date().toLocaleString("en-US", { timeZone: city.tz })).getTimezoneOffset() / 60 || 0;
  // simpler diff via Intl:
  const diffHours = useMemo(() => {
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: city.tz, hour: "numeric", hour12: false });
    const cityHour = Number(fmt.format(now));
    const localHour = now.getHours();
    let diff = cityHour - localHour;
    if (diff > 12) diff -= 24;
    if (diff < -12) diff += 24;
    return diff;
  }, [now, city.tz]);

  const [wx, setWx] = useState<{ temp?: number; sunrise?: string; sunset?: string; code?: number } | null>(null);
  useEffect(() => {
    let cancelled = false;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&daily=sunrise,sunset&timezone=${encodeURIComponent(city.tz)}`;
    fetch(url).then((r) => r.json()).then((d) => {
      if (cancelled) return;
      const sr = d.daily?.sunrise?.[0]?.slice(11, 16);
      const ss = d.daily?.sunset?.[0]?.slice(11, 16);
      setWx({ temp: d.current?.temperature_2m, sunrise: sr, sunset: ss, code: d.current?.weather_code });
    }).catch(() => { /* offline */ });
    return () => { cancelled = true; };
  }, [city.id, city.lat, city.lon, city.tz]);

  void localOffset; void cityOffsetMin;

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-3xl">{city.flag}</div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{city.country}</div>
          <div className="font-display text-xl font-bold">{city.city}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="font-display text-3xl font-bold tabular-nums">{time}</div>
          <div className="text-xs text-muted-foreground">{date}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Row icon={CloudSun} label="Weather" value={wx?.temp !== undefined ? `${Math.round(wx.temp)}°C` : "—"} />
        <Row icon={Clock} label="Time diff" value={diffHours === 0 ? "same" : `${diffHours > 0 ? "+" : ""}${diffHours}h`} />
        <Row icon={Sunrise} label="Sunrise" value={wx?.sunrise ?? "—"} />
        <Row icon={Sunset} label="Sunset" value={wx?.sunset ?? "—"} />
        <Row icon={GraduationCap} label="Uni office" value={city.office} />
        <Row icon={Award} label="Scholarship" value={city.scholarshipDeadline} />
      </div>
      <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Sun className="size-3" /> Auto-refreshing live</div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Sun; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 stroke-[1.75] text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="ml-auto text-xs font-bold">{value}</span>
    </div>
  );
}
