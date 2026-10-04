import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock3, Compass, GraduationCap, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { FloatingKanaBackground } from "@/components/FloatingKanaBackground";
import { ColorModeToggle } from "@/components/ColorModeToggle";
import { AuthStartupGate } from "@/components/AuthStartupGate";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "StudyHub — Your space to study" },
    { name: "description", content: "A focused home for planning, language learning, and studying toward your next step." },
    { property: "og:title", content: "StudyHub — Your space to study" },
    { property: "og:description", content: "Plan, focus, and learn Japanese, Chinese, and Korean in one thoughtful workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Landing,
});

const features = [
  { icon: Clock3, title: "A little focus goes a long way", body: "Make room for your next session with a timer and a planner that stay in sync.", className: "md:col-span-7" },
  { icon: Sparkles, title: "A question-friendly space", body: "Work through tricky ideas with your StudyHub tutor.", className: "md:col-span-5" },
  { icon: BookOpen, title: "Languages, at your pace", body: "Build your Japanese, Chinese, or Korean practice into your everyday routine.", className: "md:col-span-5" },
  { icon: Compass, title: "Look ahead", body: "Explore universities, scholarships, applications, and the path that connects them.", className: "md:col-span-7" },
];

function Landing() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <AuthStartupGate />
      <FloatingKanaBackground />
      <div className="relative z-10">
        <nav className="mx-auto max-w-7xl px-5 sm:px-8 h-20 flex items-center justify-between gap-4 border-b border-border/60">
          <Link to="/" className="flex items-center gap-3 min-w-0" aria-label="StudyHub home">
            <Logo className="size-10 shrink-0" /><span className="font-display text-xl font-bold truncate">StudyHub</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <ColorModeToggle />
            <Link to="/auth" className="hidden sm:inline-flex min-h-11 items-center px-4 font-medium text-sm hover:text-primary transition-colors">Log in</Link>
            <Link to="/auth" search={{ tab: "signup" as const }} className="inline-flex min-h-11 items-center gap-2 px-4 sm:px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-[var(--primary-hover)] active:scale-[0.98] transition-all">Get started <ArrowRight className="size-4" /></Link>
          </div>
        </nav>

        <main>
          <section className="relative mx-auto max-w-5xl px-5 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-24 text-center">
            <div className="absolute inset-x-1/4 top-1/4 h-64 pointer-events-none bg-[radial-gradient(ellipse,var(--hero-glow),transparent_70%)]" aria-hidden="true" />
            <div className="relative mx-auto mb-8 size-20 sm:size-24 flex items-center justify-center animate-float-soft max-sm:animate-none [animation-duration:8s]" aria-hidden="true"><Logo className="size-full" /></div>
            <h1 className="relative font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] max-w-4xl mx-auto">StudyHub</h1>
            <p className="relative text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed">A clearer space for everything you&apos;re learning, planning, and working toward.</p>
            <div className="relative mt-9 flex flex-wrap justify-center gap-3">
              <Link to="/auth" search={{ tab: "signup" as const }} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 font-semibold hover:bg-[var(--primary-hover)] active:scale-[0.98] transition-all">Start studying <ArrowRight className="size-4" /></Link>
              <Link to="/auth" className="inline-flex min-h-12 items-center rounded-lg border border-border px-6 font-semibold hover:bg-muted transition-colors">Log in</Link>
            </div>
          </section>

          <section className="border-t border-border py-16 sm:py-24" aria-label="Study spaces">
            <div className="max-w-6xl mx-auto px-5 sm:px-8">
              <div className="flex items-center gap-3 mb-8"><GraduationCap className="size-5 text-primary" /><h2 className="text-xl sm:text-2xl font-semibold">A place for every part of the journey</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
                {features.map(({ icon: Icon, title, body, className }) => (
                  <article key={title} className={`${className} rounded-xl border border-border bg-card shadow-soft p-6 sm:p-8 min-h-52 flex flex-col justify-between`}>
                    <Icon className="size-6 text-primary stroke-[1.75]" aria-hidden="true" />
                    <div><h3 className="text-xl font-semibold mb-2">{title}</h3><p className="text-muted-foreground max-w-md leading-relaxed">{body}</p></div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>
        <footer className="border-t border-border px-5 sm:px-8 py-8"><div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground"><span className="inline-flex items-center gap-2"><Logo className="size-7" /> StudyHub</span><span>Make space for what matters.</span></div></footer>
      </div>
    </div>
  );
}