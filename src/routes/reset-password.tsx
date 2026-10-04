import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { ColorModeToggle } from "@/components/ColorModeToggle";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Reset password — StudyHub" },
    { name: "description", content: "Set a new password for your StudyHub account." },
    { property: "og:title", content: "Reset password — StudyHub" },
    { property: "og:description", content: "Set a new password for your StudyHub account." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-background grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-md bg-card rounded-xl border border-border p-7 shadow-soft space-y-4">
        <div className="flex items-center justify-between"><Link to="/" className="font-display font-bold text-xl inline-flex items-center gap-2"><Logo className="size-9" /> StudyHub</Link><ColorModeToggle /></div>
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        {!ready && <p className="text-sm text-muted-foreground">Open the link from your email to continue.</p>}
        <input
          type="password" minLength={6} required
          value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full bg-card border border-border rounded-lg px-4 py-3 outline-none focus:border-primary"
        />
        <button disabled={!ready || loading} className="w-full min-h-11 bg-primary text-primary-foreground font-bold rounded-lg py-3 disabled:opacity-50">
          {loading ? "…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
