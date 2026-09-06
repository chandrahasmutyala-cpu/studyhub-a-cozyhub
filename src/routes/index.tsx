import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Languages, Timer, Compass, GraduationCap, Award, ArrowRight, ClipboardList, Cat } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SplashScreen } from "@/components/SplashScreen";
import { AuthStartupGate } from "@/components/AuthStartupGate";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyHub — A calm bento for deep work" },
      { name: "description", content: "A minimalist study platform: AI tutor, Japanese, Chinese and Korean academies, focus sessions with ambient sound, planner, and a StudentHub for universities, scholarships and applications." },
      { property: "og:title", content: "StudyHub — A calm bento for deep work" },
      { property: "og:description", content: "A minimalist study platform: AI tutor, Japanese, Chinese and Korean academies, focus sessions with ambient sound, planner, and a StudentHub for universities, scholarships and applications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

/* Soft Glass Bento — Matcha & Charcoal edition.
   The theme-charcoal class scopes the dark matcha palette to this page only. */
function Landing() {
  return (
    <div className="theme-charcoal min-h-screen bg-background text-foreground overflow-x-clip selection:bg-primary/30">
      <AuthStartupGate />
      <SplashScreen />

      {/* soft matcha glow field */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[42rem] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-24 -left-32 size-80 rounded-full bg-accent/20 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-5xl mx-auto px-6 lg:px-2 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
            <Logo className="size-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">StudyHub</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-[13px] font-medium uppercase tracking-widest text-muted-foreground">
          <a href="#bento" className="hover:text-foreground transition-colors">Features</a>
          <a href="#academies" className="hover:text-foreground transition-colors">Academies</a>
          <a href="#studenthub" className="hover:text-foreground transition-colors">StudentHub</a>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="hidden sm:inline-flex px-5 py-2.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Log in
          </Link>
          <Link to="/auth" search={{ tab: "signup" as const }} className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition shadow-sm">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero — offset, with a card overlapping its edge */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 lg:px-2 pt-16 md:pt-20 pb-10 text-center">
        <h1 className="font-display text-5xl md:text-7xl font-light tracking-tight leading-[1.05]">
          A calm <span className="italic font-normal text-primary">bento</span> for deep work.
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto mt-5 text-lg leading-relaxed">
          Intelligent tools to harmonize your learning journey.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link to="/auth" search={{ tab: "signup" as const }} className="px-7 py-3 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition inline-flex items-center gap-2">
            Start studying <ArrowRight className="size-4 stroke-[1.75]" />
          </Link>
          <a href="#bento" className="px-7 py-3 rounded-full bg-card/60 border border-border backdrop-blur text-sm font-bold hover:border-primary/40 transition">
            Explore the bento
          </a>
        </div>
      </section>

      {/* Bento — broken grid: overlapping, offset cards */}
      <section id="bento" className="relative z-10 max-w-5xl mx-auto px-6 lg:px-2 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-[160px]">

          {/* AI Tutor — large, slightly rotated */}
          <div className="md:col-span-2 md:row-span-2 md:-rotate-1 md:translate-y-3 rounded-[2.5rem] bg-card/50 backdrop-blur-md border border-border p-10 flex flex-col justify-between group hover:border-primary/40 transition-all duration-500 shadow-soft relative overflow-hidden">
            <div className="absolute -top-12 -right-12 size-48 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/15 transition-all duration-700" aria-hidden />
            <div className="relative">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">Intelligent</span>
              <h3 className="font-display text-3xl text-foreground flex items-center gap-2"><Sparkles className="size-5 stroke-[1.75] text-primary" /> AI Tutor</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed max-w-sm">Your personal academic companion, synthesized for clarity — Japanese, Chinese, Korean, or any subject.</p>
            </div>
            <div className="relative mt-8 h-32 w-full rounded-2xl bg-background/60 border border-border flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-card/40 to-transparent" aria-hidden />
              <div className="flex gap-2 items-end">
                <div className="w-2 h-8 bg-primary rounded-full animate-pulse" />
                <div className="w-2 h-12 bg-primary/60 rounded-full animate-pulse [animation-delay:0.2s]" />
                <div className="w-2 h-6 bg-primary/40 rounded-full animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </div>

          {/* Focus Flow */}
          <div className="md:col-span-2 md:rotate-[0.5deg] md:-translate-y-1 rounded-[2.5rem] bg-secondary/70 border border-border p-8 flex items-center justify-between shadow-soft">
            <div className="space-y-1">
              <h3 className="font-display text-xl font-medium flex items-center gap-2"><Timer className="size-5 stroke-[1.75] text-primary" /> Focus Flow</h3>
              <p className="text-muted-foreground text-sm italic">Minimalism for the mind.</p>
            </div>
            <div className="size-14 rounded-2xl bg-background/60 border border-border flex items-center justify-center text-primary font-display font-bold text-sm">
              25:00
            </div>
          </div>

          {/* Polyglot */}
          <div id="academies" className="md:-rotate-1 md:translate-y-2 rounded-[2rem] bg-card/50 backdrop-blur-md border border-border p-6 flex flex-col justify-between shadow-soft hover:border-primary/40 transition-colors">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider flex items-center gap-2"><Languages className="size-4 stroke-[1.75] text-primary" /> Polyglot</h3>
            <div className="flex flex-wrap gap-2 mt-4">
              {["日", "中", "한"].map((g) => (
                <span key={g} className="size-8 rounded-lg bg-background/60 border border-border flex items-center justify-center text-xs font-bold text-primary">{g}</span>
              ))}
            </div>
          </div>

          {/* Planner / Sync */}
          <div className="md:rotate-[0.75deg] rounded-[2rem] bg-card/50 backdrop-blur-md border border-border p-6 flex flex-col justify-between shadow-soft hover:border-primary/40 transition-colors">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider flex items-center gap-2"><ClipboardList className="size-4 stroke-[1.75] text-primary" /> Planner</h3>
            <div className="space-y-2.5 mt-4">
              <div className="h-1.5 bg-primary/25 rounded-full w-full" />
              <div className="h-1.5 bg-primary/25 rounded-full w-4/5" />
              <div className="h-1.5 bg-primary/25 rounded-full w-2/3" />
            </div>
          </div>

          {/* StudentHub — overlaps upward into the row above */}
          <div id="studenthub" className="md:col-span-2 md:-translate-y-4 md:-rotate-[0.5deg] rounded-[2.5rem] bg-secondary/60 border border-border p-8 flex items-center gap-6 shadow-soft hover:border-primary/40 transition-colors">
            <div className="flex -space-x-3">
              <span className="size-10 rounded-full border-2 border-card bg-accent flex items-center justify-center"><Compass className="size-4 stroke-[1.75] text-primary" /></span>
              <span className="size-10 rounded-full border-2 border-card bg-accent/80 flex items-center justify-center"><GraduationCap className="size-4 stroke-[1.75] text-primary" /></span>
              <span className="size-10 rounded-full border-2 border-card bg-accent/60 flex items-center justify-center"><Award className="size-4 stroke-[1.75] text-primary" /></span>
            </div>
            <div>
              <h3 className="font-display text-xl font-medium">StudentHub</h3>
              <p className="text-muted-foreground text-sm">Universities, scholarships & applications.</p>
            </div>
          </div>

          {/* Manifesto — dark elevated card crossing the grid line */}
          <div className="md:col-span-2 md:rotate-1 md:translate-y-2 rounded-[2.5rem] bg-primary text-primary-foreground p-10 flex flex-col justify-center relative overflow-hidden group shadow-pop">
            <div className="absolute -top-10 -right-10 size-32 rounded-full bg-white/10 blur-3xl group-hover:bg-white/15 transition-all duration-700" aria-hidden />
            <p className="italic font-display text-lg leading-relaxed relative z-10 opacity-90">
              &ldquo;Focus is not about doing more. It's about clearing the space for greatness to happen naturally.&rdquo;
            </p>
          </div>

          {/* DoodleKitty */}
          <div className="md:-rotate-1 md:-translate-y-3 rounded-[2rem] bg-card/50 backdrop-blur-md border border-border p-6 flex items-center justify-center gap-3 shadow-soft hover:border-primary/40 transition-colors">
            <Cat className="size-10 stroke-[1.25] text-primary" />
            <div>
              <h3 className="font-display text-base font-semibold">DoodleKitty</h3>
              <p className="text-muted-foreground text-xs">White-ink drawing companion.</p>
            </div>
          </div>

          {/* CTA — gradient matcha rail */}
          <div className="md:col-span-3 md:rotate-[0.5deg] rounded-[2rem] bg-gradient-to-r from-primary to-primary/70 text-primary-foreground p-8 flex flex-wrap items-center justify-between gap-4 shadow-pop">
            <div>
              <h4 className="font-display text-2xl">Start your flow.</h4>
              <p className="text-primary-foreground/70 text-sm mt-1">Free to start — a quiet room to work.</p>
            </div>
            <Link to="/auth" search={{ tab: "signup" as const }} className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-3 rounded-full text-sm font-bold shadow-sm hover:scale-105 transition-transform">
              Create your account <ArrowRight className="size-4 stroke-[1.75]" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border px-6 lg:px-2 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo className="size-7" />
            <span className="font-display text-base font-semibold">StudyHub</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} StudyHub — a calm place to actually focus.</p>
        </div>
      </footer>
    </div>
  );
}
