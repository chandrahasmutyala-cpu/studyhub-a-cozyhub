import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useProfile } from "@/lib/useProfile";
import { PETS } from "@/lib/pets";
import { PetSprite } from "@/components/PetSprite";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

const SUBJECTS = ["Math", "Science", "History", "Languages", "Coding", "Art", "Business", "Other"];

function Onboarding() {
  const { profile, update } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [examTarget, setExamTarget] = useState("");
  const [daily, setDaily] = useState(60);
  const [time, setTime] = useState("evening");
  const [languages, setLanguages] = useState<string[]>([]);
  const [pet, setPet] = useState("capybara");
  const [ageGroup, setAgeGroup] = useState<string>("");

  useEffect(() => {
    if (profile) {
      if (profile.onboarded) navigate({ to: "/dashboard" });
      setName(profile.display_name ?? "");
    }
  }, [profile, navigate]);

  function toggle<T extends string>(list: T[], setList: (l: T[]) => void, v: T) {
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  }

  async function finish() {
    await update.mutateAsync({
      display_name: name || null,
      study_goal: goal || null,
      subjects,
      exam_target: examTarget || null,
      daily_minutes_target: daily,
      preferred_time: time,
      languages,
      selected_pet: pet,
      age_group: ageGroup || null,
      onboarded: true,
    });
    toast.success(`Welcome, ${name || "friend"}! 🌱`);
    navigate({ to: "/dashboard" });
  }

  const ageStep = {
    title: "How old are you?",
    body: (
      <div className="flex gap-2 flex-wrap">
        {["under_13", "13_17", "18_plus"].map((g) => (
          <button key={g} type="button" onClick={() => setAgeGroup(g)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${ageGroup === g ? "bg-primary border-primary" : "bg-white border-border"}`}>
            {g === "under_13" ? "Under 13" : g === "13_17" ? "13–17" : "18+"}
          </button>
        ))}
        <p className="w-full text-xs text-muted-foreground mt-2">Used only for safety defaults. Profile is private.</p>
      </div>
    ),
    canNext: !!ageGroup,
  };

  const steps = [
    {
      title: "What should we call you?",
      body: (
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
          className="w-full bg-cream border border-border rounded-2xl px-4 py-3 outline-none focus:border-primary" />
      ),
      canNext: name.trim().length > 0,
    },
    {
      title: "What are you studying for?",
      body: (
        <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={3}
          placeholder="e.g. JLPT N4 in 6 months, or finals in May"
          className="w-full bg-cream border border-border rounded-2xl px-4 py-3 outline-none focus:border-primary" />
      ),
      canNext: true,
    },
    {
      title: "Pick your subjects",
      body: (
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <button key={s} type="button" onClick={() => toggle(subjects, setSubjects, s)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${subjects.includes(s) ? "bg-primary border-primary" : "bg-white border-border"}`}>
              {s}
            </button>
          ))}
        </div>
      ),
      canNext: true,
    },
    {
      title: "Languages you're learning",
      body: (
        <div className="flex flex-wrap gap-2">
          {["Japanese","English","Spanish","French","Korean","Mandarin","German"].map((s) => (
            <button key={s} type="button" onClick={() => toggle(languages, setLanguages, s)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${languages.includes(s) ? "bg-primary border-primary" : "bg-white border-border"}`}>
              {s}
            </button>
          ))}
        </div>
      ),
      canNext: true,
    },
    {
      title: "Daily study target",
      body: (
        <div className="space-y-3">
          <div className="text-3xl font-display font-bold">{daily} min</div>
          <input type="range" min={15} max={300} step={15} value={daily}
            onChange={(e) => setDaily(parseInt(e.target.value))} className="w-full" />
          <div className="flex gap-2 flex-wrap">
            {["morning","afternoon","evening","night"].map((t) => (
              <button key={t} type="button" onClick={() => setTime(t)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border capitalize ${time === t ? "bg-primary border-primary" : "bg-white border-border"}`}>
                {t}
              </button>
            ))}
          </div>
          <input value={examTarget} onChange={(e) => setExamTarget(e.target.value)}
            placeholder="Exam target (optional, e.g. JLPT N3 Dec 2026)"
            className="w-full bg-cream border border-border rounded-2xl px-4 py-3 outline-none focus:border-primary" />
        </div>
      ),
      canNext: true,
    },
    {
      title: "Pick your study buddy",
      body: (
        <div className="grid grid-cols-3 gap-3">
          {PETS.map((p) => (
            <button key={p.id} type="button" onClick={() => setPet(p.id)}
              className={`rounded-3xl p-3 border ${pet === p.id ? "bg-primary border-primary" : "bg-white border-border"}`}>
              <PetSprite petId={p.id} size={72} float={false} />
              <div className="text-[11px] font-bold mt-1">{p.name.split(" the ")[0]}</div>
            </button>
          ))}
        </div>
      ),
      canNext: true,
    },
  ];

  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen paw-bg grid place-items-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          <span>Step {step + 1} of {steps.length}</span>
          <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden mb-6">
          <div className="h-full bg-primary transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="bg-white rounded-[2rem] border border-border p-7 shadow-soft space-y-5">
          <h1 className="font-display text-2xl font-bold">{s.title}</h1>
          {s.body}
          <div className="flex gap-2 pt-2">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="px-5 py-2.5 rounded-full bg-white border border-border font-bold">
                Back
              </button>
            )}
            <button
              onClick={() => (isLast ? finish() : setStep(step + 1))}
              disabled={!s.canNext || update.isPending}
              className="flex-1 px-5 py-2.5 rounded-full bg-primary font-bold disabled:opacity-50"
            >
              {isLast ? (update.isPending ? "…" : "Enter Study") : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
