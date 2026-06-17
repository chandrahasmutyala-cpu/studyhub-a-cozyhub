import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GraduationCap, Search, MapPin } from "lucide-react";
import {
  universitiesFor,
  COUNTRY_LABEL,
  COUNTRY_FLAG,
  COUNTRY_NOTES,
  UNI_TYPE_LABEL,
  DIRECTORY_TOTALS,
  type CountryKey,
} from "@/lib/study-directory";

export const Route = createFileRoute("/_authenticated/universities")({
  component: UniversitiesPage,
});

const COUNTRIES: CountryKey[] = ["japan", "china", "korea"];

function UniversitiesPage() {
  const [country, setCountry] = useState<CountryKey>("japan");
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("");

  const all = useMemo(() => universitiesFor(country), [country]);
  const types = useMemo(
    () => Array.from(new Set(all.map((u) => u.type))),
    [all],
  );
  const filtered = useMemo(
    () => all.filter((u) => {
      if (type && u.type !== type) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        u.name.toLowerCase().includes(s) ||
        u.location.toLowerCase().includes(s) ||
        u.fields.toLowerCase().includes(s)
      );
    }),
    [all, q, type],
  );

  const notes = COUNTRY_NOTES[country];

  return (
    <AppShell>
      <div className="max-w-6xl space-y-5">
        <header>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Discovery</div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2 mt-1">
            <GraduationCap className="size-7 text-primary" /> University Finder
          </h1>
          <p className="text-sm text-muted-foreground">
            {DIRECTORY_TOTALS.japan.universities + DIRECTORY_TOTALS.china.universities + DIRECTORY_TOTALS.korea.universities}+ verified universities across Japan, China, and South Korea.
          </p>
        </header>

        {/* Country tabs */}
        <div className="flex gap-2 flex-wrap">
          {COUNTRIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCountry(c); setType(""); }}
              className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition ${
                country === c
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-white border border-border text-foreground/70 hover:bg-secondary"
              }`}
            >
              <span>{COUNTRY_FLAG[c]}</span>
              {COUNTRY_LABEL[c]}
              <span className="text-[10px] opacity-70">({DIRECTORY_TOTALS[c].universities})</span>
            </button>
          ))}
        </div>

        {/* Country brief */}
        <div className="rounded-3xl bg-white/85 backdrop-blur border border-border p-4 grid sm:grid-cols-3 gap-3 text-xs">
          <Brief label="Language" value={notes.language} />
          <Brief label="Visa" value={notes.visa} />
          <Brief label="Yearly cost" value={notes.cost} />
        </div>

        {/* Filters */}
        <div className="bg-white border border-border rounded-3xl p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, city, or field"
              className="w-full bg-cream rounded-2xl pl-10 pr-3 py-2.5 text-sm outline-none"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-cream rounded-2xl px-3 py-2.5 text-sm"
          >
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>{UNI_TYPE_LABEL[t] ?? t}</option>
            ))}
          </select>
          <div className="text-xs text-muted-foreground self-center px-2">
            {filtered.length} of {all.length} shown
          </div>
        </div>

        {/* List */}
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((u) => (
            <article key={u.name} className="bg-white border border-border rounded-3xl p-5 shadow-soft space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold leading-tight">{u.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3" /> {u.location}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-lavender-soft rounded-full px-2 py-1 whitespace-nowrap">
                  {UNI_TYPE_LABEL[u.type] ?? u.type}
                </span>
              </div>
              <p className="text-xs leading-relaxed">{u.fields}</p>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="md:col-span-2 bg-white rounded-3xl border border-border p-8 text-center text-sm text-muted-foreground">
              No universities match your search.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Brief({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{label}</div>
      <p className="mt-0.5">{value}</p>
    </div>
  );
}
