import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/useProfile";
import { PetSprite } from "@/components/PetSprite";
import { PETS, THEMES } from "@/lib/pets";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/companion")({
  component: CompanionPage,
});

function CompanionPage() {
  const { profile, update } = useProfile();
  async function pick(id: string) {
    await update.mutateAsync({ selected_pet: id });
    toast.success("New buddy locked in 🐾");
  }
  return (
    <AppShell>
      <div className="max-w-4xl space-y-5">
        <h1 className="font-display text-3xl font-bold">Your companion</h1>
        <p className="text-sm text-muted-foreground">They cheer for every session and grow with your streak.</p>

        <section className="bg-white rounded-[2rem] border border-border p-8 shadow-soft text-center">
          <PetSprite petId={profile?.selected_pet} size={180} />
          <div className="font-display text-2xl font-bold mt-3">
            {PETS.find((p) => p.id === profile?.selected_pet)?.name ?? "Mochi"}
          </div>
          <div className="text-sm text-muted-foreground">{PETS.find((p) => p.id === profile?.selected_pet)?.blurb}</div>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PETS.map((p) => (
            <button key={p.id} onClick={() => pick(p.id)}
              className={`p-4 rounded-3xl border ${profile?.selected_pet === p.id ? "bg-primary/40 border-primary" : "bg-white border-border"}`}>
              <PetSprite petId={p.id} size={96} float={false} />
              <div className="text-sm font-bold mt-2">{p.name.split(" the ")[0]}</div>
              <div className="text-[10px] text-muted-foreground">{p.name.split(" the ")[1]}</div>
            </button>
          ))}
        </section>

        <section className="bg-white rounded-[2rem] border border-border p-5">
          <h2 className="font-display text-lg font-bold mb-3">Theme</h2>
          <div className="flex flex-wrap gap-3">
            {THEMES.map((t) => (
              <button key={t.id} onClick={() => update.mutate({ selected_theme: t.id })}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border ${profile?.selected_theme === t.id ? "bg-primary/30 border-primary" : "bg-white border-border"}`}>
                <span className="size-4 rounded-full" style={{ background: t.swatch }} /> {t.name}
              </button>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
