import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/notes")({
  component: NotesPage,
});

type Note = { id: string; title: string; content: string; updated_at: string };

function NotesPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data } = await supabase.from("notes").select("id,title,content,updated_at").order("updated_at", { ascending: false });
      return (data ?? []) as Note[];
    },
  });

  useEffect(() => {
    if (!selected && q.data && q.data.length > 0) {
      setSelected(q.data[0].id);
    }
  }, [q.data, selected]);

  useEffect(() => {
    const n = q.data?.find((x) => x.id === selected);
    if (n) { setDraftTitle(n.title); setDraftContent(n.content); }
  }, [selected, q.data]);

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error();
      const { data, error } = await supabase.from("notes").insert({ user_id: user.id, title: "Untitled", content: "" }).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => { qc.invalidateQueries({ queryKey: ["notes"] }); setSelected(id); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("notes").delete().eq("id", id); },
    onSuccess: () => { setSelected(null); qc.invalidateQueries({ queryKey: ["notes"] }); },
  });

  function scheduleSave(title: string, content: string) {
    if (!selected) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase.from("notes").update({ title, content }).eq("id", selected);
      if (error) toast.error("Couldn't save");
      else qc.invalidateQueries({ queryKey: ["notes"] });
    }, 600);
  }

  return (
    <AppShell>
      <div className="grid lg:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-8rem)]">
        <aside className="bg-white border border-border rounded-3xl p-3 flex flex-col gap-2 overflow-hidden">
          <button onClick={() => create.mutate()} className="bg-primary rounded-full px-3 py-2 font-bold text-sm flex items-center justify-center gap-1">
            <Plus className="size-4" />New note
          </button>
          <div className="flex-1 overflow-y-auto space-y-1">
            {(q.data ?? []).map((n) => (
              <button key={n.id} onClick={() => setSelected(n.id)}
                className={`w-full text-left p-3 rounded-2xl ${selected === n.id ? "bg-primary/40" : "hover:bg-cream"}`}>
                <div className="font-semibold text-sm truncate">{n.title || "Untitled"}</div>
                <div className="text-[10px] text-muted-foreground truncate">{n.content.slice(0, 50) || "Empty"}</div>
              </button>
            ))}
            {q.data?.length === 0 && <div className="text-xs text-muted-foreground p-3">No notes yet</div>}
          </div>
        </aside>

        <main className="bg-white border border-border rounded-3xl p-5 flex flex-col">
          {selected ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <input
                  value={draftTitle}
                  onChange={(e) => { setDraftTitle(e.target.value); scheduleSave(e.target.value, draftContent); }}
                  className="flex-1 bg-transparent font-display text-2xl font-bold outline-none"
                  placeholder="Untitled"
                />
                <button onClick={() => selected && del.mutate(selected)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <textarea
                value={draftContent}
                onChange={(e) => { setDraftContent(e.target.value); scheduleSave(draftTitle, e.target.value); }}
                placeholder="Start writing… markdown welcome."
                className="flex-1 bg-cream rounded-2xl p-4 outline-none resize-none font-mono text-sm"
              />
              <div className="text-[10px] text-muted-foreground mt-2">Auto-saves as you type.</div>
            </>
          ) : (
            <div className="m-auto text-center text-muted-foreground">
              <div className="text-5xl mb-2">📓</div>
              Pick or create a note to begin.
            </div>
          )}
        </main>
      </div>
    </AppShell>
  );
}
