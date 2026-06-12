import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ExternalLink, Search, ShieldCheck, GraduationCap } from "lucide-react";
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
  const [q, setQ] = useState("");

  const list = useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("universities").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as Uni[];
    },
  });

  const countries = useMemo(
    () => Array.from(new Set((list.data ?? []).map((u) => u.country))).sort(),
    [list.data],
  );

  const filtered = useMemo(() => (list.data ?? []).filter((u) => {
    if (q && !u.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (country && u.country !== country) return false;
    return true;
  }), [list.data, q, country]);

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
      <div className="space-y-6 animate-fade-up">
        <header className="flex items-start justify-between gap-3">
          <div>
            <div className="section-label">University Finder</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-1">Where will you study?</h1>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-verified-soft text-verified rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider shrink-0">
            <ShieldCheck className="size-3.5" /> Verified
          </span>
        </header>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search universities"
            className="w-full bg-card border border-border rounded-full pl-12 pr-4 py-3.5 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Country pills */}
        {countries.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
            <Pill active={country === ""} onClick={() => setCountry("")}>All</Pill>
            {countries.map((c) => (
              <Pill key={c} active={country === c} onClick={() => setCountry(c)}>{c}</Pill>
            ))}
          </div>
        )}

        {list.isLoading && <div className="h-40 bg-muted animate-pulse rounded-3xl" />}

        {!list.isLoading && filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center">
            <div className="size-10 mx-auto rounded-full bg-muted grid place-items-center mb-3">
              <GraduationCap className="size-5 text-muted-foreground" />
            </div>
            <div className="font-semibold">No universities yet</div>
            <div className="text-sm text-muted-foreground mt-1">The verified directory is being seeded.</div>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((u) => (
            <article key={u.id} className="bg-card border border-border rounded-3xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{u.name}</h3>
                    <ShieldCheck className="size-4 text-verified shrink-0" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {[u.city, u.country].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button
                  onClick={() => track(u)}
                  className="size-9 rounded-full border border-border grid place-items-center hover:bg-muted shrink-0"
                  aria-label="Save"
                >
                  <ExternalLink className="size-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Field label="Tuition">
                  {u.tuition_min || u.tuition_max
                    ? `${u.currency ?? ""}${u.tuition_min ?? "?"}${u.tuition_max ? `–${u.tuition_max}` : ""} / yr`
                    : "—"}
                </Field>
                <Field label="Language">
                  {(u.languages ?? []).join(" / ") || "—"}
                </Field>
              </div>
              {u.scholarships_available && (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-verified-soft text-verified rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                  Scholarships
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function Pill({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-card text-foreground border-border hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-muted rounded-2xl px-4 py-3">
      <div className="section-label">{label}</div>
      <div className="text-sm font-semibold mt-0.5">{children}</div>
    </div>
  );
}
