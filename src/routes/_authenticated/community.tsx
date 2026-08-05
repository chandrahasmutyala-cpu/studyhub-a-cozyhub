import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { PageHero } from "@/components/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/useProfile";
import { toast } from "sonner";
import {
  Users, UserPlus, Search, Send, MessageCircle, Shield, Flag, Check, X,
  ArrowLeft, Plus, Hash, Ban,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/community")({
  component: CommunityPage,
  head: () => ({
    meta: [
      { title: "Study Community — StudyHub" },
      { name: "description", content: "Find study friends in your own age group, chat privately, and join focused study groups with built-in blocking and reporting." },
      { property: "og:title", content: "Study Community — StudyHub" },
      { property: "og:description", content: "Age-safe study friends, private chat and study groups inside StudyHub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Peer = { id: string; display_name: string | null; avatar_url: string | null; bio: string | null; age_group: string | null; level: number };
type Friendship = { id: string; requester_id: string; addressee_id: string; status: string };
type DM = { id: string; sender_id: string; recipient_id: string; body: string | null; created_at: string };
type Group = { id: string; owner_id: string; name: string; description: string | null; topic: string | null; is_public: boolean };
type GroupMsg = { id: string; group_id: string; sender_id: string; body: string | null; created_at: string };

function Avatar({ url, name, size = 40 }: { url?: string | null; name?: string | null; size?: number }) {
  return url ? (
    <img src={url} alt="" className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />
  ) : (
    <div className="rounded-full bg-muted grid place-items-center font-display font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {(name ?? "?").slice(0, 1).toUpperCase()}
    </div>
  );
}

function CommunityPage() {
  const { profile } = useProfile();
  const qc = useQueryClient();
  const me = profile?.id ?? "";
  const [tab, setTab] = useState<"friends" | "discover" | "groups">("friends");
  const [dmWith, setDmWith] = useState<Peer | null>(null);
  const [openGroup, setOpenGroup] = useState<Group | null>(null);

  const peersQ = useQuery({
    queryKey: ["community", "peers"],
    queryFn: async (): Promise<Peer[]> => {
      const { data, error } = await supabase.from("profiles")
        .select("id,display_name,avatar_url,bio,age_group,level").limit(60);
      if (error) throw error;
      return (data ?? []) as Peer[];
    },
  });

  const friendsQ = useQuery({
    queryKey: ["community", "friendships"],
    queryFn: async (): Promise<Friendship[]> => {
      const { data, error } = await supabase.from("friendships").select("id,requester_id,addressee_id,status");
      if (error) throw error;
      return (data ?? []) as Friendship[];
    },
  });

  const blocksQ = useQuery({
    queryKey: ["community", "blocks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blocks").select("blocked_id");
      if (error) throw error;
      return (data ?? []).map((b) => b.blocked_id as string);
    },
  });

  const groupsQ = useQuery({
    queryKey: ["community", "groups"],
    queryFn: async (): Promise<Group[]> => {
      const { data, error } = await supabase.from("study_groups")
        .select("id,owner_id,name,description,topic,is_public").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Group[];
    },
  });

  useEffect(() => {
    const ch = supabase.channel("community-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" },
        () => qc.invalidateQueries({ queryKey: ["community", "friendships"] }))
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [qc]);

  const blocked = new Set(blocksQ.data ?? []);
  const friendships = friendsQ.data ?? [];
  const peers = (peersQ.data ?? []).filter((p) => p.id !== me && !blocked.has(p.id));
  const peerById = useMemo(() => new Map(peers.map((p) => [p.id, p])), [peers]);

  const accepted = friendships.filter((f) => f.status === "accepted");
  const incoming = friendships.filter((f) => f.status === "pending" && f.addressee_id === me);
  const outgoing = new Set(friendships.filter((f) => f.status === "pending" && f.requester_id === me).map((f) => f.addressee_id));
  const friendIds = new Set(accepted.map((f) => (f.requester_id === me ? f.addressee_id : f.requester_id)));

  const request = useMutation({
    mutationFn: async (peer: Peer) => {
      const { error } = await supabase.from("friendships").insert({ requester_id: me, addressee_id: peer.id, status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["community", "friendships"] }); toast.success("Request sent."); },
    onError: (e: Error) => toast.error(e.message),
  });

  const respond = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "declined" }) => {
      const { error } = await supabase.from("friendships").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community", "friendships"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const block = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from("blocks").insert({ blocker_id: me, blocked_id: userId });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["community", "blocks"] }); setDmWith(null); toast.success("Blocked."); },
    onError: (e: Error) => toast.error(e.message),
  });

  const report = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase.from("reports").insert({ reporter_id: me, target_user_id: userId, reason, context: "community" });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Reported. Our moderators will review it."),
    onError: (e: Error) => toast.error(e.message),
  });

  if (dmWith) return <DMView me={me} peer={dmWith} onBack={() => setDmWith(null)}
    onBlock={() => block.mutate(dmWith.id)}
    onReport={() => report.mutate({ userId: dmWith.id, reason: "Reported from chat" })} />;

  if (openGroup) return <GroupView me={me} group={openGroup} onBack={() => setOpenGroup(null)} peers={peerById} />;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-5 pb-10 animate-fade-in">
        <PageHero
          eyebrow="Community"
          title="Study together"
          subtitle={`You only ever see students in your own age group${profile?.age_group ? ` (${profile.age_group})` : ""}. Block and report are always one tap away.`}
        />

        <div className="flex gap-2">
          {(["friends", "discover", "groups"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition capitalize ${
                tab === t ? "bg-foreground text-background border-foreground" : "border-border/60 hover:bg-muted"
              }`}>{t}</button>
          ))}
        </div>

        {tab === "friends" && (
          <div className="space-y-4">
            {incoming.length > 0 && (
              <section className="rounded-3xl border border-border/60 bg-card p-5">
                <h2 className="font-display text-base font-bold">Requests</h2>
                <ul className="mt-3 space-y-2">
                  {incoming.map((f) => {
                    const p = peerById.get(f.requester_id);
                    return (
                      <li key={f.id} className="flex items-center gap-3">
                        <Avatar url={p?.avatar_url} name={p?.display_name} />
                        <span className="flex-1 text-sm font-bold truncate">{p?.display_name ?? "Student"}</span>
                        <button onClick={() => respond.mutate({ id: f.id, status: "accepted" })}
                          className="size-9 grid place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-4 stroke-[2]" /></button>
                        <button onClick={() => respond.mutate({ id: f.id, status: "declined" })}
                          className="size-9 grid place-items-center rounded-full border border-border/60"><X className="size-4 stroke-[2]" /></button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <section className="rounded-3xl border border-border/60 bg-card p-5">
              <h2 className="font-display text-base font-bold">Friends</h2>
              {friendIds.size === 0 ? (
                <p className="text-sm text-muted-foreground mt-2">No friends yet — try Discover.</p>
              ) : (
                <ul className="mt-3 space-y-1">
                  {[...friendIds].map((id) => {
                    const p = peerById.get(id);
                    if (!p) return null;
                    return (
                      <li key={id}>
                        <button onClick={() => setDmWith(p)}
                          className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/60 transition text-left">
                          <Avatar url={p.avatar_url} name={p.display_name} />
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-bold truncate">{p.display_name ?? "Student"}</span>
                            <span className="block text-xs text-muted-foreground truncate">Level {p.level}</span>
                          </span>
                          <MessageCircle className="size-4 stroke-[1.75] text-muted-foreground" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        )}

        {tab === "discover" && (
          <Discover peers={peers.filter((p) => !friendIds.has(p.id))} outgoing={outgoing}
            onRequest={(p) => request.mutate(p)} onBlock={(id) => block.mutate(id)}
            onReport={(id) => report.mutate({ userId: id, reason: "Reported from discover" })} />
        )}

        {tab === "groups" && <Groups me={me} groups={groupsQ.data ?? []} onOpen={setOpenGroup} />}
      </div>
    </AppShell>
  );
}

function Discover({ peers, outgoing, onRequest, onBlock, onReport }: {
  peers: Peer[]; outgoing: Set<string>;
  onRequest: (p: Peer) => void; onBlock: (id: string) => void; onReport: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const list = peers.filter((p) => !q || (p.display_name ?? "").toLowerCase().includes(q.toLowerCase()));
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2">
        <Search className="size-4 stroke-[1.75] text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students"
          className="flex-1 bg-transparent outline-none text-sm font-medium" />
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-4">No one to show yet. New students in your age group appear here.</p>
      ) : (
        <ul className="mt-3 space-y-1">
          {list.map((p) => (
            <li key={p.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/60 transition">
              <Avatar url={p.avatar_url} name={p.display_name} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{p.display_name ?? "Student"}</div>
                <div className="text-xs text-muted-foreground truncate">{p.bio ?? `Level ${p.level}`}</div>
              </div>
              <button onClick={() => onReport(p.id)} aria-label="Report"
                className="size-9 grid place-items-center rounded-full border border-border/60"><Flag className="size-4 stroke-[1.75]" /></button>
              <button onClick={() => onBlock(p.id)} aria-label="Block"
                className="size-9 grid place-items-center rounded-full border border-border/60"><Ban className="size-4 stroke-[1.75]" /></button>
              <button disabled={outgoing.has(p.id)} onClick={() => onRequest(p)}
                className="rounded-full bg-primary text-primary-foreground px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50">
                <UserPlus className="size-3.5 stroke-[1.75]" /> {outgoing.has(p.id) ? "Sent" : "Add"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Groups({ me, groups, onOpen }: { me: string; groups: Group[]; onOpen: (g: Group) => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("study_groups")
        .insert({ owner_id: me, name: name.trim(), topic: topic.trim() || null, is_public: true })
        .select("id").single();
      if (error) throw error;
      const { error: mErr } = await supabase.from("group_members").insert({ group_id: data.id, user_id: me, role: "owner" });
      if (mErr) throw mErr;
    },
    onSuccess: () => { setName(""); setTopic(""); qc.invalidateQueries({ queryKey: ["community", "groups"] }); toast.success("Group created."); },
    onError: (e: Error) => toast.error(e.message),
  });

  const join = useMutation({
    mutationFn: async (g: Group) => {
      const { error } = await supabase.from("group_members").insert({ group_id: g.id, user_id: me, role: "member" });
      if (error && !error.message.includes("duplicate")) throw error;
    },
    onSuccess: () => toast.success("Joined."),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-border/60 bg-card p-5">
        <h2 className="font-display text-base font-bold">Start a study group</h2>
        <div className="mt-3 space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name"
            className="w-full rounded-2xl bg-muted/60 px-4 py-2.5 text-sm font-medium outline-none" />
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (JLPT N3, HSK 4, TOPIK II…)"
            className="w-full rounded-2xl bg-muted/60 px-4 py-2.5 text-sm font-medium outline-none" />
          <button disabled={!name.trim() || create.isPending} onClick={() => create.mutate()}
            className="w-full rounded-full bg-primary text-primary-foreground py-2.5 text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50">
            <Plus className="size-4 stroke-[1.75]" /> Create group
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-card p-5">
        <h2 className="font-display text-base font-bold">Groups</h2>
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-2">No groups yet. Be the first.</p>
        ) : (
          <ul className="mt-3 space-y-1">
            {groups.map((g) => (
              <li key={g.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/60 transition">
                <span className="size-10 rounded-2xl bg-accent grid place-items-center"><Hash className="size-4 stroke-[1.75]" /></span>
                <button onClick={() => onOpen(g)} className="flex-1 min-w-0 text-left">
                  <span className="block text-sm font-bold truncate">{g.name}</span>
                  <span className="block text-xs text-muted-foreground truncate">{g.topic ?? "Study group"}</span>
                </button>
                {g.owner_id !== me && (
                  <button onClick={() => join.mutate(g)} className="rounded-full border border-border/60 px-3.5 py-2 text-xs font-bold">Join</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ChatShell({ title, subtitle, onBack, actions, children, onSend, sending }: {
  title: string; subtitle?: string; onBack: () => void; actions?: React.ReactNode;
  children: React.ReactNode; onSend: (text: string) => void; sending?: boolean;
}) {
  const [text, setText] = useState("");
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100dvh-9rem)] animate-fade-in">
        <header className="flex items-center gap-3 pb-3 border-b border-border/50">
          <button onClick={onBack} aria-label="Back" className="size-9 grid place-items-center rounded-full hover:bg-muted transition">
            <ArrowLeft className="size-4 stroke-[1.75]" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-display text-base font-bold truncate">{title}</div>
            {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
          </div>
          {actions}
        </header>

        <div className="flex-1 overflow-y-auto py-4 space-y-2">{children}</div>

        <form onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; onSend(text.trim()); setText(""); }}
          className="flex items-center gap-2 pt-3 border-t border-border/50">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message"
            className="flex-1 rounded-full bg-muted/60 px-4 py-3 text-sm font-medium outline-none" />
          <button type="submit" disabled={sending || !text.trim()} aria-label="Send"
            className="size-11 grid place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50">
            <Send className="size-4 stroke-[1.75]" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}

function Bubble({ mine, body, at }: { mine: boolean; body: string | null; at: string }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] rounded-3xl px-4 py-2.5 ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
        <p className="text-sm whitespace-pre-wrap break-words">{body}</p>
        <span className={`block text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

function DMView({ me, peer, onBack, onBlock, onReport }: {
  me: string; peer: Peer; onBack: () => void; onBlock: () => void; onReport: () => void;
}) {
  const qc = useQueryClient();
  const endRef = useRef<HTMLDivElement>(null);

  const msgsQ = useQuery({
    queryKey: ["dm", peer.id],
    queryFn: async (): Promise<DM[]> => {
      const { data, error } = await supabase.from("dm_messages")
        .select("id,sender_id,recipient_id,body,created_at")
        .or(`and(sender_id.eq.${me},recipient_id.eq.${peer.id}),and(sender_id.eq.${peer.id},recipient_id.eq.${me})`)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as DM[];
    },
  });

  useEffect(() => {
    const ch = supabase.channel(`dm-${peer.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "dm_messages" },
        () => qc.invalidateQueries({ queryKey: ["dm", peer.id] }))
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [peer.id, qc]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgsQ.data]);

  const send = useMutation({
    mutationFn: async (body: string) => {
      const { error } = await supabase.from("dm_messages").insert({ sender_id: me, recipient_id: peer.id, body });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dm", peer.id] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <ChatShell
      title={peer.display_name ?? "Student"}
      subtitle={`Level ${peer.level}`}
      onBack={onBack}
      sending={send.isPending}
      onSend={(t) => send.mutate(t)}
      actions={
        <div className="flex gap-1.5">
          <button onClick={onReport} aria-label="Report" className="size-9 grid place-items-center rounded-full border border-border/60"><Flag className="size-4 stroke-[1.75]" /></button>
          <button onClick={onBlock} aria-label="Block" className="size-9 grid place-items-center rounded-full border border-border/60"><Shield className="size-4 stroke-[1.75]" /></button>
        </div>
      }
    >
      {(msgsQ.data ?? []).map((m) => <Bubble key={m.id} mine={m.sender_id === me} body={m.body} at={m.created_at} />)}
      <div ref={endRef} />
    </ChatShell>
  );
}

function GroupView({ me, group, onBack, peers }: { me: string; group: Group; onBack: () => void; peers: Map<string, Peer> }) {
  const qc = useQueryClient();
  const endRef = useRef<HTMLDivElement>(null);

  const msgsQ = useQuery({
    queryKey: ["group", group.id],
    queryFn: async (): Promise<GroupMsg[]> => {
      const { data, error } = await supabase.from("group_messages")
        .select("id,group_id,sender_id,body,created_at").eq("group_id", group.id).order("created_at");
      if (error) throw error;
      return (data ?? []) as GroupMsg[];
    },
  });

  useEffect(() => {
    const ch = supabase.channel(`group-${group.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "group_messages" },
        () => qc.invalidateQueries({ queryKey: ["group", group.id] }))
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [group.id, qc]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgsQ.data]);

  const send = useMutation({
    mutationFn: async (body: string) => {
      const { error } = await supabase.from("group_messages").insert({ group_id: group.id, sender_id: me, body });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["group", group.id] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <ChatShell title={group.name} subtitle={group.topic ?? "Study group"} onBack={onBack}
      sending={send.isPending} onSend={(t) => send.mutate(t)}
      actions={<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="size-4 stroke-[1.75]" /></span>}
    >
      {(msgsQ.data ?? []).map((m) => (
        <div key={m.id}>
          {m.sender_id !== me && (
            <div className="text-[10px] font-bold text-muted-foreground ml-2 mb-0.5">
              {peers.get(m.sender_id)?.display_name ?? "Student"}
            </div>
          )}
          <Bubble mine={m.sender_id === me} body={m.body} at={m.created_at} />
        </div>
      ))}
      <div ref={endRef} />
    </ChatShell>
  );
}
