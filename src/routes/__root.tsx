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
import logoAsset from "../assets/studyhub-logo.png.asset.json";

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
      { title: "StudyHub — A calm bento for deep work" },
      { name: "description", content: "A minimalist study platform: AI tutor, Japanese, Chinese and Korean academies, focus sessions with ambient sound, planner, and a StudentHub for universities, scholarships and applications." },
      { name: "theme-color", content: "#fff9f5" },
      { property: "og:title", content: "StudyHub — A calm bento for deep work" },
      { property: "og:description", content: "A minimalist study platform: AI tutor, Japanese, Chinese and Korean academies, focus sessions with ambient sound, planner, and a StudentHub for universities, scholarships and applications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "StudyHub — A calm bento for deep work" },
      { name: "twitter:description", content: "A minimalist study platform: AI tutor, Japanese, Chinese and Korean academies, focus sessions with ambient sound, planner, and a StudentHub for universities, scholarships and applications." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e6ab0b1b-e504-4946-a2ca-e08574ac5a99" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e6ab0b1b-e504-4946-a2ca-e08574ac5a99" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+JP:wght@500;700&family=Noto+Serif+JP:wght@500;700&display=swap" },
      { rel: "icon", type: "image/png", href: "/__l5e/assets-v1/5b7305a9-da7b-4c93-9287-d471f14c8e0c/studyhub-logo.png" },
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
