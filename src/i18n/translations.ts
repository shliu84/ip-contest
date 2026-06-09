export type LanguageCode = 'zh' | 'ja' | 'en'

export type TranslationKey =
  | 'logoSub'
  | 'navHome'
  | 'navAbout'
  | 'navNews'
  | 'navTimeline'
  | 'navTracks'
  | 'navPrizes'
  | 'heroBadge'
  | 'heroTitle'
  | 'heroLead'
  | 'ctaEntry'
  | 'ctaAbout'
  | 'aboutKicker'
  | 'aboutTitle'
  | 'aboutText1'
  | 'aboutText2'
  | 'aboutText3'
  | 'newsTitle'
  | 'news1Title'
  | 'news1Text'
  | 'news2Title'
  | 'news2Text'
  | 'timelineTitle'
  | 'timeline1'
  | 'timeline2'
  | 'timeline3'
  | 'timeline4'
  | 'tracksTitle'
  | 'track1Title'
  | 'track1Text'
  | 'track2Title'
  | 'track2Text'
  | 'track3Title'
  | 'track3Text'
  | 'prizesTitle'
  | 'silverTitle'
  | 'silverText'
  | 'goldTitle'
  | 'goldText'
  | 'popularTitle'
  | 'popularText'
  | 'footer'

export type Translation = {
  lang: string
  title: string
} & Record<TranslationKey, string>

export const translations: Record<LanguageCode, Translation> = {
  zh: {
    lang: 'zh-CN',
    title: 'ASIA IP CONTEST in TOKYO 2026 | 亚洲IP设计大赛',
    logoSub: '亚洲IP设计大赛',
    navHome: '首页',
    navAbout: '大赛介绍',
    navNews: '通知',
    navTimeline: '赛事日程',
    navTracks: '征集赛道',
    navPrizes: '奖项设置',
    heroBadge: 'FOR ASIA CHARACTER CREATORS',
    heroTitle: 'ASIA IP CONTEST<br>in TOKYO 2026',
    heroLead: '支持以专业创作为目标的亚洲创作者勇敢挑战',
    ctaEntry: '立即投稿',
    ctaAbout: '了解大赛',
    aboutKicker: 'ASIA IP CONTEST 是什么？',
    aboutTitle: '支持以专业创作为目标的亚洲创作者勇敢挑战',
    aboutText1: 'ASIA IP CONTEST 是一项连接亚洲创作者与企业的竞赛及展会，旨在创造交流与合作的机会，支持以专业创作为目标的创作者们发起挑战。',
    aboutText2: '世界广阔，充满许多发现。每个人身上都隐藏着机会。你的力量，也许能够推动角色市场向前发展！',
    aboutText3: '请带着勇气，尝试挑战吧！',
    newsTitle: '通知',
    news1Title: 'ASIA IP CONTEST in TOKYO 2026 官方网站已公开。',
    news1Text: '大赛最新信息将在本网站陆续发布。',
    news2Title: '作品征集已经开始。',
    news2Text: '期待来自亚洲角色创作者的挑战。',
    timelineTitle: '赛事日程',
    timeline1: '全球作品征集期<br>(Entry Period)',
    timeline2: '大众人气票选<br>(Public Voting)',
    timeline3: '专业评委复审<br>(Jury Review)',
    timeline4: '颁奖典礼与公布<br>(Award Ceremony)',
    tracksTitle: '征集赛道',
    track1Title: '角色设计',
    track1Text: '角色原画、吉祥物设计、虚拟角色设定、三视图等，重视可持续发展的角色IP潜力。',
    track2Title: '商品与立体企划',
    track2Text: '潮玩、手办、周边商品、包装和展示方案等，可提交3D渲染图或多角度资料。',
    track3Title: '插画与世界观',
    track3Text: '基于原创角色IP的场景插画、绘本故事、漫画分镜和世界观设定。',
    prizesTitle: '奖项设置',
    silverTitle: '银奖 (Silver)',
    silverText: '2名 / 颁发证书与定制奖杯',
    goldTitle: '金奖 (Gold)',
    goldText: '1名 / 商业化孵化特权 + 奖杯',
    popularTitle: '人气奖 (Popular)',
    popularText: '3名 / 颁发证书与限定周边',
    footer: 'ASIA IP CONTEST in TOKYO 2026. All rights reserved.',
  },
  ja: {
    lang: 'ja',
    title: 'ASIA IP CONTEST in TOKYO 2026 | アジアIPコンテスト',
    logoSub: 'アジアIPコンテスト',
    navHome: 'ホーム',
    navAbout: 'コンテストとは',
    navNews: 'お知らせ',
    navTimeline: 'スケジュール',
    navTracks: '募集部門',
    navPrizes: '賞について',
    heroBadge: 'FOR ASIA CHARACTER CREATORS',
    heroTitle: 'ASIA IP CONTEST<br>in TOKYO 2026',
    heroLead: 'プロを目指すアジアのクリエイターたちの挑戦を応援する',
    ctaEntry: '今すぐ応募 (Entry)',
    ctaAbout: 'コンテストについて',
    aboutKicker: 'ASIA IP CONTEST とは？',
    aboutTitle: 'プロを目指すアジアのクリエイターたちの挑戦を応援する',
    aboutText1: 'ASIA IP CONTESTは、アジアクリエイターと企業をつなげる場を創造し、プロを目指すクリエイターたちの挑戦を応援するコンテスト＆展示会です。',
    aboutText2: '世界は広く、多くの発見があります。そしてどんな人にもチャンスが眠っています。あなたの力でキャラクター市場を前進させることができるかもしれません！',
    aboutText3: '勇気を持って挑戦してみましょう！',
    newsTitle: 'お知らせ',
    news1Title: 'ASIA IP CONTEST in TOKYO 2026 公式サイトを公開しました。',
    news1Text: 'コンテストの最新情報は本サイトで順次お知らせします。',
    news2Title: '作品募集を開始しました。',
    news2Text: 'アジアのキャラクタークリエイターからの挑戦をお待ちしています。',
    timelineTitle: 'スケジュール',
    timeline1: 'グローバル作品募集期間<br>(Entry Period)',
    timeline2: '一般人気投票<br>(Public Voting)',
    timeline3: '専門審査員による審査<br>(Jury Review)',
    timeline4: '授賞式・結果発表<br>(Award Ceremony)',
    tracksTitle: '募集部門',
    track1Title: 'キャラクターデザイン',
    track1Text: 'キャラクター原画、マスコットデザイン、バーチャルキャラクター設定、三面図など。継続的に展開できるキャラクターIPの可能性を重視します。',
    track2Title: '商品・立体企画',
    track2Text: 'デザイナーズトイ、フィギュア、グッズ、パッケージ、展示企画など。3Dレンダリングまたは多角度資料を提出できます。',
    track3Title: 'イラスト・世界観',
    track3Text: 'オリジナルキャラクターIPをもとにした背景イラスト、絵本、漫画ネーム、世界観設定など。',
    prizesTitle: '賞について',
    silverTitle: '銀賞 (Silver)',
    silverText: '2名 / 証書と特製トロフィーを授与',
    goldTitle: '金賞 (Gold)',
    goldText: '1名 / 商業化インキュベーション特典 + トロフィー',
    popularTitle: '人気賞 (Popular)',
    popularText: '3名 / 証書と限定グッズを授与',
    footer: 'ASIA IP CONTEST in TOKYO 2026. All rights reserved.',
  },
  en: {
    lang: 'en',
    title: 'ASIA IP CONTEST in TOKYO 2026',
    logoSub: 'ASIA IP CONTEST',
    navHome: 'Home',
    navAbout: 'About',
    navNews: 'News',
    navTimeline: 'Timeline',
    navTracks: 'Categories',
    navPrizes: 'Prizes',
    heroBadge: 'FOR ASIA CHARACTER CREATORS',
    heroTitle: 'ASIA IP CONTEST<br>in TOKYO 2026',
    heroLead: 'Supporting Asian creators who are challenging themselves to become professionals',
    ctaEntry: 'Submit Now (Entry)',
    ctaAbout: 'About the Contest',
    aboutKicker: 'What is ASIA IP CONTEST?',
    aboutTitle: 'Supporting Asian creators who are challenging themselves to become professionals',
    aboutText1: 'ASIA IP CONTEST is a contest and exhibition that creates opportunities to connect Asian creators with companies, supporting creators who are challenging themselves to become professionals.',
    aboutText2: 'The world is wide and full of discoveries. Opportunities are waiting inside everyone. Your talent may help move the character market forward!',
    aboutText3: 'Take courage and give it a try!',
    newsTitle: 'News',
    news1Title: 'The official ASIA IP CONTEST in TOKYO 2026 website is now open.',
    news1Text: 'Latest contest updates will be announced on this website.',
    news2Title: 'Submissions are now open.',
    news2Text: 'We look forward to seeing challenges from character creators across Asia.',
    timelineTitle: 'Timeline',
    timeline1: 'Global Entry Period<br>(Entry Period)',
    timeline2: 'Public Voting<br>(Public Voting)',
    timeline3: 'Jury Review<br>(Jury Review)',
    timeline4: 'Award Ceremony & Results<br>(Award Ceremony)',
    tracksTitle: 'Categories',
    track1Title: 'Character Design',
    track1Text: 'Character concept art, mascot design, virtual character settings, three-view sheets, and other works with long-term IP potential.',
    track2Title: 'Products & 3D Planning',
    track2Text: 'Designer toys, figures, merchandise, packaging, and exhibition concepts. 3D renders or multi-angle materials may be submitted.',
    track3Title: 'Illustration & Worldbuilding',
    track3Text: 'Scene illustrations, picture books, comic storyboards, and worldbuilding based on original character IP concepts.',
    prizesTitle: 'Prizes',
    silverTitle: 'Silver Award',
    silverText: '2 winners / Certificate and custom trophy',
    goldTitle: 'Gold Award',
    goldText: '1 winner / Commercial incubation privileges + trophy',
    popularTitle: 'Popular Award',
    popularText: '3 winners / Certificate and limited merchandise',
    footer: 'ASIA IP CONTEST in TOKYO 2026. All rights reserved.',
  },
}
