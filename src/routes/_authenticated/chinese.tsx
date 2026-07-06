import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RoadmapView } from "@/components/RoadmapView";
import { useLessonProgress } from "@/lib/lesson-progress";
import { ROADMAPS } from "@/lib/roadmap";

export const Route = createFileRoute("/_authenticated/chinese")({
  component: ChinesePage,
});

function ChinesePage() {
  const { completedKeys } = useLessonProgress("chinese");
  const total = ROADMAPS.chinese.length;
  const done = completedKeys.size;
  const pct = Math.round((done / total) * 100);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Chinese Academy · 中文</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">Your Chinese roadmap</h1>
          <p className="text-sm text-muted-foreground mt-2">{done}/{total} lessons · {pct}% complete</p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-3 max-w-xs">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </header>
        <RoadmapView language="chinese" />
      </div>
    </AppShell>
  );
}
