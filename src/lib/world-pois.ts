export type Country = "japan" | "china" | "korea";

export type POI = {
  id: string;
  country: Country;
  city: string;
  name: string;
  kind: "university" | "landmark" | "district" | "culture";
  lng: number;
  lat: number;
  blurb: string;
  phrase: { native: string; romaji: string; meaning: string };
};

export const WORLD_POIS: POI[] = [
  // Japan
  { id: "utokyo", country: "japan", city: "Tokyo", name: "The University of Tokyo (Hongo)", kind: "university", lng: 139.7621, lat: 35.7128, blurb: "Japan's flagship national university. Hongo's red brick gate (Akamon) is iconic.", phrase: { native: "こんにちは", romaji: "konnichiwa", meaning: "Hello" } },
  { id: "kyoto-u", country: "japan", city: "Kyoto", name: "Kyoto University", kind: "university", lng: 135.7811, lat: 35.0263, blurb: "Renowned for free-thinking and Nobel laureates. Walk the philosophical path nearby.", phrase: { native: "ありがとう", romaji: "arigatō", meaning: "Thank you" } },
  { id: "waseda", country: "japan", city: "Tokyo", name: "Waseda University", kind: "university", lng: 139.7197, lat: 35.7089, blurb: "Private powerhouse with a strong international student community.", phrase: { native: "よろしく", romaji: "yoroshiku", meaning: "Nice to meet you" } },
  { id: "shibuya", country: "japan", city: "Tokyo", name: "Shibuya Crossing", kind: "district", lng: 139.7004, lat: 35.6595, blurb: "The world's busiest pedestrian scramble — neon, fashion, energy.", phrase: { native: "すみません", romaji: "sumimasen", meaning: "Excuse me" } },
  { id: "fushimi", country: "japan", city: "Kyoto", name: "Fushimi Inari", kind: "culture", lng: 135.7727, lat: 34.9671, blurb: "Thousands of vermillion torii gates climb the mountain.", phrase: { native: "きれい", romaji: "kirei", meaning: "Beautiful" } },

  // China
  { id: "tsinghua", country: "china", city: "Beijing", name: "Tsinghua University", kind: "university", lng: 116.3264, lat: 40.0031, blurb: "China's top engineering/science campus. Beautiful Qing-era gardens.", phrase: { native: "你好", romaji: "nǐ hǎo", meaning: "Hello" } },
  { id: "peking-u", country: "china", city: "Beijing", name: "Peking University", kind: "university", lng: 116.3105, lat: 39.9929, blurb: "Historic campus around Weiming Lake and Boya Pagoda.", phrase: { native: "谢谢", romaji: "xièxie", meaning: "Thank you" } },
  { id: "fudan", country: "china", city: "Shanghai", name: "Fudan University", kind: "university", lng: 121.5025, lat: 31.2974, blurb: "Leading Shanghai university — liberal arts and finance hub.", phrase: { native: "再见", romaji: "zàijiàn", meaning: "Goodbye" } },
  { id: "bund", country: "china", city: "Shanghai", name: "The Bund", kind: "landmark", lng: 121.4900, lat: 31.2397, blurb: "Colonial-era waterfront facing Pudong's futuristic skyline.", phrase: { native: "漂亮", romaji: "piàoliang", meaning: "Beautiful" } },
  { id: "forbidden", country: "china", city: "Beijing", name: "Forbidden City", kind: "culture", lng: 116.3972, lat: 39.9163, blurb: "500-year imperial palace — the heart of old Beijing.", phrase: { native: "对不起", romaji: "duìbuqǐ", meaning: "Sorry" } },

  // Korea
  { id: "snu", country: "korea", city: "Seoul", name: "Seoul National University", kind: "university", lng: 126.9522, lat: 37.4601, blurb: "Korea's most prestigious university, set against Gwanaksan mountain.", phrase: { native: "안녕하세요", romaji: "annyeonghaseyo", meaning: "Hello" } },
  { id: "kaist", country: "korea", city: "Daejeon", name: "KAIST", kind: "university", lng: 127.3625, lat: 36.3724, blurb: "Korea's MIT — leading in robotics, AI, and aerospace.", phrase: { native: "감사합니다", romaji: "gamsahamnida", meaning: "Thank you" } },
  { id: "yonsei", country: "korea", city: "Seoul", name: "Yonsei University", kind: "university", lng: 126.9387, lat: 37.5651, blurb: "Sinchon's historic campus — part of the famed SKY trio.", phrase: { native: "반갑습니다", romaji: "bangapseumnida", meaning: "Nice to meet you" } },
  { id: "gyeongbok", country: "korea", city: "Seoul", name: "Gyeongbokgung Palace", kind: "culture", lng: 126.9770, lat: 37.5796, blurb: "Joseon dynasty royal palace — watch the changing of the guard.", phrase: { native: "예쁘다", romaji: "yeppeuda", meaning: "Pretty" } },
  { id: "myeongdong", country: "korea", city: "Seoul", name: "Myeongdong", kind: "district", lng: 126.9850, lat: 37.5636, blurb: "Shopping, street food, and K-beauty heaven.", phrase: { native: "맛있어요", romaji: "masisseoyo", meaning: "It's delicious" } },
];

export const COUNTRY_VIEWS: Record<Country, { lng: number; lat: number; zoom: number; label: string }> = {
  japan: { lng: 139.6917, lat: 35.6895, zoom: 9, label: "Japan" },
  china: { lng: 116.4074, lat: 39.9042, zoom: 9, label: "China" },
  korea: { lng: 126.9780, lat: 37.5665, zoom: 9, label: "Korea" },
};
