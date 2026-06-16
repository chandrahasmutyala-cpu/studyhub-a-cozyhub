import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Languages, Timer, Layers, NotebookPen, Compass, GraduationCap, Award } from "lucide-react";
import { Logo } from "@/components/Logo";
import { PandaBackground } from "@/components/PandaBackground";
import { SplashScreen } from "@/components/SplashScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyHub — Learn. Plan. Achieve." },
      { name: "description", content: "A calm study platform with AI tutor, full Japanese path (hiragana, katakana, JLPT N5–N1 kanji with stroke order), Chinese and Korean lessons, focus timer, flashcards, and StudentHub for universities and scholarships." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen text-foreground relative">
      <SplashScreen />
      <PandaBackground />

      <nav className="px-6 lg:px-12 py-5 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <Logo className="size-10" />
          <span className="font-display text-2xl font-bold tracking-tight text-ink">StudyHub</span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-semibold text-foreground/70">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#studenthub" className="hover:text-primary transition-colors">StudentHub</a>
          <a href="#languages" className="hover:text-primary transition-colors">Languages</a>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="px-5 py-2.5 rounded-full bg-white/90 backdrop-blur border border-border font-bold text-sm hover:shadow-soft transition-all">Login</Link>
          <Link to="/auth" search={{ tab: "signup" as const }} className="px-5 py-2.5 rounded-full bg-primary font-bold text-sm shadow-soft hover:-translate-y-0.5 transition-all">Sign up</Link>
        </div>
      </nav>

      <section className="px-6 lg:px-12 pt-12 pb-24 max-w-3xl mx-auto text-center relative z-10">
        <div className="space-y-7 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full text-xs font-bold border border-border">
            <span className="size-2 rounded-full bg-primary"></span>
            A calm place to actually focus
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] font-bold text-balance text-ink">
            Learn. <span className="text-primary">Plan.</span> Achieve.
          </h1>
          <p className="text-lg text-foreground/70 max-w-xl mx-auto leading-relaxed">
            Plan your day, focus deeply, learn Japanese, Chinese, and Korean, and map out your university and scholarship path inside one cozy hub.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/auth" search={{ tab: "signup" as const }} className="px-7 py-3.5 rounded-3xl bg-primary text-base font-bold shadow-pop hover:scale-[1.02] active:scale-[0.98] transition-transform">
              Start studying — it's free
            </Link>
            <a href="#features" className="px-7 py-3.5 rounded-3xl bg-white/90 backdrop-blur border border-border text-base font-bold hover:bg-white transition-colors">
              See features
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="px-6 lg:px-12 py-20 bg-white/40 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="font-display text-4xl font-bold text-ink">Everything you need to focus</h2>
            <p className="text-foreground/60">Tools designed to feel calm, not loud.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { Icon: Sparkles, t: "AI Tutor", d: "Japanese, Chinese, Korean, and general study help with clear explanations." },
              { Icon: Languages, t: "Language Path", d: "Hiragana to JLPT N1 kanji with stroke order, plus Chinese and Korean." },
              { Icon: Timer, t: "Focus Sessions", d: "Pomodoro timer with calm backgrounds and ambient sounds." },
              { Icon: NotebookPen, t: "Notes", d: "Markdown notes that sync everywhere and stay yours." },
              { Icon: Layers, t: "Flashcards", d: "Spaced repetition that knows when you'll forget." },
              { Icon: Compass, t: "AI Future Planner", d: "Map a realistic roadmap from your current grade to your dream career." },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="group bg-white/85 backdrop-blur p-7 rounded-[2rem] border border-border hover:shadow-pop hover:-translate-y-1 transition-all">
                <div className="size-12 bg-primary/40 rounded-2xl grid place-items-center mb-5">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2 text-ink">{t}</h3>
                <p className="text-sm leading-relaxed text-foreground/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="studenthub" className="px-6 lg:px-12 py-24 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10 space-y-3">
          <h2 className="font-display text-4xl font-bold text-ink">StudentHub</h2>
          <p className="text-foreground/60 max-w-xl mx-auto">Career planning, universities, scholarships, and application tracking — all in one place.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { Icon: Compass, t: "Career Hub", d: "Set goals, get an AI roadmap." },
            { Icon: GraduationCap, t: "Universities", d: "Browse verified programs." },
            { Icon: Award, t: "Scholarships", d: "Discover and save opportunities." },
            { Icon: NotebookPen, t: "Applications", d: "Track deadlines and status." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="bg-white/85 backdrop-blur rounded-3xl p-6 border border-border">
              <div className="size-10 bg-primary/40 rounded-2xl grid place-items-center mb-3"><Icon className="size-5" /></div>
              <div className="font-display font-bold text-ink">{t}</div>
              <p className="text-xs text-muted-foreground mt-1">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="languages" className="px-6 lg:px-12 py-20 bg-white/40 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="font-display text-4xl font-bold text-ink">Japanese · Chinese · Korean</h2>
          <p className="text-foreground/70">A complete language path: kana foundations, JLPT N5→N1 kanji with numbered stroke-order arrows, HSK Chinese, and Korean Hangul — with an AI tutor that speaks each language with you.</p>
          <Link to="/auth" search={{ tab: "signup" as const }} className="inline-block px-7 py-3 rounded-3xl bg-primary font-bold shadow-soft">Start the path</Link>
        </div>
      </section>

      <footer className="px-6 lg:px-12 py-12 border-t border-border bg-white/40 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Logo className="size-8" />
            <span className="font-display text-xl font-bold text-ink">StudyHub</span>
          </div>
          <p className="text-sm text-foreground/50">© {new Date().getFullYear()} StudyHub — made for calm learners.</p>
        </div>
      </footer>
    </div>
  );
}
