export type MinedWord = {
  id: string;
  lang: "ja" | "zh" | "ko";
  native: string;
  reading: string;
  meaning: string;
  source?: string;
  addedAt: number;
  streak: number; // SRS-lite: consecutive correct
  nextReview: number;
};

const KEY = "studyhub.vocab.mine.v1";

export function loadMined(): MinedWord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function saveMined(list: MinedWord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}
export function addMined(w: Omit<MinedWord, "id" | "addedAt" | "streak" | "nextReview">): MinedWord[] {
  const list = loadMined();
  const exists = list.find((x) => x.lang === w.lang && x.native === w.native);
  if (exists) return list;
  const next: MinedWord = { ...w, id: crypto.randomUUID(), addedAt: Date.now(), streak: 0, nextReview: Date.now() };
  const updated = [next, ...list];
  saveMined(updated);
  return updated;
}
export function removeMined(id: string): MinedWord[] {
  const updated = loadMined().filter((x) => x.id !== id);
  saveMined(updated);
  return updated;
}
export function reviewMined(id: string, correct: boolean): MinedWord[] {
  const list = loadMined();
  const updated = list.map((x) => {
    if (x.id !== id) return x;
    const streak = correct ? x.streak + 1 : 0;
    const days = correct ? [1, 2, 4, 7, 14, 30, 60, 120][Math.min(streak, 7)] : 1;
    return { ...x, streak, nextReview: Date.now() + days * 86400000 };
  });
  saveMined(updated);
  return updated;
}
