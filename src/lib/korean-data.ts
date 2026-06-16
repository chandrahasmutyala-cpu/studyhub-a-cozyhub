/** Bundled Korean learning data. Hangul jamo + curated TOPIK starter sets.
 *  Higher-level vocabulary is generated on-demand by the AI tutor.
 */

export type Jamo = { ko: string; rom: string; type: "vowel" | "consonant"; note?: string };

export const HANGUL_VOWELS: Jamo[] = [
  { ko: "ㅏ", rom: "a", type: "vowel" }, { ko: "ㅑ", rom: "ya", type: "vowel" },
  { ko: "ㅓ", rom: "eo", type: "vowel" }, { ko: "ㅕ", rom: "yeo", type: "vowel" },
  { ko: "ㅗ", rom: "o", type: "vowel" }, { ko: "ㅛ", rom: "yo", type: "vowel" },
  { ko: "ㅜ", rom: "u", type: "vowel" }, { ko: "ㅠ", rom: "yu", type: "vowel" },
  { ko: "ㅡ", rom: "eu", type: "vowel" }, { ko: "ㅣ", rom: "i", type: "vowel" },
  { ko: "ㅐ", rom: "ae", type: "vowel" }, { ko: "ㅒ", rom: "yae", type: "vowel" },
  { ko: "ㅔ", rom: "e", type: "vowel" }, { ko: "ㅖ", rom: "ye", type: "vowel" },
  { ko: "ㅘ", rom: "wa", type: "vowel" }, { ko: "ㅙ", rom: "wae", type: "vowel" },
  { ko: "ㅚ", rom: "oe", type: "vowel" }, { ko: "ㅝ", rom: "wo", type: "vowel" },
  { ko: "ㅞ", rom: "we", type: "vowel" }, { ko: "ㅟ", rom: "wi", type: "vowel" },
  { ko: "ㅢ", rom: "ui", type: "vowel" },
];

export const HANGUL_CONSONANTS: Jamo[] = [
  { ko: "ㄱ", rom: "g/k", type: "consonant" }, { ko: "ㄴ", rom: "n", type: "consonant" },
  { ko: "ㄷ", rom: "d/t", type: "consonant" }, { ko: "ㄹ", rom: "r/l", type: "consonant" },
  { ko: "ㅁ", rom: "m", type: "consonant" }, { ko: "ㅂ", rom: "b/p", type: "consonant" },
  { ko: "ㅅ", rom: "s", type: "consonant" }, { ko: "ㅇ", rom: "ng/-", type: "consonant" },
  { ko: "ㅈ", rom: "j", type: "consonant" }, { ko: "ㅊ", rom: "ch", type: "consonant" },
  { ko: "ㅋ", rom: "k", type: "consonant" }, { ko: "ㅌ", rom: "t", type: "consonant" },
  { ko: "ㅍ", rom: "p", type: "consonant" }, { ko: "ㅎ", rom: "h", type: "consonant" },
  { ko: "ㄲ", rom: "kk", type: "consonant", note: "tense" },
  { ko: "ㄸ", rom: "tt", type: "consonant", note: "tense" },
  { ko: "ㅃ", rom: "pp", type: "consonant", note: "tense" },
  { ko: "ㅆ", rom: "ss", type: "consonant", note: "tense" },
  { ko: "ㅉ", rom: "jj", type: "consonant", note: "tense" },
];

export type KoWord = { ko: string; rom: string; en: string };
export type TopikLevel = "TOPIK I" | "TOPIK II" | "TOPIK III" | "TOPIK IV" | "TOPIK V" | "TOPIK VI";

export const TOPIK_STARTERS: Record<TopikLevel, KoWord[]> = {
  "TOPIK I": [
    { ko: "안녕하세요", rom: "annyeonghaseyo", en: "Hello (polite)" },
    { ko: "감사합니다", rom: "gamsahamnida", en: "Thank you" },
    { ko: "네", rom: "ne", en: "Yes" },
    { ko: "아니요", rom: "aniyo", en: "No" },
    { ko: "사람", rom: "saram", en: "Person" },
    { ko: "물", rom: "mul", en: "Water" },
    { ko: "밥", rom: "bap", en: "Rice / meal" },
    { ko: "학교", rom: "hakgyo", en: "School" },
    { ko: "친구", rom: "chingu", en: "Friend" },
    { ko: "집", rom: "jip", en: "House" },
    { ko: "책", rom: "chaek", en: "Book" },
    { ko: "오늘", rom: "oneul", en: "Today" },
    { ko: "내일", rom: "naeil", en: "Tomorrow" },
    { ko: "가다", rom: "gada", en: "To go" },
    { ko: "오다", rom: "oda", en: "To come" },
    { ko: "먹다", rom: "meokda", en: "To eat" },
    { ko: "마시다", rom: "masida", en: "To drink" },
    { ko: "보다", rom: "boda", en: "To see / watch" },
    { ko: "하다", rom: "hada", en: "To do" },
    { ko: "이다", rom: "ida", en: "To be (copula)" },
  ],
  "TOPIK II": [
    { ko: "공부하다", rom: "gongbuhada", en: "To study" },
    { ko: "회사", rom: "hoesa", en: "Company" },
    { ko: "여행", rom: "yeohaeng", en: "Travel" },
    { ko: "음식", rom: "eumsik", en: "Food" },
    { ko: "운동", rom: "undong", en: "Exercise" },
    { ko: "건강", rom: "geongang", en: "Health" },
    { ko: "사랑하다", rom: "saranghada", en: "To love" },
    { ko: "기다리다", rom: "gidarida", en: "To wait" },
    { ko: "이야기하다", rom: "iyagihada", en: "To talk" },
    { ko: "준비하다", rom: "junbihada", en: "To prepare" },
  ],
  "TOPIK III": [], "TOPIK IV": [], "TOPIK V": [], "TOPIK VI": [],
};

export const TOPIK_LEVELS: TopikLevel[] = ["TOPIK I","TOPIK II","TOPIK III","TOPIK IV","TOPIK V","TOPIK VI"];

export const KOREAN_GRAMMAR_POINTS = [
  { id: "은-는", title: "은/는 — Topic marker", body: "Marks the topic of a sentence; contrast or introduction." },
  { id: "이-가", title: "이/가 — Subject marker", body: "Marks the grammatical subject; new information." },
  { id: "을-를", title: "을/를 — Object marker", body: "Marks the direct object of the verb." },
  { id: "에", title: "에 — Location/time", body: "Marks location of existence or time of action." },
  { id: "에서", title: "에서 — Action location", body: "Marks where an action takes place; also 'from'." },
  { id: "아요-어요", title: "아요/어요 — Polite present", body: "Standard polite verb ending." },
  { id: "ㅂ니다-습니다", title: "ㅂ니다/습니다 — Formal", body: "Formal polite ending used in news/announcements." },
  { id: "고", title: "-고 — And", body: "Connects two clauses sequentially." },
  { id: "지만", title: "-지만 — But", body: "Contrast between two clauses." },
  { id: "면", title: "-(으)면 — If", body: "Conditional ending." },
];
