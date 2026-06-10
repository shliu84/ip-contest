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
import type { TranslationKey } from '../i18n/translations'

defineProps<{
  t: (key: TranslationKey) => string
}>()

type Judge = {
  name: string
  reading?: string
  role: string
  bio: string[]
}

const judges: Judge[] = [
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
]
</script>
