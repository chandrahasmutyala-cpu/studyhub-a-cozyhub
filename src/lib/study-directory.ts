import data from "./study-directory.json";

export type CountryKey = "japan" | "china" | "korea";

export type UniRow = { name: string; location: string; fields: string };
export type SchRow = {
  name: string; type: string; level: string; coverage: string; notes: string;
};

export const COUNTRY_LABEL: Record<CountryKey, string> = {
  japan: "Japan",
  china: "China",
  korea: "South Korea",
};

export const COUNTRY_FLAG: Record<CountryKey, string> = {
  japan: "🇯🇵",
  china: "🇨🇳",
  korea: "🇰🇷",
};

/** All universities for a country flattened with type tag */
export function universitiesFor(country: CountryKey): (UniRow & { type: string })[] {
  const groups = (data as any).universities[country] as Record<string, UniRow[]>;
  const out: (UniRow & { type: string })[] = [];
  for (const [type, list] of Object.entries(groups)) {
    for (const u of list) out.push({ ...u, type });
  }
  return out;
}

export function scholarshipsFor(country: CountryKey): SchRow[] {
  return ((data as any).scholarships[country] ?? []) as SchRow[];
}

export const UNI_TYPE_LABEL: Record<string, string> = {
  national: "National",
  public: "Public",
  private: "Private",
  "985": "C9 / 985",
  "211": "211 Project",
  tech: "Tech Institute",
  all: "University",
};

export const COUNTRY_NOTES: Record<CountryKey, { language: string; visa: string; cost: string }> = {
  japan: {
    language: "English programs available; JLPT N2+ needed for Japanese-taught degrees.",
    visa: "Student visa (留学) — Certificate of Eligibility processed by host school.",
    cost: "≈ ¥1.8M – 2.5M / yr (Tokyo) inc. tuition, housing, food.",
  },
  china: {
    language: "HSK 4+ for Chinese-taught; many English-medium programs available.",
    visa: "X1 visa (>180 days) / X2 (<180 days) — JW202 form from university.",
    cost: "≈ ¥60,000 – 90,000 / yr inc. tuition and tier-1 city housing.",
  },
  korea: {
    language: "TOPIK 3+ for Korean-taught; English degrees usually need TOEFL 80 / IELTS 5.5+.",
    visa: "D-2 student visa via Korean embassy after admission letter.",
    cost: "≈ ₩14M – 22M / yr inc. tuition and Seoul living costs.",
  },
};

export const DIRECTORY_TOTALS = {
  japan: {
    universities: universitiesFor("japan").length,
    scholarships: scholarshipsFor("japan").length,
  },
  china: {
    universities: universitiesFor("china").length,
    scholarships: scholarshipsFor("china").length,
  },
  korea: {
    universities: universitiesFor("korea").length,
    scholarships: scholarshipsFor("korea").length,
  },
};
