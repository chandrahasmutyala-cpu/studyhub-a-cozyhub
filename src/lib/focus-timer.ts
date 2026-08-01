import { useSyncExternalStore, useEffect, useState } from "react";

export type TimerPhase = "focus" | "break";

export type FocusTimerState = {
  phase: TimerPhase;
  running: boolean;
  /** epoch ms when the current phase ends (only meaningful while running) */
  endsAt: number | null;
  /** ms left while paused */
  remainingMs: number;
  focusMin: number;
  breakMin: number;
  scene: string;
};

const KEY = "studyhub-focus-timer-v1";

const DEFAULT: FocusTimerState = {
  phase: "focus",
  running: false,
  endsAt: null,
  remainingMs: 25 * 60_000,
  focusMin: 25,
  breakMin: 5,
  scene: "sage",
};

let state: FocusTimerState = DEFAULT;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT, ...(JSON.parse(raw) as Partial<FocusTimerState>) };
  } catch { /* ignore */ }
}

function persist() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function set(patch: Partial<FocusTimerState>) {
  state = { ...state, ...patch };
  persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  hydrate();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY || !e.newValue) return;
    try { state = { ...DEFAULT, ...JSON.parse(e.newValue) }; listeners.forEach((l) => l()); } catch { /* ignore */ }
  };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(cb); window.removeEventListener("storage", onStorage); };
}

function getSnapshot() { hydrate(); return state; }
function getServerSnapshot() { return DEFAULT; }

export function useFocusTimer() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const focusTimer = {
  get state() { hydrate(); return state; },
  phaseTotalMs(s: FocusTimerState = state) {
    return (s.phase === "focus" ? s.focusMin : s.breakMin) * 60_000;
  },
  remaining(now = Date.now(), s: FocusTimerState = state) {
    if (s.running && s.endsAt) return Math.max(0, s.endsAt - now);
    return Math.max(0, s.remainingMs);
  },
  start() {
    hydrate();
    if (state.running) return;
    const ms = state.remainingMs > 0 ? state.remainingMs : focusTimer.phaseTotalMs();
    set({ running: true, endsAt: Date.now() + ms, remainingMs: ms });
  },
  pause() {
    hydrate();
    if (!state.running) return;
    set({ running: false, remainingMs: focusTimer.remaining(), endsAt: null });
  },
  toggle() { state.running ? focusTimer.pause() : focusTimer.start(); },
  reset() {
    hydrate();
    set({ running: false, endsAt: null, remainingMs: focusTimer.phaseTotalMs() });
  },
  setPhase(phase: TimerPhase) {
    hydrate();
    const total = (phase === "focus" ? state.focusMin : state.breakMin) * 60_000;
    set({ phase, running: false, endsAt: null, remainingMs: total });
  },
  setDurations(focusMin: number, breakMin: number) {
    hydrate();
    const total = (state.phase === "focus" ? focusMin : breakMin) * 60_000;
    set({ focusMin, breakMin, running: false, endsAt: null, remainingMs: total });
  },
  setScene(scene: string) { set({ scene }); },
  /** called by the global engine when the phase ends */
  _complete() {
    hydrate();
    const next: TimerPhase = state.phase === "focus" ? "break" : "focus";
    const total = (next === "focus" ? state.focusMin : state.breakMin) * 60_000;
    set({ phase: next, running: false, endsAt: null, remainingMs: total });
  },
};

/** Re-renders every `ms` while `active`, so live countdowns stay smooth. */
export function useTick(ms = 500, active = true) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => force((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms, active]);
}

export function formatMs(ms: number) {
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(h > 0 ? m : m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
