import data from "./kanji-data.json";

export type Kanji = {
  k: string;       // the kanji character
  j: 1 | 2 | 3 | 4 | 5; // JLPT level (5 = easiest)
  m: string[];     // English meanings
  on: string[];    // on'yomi readings
  kun: string[];   // kun'yomi readings
  s: number;       // stroke count
};

export const KANJI = data as Kanji[];

export type KanjiLevel = "N5" | "N4" | "N3" | "N2" | "N1";

const LEVEL_MAP: Record<KanjiLevel, 1 | 2 | 3 | 4 | 5> = {
  N5: 5, N4: 4, N3: 3, N2: 2, N1: 1,
};

export function kanjiByLevel(level: KanjiLevel): Kanji[] {
  return KANJI.filter((k) => k.j === LEVEL_MAP[level]);
}

export const KANJI_COUNTS: Record<KanjiLevel, number> = {
  N5: KANJI.filter((k) => k.j === 5).length,
  N4: KANJI.filter((k) => k.j === 4).length,
  N3: KANJI.filter((k) => k.j === 3).length,
  N2: KANJI.filter((k) => k.j === 2).length,
  N1: KANJI.filter((k) => k.j === 1).length,
};
