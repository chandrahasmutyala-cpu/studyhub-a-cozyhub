import data from "./kanji-data.json";

export type Kanji = {
  k: string;       // the kanji character
  j: 0 | 1 | 2 | 3 | 4 | 5; // JLPT level (5 = easiest, 0 = no JLPT)
  m: string[];     // English meanings
  on: string[];    // on'yomi readings
  kun: string[];   // kun'yomi readings
  s: number;       // stroke count
  g: number | null; // Jōyō grade 1-6 = elementary, 8 = secondary
};

export const KANJI = data as Kanji[];

const EXPECTED_JOYO_COUNT = 2136;
if (KANJI.length !== EXPECTED_JOYO_COUNT) {
  // Surfaces immediately if the dataset is ever regenerated incorrectly.
  // eslint-disable-next-line no-console
  console.error(`Kanji dataset integrity check failed: expected ${EXPECTED_JOYO_COUNT}, got ${KANJI.length}`);
}

export const KANJI_TOTAL = KANJI.length;

export type KanjiLevel = "N5" | "N4" | "N3" | "N2" | "N1";

const LEVEL_MAP: Record<KanjiLevel, 1 | 2 | 3 | 4 | 5> = {
  N5: 5, N4: 4, N3: 3, N2: 2, N1: 1,
};

export function kanjiByLevel(level: KanjiLevel): Kanji[] {
  return KANJI.filter((k) => k.j === LEVEL_MAP[level]);
}

export type KanjiGrade = "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G8";
const GRADE_MAP: Record<KanjiGrade, number> = { G1: 1, G2: 2, G3: 3, G4: 4, G5: 5, G6: 6, G8: 8 };
export function kanjiByGrade(grade: KanjiGrade): Kanji[] {
  return KANJI.filter((k) => k.g === GRADE_MAP[grade]);
}

export const KANJI_COUNTS: Record<KanjiLevel, number> = {
  N5: KANJI.filter((k) => k.j === 5).length,
  N4: KANJI.filter((k) => k.j === 4).length,
  N3: KANJI.filter((k) => k.j === 3).length,
  N2: KANJI.filter((k) => k.j === 2).length,
  N1: KANJI.filter((k) => k.j === 1).length,
};
