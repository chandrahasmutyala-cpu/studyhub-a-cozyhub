import data from "./jlpt-vocab.json";

export type JlptWord = { j: string; r: string; m: string };
export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

const raw = data as Record<JlptLevel, JlptWord[]>;

export const JLPT_VOCAB: Record<JlptLevel, JlptWord[]> = {
  N5: raw.N5 ?? [],
  N4: raw.N4 ?? [],
  N3: raw.N3 ?? [],
  N2: raw.N2 ?? [],
  N1: raw.N1 ?? [],
};

export const JLPT_COUNTS: Record<JlptLevel, number> = {
  N5: JLPT_VOCAB.N5.length,
  N4: JLPT_VOCAB.N4.length,
  N3: JLPT_VOCAB.N3.length,
  N2: JLPT_VOCAB.N2.length,
  N1: JLPT_VOCAB.N1.length,
};

export const JLPT_TOTAL = (Object.values(JLPT_COUNTS) as number[]).reduce((a, b) => a + b, 0);
