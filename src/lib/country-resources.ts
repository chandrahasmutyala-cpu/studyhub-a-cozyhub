/** Verified university & scholarship resources for Japan, South Korea, China.
 *  Used by AI Tutor info panels and as the seed for the database listing.
 */

export type Country = "Japan" | "South Korea" | "China";

export type University = {
  name: string;
  country: Country;
  city: string;
  tuition: string;           // human-readable
  englishPrograms: boolean;
  applicationPeriod: string;
  website: string;
};

export type Scholarship = {
  name: string;
  country: Country;
  coverage: string;
  stipend: string;
  deadline: string;
  eligibility: string;
  website: string;
};

export const UNIVERSITIES: University[] = [
  // Japan
  { name: "University of Tokyo", country: "Japan", city: "Tokyo", tuition: "¥535,800/yr", englishPrograms: true, applicationPeriod: "Dec – Feb (PEAK)", website: "https://www.u-tokyo.ac.jp/en/" },
  { name: "Kyoto University", country: "Japan", city: "Kyoto", tuition: "¥535,800/yr", englishPrograms: true, applicationPeriod: "Feb – Mar", website: "https://www.kyoto-u.ac.jp/en" },
  { name: "Osaka University", country: "Japan", city: "Osaka", tuition: "¥535,800/yr", englishPrograms: true, applicationPeriod: "Jan – Feb", website: "https://www.osaka-u.ac.jp/en" },
  { name: "Tohoku University", country: "Japan", city: "Sendai", tuition: "¥535,800/yr", englishPrograms: true, applicationPeriod: "Nov – Dec (FGL)", website: "https://www.tohoku.ac.jp/en/" },
  { name: "Waseda University", country: "Japan", city: "Tokyo", tuition: "¥1,300,000/yr", englishPrograms: true, applicationPeriod: "Sep – Nov", website: "https://www.waseda.jp/inst/admission/en/" },
  { name: "Keio University", country: "Japan", city: "Tokyo", tuition: "¥1,400,000/yr", englishPrograms: true, applicationPeriod: "Sep – Nov", website: "https://www.keio.ac.jp/en/" },

  // South Korea
  { name: "Seoul National University", country: "South Korea", city: "Seoul", tuition: "₩4–6M/semester", englishPrograms: true, applicationPeriod: "Mar / Sep intake", website: "https://en.snu.ac.kr/" },
  { name: "Korea Advanced Institute of Science and Technology (KAIST)", country: "South Korea", city: "Daejeon", tuition: "Often waived (research)", englishPrograms: true, applicationPeriod: "Apr / Oct", website: "https://www.kaist.ac.kr/en/" },
  { name: "Yonsei University", country: "South Korea", city: "Seoul", tuition: "₩6–9M/semester", englishPrograms: true, applicationPeriod: "Mar – May / Sep – Nov", website: "https://www.yonsei.ac.kr/en_sc/" },
  { name: "Korea University", country: "South Korea", city: "Seoul", tuition: "₩5–8M/semester", englishPrograms: true, applicationPeriod: "Spring / Fall", website: "https://www.korea.edu/mbshome/mbs/en/index.do" },
  { name: "POSTECH", country: "South Korea", city: "Pohang", tuition: "Often covered (research)", englishPrograms: true, applicationPeriod: "Apr / Oct", website: "https://www.postech.ac.kr/eng/" },
  { name: "SungKyunKwan University (SKKU)", country: "South Korea", city: "Seoul / Suwon", tuition: "₩5–8M/semester", englishPrograms: true, applicationPeriod: "Spring / Fall", website: "https://www.skku.edu/eng/" },

  // China
  { name: "Tsinghua University", country: "China", city: "Beijing", tuition: "¥26,000–40,000/yr", englishPrograms: true, applicationPeriod: "Dec – Mar (Fall intake)", website: "https://www.tsinghua.edu.cn/en/" },
  { name: "Peking University", country: "China", city: "Beijing", tuition: "¥26,000–40,000/yr", englishPrograms: true, applicationPeriod: "Dec – Feb", website: "https://english.pku.edu.cn/" },
  { name: "Fudan University", country: "China", city: "Shanghai", tuition: "¥23,000–45,000/yr", englishPrograms: true, applicationPeriod: "Dec – Apr", website: "https://www.fudan.edu.cn/en/" },
  { name: "Shanghai Jiao Tong University", country: "China", city: "Shanghai", tuition: "¥24,800–45,800/yr", englishPrograms: true, applicationPeriod: "Dec – Mar", website: "https://en.sjtu.edu.cn/" },
  { name: "Zhejiang University", country: "China", city: "Hangzhou", tuition: "¥22,000–42,000/yr", englishPrograms: true, applicationPeriod: "Dec – Apr", website: "https://www.zju.edu.cn/english/" },
  { name: "University of Science & Technology of China (USTC)", country: "China", city: "Hefei", tuition: "¥20,000–35,000/yr", englishPrograms: true, applicationPeriod: "Dec – Apr", website: "https://en.ustc.edu.cn/" },
];

export const SCHOLARSHIPS: Scholarship[] = [
  // Japan
  { name: "MEXT Scholarship", country: "Japan", coverage: "100% tuition + travel", stipend: "¥117,000 – 145,000/mo", deadline: "May – Jun (embassy)", eligibility: "International students; strong academics; under 35 (research) / 25 (undergrad)", website: "https://www.studyinjapan.go.jp/en/" },
  { name: "JASSO Scholarship", country: "Japan", coverage: "Stipend only", stipend: "¥48,000 – 80,000/mo", deadline: "Set by host university", eligibility: "Privately-financed international students at partner schools", website: "https://www.jasso.go.jp/en/study_j/scholarships/" },
  { name: "Honjo International Scholarship", country: "Japan", coverage: "Monthly stipend", stipend: "¥180,000 – 200,000/mo", deadline: "September", eligibility: "Graduate students enrolled at a Japanese university", website: "https://hisf.or.jp/english/" },

  // South Korea
  { name: "Global Korea Scholarship (GKS)", country: "South Korea", coverage: "100% tuition + flight + language program", stipend: "₩900,000 – 1,000,000/mo", deadline: "Feb – Mar (embassy) / Sep (uni)", eligibility: "Undergrad & graduate international students", website: "https://www.studyinkorea.go.kr/en/sub/gks/allnew_invitation.do" },
  { name: "KAIST International Student Scholarship", country: "South Korea", coverage: "Full tuition + monthly stipend", stipend: "₩350,000 – 500,000/mo", deadline: "Apr / Oct", eligibility: "Admitted KAIST international students", website: "https://admission.kaist.ac.kr/intl-undergraduate/" },
  { name: "POSCO Asia Fellowship", country: "South Korea", coverage: "Tuition + living", stipend: "₩900,000/mo", deadline: "April", eligibility: "Asian undergrad/grad students at partner universities", website: "https://www.postf.org/en/main.do" },

  // China
  { name: "Chinese Government Scholarship (CSC)", country: "China", coverage: "Full tuition + accommodation + insurance", stipend: "¥2,500 – 3,500/mo", deadline: "Dec – Apr", eligibility: "Non-Chinese citizens in good health; under 25 (UG), 35 (Master), 40 (PhD)", website: "https://www.campuschina.org/" },
  { name: "Confucius Institute Scholarship", country: "China", coverage: "Tuition + accommodation + insurance", stipend: "¥2,500 – 3,000/mo", deadline: "Mar – May", eligibility: "Students of Chinese language & culture", website: "https://cis.chinese.cn/" },
  { name: "Tsinghua Schwarzman Scholars", country: "China", coverage: "Full ride: tuition, room/board, travel, stipend", stipend: "$4,000 USD personal allowance", deadline: "Sep (Sept intake the next year)", eligibility: "Outstanding global candidates under 29; Master in Global Affairs", website: "https://www.schwarzmanscholars.org/" },
];

export const COUNTRY_NOTES: Record<Country, { language: string; visa: string; cost: string }> = {
  Japan: {
    language: "English programs available; JLPT N2+ needed for Japanese-taught degrees.",
    visa: "Student visa (留学) — Certificate of Eligibility processed by host school.",
    cost: "≈ ¥1.8M – 2.5M/yr (Tokyo) including tuition, housing, food.",
  },
  "South Korea": {
    language: "TOPIK 3+ for Korean-taught; English degrees usually need TOEFL 80 / IELTS 5.5+.",
    visa: "D-2 student visa via Korean embassy after admission letter.",
    cost: "≈ ₩14M – 22M/yr including tuition and Seoul living costs.",
  },
  China: {
    language: "HSK 4+ for Chinese-taught; many English-medium programs available.",
    visa: "X1 visa (>180 days) / X2 (<180 days) — JW202 form from university.",
    cost: "≈ ¥60,000 – 90,000/yr including tuition and tier-1 city housing.",
  },
};
