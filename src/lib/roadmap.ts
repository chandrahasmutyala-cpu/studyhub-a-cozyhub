// Learning Academy roadmap definitions — Duolingo-style ordered lesson graph.

export type LessonKind =
  | "intro"
  | "learn"
  | "practice"
  | "reading"
  | "writing"
  | "listening"
  | "speaking"
  | "vocabulary"
  | "grammar"
  | "conversation"
  | "ai"
  | "review";

export type LessonNode = {
  key: string;
  title: string;
  stage: string; // e.g. "Hiragana", "Katakana", "JLPT N5"
  kind: LessonKind;
  xp: number;
  minutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
};

function buildStage(prefix: string, stage: string, opts?: { baseXp?: number }): LessonNode[] {
  const base = opts?.baseXp ?? 20;
  const kinds: LessonKind[] = ["learn", "practice", "reading", "writing", "vocabulary", "grammar", "conversation", "review"];
  return kinds.map((k, i) => ({
    key: `${prefix}-${k}`,
    title: `${stage} ${k[0].toUpperCase()}${k.slice(1)}`,
    stage,
    kind: k,
    xp: base + i * 5,
    minutes: 10 + i * 2,
    difficulty: Math.min(5, Math.ceil((i + 1) / 2)) as 1 | 2 | 3 | 4 | 5,
  }));
}

export const JAPANESE_ROADMAP: LessonNode[] = [
  { key: "jp-intro", title: "Welcome to Japanese", stage: "Introduction", kind: "intro", xp: 10, minutes: 3, difficulty: 1 },
  ...buildStage("jp-hira", "Hiragana"),
  ...buildStage("jp-kata", "Katakana", { baseXp: 25 }),
  ...buildStage("jp-kanji", "Basic Kanji", { baseXp: 30 }),
  ...buildStage("jp-n5", "JLPT N5", { baseXp: 35 }),
  ...buildStage("jp-n4", "JLPT N4", { baseXp: 45 }),
  ...buildStage("jp-n3", "JLPT N3", { baseXp: 55 }),
  ...buildStage("jp-n2", "JLPT N2", { baseXp: 70 }),
  ...buildStage("jp-n1", "JLPT N1", { baseXp: 90 }),
];

export const CHINESE_ROADMAP: LessonNode[] = [
  { key: "cn-intro", title: "Welcome to Chinese", stage: "Introduction", kind: "intro", xp: 10, minutes: 3, difficulty: 1 },
  ...buildStage("cn-pinyin", "Pinyin"),
  ...buildStage("cn-hsk1", "HSK 1", { baseXp: 25 }),
  ...buildStage("cn-hsk2", "HSK 2", { baseXp: 35 }),
  ...buildStage("cn-hsk3", "HSK 3", { baseXp: 45 }),
  ...buildStage("cn-hsk4", "HSK 4", { baseXp: 55 }),
  ...buildStage("cn-hsk5", "HSK 5", { baseXp: 70 }),
  ...buildStage("cn-hsk6", "HSK 6", { baseXp: 90 }),
];

export const KOREAN_ROADMAP: LessonNode[] = [
  { key: "kr-intro", title: "Welcome to Korean", stage: "Introduction", kind: "intro", xp: 10, minutes: 3, difficulty: 1 },
  ...buildStage("kr-hangul", "Hangul"),
  ...buildStage("kr-topik1", "TOPIK Beginner", { baseXp: 30 }),
  ...buildStage("kr-topik2", "TOPIK Intermediate", { baseXp: 55 }),
  ...buildStage("kr-topik3", "TOPIK Advanced", { baseXp: 90 }),
];

export const ROADMAPS = {
  japanese: JAPANESE_ROADMAP,
  chinese: CHINESE_ROADMAP,
  korean: KOREAN_ROADMAP,
} as const;

export type LanguageKey = keyof typeof ROADMAPS;

export function lessonState(
  index: number,
  completedKeys: Set<string>,
  nodes: LessonNode[],
): "completed" | "current" | "locked" {
  if (completedKeys.has(nodes[index].key)) return "completed";
  // current = first non-completed
  for (let i = 0; i < nodes.length; i++) {
    if (!completedKeys.has(nodes[i].key)) return i === index ? "current" : "locked";
  }
  return "locked";
}
