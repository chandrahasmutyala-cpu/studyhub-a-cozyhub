import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Mascot } from "@/components/Mascot";
import { useProfile } from "@/lib/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Lock, ShieldCheck, Bell, Sparkles, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, update } = useProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);

  const ageLabel = profile?.age_group ?? "Not set";
  const isPrivate = profile?.is_private ?? true;

  async function togglePrivate() {
    await update.mutateAsync({ is_private: !isPrivate });
  }

  async function reset() {
    if (!confirm("Reset device data? This signs you out and clears the local cache.")) return;
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Device data cleared");
    navigate({ to: "/auth", replace: true });
  }

  const details: { key: string; label: string; value: string | null | undefined }[] = [
    { key: "career", label: "Career goal", value: profile?.dream_career },
    { key: "country", label: "Dream country", value: profile?.dream_country },
    { key: "uni", label: "Dream university", value: profile?.dream_university },
    { key: "interests", label: "Interests", value: profile?.subjects?.join(", ") || null },
  ];

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-up">
        <header>
          <div className="section-label">Profile</div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-1">Your StudentHub</h1>
        </header>

        {/* Identity card */}
        <section className="bg-card border border-border rounded-3xl p-5 flex items-center gap-4">
          <div className="size-20 rounded-2xl bg-brand-soft grid place-items-center overflow-hidden shrink-0">
            <Mascot size={80} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg truncate">{profile?.display_name ?? "Student"}</div>
            <div className="text-sm text-muted-foreground mt-0.5">— · Age group {ageLabel}</div>
            <div className="mt-1.5 inline-flex items-center gap-1 text-primary text-[11px] font-bold uppercase tracking-wider">
              <Lock className="size-3" /> {isPrivate ? "Private profile" : "Public profile"}
            </div>
          </div>
          <Link to="/onboarding" className="text-primary font-semibold text-sm shrink-0">Edit</Link>
        </section>

        {/* Detail accordion */}
        <section className="bg-card border border-border rounded-3xl divide-y divide-border">
          {details.map((d) => {
            const isOpen = open === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setOpen(isOpen ? null : d.key)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="section-label">{d.label}</div>
                  {isOpen && (
                    <div className="text-sm mt-1 text-foreground/80">{d.value ?? "Not set yet"}</div>
                  )}
                </div>
                <div className="text-muted-foreground text-xl leading-none ml-3 shrink-0">—</div>
              </button>
            );
          })}
        </section>

        {/* Safety & Privacy */}
        <div>
          <div className="section-label mb-2">Safety & Privacy</div>
          <div className="space-y-3">
            <button
              onClick={togglePrivate}
              className="w-full bg-card border border-border rounded-3xl p-4 flex items-center gap-4 text-left"
            >
              <div className="size-10 rounded-full bg-brand-soft grid place-items-center shrink-0">
                <ShieldCheck className="size-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold">Private profile</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Hidden from discovery. Different age groups can't message you.
                </div>
              </div>
              <span
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                  isPrivate ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                    isPrivate ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>

            <Row to="/settings" icon={Bell} title="Notifications" desc="Study, exam, scholarship & application reminders" />
            <Row to="/avatar" icon={Sparkles} title="Avatar Creator" desc="Customize your StudentHub avatar" />
          </div>
        </div>

        <button
          onClick={reset}
          className="w-full bg-card border border-border rounded-full py-4 flex items-center justify-center gap-2 text-destructive font-semibold text-sm"
        >
          <Trash2 className="size-4" /> Reset device data
        </button>
      </div>
    </AppShell>
  );
}

function Row({
  to, icon: Icon, title, desc,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link to={to as "/settings"} className="block bg-card border border-border rounded-3xl p-4 flex items-center gap-4">
      <div className="size-10 rounded-full bg-brand-soft grid place-items-center shrink-0">
        <Icon className="size-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">{desc}</div>
      </div>
      <ChevronRight className="size-5 text-muted-foreground shrink-0" />
    </Link>
  );
}
