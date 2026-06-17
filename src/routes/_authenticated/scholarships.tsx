import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Award, Search } from "lucide-react";
import {
  scholarshipsFor,
  COUNTRY_LABEL,
  COUNTRY_FLAG,
  DIRECTORY_TOTALS,
  type CountryKey,
} from "@/lib/study-directory";

export const Route = createFileRoute("/_authenticated/scholarships")({
  component: ScholarshipsPage,
});

const COUNTRIES: CountryKey[] = ["japan", "china", "korea"];

function ScholarshipsPage() {
  const [country, setCountry] = useState<CountryKey>("japan");
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("");

  const all = useMemo(() => scholarshipsFor(country), [country]);
  const levels = useMemo(
    () => Array.from(new Set(all.map((s) => s.level))).filter(Boolean),
    [all],
  );

  const filtered = useMemo(
    () => all.filter((s) => {
      if (level && s.level !== level) return false;
      if (!q) return true;
      const t = q.toLowerCase();
      return [s.name, s.type, s.coverage, s.notes].some((v) => v.toLowerCase().includes(t));
    }),
    [all, q, level],
  );

  return (
    <AppShell>
      <div className="max-w-5xl space-y-5">
        <header>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Discovery</div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2 mt-1">
            <Award className="size-7 text-primary" /> Scholarship Finder
          </h1>
          <p className="text-sm text-muted-foreground">
            {DIRECTORY_TOTALS.japan.scholarships + DIRECTORY_TOTALS.china.scholarships + DIRECTORY_TOTALS.korea.scholarships} verified scholarships — government, university, and private.
          </p>
        </header>

        <div className="flex gap-2 flex-wrap">
          {COUNTRIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCountry(c); setLevel(""); }}
              className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition ${
                country === c
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-white border border-border text-foreground/70 hover:bg-secondary"
              }`}
            >
              <span>{COUNTRY_FLAG[c]}</span>
              {COUNTRY_LABEL[c]}
              <span className="text-[10px] opacity-70">({DIRECTORY_TOTALS[c].scholarships})</span>
            </button>
          ))}
        </div>

        <div className="bg-white border border-border rounded-3xl p-4 grid sm:grid-cols-3 gap-2">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, provider, or benefit"
              className="w-full bg-cream rounded-2xl pl-10 pr-3 py-2.5 text-sm outline-none"
            />
          </div>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="bg-cream rounded-2xl px-3 py-2.5 text-sm"
          >
            <option value="">All levels</option>
            {levels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          {filtered.map((s) => (
            <article key={s.name} className="bg-white border border-border rounded-3xl p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">{s.type}{s.level && ` · ${s.level}`}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-honey rounded-full px-2 py-1 whitespace-nowrap">
                  {COUNTRY_FLAG[country]} {COUNTRY_LABEL[country]}
                </span>
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Coverage</span>
                  <p>{s.coverage}</p>
                </div>
                {s.notes && (
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Notes</span>
                    <p>{s.notes}</p>
                  </div>
                )}
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="bg-white rounded-3xl border border-border p-8 text-center text-sm text-muted-foreground">
              No scholarships match your search.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
