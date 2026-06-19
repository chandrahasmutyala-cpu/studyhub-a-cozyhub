import data from "./study-directory.json";

export type CountryKey = "japan" | "china" | "korea";

export type UniRow = {
  name: string;
  location: string;
  fields: string;
  tuition?: string;
  requirements?: string;
  apply?: string;
  website?: string;
};
export type SchRow = {
  name: string;
  website?: string;
  type: string;
  level: string;
  coverage: string;
  notes: string;
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
  "985": "985 / C9 Elite",
  "211": "211 Project",
  tech: "Tech Institute (KAIST/POSTECH+)",
};

export const COUNTRY_NOTES: Record<CountryKey, { language: string; visa: string; cost: string }> = {
  japan: {
    language: "English programs available; JLPT N2+ needed for Japanese-taught degrees, N1+ for medicine.",
    visa: "Student visa (留学) — Certificate of Eligibility processed by host school.",
    cost: "National/public: ¥535,800/yr + ¥282,000 admission. Private: ¥700k–1.5M/yr; medicine up to ¥10M.",
  },
  china: {
    language: "HSK 4+ for Chinese-taught; many English-medium programs at top schools (IELTS 6.0–6.5 / TOEFL 80–90).",
    visa: "X1 visa (>180 days) / X2 (<180 days) — JW202 form from university.",
    cost: "UG ¥18k–60k/yr · Masters ¥25k–80k/yr · PhD ¥30k–100k/yr (medicine/MBA at the high end).",
  },
  korea: {
    language: "TOPIK 3+ for Korean-taught; English degrees usually need TOEFL 72–80+ / IELTS 5.5–6.0+.",
    visa: "D-2 student visa via Korean embassy after admission letter.",
    cost: "National: ₩2M–5M/semester · SKY: ₩4M–7.5M · Medicine: ₩8M–12M. KAIST/POSTECH/GIST/UNIST/DGIST: free for grads.",
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
