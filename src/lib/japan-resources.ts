export type JapanUni = {
  name: string;
  location: string;
  tuitionJpy: string;
  applicationPeriod: string;
  englishPrograms: boolean;
  entranceExam: boolean;
  website: string;
};

export const JAPAN_UNIS: JapanUni[] = [
  { name: "University of Tokyo", location: "Tokyo", tuitionJpy: "535,800/yr", applicationPeriod: "Dec – Feb (PEAK)", englishPrograms: true, entranceExam: true, website: "https://www.u-tokyo.ac.jp/en/" },
  { name: "Kyoto University", location: "Kyoto", tuitionJpy: "535,800/yr", applicationPeriod: "Feb – Mar", englishPrograms: true, entranceExam: true, website: "https://www.kyoto-u.ac.jp/en" },
  { name: "Osaka University", location: "Osaka", tuitionJpy: "535,800/yr", applicationPeriod: "Jan – Feb", englishPrograms: true, entranceExam: true, website: "https://www.osaka-u.ac.jp/en" },
  { name: "Tohoku University", location: "Sendai", tuitionJpy: "535,800/yr", applicationPeriod: "Nov – Dec (FGL)", englishPrograms: true, entranceExam: false, website: "https://www.tohoku.ac.jp/en/" },
  { name: "Hokkaido University", location: "Sapporo", tuitionJpy: "535,800/yr", applicationPeriod: "Oct – Nov", englishPrograms: true, entranceExam: false, website: "https://www.global.hokudai.ac.jp/" },
  { name: "Waseda University", location: "Tokyo", tuitionJpy: "1,300,000/yr", applicationPeriod: "Sep – Nov", englishPrograms: true, entranceExam: false, website: "https://www.waseda.jp/inst/admission/en/" },
  { name: "Keio University", location: "Tokyo", tuitionJpy: "1,400,000/yr", applicationPeriod: "Sep – Nov", englishPrograms: true, entranceExam: false, website: "https://www.keio.ac.jp/en/" },
  { name: "Ritsumeikan University", location: "Kyoto", tuitionJpy: "1,200,000/yr", applicationPeriod: "Sep – Dec", englishPrograms: true, entranceExam: false, website: "https://en.ritsumei.ac.jp/" },
  { name: "Sophia University", location: "Tokyo", tuitionJpy: "1,300,000/yr", applicationPeriod: "Sep – Nov", englishPrograms: true, entranceExam: false, website: "https://www.sophia.ac.jp/eng/" },
];

export type JapanScholarship = {
  name: string;
  coverage: string;
  monthlyStipendJpy: string;
  deadline: string;
  eligibility: string;
  website: string;
};

export const JAPAN_SCHOLARSHIPS: JapanScholarship[] = [
  { name: "MEXT Scholarship", coverage: "100% tuition + travel", monthlyStipendJpy: "117,000 – 145,000", deadline: "May – June (embassy)", eligibility: "International students; strong academics; under 35 (research) / 25 (undergrad)", website: "https://www.studyinjapan.go.jp/en/" },
  { name: "JASSO Scholarship", coverage: "Monthly stipend only", monthlyStipendJpy: "48,000 – 80,000", deadline: "Set by host university", eligibility: "Privately-financed international students at partner schools", website: "https://www.jasso.go.jp/en/study_j/scholarships/" },
  { name: "Honjo International Scholarship", coverage: "Monthly stipend", monthlyStipendJpy: "180,000 – 200,000", deadline: "September", eligibility: "Graduate students enrolled at a Japanese university", website: "https://hisf.or.jp/english/" },
  { name: "Rotary Yoneyama Scholarship", coverage: "Monthly stipend", monthlyStipendJpy: "100,000 – 140,000", deadline: "Varies by district", eligibility: "International students studying in Japan", website: "https://www.rotary-yoneyama.or.jp/english" },
  { name: "ADB–Japan Scholarship", coverage: "Full tuition + living + travel", monthlyStipendJpy: "Living + housing covered", deadline: "Varies (per partner school)", eligibility: "Nationals of ADB member countries; master's programs", website: "https://www.adb.org/work-with-us/careers/japan-scholarship-program" },
  { name: "Asian Future Leaders Scholarship (AFLSP)", coverage: "Tuition + stipend + program fees", monthlyStipendJpy: "Full living covered", deadline: "March", eligibility: "Outstanding Asian undergraduates at partner Japanese universities", website: "https://en.bxai.org/programs/aflsp/" },
];

export const ADMISSION_REQS = [
  { label: "Minimum academic %", value: "Top 70%+ (top universities expect 80%+)" },
  { label: "English (non-native)", value: "TOEFL iBT 80+ / IELTS 6.5+" },
  { label: "Japanese (Japanese-taught)", value: "JLPT N2 minimum, N1 preferred" },
  { label: "Japanese (English-taught)", value: "Often none required" },
  { label: "Required documents", value: "Transcripts, diploma, passport copy, photo, financial proof" },
  { label: "Statement of Purpose", value: "1–2 pages; research goals & motivation" },
  { label: "Recommendation letters", value: "2 from academic referees" },
  { label: "Passport", value: "Valid 6+ months beyond program start" },
];

export const COST_ESTIMATE = [
  { label: "Tuition (national uni)", jpy: 535800 },
  { label: "Accommodation (Tokyo avg)", jpy: 720000 },
  { label: "Food", jpy: 360000 },
  { label: "Transport", jpy: 120000 },
  { label: "Utilities & misc", jpy: 240000 },
];

export const OFFICIAL_RESOURCES = [
  { title: "Study in Japan (MEXT)", url: "https://www.studyinjapan.go.jp/en/" },
  { title: "JASSO scholarships portal", url: "https://www.jasso.go.jp/en/" },
  { title: "Japan Student Visa info", url: "https://www.mofa.go.jp/j_info/visit/visa/long/visa5.html" },
  { title: "Immigration Services Agency", url: "https://www.isa.go.jp/en/" },
  { title: "JapanGov student life guide", url: "https://www.japan.go.jp/" },
  { title: "JLPT official", url: "https://www.jlpt.jp/e/" },
];
