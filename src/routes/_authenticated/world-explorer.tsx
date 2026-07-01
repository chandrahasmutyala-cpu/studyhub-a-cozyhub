import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, PerspectiveCamera, Html, Stats } from "@react-three/drei";
import * as THREE from "three";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { tutorChat } from "@/lib/tutor.functions";
import { DISTRICTS, type District, type Landmark, type NPC } from "@/lib/world-districts";
import { COUNTRY_FLAG, COUNTRY_LABEL, universitiesFor, type CountryKey } from "@/lib/study-directory";

export const Route = createFileRoute("/_authenticated/world-explorer")({
  component: WorldPage,
  head: () => ({ meta: [{ title: "World Explorer · StudyHub" }, { name: "description", content: "Explore Japan, Korea and China districts, meet NPCs and learn vocabulary in 3D." }] }),
});

/* ------------------------- persistent player data ------------------------- */
type SavedWord = { lang: CountryKey; text: string; reading: string; meaning: string; at: number };
type Progress = {
  xp: number;
  savedWords: SavedWord[];
  visited: string[]; // landmark ids
  talkedTo: string[]; // npc ids
  avatarColor: string;
};
const P_KEY = "studyhub.world.progress.v1";
function loadProgress(): Progress {
  if (typeof window === "undefined") return { xp: 0, savedWords: [], visited: [], talkedTo: [], avatarColor: "#f5b8c8" };
  try { return { xp: 0, savedWords: [], visited: [], talkedTo: [], avatarColor: "#f5b8c8", ...JSON.parse(localStorage.getItem(P_KEY) ?? "{}") }; }
  catch { return { xp: 0, savedWords: [], visited: [], talkedTo: [], avatarColor: "#f5b8c8" }; }
}
function saveProgress(p: Progress) { try { localStorage.setItem(P_KEY, JSON.stringify(p)); } catch {} }

/* ------------------------- input hook ------------------------------------ */
type InputState = { forward: number; strafe: number; run: boolean };
function useKeyboardInput() {
  const state = useRef<InputState>({ forward: 0, strafe: 0, run: false });
  useEffect(() => {
    const keys = new Set<string>();
    const update = () => {
      state.current.forward = (keys.has("w") || keys.has("arrowup") ? 1 : 0) - (keys.has("s") || keys.has("arrowdown") ? 1 : 0);
      state.current.strafe  = (keys.has("d") || keys.has("arrowright") ? 1 : 0) - (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
      state.current.run     = keys.has("shift");
    };
    const dn = (e: KeyboardEvent) => { keys.add(e.key.toLowerCase()); update(); };
    const up = (e: KeyboardEvent) => { keys.delete(e.key.toLowerCase()); update(); };
    window.addEventListener("keydown", dn); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, []);
  return state;
}

/* ------------------------- 3D primitives --------------------------------- */
function Building({ lm, onClick, highlighted }: { lm: Landmark; onClick: () => void; highlighted: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <group position={[lm.pos[0], 0, lm.pos[1]]} onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <mesh castShadow position={[0, lm.size[1] / 2, 0]}>
        <boxGeometry args={lm.size} />
        <meshStandardMaterial color={lm.color} emissive={hover || highlighted ? lm.roofColor : "#000000"} emissiveIntensity={hover || highlighted ? 0.15 : 0} />
      </mesh>
      {/* Roof */}
      <mesh castShadow position={[0, lm.size[1] + 0.4, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[Math.max(lm.size[0], lm.size[2]) * 0.75, 1.4, 4]} />
        <meshStandardMaterial color={lm.roofColor} />
      </mesh>
      {/* Floating label */}
      <Html position={[0, lm.size[1] + 2, 0]} center distanceFactor={12} occlude={false}>
        <div className="px-2 py-0.5 rounded-full bg-white/90 border border-border text-[10px] font-bold whitespace-nowrap shadow-sm">
          {lm.sign.text}
        </div>
      </Html>
    </group>
  );
}

function NpcMesh({ npc, onClick }: { npc: NPC; onClick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 2 + npc.pos[0]) * 0.08; });
  return (
    <group ref={ref} position={[npc.pos[0], 0, npc.pos[1]]} onClick={onClick}>
      <mesh castShadow position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.4, 1.0, 4, 8]} />
        <meshStandardMaterial color={npc.color} />
      </mesh>
      <mesh castShadow position={[0, 1.9, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#ffe0c4" />
      </mesh>
      <Html position={[0, 2.6, 0]} center distanceFactor={10}>
        <div className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold whitespace-nowrap shadow-sm">
          💬 {npc.name}
        </div>
      </Html>
    </group>
  );
}

function Player({ input, joystick, avatarColor, onMove }: {
  input: React.MutableRefObject<InputState>;
  joystick: React.MutableRefObject<{ x: number; y: number }>;
  avatarColor: string;
  onMove: (pos: THREE.Vector3) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const cam = useThree((s) => s.camera);
  const yaw = useRef(0);

  useFrame((_, dt) => {
    if (!group.current) return;
    const f = input.current.forward + (-joystick.current.y);
    const s = input.current.strafe + joystick.current.x;
    const running = input.current.run;
    const speed = (running ? 6 : 3.2) * dt;
    const mag = Math.hypot(f, s);
    if (mag > 0.05) {
      const targetYaw = Math.atan2(s, f);
      // smooth rotate
      let dy = targetYaw - yaw.current;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      yaw.current += dy * Math.min(1, dt * 10);
      group.current.rotation.y = yaw.current;
      const nx = Math.sin(yaw.current) * speed;
      const nz = Math.cos(yaw.current) * speed;
      group.current.position.x = THREE.MathUtils.clamp(group.current.position.x + nx, -22, 22);
      group.current.position.z = THREE.MathUtils.clamp(group.current.position.z + nz, -22, 22);
    }
    // Third-person camera
    const target = group.current.position;
    const camX = target.x - Math.sin(yaw.current) * 7;
    const camZ = target.z - Math.cos(yaw.current) * 7;
    cam.position.lerp(new THREE.Vector3(camX, 5, camZ), Math.min(1, dt * 6));
    cam.lookAt(target.x, 1.2, target.z);
    onMove(target);
  });

  return (
    <group ref={group} position={[0, 0, 6]}>
      <mesh castShadow position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.4, 1.0, 4, 8]} />
        <meshStandardMaterial color={avatarColor} />
      </mesh>
      <mesh castShadow position={[0, 1.9, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#ffe0c4" />
      </mesh>
      {/* forward arrow */}
      <mesh position={[0, 0.05, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.2, 0.4, 3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/* ------------------------- scene ---------------------------------------- */
function DistrictScene({
  district, input, joystick, quality, avatarColor,
  onLandmarkClick, onNpcClick, onMove,
}: {
  district: District;
  input: React.MutableRefObject<InputState>;
  joystick: React.MutableRefObject<{ x: number; y: number }>;
  quality: "low" | "medium" | "high";
  avatarColor: string;
  onLandmarkClick: (lm: Landmark) => void;
  onNpcClick: (n: NPC) => void;
  onMove: (p: THREE.Vector3) => void;
}) {
  const shadows = quality !== "low";
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 6, 12]} fov={55} />
      <Sky sunPosition={[80, 40, 20]} turbidity={2} rayleigh={0.6} inclination={0.55} azimuth={0.25} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[15, 20, 10]} intensity={1.1} castShadow={shadows} shadow-mapSize={[1024, 1024]} />
      {/* Ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={district.ground} />
      </mesh>
      {/* Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[3, 40]} />
        <meshStandardMaterial color="#c8b98a" />
      </mesh>
      {/* Trees — cheap cones */}
      {Array.from({ length: quality === "low" ? 6 : 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2; const r = 18 + (i % 3) * 2;
        return (
          <group key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]}>
            <mesh castShadow={shadows} position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.15, 0.2, 1, 6]} />
              <meshStandardMaterial color="#7a5433" />
            </mesh>
            <mesh castShadow={shadows} position={[0, 1.6, 0]}>
              <coneGeometry args={[0.9, 2, 6]} />
              <meshStandardMaterial color={district.key === "japan" ? "#f6b7c9" : district.key === "korea" ? "#a8d6a5" : "#c99b57"} />
            </mesh>
          </group>
        );
      })}
      {district.landmarks.map((lm) => (
        <Building key={lm.id} lm={lm} highlighted={false} onClick={() => onLandmarkClick(lm)} />
      ))}
      {district.npcs.map((n) => (
        <NpcMesh key={n.id} npc={n} onClick={() => onNpcClick(n)} />
      ))}
      <Player input={input} joystick={joystick} avatarColor={avatarColor} onMove={onMove} />
    </>
  );
}

/* ------------------------- joystick ------------------------------------ */
function Joystick({ onChange }: { onChange: (v: { x: number; y: number }) => void }) {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef(false);
  function set(clientX: number, clientY: number) {
    const el = base.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = clientX - cx, dy = clientY - cy;
    const max = r.width / 2;
    const mag = Math.min(1, Math.hypot(dx, dy) / max);
    const ang = Math.atan2(dy, dx);
    const nx = Math.cos(ang) * mag, ny = Math.sin(ang) * mag;
    setKnob({ x: nx * max, y: ny * max });
    onChange({ x: nx, y: ny });
  }
  function stop() { active.current = false; setKnob({ x: 0, y: 0 }); onChange({ x: 0, y: 0 }); }
  return (
    <div
      ref={base}
      onTouchStart={(e) => { active.current = true; set(e.touches[0].clientX, e.touches[0].clientY); }}
      onTouchMove={(e) => { if (active.current) set(e.touches[0].clientX, e.touches[0].clientY); }}
      onTouchEnd={stop}
      onMouseDown={(e) => { active.current = true; set(e.clientX, e.clientY); }}
      onMouseMove={(e) => { if (active.current) set(e.clientX, e.clientY); }}
      onMouseUp={stop} onMouseLeave={stop}
      className="relative size-32 rounded-full bg-white/40 backdrop-blur border-2 border-white/60 touch-none select-none"
    >
      <div className="absolute size-14 rounded-full bg-white/90 border border-border shadow-md"
           style={{ left: "50%", top: "50%", transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
    </div>
  );
}

/* ------------------------- page ---------------------------------------- */
function WorldPage() {
  const [country, setCountry] = useState<CountryKey>("japan");
  const district = DISTRICTS[country];
  const input = useKeyboardInput();
  const joystick = useRef({ x: 0, y: 0 });
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  useEffect(() => { saveProgress(progress); }, [progress]);

  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [showStats, setShowStats] = useState(false);
  const [activeLm, setActiveLm] = useState<Landmark | null>(null);
  const [activeNpc, setActiveNpc] = useState<NPC | null>(null);
  const [uniOpen, setUniOpen] = useState(false);
  const [runToggle, setRunToggle] = useState(false); // mobile run button
  useEffect(() => {
    input.current.run = runToggle;
  }, [runToggle, input]);

  function grantXp(n: number) { setProgress((p) => ({ ...p, xp: p.xp + n })); }
  function markVisited(id: string) { setProgress((p) => p.visited.includes(id) ? p : ({ ...p, visited: [...p.visited, id] })); }
  function markTalked(id: string) { setProgress((p) => p.talkedTo.includes(id) ? p : ({ ...p, talkedTo: [...p.talkedTo, id] })); }

  function handleLandmarkClick(lm: Landmark) {
    setActiveLm(lm);
    if (!progress.visited.includes(lm.id)) { markVisited(lm.id); grantXp(3); }
    if (lm.kind === "gate") setUniOpen(true);
  }

  function saveWord() {
    if (!activeLm) return;
    const w: SavedWord = { lang: country, text: activeLm.sign.text, reading: activeLm.sign.reading, meaning: activeLm.sign.meaning, at: Date.now() };
    setProgress((p) => {
      const exists = p.savedWords.some((x) => x.text === w.text && x.lang === w.lang);
      if (exists) return p;
      return { ...p, savedWords: [w, ...p.savedWords], xp: p.xp + 5 };
    });
    toast.success(`Saved "${activeLm.sign.text}" (+5 XP)`);
  }

  // Quest progress
  const districtWords = progress.savedWords.filter((w) => w.lang === country).length;
  const questState = useMemo(() => {
    const q = district.quests;
    return [
      { ...q[0], done: districtWords >= 5, progress: Math.min(5, districtWords), max: 5 },
      { ...q[1], done: progress.visited.includes(district.landmarks.find((l) => l.kind === "library")?.id ?? ""), progress: 0, max: 1 },
      { ...q[2], done: district.npcs.some((n) => n.role === "student" && progress.talkedTo.includes(n.id)), progress: 0, max: 1 },
    ];
  }, [district, districtWords, progress.visited, progress.talkedTo]);

  const [_playerPos, setPlayerPos] = useState<THREE.Vector3 | null>(null);

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
              🗺️ World Explorer
              <Badge variant="secondary" className="text-[10px]">V1</Badge>
            </h1>
            <p className="text-sm text-muted-foreground">Walk through Japan, Korea and China — click signs to save vocab, chat with NPCs.</p>
          </div>
          <div className="flex items-center gap-2">
            {(Object.keys(DISTRICTS) as CountryKey[]).map((k) => (
              <button key={k} onClick={() => setCountry(k)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${country === k ? "bg-primary text-primary-foreground border-primary" : "bg-white border-border"}`}>
                {COUNTRY_FLAG[k]} {COUNTRY_LABEL[k]}
              </button>
            ))}
          </div>
        </div>

        <Card className="relative overflow-hidden border-border p-0 aspect-[16/10] md:aspect-[16/9] bg-slate-100">
          <Canvas shadows={quality !== "low"} dpr={quality === "high" ? [1, 2] : quality === "medium" ? [1, 1.5] : 1}
                  gl={{ antialias: quality !== "low", powerPreference: "high-performance" }}>
            <Suspense fallback={null}>
              <DistrictScene
                district={district}
                input={input}
                joystick={joystick}
                quality={quality}
                avatarColor={progress.avatarColor}
                onLandmarkClick={handleLandmarkClick}
                onNpcClick={(n) => setActiveNpc(n)}
                onMove={setPlayerPos}
              />
              {showStats && <Stats />}
            </Suspense>
          </Canvas>

          {/* HUD */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-2">
              <div className="px-3 py-1.5 rounded-full bg-white/85 border border-border text-xs font-bold shadow-sm">
                ⚡ {progress.xp} XP
              </div>
              <div className="px-3 py-1.5 rounded-full bg-white/85 border border-border text-xs font-bold shadow-sm">
                📚 {progress.savedWords.length} words
              </div>
            </div>
            <div className="pointer-events-auto flex gap-1">
              <select value={quality} onChange={(e) => setQuality(e.target.value as never)}
                className="px-2 py-1 rounded-full bg-white/85 border border-border text-xs font-semibold">
                <option value="low">Low</option><option value="medium">Med</option><option value="high">High</option>
              </select>
              <button onClick={() => setShowStats((s) => !s)}
                className="px-2 py-1 rounded-full bg-white/85 border border-border text-xs font-semibold">FPS</button>
            </div>
          </div>

          {/* Mobile joystick + run */}
          <div className="absolute bottom-4 left-4 md:hidden pointer-events-auto">
            <Joystick onChange={(v) => { joystick.current = v; }} />
          </div>
          <div className="absolute bottom-4 right-4 md:hidden pointer-events-auto flex flex-col gap-2">
            <button onTouchStart={() => setRunToggle(true)} onTouchEnd={() => setRunToggle(false)}
              className={`size-16 rounded-full font-bold border ${runToggle ? "bg-primary text-primary-foreground" : "bg-white/90 border-border"}`}>RUN</button>
          </div>

          {/* Desktop hint */}
          <div className="hidden md:block absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-white/85 border border-border text-[11px] font-semibold shadow-sm">
            WASD to move · Shift to run · click buildings & NPCs
          </div>
        </Card>

        {/* Quests + saved words */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4 space-y-2">
            <div className="font-display font-bold flex items-center gap-2">📜 Quests — {district.label}</div>
            {questState.map((q) => (
              <div key={q.id} className={`p-3 rounded-2xl border ${q.done ? "bg-green-50 border-green-300" : "bg-white/70 border-border"}`}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">{q.done ? "✅" : "⭕"} {q.title}</div>
                  {q.max > 1 && <div className="text-xs text-muted-foreground">{q.progress}/{q.max}</div>}
                </div>
                <div className="text-xs text-muted-foreground">{q.goal}</div>
              </div>
            ))}
          </Card>

          <Card className="p-4 space-y-2">
            <div className="font-display font-bold flex items-center justify-between">
              <span>📚 Saved vocabulary</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Avatar</span>
                <input type="color" value={progress.avatarColor} onChange={(e) => setProgress((p) => ({ ...p, avatarColor: e.target.value }))}
                  className="size-6 rounded-full border border-border p-0" />
              </div>
            </div>
            {progress.savedWords.length === 0 && (
              <div className="text-xs text-muted-foreground">Click a building sign to save vocabulary here.</div>
            )}
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {progress.savedWords.map((w) => (
                <div key={w.text + w.at} className="flex items-center justify-between p-2 rounded-xl bg-white/70 border border-border">
                  <div className="min-w-0">
                    <div className="font-semibold">{w.text} <span className="text-xs text-muted-foreground">{w.reading}</span></div>
                    <div className="text-xs text-muted-foreground truncate">{w.meaning}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{COUNTRY_FLAG[w.lang]}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Landmark dialog */}
      <Dialog open={!!activeLm} onOpenChange={(v) => !v && setActiveLm(null)}>
        <DialogContent>
          {activeLm && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl">{activeLm.sign.text}</DialogTitle>
                <DialogDescription>
                  <span className="font-mono">{activeLm.sign.reading}</span> — {activeLm.sign.meaning}
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm text-muted-foreground">Location: <b>{activeLm.label}</b> in {district.label}</div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActiveLm(null)}>Close</Button>
                <Button onClick={saveWord}>💾 Save word (+5 XP)</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* NPC chat drawer */}
      <NpcChat npc={activeNpc} onClose={() => setActiveNpc(null)} onTalked={(id) => { markTalked(id); grantXp(4); }} />

      {/* Universities drawer for gate */}
      <Sheet open={uniOpen} onOpenChange={setUniOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{COUNTRY_FLAG[country]} Universities in {COUNTRY_LABEL[country]}</SheetTitle>
          </SheetHeader>
          <div className="mt-3 space-y-2">
            {universitiesFor(country).slice(0, 40).map((u) => (
              <div key={u.name} className="p-3 rounded-2xl border border-border bg-white/70">
                <div className="font-semibold text-sm">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.location} · {u.type}</div>
                {u.fields && <div className="text-xs mt-1">{u.fields}</div>}
                {u.website && <a href={u.website} target="_blank" rel="noreferrer" className="text-xs text-primary underline">Visit website</a>}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

/* ------------------------- NPC chat ------------------------------------ */
function NpcChat({ npc, onClose, onTalked }: { npc: NPC | null; onClose: () => void; onTalked: (id: string) => void }) {
  const chat = useServerFn(tutorChat);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (npc) {
      setMessages([{ role: "assistant", content: npc.greeting }]);
      onTalked(npc.id);
    } else {
      setMessages([]); setInput("");
    }
  }, [npc, onTalked]);

  async function send() {
    if (!npc || !input.trim() || busy) return;
    const next = [...messages, { role: "user" as const, content: input.trim() }];
    setMessages(next); setInput(""); setBusy(true);
    try {
      const res = await chat({ data: { messages: next, mode: "npc", systemOverride: npc.systemPrompt } });
      setMessages((m) => [...m, { role: "assistant", content: res.content }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat failed");
    } finally { setBusy(false); }
  }

  return (
    <Sheet open={!!npc} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>💬 {npc?.name} <span className="text-xs text-muted-foreground font-normal">· {npc?.role.replace("_", " ")}</span></SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto space-y-2 my-3 pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`p-3 rounded-2xl text-sm ${m.role === "user" ? "bg-primary/15 ml-6" : "bg-white/80 border border-border mr-6"}`}>
              {m.content}
            </div>
          ))}
          {busy && <div className="text-xs text-muted-foreground animate-pulse">…thinking</div>}
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say something…" className="flex-1 px-3 py-2 rounded-full bg-white border border-border text-sm" />
          <Button onClick={send} disabled={busy}>Send</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
