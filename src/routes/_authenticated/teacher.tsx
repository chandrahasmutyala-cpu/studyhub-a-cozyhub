import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Mascot } from "@/components/Mascot";
import { useProfile } from "@/lib/useProfile";
import { MessageCircle, Settings2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/teacher")({
  component: TeacherPage,
});

function TeacherPage() {
  const { profile } = useProfile();
  const hasTeacher = Boolean(profile?.teacher_name);

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-up">
        <header>
          <div className="section-label">Teacher</div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-1">
            {hasTeacher ? "Your AI teacher." : "Set up your AI teacher."}
          </h1>
        </header>

        <section className="bg-card border border-border rounded-3xl p-6 flex flex-col items-center text-center">
          <Mascot size={180} waving />
          {hasTeacher ? (
            <>
              <div className="mt-4 font-bold text-lg">{profile?.teacher_name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {profile?.teacher_personality ?? "Friendly"} · {profile?.teacher_style ?? "Conversational"}
              </div>
              <div className="flex gap-2 mt-5">
                <Link
                  to="/tutor"
                  className="inline-flex items-center gap-2 bg-foreground text-background rounded-full px-5 py-2.5 font-semibold text-sm"
                >
                  <MessageCircle className="size-4" /> Start lesson
                </Link>
                <Link
                  to="/avatar"
                  className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-5 py-2.5 font-semibold text-sm"
                >
                  <Settings2 className="size-4" /> Edit
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="mt-6 text-sm text-muted-foreground max-w-xs">
                Customize a 2D companion to learn with you.
              </p>
              <Link
                to="/avatar"
                className="mt-5 inline-flex bg-foreground text-background rounded-full px-6 py-3 font-semibold text-sm"
              >
                Create teacher
              </Link>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
