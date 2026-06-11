import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Award, ExternalLink, BookmarkPlus, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/scholarships")({
  component: ScholarshipsPage,
});

type Scholarship = {
  id: string; name: string; provider: string | null; country: string | null;
  eligibility: string | null; benefits: string | null; documents_required: string | null;
  deadline: string | null; source_url: string;
};

function ScholarshipsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");

  const list = useQuery({
    queryKey: ["scholarships"],
    queryFn: async () => {
      const { data, error } = await supabase.from("scholarships").select("*").order("deadline", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Scholarship[];
    },
  });

  const countries = useMemo(() => Array.from(new Set((list.data ?? []).map((s) => s.country).filter(Boolean) as string[])).sort(), [list.data]);
  const filtered = useMemo(() => (list.data ?? []).filter((s) =>
    (!q || s.name.toLowerCase().includes(q.toLowerCase())) && (!country || s.country === country)
  ), [list.data, q, country]);

  async function track(s: Scholarship) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("applications").insert({
      user_id: user.id, kind: "scholarship", name: s.name, country: s.country,
      url: s.source_url, status: "interested", deadline: s.deadline,
    });
    if (error) return toast.error(error.message);
    toast.success(`Saved ${s.name}`);
    qc.invalidateQueries({ queryKey: ["applications"] });
  }

  return (
    <AppShell>
      <div className="max-w-5xl space-y-5">
        <header>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Discovery</div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2 mt-1">
            <Award className="size-7 text-primary" /> Scholarships
          </h1>
          <p className="text-sm text-muted-foreground">Verified scholarships only — always confirm details on the official source.</p>
        </header>

        <div className="bg-white border border-border rounded-3xl p-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search scholarships" className="w-full bg-cream rounded-2xl pl-10 pr-3 py-2.5 text-sm outline-none" />
          </div>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-cream rounded-2xl px-3 py-2.5 text-sm">
            <option value="">Any country</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {list.isLoading && <div className="h-32 bg-cream animate-pulse rounded-3xl" />}
        {!list.isLoading && filtered.length === 0 && (
          <div className="bg-white rounded-3xl border border-border p-8 text-center text-sm text-muted-foreground">
            No verified scholarships available yet.
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((s) => (
            <article key={s.id} className="bg-white border border-border rounded-3xl p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">{[s.provider, s.country].filter(Boolean).join(" · ")}</p>
                </div>
                <button onClick={() => track(s)} className="size-9 rounded-full bg-secondary hover:bg-primary grid place-items-center" aria-label="Save">
                  <BookmarkPlus className="size-4" />
                </button>
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                {s.eligibility && <div><span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Eligibility</span><p>{s.eligibility}</p></div>}
                {s.benefits && <div><span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Benefits</span><p>{s.benefits}</p></div>}
                {s.documents_required && <div className="sm:col-span-2"><span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Documents</span><p>{s.documents_required}</p></div>}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                {s.deadline ? <span>📅 Deadline: {new Date(s.deadline).toLocaleDateString()}</span> : <span />}
                <a href={s.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold bg-primary rounded-full px-3 py-1">
                  Official source <ExternalLink className="size-3" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
