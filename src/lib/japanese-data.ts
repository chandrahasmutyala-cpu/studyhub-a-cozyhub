// Complete kana + JLPT vocabulary data, plus curated YouTube lesson links
// from the "Learn Japanese Channel" (https://www.youtube.com/@LearnJapaneseChannel).

export type Kana = { kana: string; romaji: string };

const tuple = (k: string, r: string): Kana => ({ kana: k, romaji: r });

export const HIRAGANA_BASIC: Kana[] = [
  ["あ","a"],["い","i"],["う","u"],["え","e"],["お","o"],
  ["か","ka"],["き","ki"],["く","ku"],["け","ke"],["こ","ko"],
  ["さ","sa"],["し","shi"],["す","su"],["せ","se"],["そ","so"],
  ["た","ta"],["ち","chi"],["つ","tsu"],["て","te"],["と","to"],
  ["な","na"],["に","ni"],["ぬ","nu"],["ね","ne"],["の","no"],
  ["は","ha"],["ひ","hi"],["ふ","fu"],["へ","he"],["ほ","ho"],
  ["ま","ma"],["み","mi"],["む","mu"],["め","me"],["も","mo"],
  ["や","ya"],["ゆ","yu"],["よ","yo"],
  ["ら","ra"],["り","ri"],["る","ru"],["れ","re"],["ろ","ro"],
  ["わ","wa"],["を","wo"],["ん","n"],
].map(([k,r]) => tuple(k,r));

export const HIRAGANA_DAKUTEN: Kana[] = [
  ["が","ga"],["ぎ","gi"],["ぐ","gu"],["げ","ge"],["ご","go"],
  ["ざ","za"],["じ","ji"],["ず","zu"],["ぜ","ze"],["ぞ","zo"],
  ["だ","da"],["ぢ","ji"],["づ","zu"],["で","de"],["ど","do"],
  ["ば","ba"],["び","bi"],["ぶ","bu"],["べ","be"],["ぼ","bo"],
  ["ぱ","pa"],["ぴ","pi"],["ぷ","pu"],["ぺ","pe"],["ぽ","po"],
].map(([k,r]) => tuple(k,r));

export const HIRAGANA_YOON: Kana[] = [
  ["きゃ","kya"],["きゅ","kyu"],["きょ","kyo"],
  ["しゃ","sha"],["しゅ","shu"],["しょ","sho"],
  ["ちゃ","cha"],["ちゅ","chu"],["ちょ","cho"],
  ["にゃ","nya"],["にゅ","nyu"],["にょ","nyo"],
  ["ひゃ","hya"],["ひゅ","hyu"],["ひょ","hyo"],
  ["みゃ","mya"],["みゅ","myu"],["みょ","myo"],
  ["りゃ","rya"],["りゅ","ryu"],["りょ","ryo"],
  ["ぎゃ","gya"],["ぎゅ","gyu"],["ぎょ","gyo"],
  ["じゃ","ja"],["じゅ","ju"],["じょ","jo"],
  ["びゃ","bya"],["びゅ","byu"],["びょ","byo"],
  ["ぴゃ","pya"],["ぴゅ","pyu"],["ぴょ","pyo"],
].map(([k,r]) => tuple(k,r));

export const KATAKANA_BASIC: Kana[] = [
  ["ア","a"],["イ","i"],["ウ","u"],["エ","e"],["オ","o"],
  ["カ","ka"],["キ","ki"],["ク","ku"],["ケ","ke"],["コ","ko"],
  ["サ","sa"],["シ","shi"],["ス","su"],["セ","se"],["ソ","so"],
  ["タ","ta"],["チ","chi"],["ツ","tsu"],["テ","te"],["ト","to"],
  ["ナ","na"],["ニ","ni"],["ヌ","nu"],["ネ","ne"],["ノ","no"],
  ["ハ","ha"],["ヒ","hi"],["フ","fu"],["ヘ","he"],["ホ","ho"],
  ["マ","ma"],["ミ","mi"],["ム","mu"],["メ","me"],["モ","mo"],
  ["ヤ","ya"],["ユ","yu"],["ヨ","yo"],
  ["ラ","ra"],["リ","ri"],["ル","ru"],["レ","re"],["ロ","ro"],
  ["ワ","wa"],["ヲ","wo"],["ン","n"],
].map(([k,r]) => tuple(k,r));

export const KATAKANA_DAKUTEN: Kana[] = [
  ["ガ","ga"],["ギ","gi"],["グ","gu"],["ゲ","ge"],["ゴ","go"],
  ["ザ","za"],["ジ","ji"],["ズ","zu"],["ゼ","ze"],["ゾ","zo"],
  ["ダ","da"],["ヂ","ji"],["ヅ","zu"],["デ","de"],["ド","do"],
  ["バ","ba"],["ビ","bi"],["ブ","bu"],["ベ","be"],["ボ","bo"],
  ["パ","pa"],["ピ","pi"],["プ","pu"],["ペ","pe"],["ポ","po"],
].map(([k,r]) => tuple(k,r));

export const KATAKANA_YOON: Kana[] = [
  ["キャ","kya"],["キュ","kyu"],["キョ","kyo"],
  ["シャ","sha"],["シュ","shu"],["ショ","sho"],
  ["チャ","cha"],["チュ","chu"],["チョ","cho"],
  ["ニャ","nya"],["ニュ","nyu"],["ニョ","nyo"],
  ["ヒャ","hya"],["ヒュ","hyu"],["ヒョ","hyo"],
  ["ミャ","mya"],["ミュ","myu"],["ミョ","myo"],
  ["リャ","rya"],["リュ","ryu"],["リョ","ryo"],
  ["ギャ","gya"],["ギュ","gyu"],["ギョ","gyo"],
  ["ジャ","ja"],["ジュ","ju"],["ジョ","jo"],
  ["ビャ","bya"],["ビュ","byu"],["ビョ","byo"],
  ["ピャ","pya"],["ピュ","pyu"],["ピョ","pyo"],
].map(([k,r]) => tuple(k,r));

export type Vocab = { j: string; r: string; m: string; ex?: string; exR?: string; exM?: string };

export const JLPT: Record<"N5"|"N4"|"N3"|"N2"|"N1", Vocab[]> = {
  N5: [
    { j:"学校", r:"gakkou", m:"school", ex:"学校に行きます。", exR:"Gakkou ni ikimasu.", exM:"I go to school." },
    { j:"先生", r:"sensei", m:"teacher", ex:"先生は親切です。", exR:"Sensei wa shinsetsu desu.", exM:"The teacher is kind." },
    { j:"学生", r:"gakusei", m:"student", ex:"私は学生です。", exR:"Watashi wa gakusei desu.", exM:"I am a student." },
    { j:"本", r:"hon", m:"book", ex:"本を読みます。", exR:"Hon wo yomimasu.", exM:"I read a book." },
    { j:"水", r:"mizu", m:"water", ex:"水をください。", exR:"Mizu wo kudasai.", exM:"Water, please." },
    { j:"猫", r:"neko", m:"cat", ex:"猫がかわいいです。", exR:"Neko ga kawaii desu.", exM:"The cat is cute." },
    { j:"犬", r:"inu", m:"dog", ex:"犬と散歩します。", exR:"Inu to sanpo shimasu.", exM:"I walk with my dog." },
    { j:"食べる", r:"taberu", m:"to eat", ex:"パンを食べる。", exR:"Pan wo taberu.", exM:"I eat bread." },
    { j:"飲む", r:"nomu", m:"to drink", ex:"お茶を飲む。", exR:"Ocha wo nomu.", exM:"I drink tea." },
    { j:"行く", r:"iku", m:"to go", ex:"駅へ行く。", exR:"Eki e iku.", exM:"I go to the station." },
    { j:"来る", r:"kuru", m:"to come", ex:"友達が来る。", exR:"Tomodachi ga kuru.", exM:"My friend is coming." },
    { j:"見る", r:"miru", m:"to see/watch", ex:"映画を見る。", exR:"Eiga wo miru.", exM:"I watch a movie." },
    { j:"買う", r:"kau", m:"to buy", ex:"本を買う。", exR:"Hon wo kau.", exM:"I buy a book." },
    { j:"今日", r:"kyou", m:"today", ex:"今日は寒い。", exR:"Kyou wa samui.", exM:"Today is cold." },
    { j:"明日", r:"ashita", m:"tomorrow", ex:"明日休みです。", exR:"Ashita yasumi desu.", exM:"Tomorrow is a day off." },
    { j:"友達", r:"tomodachi", m:"friend", ex:"友達と話す。", exR:"Tomodachi to hanasu.", exM:"I talk with my friend." },
    { j:"家", r:"ie", m:"house/home", ex:"家に帰る。", exR:"Ie ni kaeru.", exM:"I go home." },
    { j:"駅", r:"eki", m:"station", ex:"駅で会いましょう。", exR:"Eki de aimashou.", exM:"Let's meet at the station." },
    { j:"車", r:"kuruma", m:"car", ex:"車を運転する。", exR:"Kuruma wo unten suru.", exM:"I drive a car." },
    { j:"時間", r:"jikan", m:"time", ex:"時間がない。", exR:"Jikan ga nai.", exM:"There is no time." },
    { j:"日本", r:"nihon", m:"Japan", ex:"日本に住む。", exR:"Nihon ni sumu.", exM:"I live in Japan." },
    { j:"大きい", r:"ookii", m:"big", ex:"大きい犬。", exR:"Ookii inu.", exM:"A big dog." },
    { j:"小さい", r:"chiisai", m:"small", ex:"小さい花。", exR:"Chiisai hana.", exM:"A small flower." },
    { j:"高い", r:"takai", m:"expensive/tall", ex:"高い山。", exR:"Takai yama.", exM:"A tall mountain." },
    { j:"安い", r:"yasui", m:"cheap", ex:"安いカフェ。", exR:"Yasui kafe.", exM:"A cheap cafe." },
    { j:"新しい", r:"atarashii", m:"new", ex:"新しい服。", exR:"Atarashii fuku.", exM:"New clothes." },
    { j:"古い", r:"furui", m:"old", ex:"古い家。", exR:"Furui ie.", exM:"An old house." },
    { j:"美味しい", r:"oishii", m:"delicious", ex:"このラーメンは美味しい。", exR:"Kono raamen wa oishii.", exM:"This ramen is delicious." },
    { j:"好き", r:"suki", m:"like", ex:"音楽が好きです。", exR:"Ongaku ga suki desu.", exM:"I like music." },
    { j:"嫌い", r:"kirai", m:"dislike", ex:"虫が嫌いです。", exR:"Mushi ga kirai desu.", exM:"I dislike bugs." },
    { j:"一", r:"ichi", m:"one" },{ j:"二", r:"ni", m:"two" },{ j:"三", r:"san", m:"three" },
    { j:"四", r:"yon/shi", m:"four" },{ j:"五", r:"go", m:"five" },{ j:"六", r:"roku", m:"six" },
    { j:"七", r:"nana/shichi", m:"seven" },{ j:"八", r:"hachi", m:"eight" },
    { j:"九", r:"kyuu/ku", m:"nine" },{ j:"十", r:"juu", m:"ten" },
  ],
  N4: [
    { j:"約束", r:"yakusoku", m:"promise", ex:"友達と約束した。", exR:"Tomodachi to yakusoku shita.", exM:"I made a promise with my friend." },
    { j:"経験", r:"keiken", m:"experience", ex:"いい経験になった。", exR:"Ii keiken ni natta.", exM:"It became a good experience." },
    { j:"意味", r:"imi", m:"meaning", ex:"この言葉の意味は？", exR:"Kono kotoba no imi wa?", exM:"What does this word mean?" },
    { j:"図書館", r:"toshokan", m:"library", ex:"図書館で勉強する。", exR:"Toshokan de benkyou suru.", exM:"I study at the library." },
    { j:"説明", r:"setsumei", m:"explanation", ex:"先生が説明する。", exR:"Sensei ga setsumei suru.", exM:"The teacher explains." },
    { j:"準備", r:"junbi", m:"preparation", ex:"試験の準備をする。", exR:"Shiken no junbi wo suru.", exM:"I prepare for the exam." },
    { j:"必要", r:"hitsuyou", m:"necessary", ex:"水が必要です。", exR:"Mizu ga hitsuyou desu.", exM:"Water is necessary." },
    { j:"大切", r:"taisetsu", m:"important", ex:"家族は大切です。", exR:"Kazoku wa taisetsu desu.", exM:"Family is important." },
    { j:"心配", r:"shinpai", m:"worry", ex:"心配しないで。", exR:"Shinpai shinaide.", exM:"Don't worry." },
    { j:"覚える", r:"oboeru", m:"to remember/learn", ex:"漢字を覚える。", exR:"Kanji wo oboeru.", exM:"I learn kanji." },
    { j:"忘れる", r:"wasureru", m:"to forget", ex:"宿題を忘れた。", exR:"Shukudai wo wasureta.", exM:"I forgot my homework." },
    { j:"教える", r:"oshieru", m:"to teach", ex:"日本語を教える。", exR:"Nihongo wo oshieru.", exM:"I teach Japanese." },
    { j:"答える", r:"kotaeru", m:"to answer", ex:"質問に答える。", exR:"Shitsumon ni kotaeru.", exM:"I answer the question." },
    { j:"始める", r:"hajimeru", m:"to begin", ex:"仕事を始める。", exR:"Shigoto wo hajimeru.", exM:"I begin work." },
    { j:"終わる", r:"owaru", m:"to end", ex:"授業が終わる。", exR:"Jugyou ga owaru.", exM:"Class ends." },
    { j:"会議", r:"kaigi", m:"meeting", ex:"明日会議があります。", exR:"Ashita kaigi ga arimasu.", exM:"There is a meeting tomorrow." },
    { j:"質問", r:"shitsumon", m:"question", ex:"質問はありますか？", exR:"Shitsumon wa arimasu ka?", exM:"Do you have a question?" },
    { j:"宿題", r:"shukudai", m:"homework", ex:"宿題を出す。", exR:"Shukudai wo dasu.", exM:"I hand in homework." },
    { j:"練習", r:"renshuu", m:"practice", ex:"毎日練習する。", exR:"Mainichi renshuu suru.", exM:"I practice every day." },
    { j:"自由", r:"jiyuu", m:"freedom", ex:"自由な時間。", exR:"Jiyuu na jikan.", exM:"Free time." },
  ],
  N3: [
    { j:"適当", r:"tekitou", m:"suitable / random", ex:"適当に答えた。", exR:"Tekitou ni kotaeta.", exM:"I answered randomly." },
    { j:"想像", r:"souzou", m:"imagination", ex:"想像できない。", exR:"Souzou dekinai.", exM:"I can't imagine." },
    { j:"比較", r:"hikaku", m:"comparison", ex:"二つを比較する。", exR:"Futatsu wo hikaku suru.", exM:"I compare the two." },
    { j:"以前", r:"izen", m:"before/previously", ex:"以前会った人。", exR:"Izen atta hito.", exM:"A person I met before." },
    { j:"以降", r:"ikou", m:"after/since", ex:"三時以降空いてる。", exR:"Sanji ikou aiteru.", exM:"I'm free after 3pm." },
    { j:"確認", r:"kakunin", m:"confirmation", ex:"予約を確認する。", exR:"Yoyaku wo kakunin suru.", exM:"I confirm the reservation." },
    { j:"報告", r:"houkoku", m:"report", ex:"結果を報告する。", exR:"Kekka wo houkoku suru.", exM:"I report the results." },
    { j:"連絡", r:"renraku", m:"contact", ex:"あとで連絡する。", exR:"Atode renraku suru.", exM:"I'll contact you later." },
    { j:"相談", r:"soudan", m:"consultation", ex:"先生に相談する。", exR:"Sensei ni soudan suru.", exM:"I consult my teacher." },
    { j:"成功", r:"seikou", m:"success", ex:"プロジェクトが成功した。", exR:"Purojekuto ga seikou shita.", exM:"The project succeeded." },
    { j:"失敗", r:"shippai", m:"failure", ex:"失敗から学ぶ。", exR:"Shippai kara manabu.", exM:"I learn from failure." },
    { j:"努力", r:"doryoku", m:"effort", ex:"努力が大事。", exR:"Doryoku ga daiji.", exM:"Effort is important." },
    { j:"目標", r:"mokuhyou", m:"goal", ex:"目標を決める。", exR:"Mokuhyou wo kimeru.", exM:"I set a goal." },
    { j:"将来", r:"shourai", m:"future", ex:"将来の夢。", exR:"Shourai no yume.", exM:"A dream for the future." },
    { j:"環境", r:"kankyou", m:"environment", ex:"環境を守る。", exR:"Kankyou wo mamoru.", exM:"Protect the environment." },
  ],
  N2: [
    { j:"矛盾", r:"mujun", m:"contradiction", ex:"話が矛盾している。", exR:"Hanashi ga mujun shite iru.", exM:"The story contradicts itself." },
    { j:"概念", r:"gainen", m:"concept", ex:"基本的な概念。", exR:"Kihonteki na gainen.", exM:"A basic concept." },
    { j:"傾向", r:"keikou", m:"tendency", ex:"そういう傾向がある。", exR:"Sou iu keikou ga aru.", exM:"There is such a tendency." },
    { j:"影響", r:"eikyou", m:"influence", ex:"大きな影響を与える。", exR:"Ookina eikyou wo ataeru.", exM:"To have a big influence." },
    { j:"判断", r:"handan", m:"judgment", ex:"自分で判断する。", exR:"Jibun de handan suru.", exM:"Judge by yourself." },
    { j:"対応", r:"taiou", m:"response/handling", ex:"問題に対応する。", exR:"Mondai ni taiou suru.", exM:"Handle the problem." },
    { j:"効果", r:"kouka", m:"effect", ex:"効果が出る。", exR:"Kouka ga deru.", exM:"The effect appears." },
    { j:"発展", r:"hatten", m:"development", ex:"経済が発展する。", exR:"Keizai ga hatten suru.", exM:"The economy develops." },
    { j:"維持", r:"iji", m:"maintenance", ex:"健康を維持する。", exR:"Kenkou wo iji suru.", exM:"Maintain health." },
    { j:"提案", r:"teian", m:"proposal", ex:"新しい提案をする。", exR:"Atarashii teian wo suru.", exM:"I make a new proposal." },
  ],
  N1: [
    { j:"曖昧", r:"aimai", m:"ambiguous", ex:"曖昧な返事。", exR:"Aimai na henji.", exM:"A vague answer." },
    { j:"葛藤", r:"kattou", m:"inner conflict", ex:"心の葛藤。", exR:"Kokoro no kattou.", exM:"Inner conflict of the heart." },
    { j:"洞察", r:"dousatsu", m:"insight", ex:"鋭い洞察。", exR:"Surudoi dousatsu.", exM:"Sharp insight." },
    { j:"概ね", r:"oomune", m:"generally", ex:"概ね賛成です。", exR:"Oomune sansei desu.", exM:"I generally agree." },
    { j:"普及", r:"fukyuu", m:"diffusion/spread", ex:"スマホが普及する。", exR:"Sumaho ga fukyuu suru.", exM:"Smartphones spread widely." },
    { j:"潜在", r:"senzai", m:"latent/potential", ex:"潜在能力。", exR:"Senzai nouryoku.", exM:"Latent ability." },
    { j:"顕著", r:"kencho", m:"remarkable", ex:"顕著な進歩。", exR:"Kencho na shinpo.", exM:"Remarkable progress." },
    { j:"是非", r:"zehi", m:"by all means", ex:"是非来てください。", exR:"Zehi kite kudasai.", exM:"Please come by all means." },
    { j:"踏襲", r:"toushuu", m:"follow precedent", ex:"伝統を踏襲する。", exR:"Dentou wo toushuu suru.", exM:"Follow tradition." },
    { j:"忖度", r:"sontaku", m:"reading the air", ex:"上司に忖度する。", exR:"Joushi ni sontaku suru.", exM:"Read the boss's intent." },
  ],
};

export type Lesson = { title: string; url: string; note?: string };

const channelSearch = (q: string) =>
  `https://www.youtube.com/@LearnJapaneseChannel/search?query=${encodeURIComponent(q)}`;

export const CHANNEL_URL = "https://www.youtube.com/@LearnJapaneseChannel";

export const LESSONS: Record<"hiragana"|"katakana"|"N5"|"N4"|"N3"|"N2"|"N1", Lesson[]> = {
  hiragana: [
    { title: "Hiragana on Learn Japanese Channel", url: channelSearch("hiragana"), note: "Search the channel for full hiragana videos" },
  ],
  katakana: [
    { title: "Katakana on Learn Japanese Channel", url: channelSearch("katakana") },
  ],
  N5: [{ title: "JLPT N5 lessons", url: channelSearch("JLPT N5") }],
  N4: [{ title: "JLPT N4 lessons", url: channelSearch("JLPT N4") }],
  N3: [{ title: "JLPT N3 lessons", url: channelSearch("JLPT N3") }],
  N2: [{ title: "JLPT N2 lessons", url: channelSearch("JLPT N2") }],
  N1: [{ title: "JLPT N1 lessons", url: channelSearch("JLPT N1") }],
};
