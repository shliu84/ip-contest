<template>
  <section id="benefits" class="section-padding container">
    <div class="sec-title">
      <span>WHY YOU SHOULD JOIN US!</span>
      <h2>{{ copy.title }}</h2>
    </div>

    <div class="benefits-layout">
      <article
        v-for="benefit in copy.benefits"
        :key="benefit.title"
        class="glass-card benefit-card"
        :class="{ featured: benefit.featured }"
      >
        <div class="benefit-image-placeholder" aria-hidden="true"></div>
        <div class="benefit-copy">
          <p v-if="benefit.group" class="benefit-group">{{ benefit.group }}</p>
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
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LanguageCode } from '../i18n/translations'

const props = defineProps<{
  currentLanguage: LanguageCode
}>()

type Benefit = {
  group?: string
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

type BenefitCopy = {
  title: string
  benefits: Benefit[]
}

const benefitCopy: Record<LanguageCode, BenefitCopy> = {
  zh: {
    title: '参赛者特典・受赏特典',
    benefits: [
      {
        group: '所有参赛者',
        title: '所有投稿作品将在线上会场展示',
        body: [
          '线上展示将展示所有投稿作品。除作品本身外，也会刊登 SNS 账号和主页 URL，让更多人可以与各位创作者建立联系。',
          '【2025 线上会场】',
        ],
        featured: true,
      },
      {
        group: '所有参赛者',
        title: '赠送参赛证明书',
        body: ['作为勇敢挑战 ASIA IP CONTEST 的证明，所有参赛者都将获得数字参赛证明书。'],
      },
      {
        group: '优秀作品・获奖者',
        title: '优秀作品将在实体展会现场展示',
        body: ['优秀作品将在东京六本木这一艺术街区的会场进行特别展示。作品展示现场照片将于后日共享。'],
      },
      {
        group: '优秀作品・获奖者',
        title: '各部门最优秀创作者可获得奖金',
        body: [],
        items: [
          '个人部门（2D、3D、AI）各部门 1 名：JPY 100,000',
          '企业角色部门 1 名：JPY 300,000',
        ],
      },
      {
        group: '特别机会',
        title: '角色商品化！！',
        body: [
          '入选“OMAKE 奖”的作品，将获得扭蛋商品化的机会。所有投稿作品都会进入评选范围，每位参赛者都有挑战机会。',
          '※ 由“斎藤企画”提供。',
          '※ 商品化过程中可能需要合同、企划等准备时间。',
          '往届 OMAKE 奖商品可在这里购买！',
        ],
        link: {
          label: 'GACHA LIVE24',
          href: 'https://gachalive.com/ja/',
        },
      },
    ],
  },
  ja: {
    title: '参加者特典・受賞特典',
    benefits: [
      {
        group: '参加者全員',
        title: 'オンライン会場に全ての応募作品を展示',
        body: [
          'オンライン展示では、ご応募いただいた作品を全て展示いたします。作品だけでなく、各クリエイター達と繋がれるように、SNSのアカウントやホームページのURLも掲載します。',
          '【2025オンライン会場】',
        ],
        featured: true,
      },
      {
        group: '参加者全員',
        title: '参加証明書を贈呈',
        body: [
          'ASIA IP CONTESTに果敢に取り組んだ証として、参加者全員にデジタル参加証明書を贈呈します。',
        ],
      },
      {
        group: '上位作品・受賞者',
        title: 'リアル展示会場に上位作品を展示',
        body: [
          '上位作品は、美術の街東京六本木の会場で特別展示されます。作品展示の様子は後日共有されます。',
        ],
      },
      {
        group: '上位作品・受賞者',
        title: '各部門の最優秀クリエイターは賞金を獲得！！',
        body: [],
        items: [
          '個人部門（2D、3D、AI） 各部門1名：JPY 100,000',
          '企業キャラクター部門 1名：JPY 300,000',
        ],
      },
      {
        group: '特別チャンス',
        title: 'キャラクターを商品化！！',
        body: [
          '「OMAKE賞」に選ばれた場合、カプセルトイ商品化のチャンスが得られます。すべての作品が選考対象なので、全員に挑戦のチャンスがあります。',
          '※「斎藤企画」提供。',
          '※ 契約、企画など商品化まで時間が必要な場合があります。',
          'これまでのOMAKE賞の商品はこちらから購入できます！',
        ],
        link: {
          label: 'GACHA LIVE24',
          href: 'https://gachalive.com/ja/',
        },
      },
    ],
  },
  en: {
    title: 'Participant and Award Benefits',
    benefits: [
      {
        group: 'All Participants',
        title: 'All submissions exhibited online',
        body: [
          'The online exhibition will feature every submitted work. Alongside the works, creator SNS accounts and website URLs will be listed so visitors can connect with each creator.',
          '[2025 Online Venue]',
        ],
        featured: true,
      },
      {
        group: 'All Participants',
        title: 'Digital participation certificate',
        body: [
          'Every participant will receive a digital certificate as proof of their challenge in ASIA IP CONTEST.',
        ],
      },
      {
        group: 'Top Works and Winners',
        title: 'Top works exhibited at the physical venue',
        body: [
          'Selected top works will be specially exhibited at a venue in Roppongi, Tokyo, a district known for art. Photos from the exhibition will be shared later.',
        ],
      },
      {
        group: 'Top Works and Winners',
        title: 'Top creators receive cash prizes',
        body: [],
        items: [
          'Individual categories (2D, 3D, AI): 1 winner per category, JPY 100,000',
          'Corporate character category: 1 winner, JPY 300,000',
        ],
      },
      {
        group: 'Special Opportunity',
        title: 'Turn your character into merchandise!',
        body: [
          'Works selected for the OMAKE Award receive a chance to be developed into capsule toy merchandise. Every submission is eligible, so every participant has a chance.',
          'Provided by Saito Kikaku.',
          'Merchandising may require time for contracts, planning, and production preparation.',
          'Past OMAKE Award products are available here:',
        ],
        link: {
          label: 'GACHA LIVE24',
          href: 'https://gachalive.com/ja/',
        },
      },
    ],
  },
}

const copy = computed(() => benefitCopy[props.currentLanguage])
</script>
