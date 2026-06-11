import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
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
    <div className="min-h-screen paw-bg grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-[2rem] border border-border p-7 shadow-soft space-y-4">
        <Link to="/" className="font-display font-bold text-xl">🍓 Study.</Link>
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        {!ready && <p className="text-sm text-muted-foreground">Open the link from your email to continue.</p>}
        <input
          type="password" minLength={6} required
          value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full bg-cream border border-border rounded-2xl px-4 py-3 outline-none focus:border-primary"
        />
        <button disabled={!ready || loading} className="w-full bg-primary font-bold rounded-full py-3 disabled:opacity-50">
          {loading ? "…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
