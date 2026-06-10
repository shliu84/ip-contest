<template>
  <section id="benefits" class="section-padding container">
    <div class="sec-title">
      <span>WHY YOU SHOULD JOIN US!</span>
      <h2>参加メリット</h2>
    </div>

    <div class="benefits-layout">
      <article
        v-for="benefit in benefits"
        :key="benefit.title"
        class="glass-card benefit-card"
        :class="{ featured: benefit.featured }"
      >
        <h3>{{ benefit.title }}</h3>
        <p
          v-for="text in benefit.body"
          :key="text"
        >
          {{ text }}
        </p>
        <ul v-if="benefit.items" class="benefit-list">
          <li
            v-for="item in benefit.items"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
        <a
          v-if="benefit.link"
          class="benefit-link"
          :href="benefit.link.href"
          target="_blank"
          rel="noreferrer"
        >
          {{ benefit.link.label }}
        </a>
        <p v-if="benefit.note" class="benefit-note">{{ benefit.note }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
type Benefit = {
  title: string
  body: string[]
  items?: string[]
  link?: {
    label: string
    href: string
  }
  note?: string
  featured?: boolean
}

const benefits: Benefit[] = [
  {
    title: 'キャラクターを商品化！！',
    body: [
      '「OMAKE賞」に選ばれた場合、カプセルトイ商品化の権利が得られます！すべての作品が選考対象なので、全員に挑戦のチャンスがあります。',
      '※「斎藤企画」提供。',
      '※ 契約、企画など商品化まで時間が必要な場合があります。',
      'これまでのOMAKE賞の商品はこちらから購入できます！',
    ],
    link: {
      label: 'GACHA LIVE24',
      href: 'https://gachalive.com/ja/',
    },
    featured: true,
  },
  {
    title: '各部門の最優秀クリエイターは賞金を獲得！！',
    body: [],
    items: [
      '個人部門（2D、3D、AI） 各部門1名：JPY 100,000',
      '企業キャラクター部門 1名：JPY 300,000',
    ],
  },
  {
    title: 'リアル展示会場に上位作品を展示',
    body: [
      '上位作品は、美術の街東京六本木の会場で特別展示されます。作品展示の様子は後日共有されます。',
    ],
  },
  {
    title: 'オンライン会場に全ての応募作品を展示',
    body: [
      'オンライン展示では、ご応募いただいた作品を全て展示いたします。作品だけでなく、各クリエイター達と繋がれるように、SNSのアカウントやホームページのURLも掲載します。',
    ],
    note: '【2025オンライン会場】',
  },
  {
    title: '参加証明書を贈呈',
    body: [
      'ASIA IP CONTESTに果敢に取り組んだ証として、参加者全員にデジタル参加証明書を贈呈します。',
    ],
  },
]
</script>
