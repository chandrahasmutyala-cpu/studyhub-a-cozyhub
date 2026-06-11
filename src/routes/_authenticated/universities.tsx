import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { GraduationCap, ExternalLink, BookmarkPlus, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/universities")({
  component: UniversitiesPage,
});

type Uni = {
  id: string; name: string; country: string; city: string | null;
  languages: string[] | null; degrees: string[] | null;
  tuition_min: number | null; tuition_max: number | null; currency: string | null;
  requirements: string | null; scholarships_available: boolean | null;
  website: string | null; application_deadline: string | null;
};

function UniversitiesPage() {
  const qc = useQueryClient();
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [degree, setDegree] = useState("");
  const [maxTuition, setMaxTuition] = useState<number | "">("");
  const [q, setQ] = useState("");

  const list = useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("universities").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as Uni[];
    },
  });

  const countries = useMemo(() => Array.from(new Set((list.data ?? []).map((u) => u.country))).sort(), [list.data]);

  const filtered = useMemo(() => (list.data ?? []).filter((u) => {
    if (q && !u.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (country && u.country !== country) return false;
    if (language && !(u.languages ?? []).includes(language)) return false;
    if (degree && !(u.degrees ?? []).map((d) => d.toLowerCase()).includes(degree.toLowerCase())) return false;
    if (maxTuition !== "" && (u.tuition_min ?? 0) > Number(maxTuition)) return false;
    return true;
  }), [list.data, q, country, language, degree, maxTuition]);

  async function track(u: Uni) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("applications").insert({
      user_id: user.id, kind: "university", name: u.name, country: u.country,
      url: u.website, status: "interested", deadline: u.application_deadline,
    });
    if (error) return toast.error(error.message);
    toast.success(`Added ${u.name} to applications`);
    qc.invalidateQueries({ queryKey: ["applications"] });
  }

  return (
    <AppShell>
      <div className="max-w-6xl space-y-5">
        <header>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Discovery</div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2 mt-1">
            <GraduationCap className="size-7 text-primary" /> Universities
          </h1>
          <p className="text-sm text-muted-foreground">Only verified entries shown. Save the ones you like to your tracker.</p>
        </header>

        <div className="bg-white border border-border rounded-3xl p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name"
              className="w-full bg-cream rounded-2xl pl-10 pr-3 py-2.5 text-sm outline-none" />
          </div>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-cream rounded-2xl px-3 py-2.5 text-sm">
            <option value="">Any country</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="Degree (e.g. BSc)" className="bg-cream rounded-2xl px-3 py-2.5 text-sm outline-none" />
          <div className="flex gap-2">
            <input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="Language" className="flex-1 bg-cream rounded-2xl px-3 py-2.5 text-sm outline-none" />
            <input value={maxTuition} onChange={(e) => setMaxTuition(e.target.value ? Number(e.target.value) : "")} placeholder="Max $" className="w-24 bg-cream rounded-2xl px-3 py-2.5 text-sm outline-none" type="number" />
          </div>
        </div>

        {list.isLoading && <div className="h-32 bg-cream animate-pulse rounded-3xl" />}
        {!list.isLoading && filtered.length === 0 && (
          <div className="bg-white rounded-3xl border border-border p-8 text-center text-sm text-muted-foreground">
            No verified universities match your filters yet. Add data via the admin import (or ask us to seed the directory).
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((u) => (
            <article key={u.id} className="bg-white border border-border rounded-3xl p-5 shadow-soft space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold">{u.name}</h3>
                  <p className="text-xs text-muted-foreground">{[u.city, u.country].filter(Boolean).join(", ")}</p>
                </div>
                <button onClick={() => track(u)} className="size-9 rounded-full bg-secondary hover:bg-primary grid place-items-center" aria-label="Track">
                  <BookmarkPlus className="size-4" />
                </button>
              </div>
              <div className="text-xs flex flex-wrap gap-1.5">
                {(u.degrees ?? []).map((d) => <span key={d} className="bg-lavender-soft rounded-full px-2 py-0.5">{d}</span>)}
                {(u.languages ?? []).map((l) => <span key={l} className="bg-matcha-soft rounded-full px-2 py-0.5">{l}</span>)}
              </div>
              {(u.tuition_min || u.tuition_max) && (
                <p className="text-xs text-muted-foreground">Tuition: {u.tuition_min ?? "?"}–{u.tuition_max ?? "?"} {u.currency ?? "USD"}/yr</p>
              )}
              {u.requirements && <p className="text-xs">{u.requirements}</p>}
              <div className="flex items-center gap-3 text-xs">
                {u.application_deadline && <span>📅 {new Date(u.application_deadline).toLocaleDateString()}</span>}
                {u.scholarships_available && <span className="bg-honey/50 rounded-full px-2 py-0.5">Scholarships</span>}
                {u.website && (
                  <a href={u.website} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 font-bold text-primary-foreground bg-primary rounded-full px-3 py-1">
                    Visit <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
