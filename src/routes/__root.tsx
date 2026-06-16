import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center paw-bg px-4">
      <div className="max-w-md text-center bg-white rounded-3xl border border-border p-8 shadow-soft">
        <div className="text-6xl mb-2">🐾</div>
        <h1 className="text-5xl font-display font-bold">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page wandered off for a nap.</p>
        <Link to="/" className="inline-block mt-6 rounded-full bg-primary px-5 py-2 text-sm font-bold">
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center paw-bg px-4">
      <div className="max-w-md text-center bg-white rounded-3xl border border-border p-8 shadow-soft">
        <div className="text-5xl mb-2">😿</div>
        <h1 className="text-xl font-display font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Take a breath — try again, or head home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-full bg-primary px-4 py-2 text-sm font-bold">
            Try again
          </button>
          <a href="/" className="rounded-full border border-border bg-white px-4 py-2 text-sm font-bold">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "StudyHub — Calm, focused learning for ambitious students" },
      { name: "description", content: "StudyHub is a minimalist learning workspace: AI tutor, full Japanese path (hiragana, katakana, all JLPT kanji N5–N1), planner with alarms, focus timer, flashcards, plus verified universities and scholarships." },
      { name: "theme-color", content: "#fff9f5" },
      { property: "og:title", content: "StudyHub — Calm, focused learning" },
      { property: "og:description", content: "AI tutor, Japanese N5–N1 with all JLPT kanji, planner, focus, and verified universities & scholarships." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&family=Noto+Sans+JP:wght@500;700&family=Noto+Serif+JP:wght@500;700&display=swap" },
      { rel: "icon", href: "/__l5e/assets-v1/" }, // overridden below by logo asset
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
