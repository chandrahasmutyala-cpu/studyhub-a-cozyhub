import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Calculator } from "lucide-react";

export const Route = createFileRoute("/_authenticated/cost-calculator")({
  component: CostCalculator,
});

type Country = "Japan" | "China" | "South Korea";
type CityRow = {
  country: Country;
  currency: "JPY" | "CNY" | "KRW";
  tuition: [number, number]; // public, private (per year)
  rent: [number, number];    // dorm, apartment (per month)
  food: number;
  transport: number;
  misc: number;
  fx: number; // 1 unit local → USD
};

// FX as of 2025 (approx)
const FX = { JPY: 0.0067, CNY: 0.14, KRW: 0.00073 };

// Tier presets per country
const JP_BASE = { currency: "JPY" as const, tuition: [535800, 1100000] as [number, number], food: 38000, transport: 8000, misc: 18000, fx: FX.JPY };
const JP_TOKYO = { ...JP_BASE, tuition: [535800, 1500000] as [number, number], food: 45000, transport: 10000, misc: 20000 };
const CN_BASE = { currency: "CNY" as const, tuition: [18000, 55000] as [number, number], food: 2200, transport: 350, misc: 1000, fx: FX.CNY };
const CN_TIER1 = { ...CN_BASE, tuition: [25000, 70000] as [number, number], food: 2800, transport: 500, misc: 1500 };
const KR_BASE = { currency: "KRW" as const, tuition: [3600000, 7500000] as [number, number], food: 420000, transport: 60000, misc: 200000, fx: FX.KRW };
const KR_SEOUL = { ...KR_BASE, tuition: [4000000, 9000000] as [number, number], food: 500000, transport: 70000, misc: 250000 };

function jp(city: string, rent: [number, number], tier: typeof JP_BASE = JP_BASE): [string, CityRow] {
  return [city, { country: "Japan", ...tier, rent }];
}
function cn(city: string, rent: [number, number], tier: typeof CN_BASE = CN_BASE): [string, CityRow] {
  return [city, { country: "China", ...tier, rent }];
}
function kr(city: string, rent: [number, number], tier: typeof KR_BASE = KR_BASE): [string, CityRow] {
  return [city, { country: "South Korea", ...tier, rent }];
}

const CITIES: Record<string, CityRow> = Object.fromEntries([
  // ---- Japan (major cities) ----
  jp("Tokyo", [70000, 130000], JP_TOKYO),
  jp("Yokohama", [55000, 100000], JP_TOKYO),
  jp("Kawasaki", [55000, 95000], JP_TOKYO),
  jp("Chiba", [45000, 80000]),
  jp("Saitama", [45000, 80000]),
  jp("Osaka", [50000, 95000]),
  jp("Kyoto", [50000, 90000]),
  jp("Kobe", [50000, 85000]),
  jp("Nagoya", [45000, 85000]),
  jp("Sapporo", [40000, 75000]),
  jp("Sendai", [40000, 75000]),
  jp("Hiroshima", [38000, 70000]),
  jp("Fukuoka", [40000, 75000]),
  jp("Kitakyushu", [35000, 65000]),
  jp("Nara", [40000, 75000]),
  jp("Okayama", [38000, 70000]),
  jp("Kanazawa", [38000, 68000]),
  jp("Niigata", [35000, 65000]),
  jp("Hamamatsu", [38000, 68000]),
  jp("Shizuoka", [38000, 68000]),
  jp("Tsukuba", [38000, 65000]),
  jp("Akita", [32000, 60000]),
  jp("Aomori", [32000, 58000]),
  jp("Hakodate", [33000, 60000]),
  jp("Matsuyama", [34000, 62000]),
  jp("Kumamoto", [35000, 65000]),
  jp("Kagoshima", [33000, 60000]),
  jp("Naha (Okinawa)", [40000, 70000]),

  // ---- China (major cities) ----
  cn("Beijing", [4000, 9000], CN_TIER1),
  cn("Shanghai", [4500, 9500], CN_TIER1),
  cn("Shenzhen", [4500, 9000], CN_TIER1),
  cn("Guangzhou", [3500, 7500], CN_TIER1),
  cn("Hangzhou", [3500, 7000], CN_TIER1),
  cn("Nanjing", [3000, 6500]),
  cn("Tianjin", [2800, 6000]),
  cn("Suzhou", [3000, 6500]),
  cn("Wuhan", [2500, 5500]),
  cn("Chengdu", [2500, 5500]),
  cn("Chongqing", [2300, 5000]),
  cn("Xi'an", [2200, 4800]),
  cn("Hefei", [2000, 4500]),
  cn("Qingdao", [2500, 5500]),
  cn("Jinan", [2200, 4800]),
  cn("Dalian", [2500, 5500]),
  cn("Harbin", [2000, 4500]),
  cn("Changchun", [1800, 4000]),
  cn("Shenyang", [2000, 4500]),
  cn("Changsha", [2200, 4800]),
  cn("Zhengzhou", [2000, 4500]),
  cn("Fuzhou", [2200, 4800]),
  cn("Xiamen", [2800, 6000]),
  cn("Kunming", [2000, 4200]),
  cn("Lanzhou", [1500, 3500]),
  cn("Urumqi", [1500, 3500]),
  cn("Nanning", [1800, 4000]),
  cn("Haikou", [2000, 4500]),
  cn("Lhasa", [1800, 4000]),
  cn("Yanji", [1500, 3200]),

  // ---- South Korea (major cities) ----
  kr("Seoul", [400000, 900000], KR_SEOUL),
  kr("Incheon", [300000, 700000], KR_SEOUL),
  kr("Suwon", [320000, 700000], KR_SEOUL),
  kr("Seongnam", [350000, 750000], KR_SEOUL),
  kr("Busan", [280000, 650000]),
  kr("Daegu", [250000, 600000]),
  kr("Daejeon", [240000, 580000]),
  kr("Gwangju", [220000, 550000]),
  kr("Ulsan", [260000, 600000]),
  kr("Pohang", [220000, 520000]),
  kr("Cheongju", [200000, 480000]),
  kr("Cheonan", [220000, 500000]),
  kr("Chuncheon", [200000, 470000]),
  kr("Jeonju", [200000, 470000]),
  kr("Jeju City", [240000, 540000]),
  kr("Andong", [180000, 420000]),
  kr("Changwon", [220000, 500000]),
  kr("Mokpo", [180000, 420000]),
  kr("Gimhae", [220000, 500000]),
  kr("Gumi", [200000, 460000]),
  kr("Iksan", [180000, 420000]),
  kr("Asan", [200000, 460000]),
  kr("Nonsan", [170000, 400000]),
  kr("Gongju", [180000, 420000]),
  kr("Gangneung", [200000, 460000]),
  kr("Chungju", [180000, 420000]),
]);

const CURRENCY_SYMBOL = { JPY: "¥", CNY: "¥", KRW: "₩" };

function CostCalculator() {
  const [country, setCountry] = useState<Country | "All">("All");
  const cityNames = useMemo(() => {
    const list = Object.keys(CITIES).filter((c) => country === "All" || CITIES[c].country === country);
    return list.sort();
  }, [country]);
  const [city, setCity] = useState<string>("Tokyo");
  const [tuitionTier, setTuitionTier] = useState<0 | 1>(0);
  const [rentTier, setRentTier] = useState<0 | 1>(0);
  const [years, setYears] = useState(4);

  // ensure selected city is in current country filter
  const c = CITIES[city] ?? CITIES.Tokyo;

  const result = useMemo(() => {
    const tuitionYear = c.tuition[tuitionTier];
    const rentMonth = c.rent[rentTier];
    const monthly = rentMonth + c.food + c.transport + c.misc;
    const yearlyLiving = monthly * 12;
    const totalLocal = (tuitionYear + yearlyLiving) * years;
    return { tuitionYear, rentMonth, monthly, yearlyLiving, totalLocal, totalUsd: Math.round(totalLocal * c.fx) };
  }, [c, tuitionTier, rentTier, years]);

  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));
  const sym = CURRENCY_SYMBOL[c.currency];

  return (
    <AppShell>
      <div className="space-y-5 max-w-4xl">
        <header>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <Calculator className="size-7" /> Cost Calculator
          </h1>
          <p className="text-sm text-muted-foreground">
            Estimate tuition + living costs across {Object.keys(CITIES).length}+ cities in Japan, China, and South Korea.
          </p>
        </header>

        <div className="flex gap-1 bg-white p-1 rounded-full border border-border w-fit text-xs font-bold">
          {(["All", "Japan", "China", "South Korea"] as const).map((co) => (
            <button key={co} onClick={() => setCountry(co)}
              className={`px-3 py-1.5 rounded-full transition ${country === co ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
              {co}
            </button>
          ))}
        </div>

        <div className="rounded-3xl bg-white border border-border p-5 grid sm:grid-cols-2 gap-3 shadow-soft">
          <Field label="City">
            <select value={cityNames.includes(city) ? city : cityNames[0]} onChange={(e) => setCity(e.target.value)} className="input">
              {cityNames.map((k) => <option key={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="University tier">
            <select value={tuitionTier} onChange={(e) => setTuitionTier(Number(e.target.value) as 0 | 1)} className="input">
              <option value={0}>Public / National</option>
              <option value={1}>Private</option>
            </select>
          </Field>
          <Field label="Accommodation">
            <select value={rentTier} onChange={(e) => setRentTier(Number(e.target.value) as 0 | 1)} className="input">
              <option value={0}>Dorm / shared</option>
              <option value={1}>Private apartment</option>
            </select>
          </Field>
          <Field label="Duration (years)">
            <input type="number" min={1} max={8} value={years}
              onChange={(e) => setYears(Math.max(1, Math.min(8, Number(e.target.value) || 1)))} className="input" />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Stat label="Tuition / year" value={`${sym}${fmt(result.tuitionYear)}`} sub={`≈ $${fmt(result.tuitionYear * c.fx)}`} />
          <Stat label="Living / month" value={`${sym}${fmt(result.monthly)}`} sub={`Rent ${sym}${fmt(result.rentMonth)} + food, transport, misc`} />
          <Stat label="Living / year" value={`${sym}${fmt(result.yearlyLiving)}`} sub={`≈ $${fmt(result.yearlyLiving * c.fx)}`} />
          <Stat label={`Total ${years}-year cost`} value={`${sym}${fmt(result.totalLocal)} ${c.currency}`} sub={`≈ $${fmt(result.totalUsd)} USD`} highlight />
        </div>

        <p className="text-xs text-muted-foreground">
          Estimates use typical 2024–2025 ranges. Exchange rates are approximate. Actual costs vary by university, neighborhood, and lifestyle.
        </p>
      </div>
      <style>{`.input{width:100%;border:1px solid hsl(var(--border));border-radius:14px;padding:8px 12px;font-size:14px;background:white}`}</style>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{label}</div>{children}</label>;
}
function Stat({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-3xl border p-5 shadow-soft ${highlight ? "bg-primary/15 border-primary" : "bg-white border-border"}`}>
      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}
