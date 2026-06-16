import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Calculator } from "lucide-react";

export const Route = createFileRoute("/_authenticated/cost-calculator")({
  component: CostCalculator,
});

type CityKey = keyof typeof CITIES;
const CITIES = {
  Tokyo: { country: "Japan", currency: "JPY", tuition: [535800, 1500000], rent: [70000, 130000], food: 45000, transport: 10000, misc: 20000, fx: 0.0067 },
  Osaka: { country: "Japan", currency: "JPY", tuition: [535800, 1300000], rent: [50000, 95000], food: 38000, transport: 8000, misc: 18000, fx: 0.0067 },
  Kyoto: { country: "Japan", currency: "JPY", tuition: [535800, 1300000], rent: [50000, 90000], food: 38000, transport: 8000, misc: 18000, fx: 0.0067 },
  Beijing: { country: "China", currency: "CNY", tuition: [20000, 60000], rent: [3500, 8000], food: 2500, transport: 400, misc: 1200, fx: 0.14 },
  Shanghai: { country: "China", currency: "CNY", tuition: [25000, 75000], rent: [4500, 9000], food: 2800, transport: 500, misc: 1500, fx: 0.14 },
  Seoul: { country: "South Korea", currency: "KRW", tuition: [4000000, 9000000], rent: [400000, 900000], food: 500000, transport: 70000, misc: 250000, fx: 0.00073 },
  Busan: { country: "South Korea", currency: "KRW", tuition: [3800000, 7500000], rent: [300000, 650000], food: 420000, transport: 60000, misc: 200000, fx: 0.00073 },
};

function CostCalculator() {
  const [city, setCity] = useState<CityKey>("Tokyo");
  const [tuitionTier, setTuitionTier] = useState<0 | 1>(0);
  const [rentTier, setRentTier] = useState<0 | 1>(0);
  const [years, setYears] = useState(4);

  const c = CITIES[city];
  const result = useMemo(() => {
    const tuitionYear = c.tuition[tuitionTier];
    const rentMonth = c.rent[rentTier];
    const monthly = rentMonth + c.food + c.transport + c.misc;
    const yearlyLiving = monthly * 12;
    const totalLocal = (tuitionYear + yearlyLiving) * years;
    return {
      tuitionYear, rentMonth, monthly, yearlyLiving, totalLocal,
      totalUsd: Math.round(totalLocal * c.fx),
    };
  }, [c, tuitionTier, rentTier, years]);

  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));

  return (
    <AppShell>
      <div className="space-y-5 max-w-4xl">
        <header>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2"><Calculator className="size-7" /> Cost Calculator</h1>
          <p className="text-sm text-muted-foreground">Estimate the real cost of studying abroad — tuition, rent, food, and more.</p>
        </header>

        <div className="rounded-3xl bg-white border border-border p-5 grid sm:grid-cols-2 gap-3 shadow-soft">
          <Field label="City"><select value={city} onChange={e => setCity(e.target.value as CityKey)} className="input">
            {Object.keys(CITIES).map(k => <option key={k}>{k}</option>)}
          </select></Field>
          <Field label="University tier">
            <select value={tuitionTier} onChange={e => setTuitionTier(Number(e.target.value) as 0 | 1)} className="input">
              <option value={0}>Public / National</option>
              <option value={1}>Private</option>
            </select>
          </Field>
          <Field label="Accommodation">
            <select value={rentTier} onChange={e => setRentTier(Number(e.target.value) as 0 | 1)} className="input">
              <option value={0}>Dorm / shared</option>
              <option value={1}>Private apartment</option>
            </select>
          </Field>
          <Field label="Duration (years)">
            <input type="number" min={1} max={8} value={years} onChange={e => setYears(Math.max(1, Math.min(8, Number(e.target.value) || 1)))} className="input" />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Stat label="Tuition / year" value={`${fmt(result.tuitionYear)} ${c.currency}`} sub={`≈ $${fmt(result.tuitionYear * c.fx)}`} />
          <Stat label="Living / month" value={`${fmt(result.monthly)} ${c.currency}`} sub={`Rent ${fmt(result.rentMonth)} + food, transport, misc`} />
          <Stat label="Living / year" value={`${fmt(result.yearlyLiving)} ${c.currency}`} sub={`≈ $${fmt(result.yearlyLiving * c.fx)}`} />
          <Stat label={`Total ${years}-year cost`} value={`${fmt(result.totalLocal)} ${c.currency}`} sub={`≈ $${fmt(result.totalUsd)} USD`} highlight />
        </div>

        <p className="text-xs text-muted-foreground">Estimates use typical 2024–2025 ranges. Exchange rates are approximate. Actual costs vary by university, neighborhood, and lifestyle.</p>
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
