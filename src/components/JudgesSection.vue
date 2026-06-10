<template>
  <section id="judges" class="section-padding container">
    <div class="sec-title">
      <span>Judge Board</span>
      <h2>{{ t('judgesTitle') }}</h2>
    </div>
    <div class="judges-grid">
      <article
        v-for="judge in judges"
        :key="judge.name"
        class="glass-card judge-card"
      >
        <div class="judge-avatar" aria-hidden="true">{{ judge.name.slice(0, 1) }}</div>
        <div class="judge-content">
          <h3>{{ judge.name }}</h3>
          <p v-if="judge.reading" class="judge-reading">{{ judge.reading }}</p>
          <p class="judge-role">{{ judge.role }}</p>
          <p
            v-for="bio in judge.bio"
            :key="bio"
            class="judge-bio"
          >
            {{ bio }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LanguageCode, TranslationKey } from '../i18n/translations'

const props = defineProps<{
  currentLanguage: LanguageCode
  t: (key: TranslationKey) => string
}>()

type Judge = {
  name: string
  reading?: string
  role: string
  bio: string[]
}

const judgesByLanguage: Record<LanguageCode, Judge[]> = {
  zh: [
    {
      name: '关口 贡',
      role: '一般社团法人 日中动漫游戏产业联合会 理事长',
      bio: ['在三丽鸥从事授权设计管理 30 年以上'],
    },
    {
      name: '远藤 贵司',
      role: '一般社团法人 日中动漫游戏产业联合会 理事',
      bio: ['从十几岁起参与动画、游戏角色商品，专注市场营销的专家'],
    },
    {
      name: '金城',
      role: '广东省动漫艺术家协会会长',
      bio: [
        '手冢治虫作品《铁臂阿童木》《我的孙悟空》中文版出版制作人',
        '2025 年获日本外务省在外公馆长表彰',
      ],
    },
    {
      name: '顾子易（建国）',
      role: '动画作家、导演',
      bio: ['参与《哪吒闹海》《黑猫警长》《九色鹿》《哆啦A梦》等作品'],
    },
    {
      name: 'Taebong Cho',
      role: '韩国文化内容授权协会会长',
      bio: ['韩国授权行业权威人士'],
    },
    {
      name: '林 秀则',
      role: 'CG 导演 / CEO',
      bio: [
        '3DCG 制作实绩包括《奥特曼》《假面骑士》《机动战士高达UC》《剧场版 刀剑神域》《剧场版 歌之王子殿下♪》',
      ],
    },
    {
      name: '佐藤 进哉',
      role: '有限会社 Pickup 代表董事社长',
      bio: ['《全力兔子》动画制作人，在动画制作和声优选角等领域拥有深厚行业经验'],
    },
    {
      name: '孙弋涵',
      role: 'MING STUDIO CEO',
      bio: ['VR 游戏《Mecha Force》制作人', '曾在 NetEase 开发《宝可梦探险寻宝》'],
    },
    {
      name: 'Frank Yokoyama',
      role: '创意总监',
      bio: ['活跃于商品、品牌、活动等多领域的实力派制作人'],
    },
    {
      name: '胡蓉',
      role: 'NoWall 株式会社 代表董事社长',
      bio: ['作为漫画家曾获东亚漫画峰会“评审员特别奖”'],
    },
    {
      name: '谭正',
      role: '角色创作者',
      bio: ['动画、IP、漫画与角色领域专家'],
    },
    {
      name: '夏瑛',
      role: '浙江大学影视动漫游戏研究中心副主任',
      bio: ['日中娱乐行业专家'],
    },
    {
      name: '山吉 敏郎',
      role: '角色设计师',
      bio: ['客户实绩包括 Nintendo、东京迪士尼度假区、USJ JAPAN、Coca-Cola'],
    },
    {
      name: 'MOMO',
      role: '角色艺术总监',
      bio: ['Fate/Grand Order 官方插画大赛最高奖获得者'],
    },
    {
      name: '阿里斯别克・努汗',
      role: '“ASIA IP Contest in Tokyo 2024”获奖者',
      bio: ['法人角色部门最优秀奖及 OMAKE 奖获得者'],
    },
  ],
  ja: [
    {
      name: '関口 貢',
      role: '一般社団法人 日中動漫遊戯産業連合会 理事長',
      bio: ['サンリオで30年以上ライセンスデザイン管理'],
    },
    {
      name: '遠藤 貴司',
      role: '一般社団法人日中動漫遊戯産業連合会 理事',
      bio: ['10代からアニメ・ゲームキャラクターグッズに関わるマーケティング専門家'],
    },
    {
      name: '金城',
      role: '広東省アニメ芸術家協会会長',
      bio: [
        '手塚治虫の作品『鉄腕アトム』『ぼくの孫悟空』の中国語版出版プロデューサー',
        '2025年、日本外務省より在外公館長表彰を受賞',
      ],
    },
    {
      name: '顧子易（建国）',
      role: 'アニメーション作家・監督',
      bio: ['『哪吒鬧海』『黒猫警長』『九色鹿』『ドラえもん』に参加'],
    },
    {
      name: 'Taebong Cho',
      role: '韓国文化コンテンツライセンス協会会長',
      bio: ['韓国ライセンス業界の権威'],
    },
    {
      name: '林 秀則',
      role: 'CGディレクター / CEO',
      bio: [
        '3DCG制作実績「ウルトラマン」「仮面ライダー」「ガンダムUC」「劇場版ソードアート・オンライン」「劇場版うたの☆プリンスさまっ♪」',
      ],
    },
    {
      name: '佐藤 進哉',
      role: '有限会社ピックアップ代表取締役社長',
      bio: ['「全力ウサギ」アニメプロデューサー、動画制作や声優キャスティングなど業界屈指のプロ'],
    },
    {
      name: '孫弋涵',
      reading: 'ソン・イハン',
      role: 'MING STUDIO CEO',
      bio: ['VRゲーム「Mecha Force」プロデューサー', 'NetEaseで「ポケモンクエスト」を開発'],
    },
    {
      name: 'フランク・ヨコヤマ',
      role: 'クリエイティブディレクター',
      bio: ['商品やブランド、イベントなど幅広く手掛ける凄腕プロデューサー'],
    },
    {
      name: '胡蓉',
      reading: 'フー・ロン',
      role: 'ノーウォール株式会社 代表取締役社長',
      bio: ['漫画家として東アジア漫画サミットで「審査員特別賞」を獲得'],
    },
    {
      name: '谭正',
      reading: 'タン・セイ',
      role: 'キャラクタークリエイター',
      bio: ['アニメ、IP、漫画、キャラクターの専門家'],
    },
    {
      name: '夏瑛',
      reading: 'カ・エイ',
      role: '浙江大学影視動漫遊戯研究センター副センター長',
      bio: ['日中エンターテインメント業界の専門家'],
    },
    {
      name: '山吉 敏郎',
      role: 'キャラクターデザイナー',
      bio: ['クライアント実績：Nintendo、東京オリエンタルランド、USJ JAPAN、Coca-cola'],
    },
    {
      name: 'MOMO',
      role: 'キャラクターアートディレクター',
      bio: ['Fate/grand order公式イラストコンテント最優秀賞受賞'],
    },
    {
      name: 'アリスベク・ヌハン',
      role: '「ASIA IPコンテスト in Tokyo 2024」受賞者',
      bio: ['法人キャラクター部門最優秀賞およびOMAKE賞 受賞'],
    },
  ],
  en: [
    {
      name: 'Mitsugu Sekiguchi',
      role: 'Chairperson, Japan-China Animation, Comic and Game Industry Association',
      bio: ['Managed licensed design at Sanrio for more than 30 years'],
    },
    {
      name: 'Takashi Endo',
      role: 'Director, Japan-China Animation, Comic and Game Industry Association',
      bio: ['Marketing specialist involved with anime and game character merchandise since his teens'],
    },
    {
      name: 'Jincheng',
      role: 'Chairperson, Guangdong Animation Artists Association',
      bio: [
        'Publishing producer for the Chinese editions of Osamu Tezuka works Astro Boy and My Son Goku',
        'Received a Commendation from the Head of a Japanese Overseas Diplomatic Mission in 2025',
      ],
    },
    {
      name: 'Gu Ziyi (Jianguo)',
      role: 'Animation creator and director',
      bio: ['Participated in Nezha Conquers the Dragon King, Black Cat Detective, Nine-Colored Deer, and Doraemon'],
    },
    {
      name: 'Taebong Cho',
      role: 'Chairperson, Korea Culture Contents Licensing Association',
      bio: ['Authority in the Korean licensing industry'],
    },
    {
      name: 'Hidenori Hayashi',
      role: 'CG Director / CEO',
      bio: [
        '3DCG credits include Ultraman, Kamen Rider, Mobile Suit Gundam UC, Sword Art Online the Movie, and Uta no Prince-sama the Movie',
      ],
    },
    {
      name: 'Shinya Sato',
      role: 'President and Representative Director, Pick Up Co., Ltd.',
      bio: ['Anime producer for Zenryoku Usagi, with deep expertise in video production and voice actor casting'],
    },
    {
      name: 'Sun Yihan',
      role: 'CEO, MING STUDIO',
      bio: ['Producer of the VR game Mecha Force', 'Developed Pokemon Quest at NetEase'],
    },
    {
      name: 'Frank Yokoyama',
      role: 'Creative Director',
      bio: ['Accomplished producer working across products, brands, events, and more'],
    },
    {
      name: 'Hu Rong',
      role: 'President and Representative Director, NoWall Inc.',
      bio: ['Won the Judges’ Special Award at the East Asia Manga Summit as a manga artist'],
    },
    {
      name: 'Tan Zheng',
      role: 'Character Creator',
      bio: ['Specialist in anime, IP, manga, and characters'],
    },
    {
      name: 'Xia Ying',
      role: 'Deputy Director, Zhejiang University Film, Animation and Game Research Center',
      bio: ['Specialist in the Japan-China entertainment industry'],
    },
    {
      name: 'Toshiro Yamayoshi',
      role: 'Character Designer',
      bio: ['Client credits include Nintendo, Tokyo Disney Resort, USJ Japan, and Coca-Cola'],
    },
    {
      name: 'MOMO',
      role: 'Character Art Director',
      bio: ['Grand prize winner in the Fate/Grand Order official illustration contest'],
    },
    {
      name: 'Alicebek Nuhan',
      role: 'ASIA IP Contest in Tokyo 2024 award winner',
      bio: ['Winner of the Corporate Character Category Grand Prize and the OMAKE Award'],
    },
  ],
}

const judges = computed(() => judgesByLanguage[props.currentLanguage])
</script>
