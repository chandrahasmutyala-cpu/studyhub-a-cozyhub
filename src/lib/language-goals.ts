export type LanguageGoals = {
  dailyWords: number;
  dailyMinutes: number;
  weeklySessions: number;
};
export type GoalLog = { date: string; words: number; minutes: number; session: boolean };

const KEY_GOALS = "studyhub.lang.goals.v1";
const KEY_LOG = "studyhub.lang.log.v1";

export const DEFAULT_GOALS: LanguageGoals = { dailyWords: 10, dailyMinutes: 20, weeklySessions: 5 };

export function loadGoals(): LanguageGoals {
  if (typeof window === "undefined") return DEFAULT_GOALS;
  try { return { ...DEFAULT_GOALS, ...JSON.parse(window.localStorage.getItem(KEY_GOALS) || "{}") }; } catch { return DEFAULT_GOALS; }
}
export function saveGoals(g: LanguageGoals) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY_GOALS, JSON.stringify(g));
}
export function loadLog(): GoalLog[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(KEY_LOG) || "[]"); } catch { return []; }
}
export function logProgress(words: number, minutes: number) {
  const date = new Date().toISOString().slice(0, 10);
  const log = loadLog();
  const idx = log.findIndex(e => e.date === date);
  if (idx >= 0) log[idx] = { ...log[idx], words: log[idx].words + words, minutes: log[idx].minutes + minutes, session: true };
  else log.unshift({ date, words, minutes, session: true });
  window.localStorage.setItem(KEY_LOG, JSON.stringify(log.slice(0, 90)));
  return log;
}
