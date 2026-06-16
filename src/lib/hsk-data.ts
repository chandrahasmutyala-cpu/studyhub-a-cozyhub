import data from "./hsk-data.json";

export type HskWord = { s: string; p: string };
export type HskLevel = 1 | 2 | 3 | 4 | 5 | 6;

const raw = data as Record<string, HskWord[]>;

export const HSK_VOCAB: Record<HskLevel, HskWord[]> = {
  1: raw["1"] ?? [],
  2: raw["2"] ?? [],
  3: raw["3"] ?? [],
  4: raw["4"] ?? [],
  5: raw["5"] ?? [],
  6: raw["6"] ?? [],
};

export const HSK_COUNTS: Record<HskLevel, number> = {
  1: HSK_VOCAB[1].length,
  2: HSK_VOCAB[2].length,
  3: HSK_VOCAB[3].length,
  4: HSK_VOCAB[4].length,
  5: HSK_VOCAB[5].length,
  6: HSK_VOCAB[6].length,
};

export const HSK_TOTAL = (Object.values(HSK_COUNTS) as number[]).reduce((a, b) => a + b, 0);

/** Pinyin initials & finals — bundled for the Pronunciation tab. */
export const PINYIN_INITIALS = [
  "b","p","m","f","d","t","n","l","g","k","h","j","q","x","zh","ch","sh","r","z","c","s","y","w",
];
export const PINYIN_FINALS = [
  "a","o","e","i","u","ü","ai","ei","ao","ou","an","en","ang","eng","ong",
  "ia","ie","iao","iu","ian","in","iang","ing","iong",
  "ua","uo","uai","ui","uan","un","uang","ueng","üe","üan","ün","er",
];
export const TONES = [
  { mark: "ā", name: "First (high level)", arrow: "→" },
  { mark: "á", name: "Second (rising)", arrow: "↗" },
  { mark: "ǎ", name: "Third (dip)", arrow: "↘↗" },
  { mark: "à", name: "Fourth (falling)", arrow: "↘" },
  { mark: "a", name: "Neutral (light)", arrow: "·" },
];
