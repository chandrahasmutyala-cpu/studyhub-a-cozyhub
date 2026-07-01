import type { CountryKey } from "./study-directory";

export type Landmark = {
  id: string;
  label: string; // English label
  sign: { text: string; reading: string; meaning: string }; // native script
  pos: [number, number]; // x, z on ground
  size: [number, number, number]; // w, h, d
  color: string;
  roofColor: string;
  kind: "school" | "library" | "store" | "station" | "gate";
};

export type NPC = {
  id: string;
  name: string;
  role: "student" | "teacher" | "librarian" | "shop_worker";
  pos: [number, number];
  color: string;
  systemPrompt: string;
  greeting: string;
};

export type District = {
  key: CountryKey;
  label: string;
  flag: string;
  ground: string; // hex ground color
  sky: string;
  accent: string;
  landmarks: Landmark[];
  npcs: NPC[];
  quests: { id: string; title: string; goal: string }[];
};

const jp: District = {
  key: "japan",
  label: "Japan District",
  flag: "🇯🇵",
  ground: "#e9f0d9",
  sky: "#cfe6ff",
  accent: "#e8687a",
  landmarks: [
    { id: "jp-school",  label: "School",             sign: { text: "学校",   reading: "がっこう",     meaning: "School" },        pos: [-10, -8], size: [6, 4, 5], color: "#f7d1cc", roofColor: "#b04a5a", kind: "school" },
    { id: "jp-library", label: "Library",            sign: { text: "図書館", reading: "としょかん",   meaning: "Library" },       pos: [10, -6],  size: [5, 5, 5], color: "#efe1c0", roofColor: "#7a5c34", kind: "library" },
    { id: "jp-store",   label: "Convenience Store",  sign: { text: "コンビニ", reading: "こんびに",    meaning: "Convenience store" }, pos: [-6, 10], size: [4, 3, 4], color: "#ffffff", roofColor: "#2b7fbf", kind: "store" },
    { id: "jp-station", label: "Train Station",      sign: { text: "東京駅", reading: "とうきょうえき", meaning: "Tokyo Station" }, pos: [12, 8], size: [7, 4, 5], color: "#dcdcdc", roofColor: "#3a3a3a", kind: "station" },
    { id: "jp-gate",    label: "University Gate",    sign: { text: "大学",   reading: "だいがく",     meaning: "University" },    pos: [0, -14], size: [8, 6, 3], color: "#e6d3b3", roofColor: "#8b3a3a", kind: "gate" },
  ],
  npcs: [
    { id: "jp-mio", name: "Mio", role: "student",
      pos: [-3, 3], color: "#f6a6b5",
      greeting: "はじめまして！(Hajimemashite!) — Nice to meet you.",
      systemPrompt: "You are Mio, a friendly 19-year-old Japanese university student. Chat in simple Japanese with romaji in parentheses and short English glosses. Keep replies 2–3 sentences." },
    { id: "jp-sensei", name: "Tanaka-sensei", role: "teacher",
      pos: [4, -2], color: "#8fb3d9",
      greeting: "こんにちは。JLPTの勉強、頑張っていますか？",
      systemPrompt: "You are Tanaka-sensei, a calm Japanese language teacher. Speak polite Japanese (です/ます), always include romaji + short English gloss. Explain one grammar point per reply." },
    { id: "jp-libr", role: "librarian", name: "Aya", pos: [8, -4], color: "#c9b6d9",
      greeting: "ここは図書館です。静かにお願いします。",
      systemPrompt: "You are Aya, a quiet Japanese librarian. Recommend one Japanese book or article per reply. Japanese + romaji + short English gloss." },
  ],
  quests: [
    { id: "jp-q1", title: "Learn 5 Japanese words", goal: "Save 5 words from the district signs." },
    { id: "jp-q2", title: "Visit the library",     goal: "Click on the Library building." },
    { id: "jp-q3", title: "Talk to a student",     goal: "Have a conversation with Mio." },
  ],
};

const kr: District = {
  key: "korea",
  label: "Korea District",
  flag: "🇰🇷",
  ground: "#e6ecf5",
  sky: "#d6e6ff",
  accent: "#4a6cf7",
  landmarks: [
    { id: "kr-campus",  label: "Campus Area", sign: { text: "캠퍼스", reading: "kaempeoseu", meaning: "Campus" },  pos: [-8, -8], size: [8, 5, 6], color: "#dfe6f5", roofColor: "#324b7a", kind: "school" },
    { id: "kr-cafe",    label: "Cafe",        sign: { text: "카페",   reading: "kape",       meaning: "Cafe" },    pos: [8, -4],  size: [4, 3, 4], color: "#f5e3cc", roofColor: "#8a5a3a", kind: "store" },
    { id: "kr-books",   label: "Bookstore",   sign: { text: "서점",   reading: "seojeom",    meaning: "Bookstore" },pos: [-6, 8],  size: [5, 4, 5], color: "#f0e4b5", roofColor: "#6d5a24", kind: "library" },
    { id: "kr-subway",  label: "Subway",      sign: { text: "지하철", reading: "jihacheol",  meaning: "Subway" },  pos: [10, 10], size: [5, 3, 5], color: "#cfd4dc", roofColor: "#2a3140", kind: "station" },
    { id: "kr-gate",    label: "University Gate", sign: { text: "대학교", reading: "daehakgyo", meaning: "University" }, pos: [0, -14], size: [8, 6, 3], color: "#eeddaa", roofColor: "#7a2b2b", kind: "gate" },
  ],
  npcs: [
    { id: "kr-jimin", name: "Jimin", role: "student", pos: [-2, 2], color: "#7fa8ff",
      greeting: "안녕하세요! (annyeonghaseyo!) — Hello!",
      systemPrompt: "You are Jimin, a cheerful Korean student. Reply in simple Korean + revised romanization in parentheses + short English gloss." },
    { id: "kr-park", name: "Park-ssaem", role: "teacher", pos: [4, -3], color: "#b3c7ff",
      greeting: "TOPIK 준비 잘 되고 있어요?",
      systemPrompt: "You are Park-ssaem, a Korean TOPIK teacher. Use polite Korean (해요/합니다), add romanization + English gloss, explain one grammar point." },
  ],
  quests: [
    { id: "kr-q1", title: "Learn 5 Korean words", goal: "Save 5 vocab from signs." },
    { id: "kr-q2", title: "Visit the bookstore",  goal: "Click Bookstore." },
    { id: "kr-q3", title: "Talk to Jimin",        goal: "Chat with a Korean student." },
  ],
};

const cn: District = {
  key: "china",
  label: "China District",
  flag: "🇨🇳",
  ground: "#f2ead9",
  sky: "#ffe6c9",
  accent: "#c9302c",
  landmarks: [
    { id: "cn-uni",     label: "University Area", sign: { text: "大学",   reading: "dàxué",     meaning: "University" }, pos: [-8, -6], size: [8, 6, 6], color: "#f5d3b5", roofColor: "#a03028", kind: "school" },
    { id: "cn-lib",     label: "Library",         sign: { text: "图书馆", reading: "túshūguǎn", meaning: "Library" },    pos: [8, -6],  size: [6, 5, 5], color: "#ebd6a8", roofColor: "#6d4620", kind: "library" },
    { id: "cn-study",   label: "Study Center",    sign: { text: "自习室", reading: "zìxíshì",   meaning: "Study room" }, pos: [-4, 8],  size: [5, 4, 5], color: "#eee6cf", roofColor: "#3a3a3a", kind: "school" },
    { id: "cn-gate",    label: "University Gate", sign: { text: "校门",   reading: "xiàomén",   meaning: "School gate" },pos: [0, -14], size: [8, 6, 3], color: "#f0d9b5", roofColor: "#8b2a2a", kind: "gate" },
  ],
  npcs: [
    { id: "cn-mei", name: "Mei", role: "student", pos: [-3, 3], color: "#ff9a8b",
      greeting: "你好！(Nǐ hǎo!) — Hello!",
      systemPrompt: "You are Mei, a friendly Chinese university student. Reply with simplified Chinese + pinyin (with tone marks) + short English gloss." },
    { id: "cn-wang", name: "Wang laoshi", role: "teacher", pos: [4, -2], color: "#f0a04a",
      greeting: "HSK考试准备得怎么样？",
      systemPrompt: "You are Wang laoshi, an HSK Chinese teacher. Reply in Chinese + pinyin + short English gloss. Explain one HSK grammar point per reply." },
  ],
  quests: [
    { id: "cn-q1", title: "Learn 5 Chinese words", goal: "Save 5 vocab from signs." },
    { id: "cn-q2", title: "Visit the library",     goal: "Click on Library." },
    { id: "cn-q3", title: "Talk to Mei",           goal: "Chat with a Chinese student." },
  ],
};

export const DISTRICTS: Record<CountryKey, District> = { japan: jp, korea: kr, china: cn };
