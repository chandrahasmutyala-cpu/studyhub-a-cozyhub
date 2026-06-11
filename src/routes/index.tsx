import { createFileRoute, Link } from "@tanstack/react-router";
import { PetSprite } from "@/components/PetSprite";
import { PETS } from "@/lib/pets";
import { Sparkles, Languages, Timer, Heart, Layers, NotebookPen } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Study — your softest corner for hard work" },
      { name: "description", content: "A cozy kawaii study platform with AI tutor, Japanese learning, focus timer, flashcards, and a virtual animal companion." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen paw-bg text-foreground">
      {/* Nav */}
      <nav className="px-6 lg:px-12 py-5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="size-10 bg-primary rounded-2xl grid place-items-center text-2xl">🍓</div>
          <span className="font-display text-2xl font-bold tracking-tight">Study.</span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-semibold text-foreground/70">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#companions" className="hover:text-primary transition-colors">Companions</a>
          <a href="#japanese" className="hover:text-primary transition-colors">Japanese</a>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="px-5 py-2.5 rounded-full bg-white border border-border font-bold text-sm hover:shadow-soft transition-all">Login</Link>
          <Link to="/auth" search={{ tab: "signup" as const }} className="px-5 py-2.5 rounded-full bg-primary font-bold text-sm shadow-soft hover:-translate-y-0.5 transition-all">Sign up</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 lg:px-12 pt-8 pb-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-7 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-xs font-bold">
              <span className="size-2 rounded-full bg-matcha"></span>
              A calm place to actually focus
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] font-bold text-balance">
              Your softest corner <br className="hidden sm:block" />for <span className="text-primary underline decoration-wavy decoration-primary/60 underline-offset-8">hard work.</span>
            </h1>
            <p className="text-lg text-foreground/70 max-w-lg leading-relaxed">
              Plan your day, focus deeply, learn Japanese from hiragana to JLPT N1, and grow alongside a tiny animal companion that cheers for every pomodoro.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth" search={{ tab: "signup" as const }} className="px-7 py-3.5 rounded-3xl bg-primary text-base font-bold shadow-pop hover:scale-[1.02] active:scale-[0.98] transition-transform">
                Start studying — it's free
              </Link>
              <a href="#features" className="px-7 py-3.5 rounded-3xl bg-white border border-border text-base font-bold hover:bg-secondary/40 transition-colors">
                See features
              </a>
            </div>
            <div className="flex items-center gap-3 pt-2 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {PETS.slice(0, 4).map((p) => (
                  <img key={p.id} src={p.image} alt="" width={32} height={32} className="size-8 rounded-full bg-white border-2 border-cream" />
                ))}
              </div>
              Six cute companions to choose from
            </div>
          </div>

          {/* App preview */}
          <div className="bg-white/70 p-5 sm:p-6 rounded-[2.5rem] border-8 border-white shadow-pop relative">
            <div className="absolute -top-10 -right-6 sm:-right-8 animate-float-soft z-10">
              <PetSprite petId="capybara" size={140} float={false} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-3xl shadow-soft space-y-3 border border-lavender/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Language</span>
                  <span className="px-2 py-0.5 bg-lavender rounded-lg text-[10px] font-bold">JLPT N3</span>
                </div>
                <div className="text-4xl font-display py-1" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>約束</div>
                <p className="text-sm font-medium">yakusoku · promise</p>
                <div className="w-full h-2 bg-lavender-soft rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-lavender rounded-full" />
                </div>
              </div>

              <div className="bg-matcha-soft p-5 rounded-3xl shadow-soft border border-matcha/40 flex flex-col items-center justify-center gap-2">
                <div className="text-3xl font-display font-bold">24:59</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Deep Focus</div>
                <div className="flex gap-1.5 mt-1">
                  <div className="size-2 rounded-full bg-matcha" />
                  <div className="size-2 rounded-full bg-matcha/30" />
                  <div className="size-2 rounded-full bg-matcha/30" />
                </div>
              </div>

              <div className="col-span-2 bg-white p-5 rounded-3xl shadow-soft border border-border space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="size-8 shrink-0 bg-lavender rounded-xl grid place-items-center">✨</div>
                  <div className="bg-cream p-3 rounded-2xl rounded-tl-none text-sm">
                    Want to practice the <strong>~te form</strong> together today?
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-cream rounded-full px-4 flex items-center text-xs text-muted-foreground">Type a response…</div>
                  <div className="size-10 bg-primary rounded-full grid place-items-center font-bold">→</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 lg:px-12 py-20 bg-white/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="font-display text-4xl font-bold">Everything you need to focus</h2>
            <p className="text-foreground/60">Tools designed to feel like a warm hug, not a chore.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { Icon: Sparkles, t: "AI Tutor", d: "Ask anything — homework, code, exam prep. Clear explanations, tiny examples.", c: "bg-peach-soft" },
              { Icon: Languages, t: "Japanese Path", d: "Hiragana, Katakana, and JLPT N5 → N1 with kana drills and grammar.", c: "bg-lavender-soft" },
              { Icon: Timer, t: "Focus Sessions", d: "Pomodoro timer with cozy backgrounds and ambient sounds.", c: "bg-matcha-soft" },
              { Icon: NotebookPen, t: "Notes", d: "Markdown notes that sync everywhere and stay yours.", c: "bg-honey/30" },
              { Icon: Layers, t: "Flashcards", d: "Spaced repetition that actually remembers when you'll forget.", c: "bg-peach-soft" },
              { Icon: Heart, t: "Animal Companion", d: "A tiny friend that levels up alongside you and celebrates streaks.", c: "bg-lavender-soft" },
            ].map(({ Icon, t, d, c }) => (
              <div key={t} className="group bg-white p-7 rounded-[2rem] border border-border hover:shadow-pop hover:-translate-y-1 transition-all">
                <div className={`size-12 ${c} rounded-2xl grid place-items-center mb-5`}>
                  <Icon className="size-5" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{t}</h3>
                <p className="text-sm leading-relaxed text-foreground/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companions */}
      <section id="companions" className="px-6 lg:px-12 py-24 max-w-6xl mx-auto text-center">
        <h2 className="font-display text-4xl font-bold mb-3">Pick your study buddy</h2>
        <p className="text-foreground/60 max-w-lg mx-auto mb-12">They react to your focus sessions and grow with every streak.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {PETS.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl p-5 border border-border hover:shadow-pop transition-all">
              <img src={p.image} alt={p.name} width={120} height={120} loading="lazy" className="mx-auto size-24 animate-float-soft" />
              <div className="text-xs font-bold mt-2">{p.name.split(" the ")[0]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Japanese */}
      <section id="japanese" className="px-6 lg:px-12 py-20 bg-lavender-soft">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div className="space-y-5">
            <h2 className="font-display text-4xl font-bold">From あ to JLPT N1</h2>
            <p className="text-foreground/70">A complete Japanese path: kana foundations, JLPT vocabulary, grammar, and an AI tutor who speaks Japanese with you.</p>
            <Link to="/auth" search={{ tab: "signup" as const }} className="inline-block px-7 py-3 rounded-3xl bg-primary font-bold shadow-soft">Start the path</Link>
          </div>
          <div className="bg-white rounded-3xl border border-border p-6 shadow-soft">
            <div className="grid grid-cols-5 gap-2 text-center" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>
              {["あ","い","う","え","お","か","き","く","け","こ"].map((k) => (
                <div key={k} className="aspect-square rounded-2xl bg-cream grid place-items-center text-2xl font-bold">{k}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="px-6 lg:px-12 py-12 border-t border-border bg-peach-soft/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-primary rounded-xl grid place-items-center">🍓</div>
            <span className="font-display text-xl font-bold">Study.</span>
          </div>
          <p className="text-sm text-foreground/50">© {new Date().getFullYear()} Study — made for cozy learners.</p>
        </div>
      </footer>
    </div>
  );
}
