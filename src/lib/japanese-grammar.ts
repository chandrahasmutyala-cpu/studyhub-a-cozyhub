export type GrammarPoint = {
  pattern: string;
  meaning: string;
  structure: string;
  example: string;
  exRomaji: string;
  exMeaning: string;
};

export const GRAMMAR: Record<"N5" | "N4" | "N3" | "N2" | "N1", GrammarPoint[]> = {
  N5: [
    { pattern: "～です", meaning: "to be (polite)", structure: "Noun + です", example: "私は学生です。", exRomaji: "Watashi wa gakusei desu.", exMeaning: "I am a student." },
    { pattern: "～ます", meaning: "polite verb ending", structure: "Verb stem + ます", example: "毎日勉強します。", exRomaji: "Mainichi benkyou shimasu.", exMeaning: "I study every day." },
    { pattern: "～ません", meaning: "negative polite", structure: "Verb stem + ません", example: "肉を食べません。", exRomaji: "Niku wo tabemasen.", exMeaning: "I don't eat meat." },
    { pattern: "～は～です", meaning: "topic marker", structure: "A は B です", example: "これは本です。", exRomaji: "Kore wa hon desu.", exMeaning: "This is a book." },
    { pattern: "～を", meaning: "object particle", structure: "Noun を Verb", example: "水を飲みます。", exRomaji: "Mizu wo nomimasu.", exMeaning: "I drink water." },
    { pattern: "～に行く", meaning: "to go to", structure: "Place に 行く", example: "学校に行く。", exRomaji: "Gakkou ni iku.", exMeaning: "I go to school." },
    { pattern: "～たい", meaning: "want to do", structure: "Verb stem + たい", example: "寿司を食べたい。", exRomaji: "Sushi wo tabetai.", exMeaning: "I want to eat sushi." },
    { pattern: "～から", meaning: "because", structure: "Reason + から", example: "寒いから家にいる。", exRomaji: "Samui kara ie ni iru.", exMeaning: "I stay home because it's cold." },
    { pattern: "～ましょう", meaning: "let's do", structure: "Verb stem + ましょう", example: "行きましょう。", exRomaji: "Ikimashou.", exMeaning: "Let's go." },
    { pattern: "～が好き", meaning: "to like", structure: "Noun + が好き", example: "音楽が好きです。", exRomaji: "Ongaku ga suki desu.", exMeaning: "I like music." },
    { pattern: "～てください", meaning: "please do", structure: "Verb-te + ください", example: "見てください。", exRomaji: "Mite kudasai.", exMeaning: "Please look." },
    { pattern: "～でした", meaning: "was (past polite)", structure: "Noun + でした", example: "昨日休みでした。", exRomaji: "Kinou yasumi deshita.", exMeaning: "Yesterday was a day off." },
  ],
  N4: [
    { pattern: "～ている", meaning: "ongoing / state", structure: "Verb-te + いる", example: "本を読んでいる。", exRomaji: "Hon wo yonde iru.", exMeaning: "I am reading a book." },
    { pattern: "～たことがある", meaning: "have done before", structure: "Verb-ta + ことがある", example: "日本に行ったことがある。", exRomaji: "Nihon ni itta koto ga aru.", exMeaning: "I've been to Japan before." },
    { pattern: "～ながら", meaning: "while doing", structure: "Verb stem + ながら", example: "音楽を聞きながら勉強する。", exRomaji: "Ongaku wo kikinagara benkyou suru.", exMeaning: "I study while listening to music." },
    { pattern: "～かもしれない", meaning: "might / maybe", structure: "Plain form + かもしれない", example: "雨が降るかもしれない。", exRomaji: "Ame ga furu kamoshirenai.", exMeaning: "It might rain." },
    { pattern: "～と思う", meaning: "I think that", structure: "Plain form + と思う", example: "彼は来ると思う。", exRomaji: "Kare wa kuru to omou.", exMeaning: "I think he will come." },
    { pattern: "～なければならない", meaning: "must do", structure: "Verb-nai + ければならない", example: "勉強しなければならない。", exRomaji: "Benkyou shinakereba naranai.", exMeaning: "I must study." },
    { pattern: "～てもいい", meaning: "may / it's ok to", structure: "Verb-te + もいい", example: "入ってもいいですか。", exRomaji: "Haitte mo ii desu ka.", exMeaning: "May I come in?" },
    { pattern: "～てはいけない", meaning: "must not", structure: "Verb-te + はいけない", example: "ここで写真を撮ってはいけない。", exRomaji: "Koko de shashin wo totte wa ikenai.", exMeaning: "You must not take photos here." },
    { pattern: "～あげる/くれる/もらう", meaning: "give / receive", structure: "verbs of giving", example: "プレゼントをくれた。", exRomaji: "Purezento wo kureta.", exMeaning: "(They) gave me a present." },
    { pattern: "～そうだ (hearsay)", meaning: "I heard that", structure: "Plain + そうだ", example: "雨が降るそうだ。", exRomaji: "Ame ga furu sou da.", exMeaning: "I heard it'll rain." },
  ],
  N3: [
    { pattern: "～ようになる", meaning: "come to / become able to", structure: "Verb dict + ようになる", example: "漢字が読めるようになった。", exRomaji: "Kanji ga yomeru you ni natta.", exMeaning: "I became able to read kanji." },
    { pattern: "～ことにする", meaning: "decide to", structure: "Verb dict + ことにする", example: "毎日走ることにした。", exRomaji: "Mainichi hashiru koto ni shita.", exMeaning: "I decided to run every day." },
    { pattern: "～はず", meaning: "should / supposed to", structure: "Plain + はず", example: "彼は来るはずだ。", exRomaji: "Kare wa kuru hazu da.", exMeaning: "He should come." },
    { pattern: "～らしい", meaning: "seems / it seems that", structure: "Plain + らしい", example: "雨らしい。", exRomaji: "Ame rashii.", exMeaning: "It seems to be raining." },
    { pattern: "～ば～ほど", meaning: "the more, the more", structure: "Verb-ba + Verb-dict + ほど", example: "練習すればするほど上手になる。", exRomaji: "Renshuu sureba suru hodo jouzu ni naru.", exMeaning: "The more you practice, the better you get." },
    { pattern: "～によって", meaning: "depending on / by means of", structure: "Noun + によって", example: "人によって意見が違う。", exRomaji: "Hito ni yotte iken ga chigau.", exMeaning: "Opinions differ depending on the person." },
    { pattern: "～わけだ", meaning: "no wonder / it follows that", structure: "Plain + わけだ", example: "寒いわけだ、雪が降っている。", exRomaji: "Samui wake da, yuki ga futte iru.", exMeaning: "No wonder it's cold — it's snowing." },
    { pattern: "～ながらも", meaning: "although / despite", structure: "Verb stem + ながらも", example: "知っていながらも黙っていた。", exRomaji: "Shitte i nagara mo damatte ita.", exMeaning: "Although I knew, I stayed silent." },
    { pattern: "～がる", meaning: "shows feeling (3rd person)", structure: "い-adj stem + がる", example: "犬を怖がる。", exRomaji: "Inu wo kowagaru.", exMeaning: "He is afraid of dogs." },
    { pattern: "～ば良かった", meaning: "I wish I had", structure: "Verb-ba + 良かった", example: "もっと勉強すれば良かった。", exRomaji: "Motto benkyou sureba yokatta.", exMeaning: "I wish I had studied more." },
  ],
  N2: [
    { pattern: "～にもかかわらず", meaning: "despite / in spite of", structure: "Noun/Plain + にもかかわらず", example: "努力にもかかわらず失敗した。", exRomaji: "Doryoku ni mo kakawarazu shippai shita.", exMeaning: "Despite the effort, I failed." },
    { pattern: "～ものの", meaning: "although", structure: "Plain + ものの", example: "言ったものの、自信がない。", exRomaji: "Itta mono no, jishin ga nai.", exMeaning: "I said so, but I'm not confident." },
    { pattern: "～どころか", meaning: "far from / let alone", structure: "Noun/Plain + どころか", example: "漢字どころかひらがなも読めない。", exRomaji: "Kanji dokoro ka hiragana mo yomenai.", exMeaning: "Let alone kanji, I can't even read hiragana." },
    { pattern: "～次第", meaning: "as soon as / depending on", structure: "Verb stem + 次第", example: "到着次第連絡します。", exRomaji: "Touchaku shidai renraku shimasu.", exMeaning: "I'll contact you as soon as I arrive." },
    { pattern: "～ざるを得ない", meaning: "have no choice but to", structure: "Verb-nai + ざるを得ない", example: "認めざるを得ない。", exRomaji: "Mitomezaru wo enai.", exMeaning: "I have no choice but to admit it." },
    { pattern: "～にすぎない", meaning: "nothing more than", structure: "Noun + にすぎない", example: "言い訳にすぎない。", exRomaji: "Iiwake ni suginai.", exMeaning: "It's nothing more than an excuse." },
    { pattern: "～ばかりか", meaning: "not only ... but also", structure: "Plain + ばかりか", example: "雨ばかりか風も強い。", exRomaji: "Ame bakari ka kaze mo tsuyoi.", exMeaning: "Not only rain but also strong wind." },
    { pattern: "～たとたん", meaning: "the moment / as soon as", structure: "Verb-ta + とたん", example: "ドアを開けたとたん猫が逃げた。", exRomaji: "Doa wo aketa totan neko ga nigeta.", exMeaning: "The moment I opened the door, the cat ran away." },
  ],
  N1: [
    { pattern: "～をもって", meaning: "with / as of", structure: "Noun + をもって", example: "本日をもって閉店します。", exRomaji: "Honjitsu wo motte heiten shimasu.", exMeaning: "We close as of today." },
    { pattern: "～や否や", meaning: "as soon as", structure: "Verb dict + や否や", example: "ベルが鳴るや否や走り出した。", exRomaji: "Beru ga naru ya inaya hashiridashita.", exMeaning: "The moment the bell rang, I ran." },
    { pattern: "～べからず", meaning: "must not (classical)", structure: "Verb dict + べからず", example: "立ち入るべからず。", exRomaji: "Tachiiru bekarazu.", exMeaning: "Do not enter." },
    { pattern: "～にかたくない", meaning: "not difficult to", structure: "Noun + にかたくない", example: "想像にかたくない。", exRomaji: "Souzou ni kataku nai.", exMeaning: "Not hard to imagine." },
    { pattern: "～が早いか", meaning: "no sooner than", structure: "Verb dict + が早いか", example: "見るが早いか駆け寄った。", exRomaji: "Miru ga hayai ka kakeyotta.", exMeaning: "No sooner had I seen it than I ran over." },
    { pattern: "～ともなると", meaning: "when it comes to", structure: "Noun + ともなると", example: "社長ともなると忙しい。", exRomaji: "Shachou to mo naru to isogashii.", exMeaning: "When it comes to being CEO, you're busy." },
    { pattern: "～あっての", meaning: "thanks to / only because of", structure: "Noun + あっての + Noun", example: "お客様あっての商売です。", exRomaji: "Okyakusama atte no shoubai desu.", exMeaning: "Business exists only thanks to customers." },
    { pattern: "～ないではいられない", meaning: "can't help but", structure: "Verb-nai + ではいられない", example: "笑わないではいられない。", exRomaji: "Warawanai de wa irarenai.", exMeaning: "I can't help but laugh." },
  ],
};
