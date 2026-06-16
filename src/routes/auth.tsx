import { createFileRoute, useNavigate, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

const search = z.object({
  tab: z.enum(["login", "signup", "reset"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Sign in — Study" },
      { name: "description", content: "Sign in or create your Study account to start your cozy learning journey." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "reset">(tab ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMode(tab ?? "login"); }, [tab]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { name }, emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        toast.success("Welcome! Let's get set up.");
        navigate({ to: "/onboarding" });
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back ✨");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Check your email for a reset link.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/dashboard",
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen paw-bg grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <Logo className="size-12" />
          <span className="font-display text-2xl font-bold">StudyHub</span>
        </Link>

        <div className="bg-white rounded-[2rem] border border-border p-7 shadow-soft">
          <div className="flex gap-1 bg-cream p-1 rounded-full mb-6">
            {(["login","signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors ${mode === m ? "bg-primary" : "text-foreground/60"}`}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <h1 className="font-display text-2xl font-bold text-center mb-1">
            {mode === "signup" ? "Make yourself at home" : mode === "reset" ? "Reset your password" : "Welcome back"}
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-6">
            {mode === "signup" ? "Your cozy study room is waiting." : mode === "reset" ? "We'll send you a magic link." : "Sign in and let's focus."}
          </p>

          {mode !== "reset" && (
            <>
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full bg-white border border-border rounded-full py-3 font-bold flex items-center justify-center gap-2 hover:bg-cream transition-colors disabled:opacity-50"
              >
                <GoogleIcon /> Continue with Google
              </button>
              <div className="flex items-center gap-3 my-5 text-xs text-muted-foreground">
                <div className="flex-1 h-px bg-border" /> or email <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <input value={name} onChange={(e) => setName(e.target.value)} required
                placeholder="Your name" className="w-full bg-cream border border-border rounded-2xl px-4 py-3 outline-none focus:border-primary" />
            )}
            <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email"
              placeholder="you@example.com" className="w-full bg-cream border border-border rounded-2xl px-4 py-3 outline-none focus:border-primary" />
            {mode !== "reset" && (
              <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" minLength={6}
                placeholder="Password (6+ characters)" className="w-full bg-cream border border-border rounded-2xl px-4 py-3 outline-none focus:border-primary" />
            )}
            <button disabled={loading} className="w-full bg-primary font-bold rounded-full py-3 shadow-soft hover:-translate-y-0.5 transition-transform disabled:opacity-60">
              {loading ? "…" : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Log in"}
            </button>
          </form>

          <div className="flex justify-between text-xs text-muted-foreground mt-4">
            {mode === "login" ? (
              <button onClick={() => setMode("reset")} className="hover:text-primary">Forgot password?</button>
            ) : <span />}
            {mode === "reset" && <button onClick={() => setMode("login")} className="hover:text-primary">Back to login</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.92v2.32A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.92A9 9 0 0 0 0 9c0 1.45.35 2.82.92 4.04l3.05-2.32Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.43 1.35l2.58-2.58A9 9 0 0 0 .92 4.96l3.05 2.32C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}
