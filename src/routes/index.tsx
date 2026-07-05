import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Languages, Timer, Compass, GraduationCap, Award, ArrowRight, ClipboardList, Cat } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SplashScreen } from "@/components/SplashScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyHub — A calm bento for deep work" },
      { name: "description", content: "A minimalist study platform: AI tutor, Japanese, Chinese and Korean academies, focus sessions with ambient sound, planner, and a StudentHub for universities, scholarships and applications." },
      { property: "og:title", content: "StudyHub — A calm bento for deep work" },
      { property: "og:description", content: "AI tutor, three language academies, focus timer with ambient sound, and a full StudentHub for your next step." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SplashScreen />

      {/* Nav */}
      <nav className="px-6 lg:px-12 py-6 flex justify-between items-center relative z-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <Logo className="size-9" />
          <span className="font-display text-xl font-bold tracking-tight">StudyHub</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-foreground/70">
          <a href="#bento" className="hover:text-foreground transition">Features</a>
          <a href="#academies" className="hover:text-foreground transition">Academies</a>
          <a href="#studenthub" className="hover:text-foreground transition">StudentHub</a>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-semibold hover:bg-muted transition">
            Log in
          </Link>
          <Link to="/auth" search={{ tab: "signup" as const }} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition">
            Get started <ArrowRight className="size-3.5 stroke-[1.75]" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 lg:px-12 pt-10 pb-16 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border/60 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" /> Sage & Cream · v1
        </div>
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.02] mt-6">
          A calm bento for<br /><span className="text-primary">deep work.</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mt-5 leading-relaxed">
          One quiet workspace for planning, focus, three language academies, and the full path to university — all in a soft sage palette designed to lower your shoulders.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link to="/auth" search={{ tab: "signup" as const }} className="px-6 py-3 rounded-full bg-foreground text-background text-sm font-bold hover:opacity-90 transition inline-flex items-center gap-2">
            Start studying <ArrowRight className="size-4 stroke-[1.75]" />
          </Link>
          <a href="#bento" className="px-6 py-3 rounded-full bg-card border border-border/60 text-sm font-bold hover:border-primary/40 transition">
            Explore the bento
          </a>
        </div>
      </section>

      {/* Bento grid */}
      <section id="bento" className="px-6 lg:px-12 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-6 auto-rows-[minmax(9rem,auto)] gap-4">
          {/* Tutor — large */}
          <div className="col-span-6 md:col-span-4 row-span-2 rounded-3xl bg-card border border-border/60 p-7 md:p-8 flex flex-col justify-between relative overflow-hidden hover:border-primary/40 transition">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <Sparkles className="size-3.5 stroke-[1.75]" /> AI Tutor
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold mt-3 tracking-tight leading-tight">
                Ask anything.<br />Get calm, precise answers.
              </h3>
              <p className="text-sm text-muted-foreground mt-3 max-w-md">Japanese, Chinese, Korean, or general study help — with clear explanations, worked examples and gentle follow-ups.</p>
            </div>
            <div className="absolute -bottom-16 -right-16 size-56 rounded-full bg-primary/10 blur-2xl" aria-hidden />
          </div>

          {/* Focus */}
          <div className="col-span-3 md:col-span-2 rounded-3xl bg-primary text-primary-foreground p-6 flex flex-col justify-between hover:opacity-95 transition">
            <Timer className="size-6 stroke-[1.75]" />
            <div>
              <div className="font-display text-2xl font-bold leading-tight">Focus.</div>
              <div className="text-xs opacity-80 mt-1">Pomodoro + ambient sound.</div>
            </div>
          </div>

          {/* Academies */}
          <div id="academies" className="col-span-3 md:col-span-2 rounded-3xl bg-card border border-border/60 p-6 hover:border-primary/40 transition">
            <Languages className="size-6 stroke-[1.75] text-primary" />
            <div className="font-display text-xl font-bold mt-3">日本語 · 中文 · 한국어</div>
            <div className="text-xs text-muted-foreground mt-1">Three full academies.</div>
          </div>

          {/* Planner */}
          <div className="col-span-3 md:col-span-2 rounded-3xl bg-card border border-border/60 p-6 hover:border-primary/40 transition">
            <ClipboardList className="size-6 stroke-[1.75] text-primary" />
            <div className="font-display text-xl font-bold mt-3">Planner</div>
            <div className="text-xs text-muted-foreground mt-1">Today, this week, deadlines.</div>
          </div>

          {/* StudentHub — wide */}
          <div id="studenthub" className="col-span-6 md:col-span-4 rounded-3xl bg-secondary text-secondary-foreground p-7 md:p-8 hover:opacity-95 transition">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-70">
                  <Compass className="size-3.5 stroke-[1.75]" /> StudentHub
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold mt-2 tracking-tight leading-tight">Career, universities,<br />scholarships & applications.</h3>
              </div>
              <ArrowRight className="size-5 stroke-[1.75] shrink-0" />
            </div>
            <div className="grid grid-cols-4 gap-3 mt-5 text-[11px] font-semibold">
              {[
                { icon: Compass, label: "Career" },
                { icon: GraduationCap, label: "Uni" },
                { icon: Award, label: "Scholar" },
                { icon: ClipboardList, label: "Apps" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-2xl bg-background/40 backdrop-blur px-3 py-3 flex items-center gap-2">
                  <Icon className="size-4 stroke-[1.75]" /> {label}
                </div>
              ))}
            </div>
          </div>

          {/* DoodleKitty */}
          <div className="col-span-3 md:col-span-2 rounded-3xl bg-card border border-border/60 p-6 hover:border-primary/40 transition">
            <Cat className="size-6 stroke-[1.75] text-primary" />
            <div className="font-display text-xl font-bold mt-3">DoodleKitty</div>
            <div className="text-xs text-muted-foreground mt-1">AI-powered drawing companion.</div>
          </div>

          {/* Streak */}
          <div className="col-span-3 md:col-span-2 rounded-3xl bg-card border border-border/60 p-6 hover:border-primary/40 transition">
            <div className="font-display text-4xl font-bold text-primary">7d</div>
            <div className="text-xs text-muted-foreground mt-2">Median streak in the first month.</div>
          </div>

          {/* Quote — wide */}
          <div className="col-span-6 md:col-span-4 rounded-3xl bg-foreground text-background p-7 md:p-8 flex flex-col justify-between hover:opacity-95 transition">
            <div className="text-xs font-bold uppercase tracking-[0.22em] opacity-60">Manifesto</div>
            <p className="font-display text-2xl md:text-3xl font-medium leading-snug mt-3">
              &ldquo;Small, quiet sessions beat loud, brittle sprints. StudyHub is built for the long climb.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-12 pb-24 max-w-3xl mx-auto text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Ready to lower your shoulders?</h2>
        <p className="text-muted-foreground mt-3">Free to start. No noise, no upsells — just a quiet room to work.</p>
        <Link to="/auth" search={{ tab: "signup" as const }} className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-bold hover:opacity-90 transition">
          Create your account <ArrowRight className="size-4 stroke-[1.75]" />
        </Link>
      </section>

      <footer className="px-6 lg:px-12 py-10 border-t border-border/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo className="size-7" />
            <span className="font-display text-base font-bold">StudyHub</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} StudyHub — a calm place to actually focus.</p>
        </div>
      </footer>
    </div>
  );
}
