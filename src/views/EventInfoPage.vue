<template>
  <main>
    <section class="subpage-hero container">
      <div class="subpage-kicker">EVENT INFO</div>
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.lead }}</p>
    </section>
    <section class="event-info-section section-padding container">
      <div class="event-info-grid">
        <article class="glass-card event-overview-card">
          <div class="event-info-label">{{ copy.overview.eyebrow }}</div>
          <h2>{{ copy.overview.name }}</h2>
          <dl class="event-info-list">
            <div
              v-for="item in copy.overview.items"
              :key="item.label"
            >
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </article>

        <article class="glass-card event-overview-card">
          <div class="event-info-label">{{ copy.categories.eyebrow }}</div>
          <h2>{{ copy.categories.title }}</h2>
          <div class="event-category-list">
            <div
              v-for="category in copy.categories.items"
              :key="category.title"
            >
              <h3>{{ category.title }}</h3>
              <p>{{ category.body }}</p>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="event-info-section section-padding container">
      <div class="sec-title">
        <span>Schedule</span>
        <h2>{{ copy.schedule.title }}</h2>
      </div>
      <div class="event-schedule-grid">
        <article
          v-for="item in copy.schedule.items"
          :key="item.title"
          class="glass-card event-schedule-card"
        >
          <span>{{ item.period }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
        </article>
      </div>
    </section>

    <section class="event-info-section section-padding container">
      <div class="sec-title">
        <span>Participation</span>
        <h2>{{ copy.participation.title }}</h2>
      </div>
      <div class="event-info-grid">
        <article
          v-for="item in copy.participation.items"
          :key="item.title"
          class="glass-card event-overview-card"
        >
          <div class="event-info-label">{{ item.eyebrow }}</div>
          <h2>{{ item.title }}</h2>
          <p>{{ item.body }}</p>
        </article>
      </div>
    </section>

  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LanguageCode } from '../i18n/translations'

const props = defineProps<{
  currentLanguage: LanguageCode
}>()

const pageCopy = {
  zh: {
    title: '举办信息',
    lead: '确认 ASIA IP CONTEST in Tokyo 2026 的赛事概要、募集部门、日程与参赛相关信息。',
    overview: {
      eyebrow: 'Contest',
      name: 'ASIA IP CONTEST in Tokyo 2026',
      items: [
        { label: '赛事名', value: 'ASIA IP CONTEST in Tokyo 2026（亚洲 IP 大赛 in Tokyo 2026）' },
        { label: '主题', value: '待公布' },
        { label: '参加费', value: '个人部门：JPY 10,000 / 法人部门：JPY 100,000' },
      ],
    },
    categories: {
      eyebrow: 'Categories',
      title: '募集部门',
      items: [
        {
          title: '个人部门（2D、3D、AI）',
          body: '以原创角色为对象进行募集。企业创作者也可以个人名义参加。',
        },
        {
          title: '企业角色部门',
          body: '可使用自社原创角色参赛，新角色和既有角色均可报名，也是展示企业角色资产的机会。',
        },
      ],
    },
    schedule: {
      title: '赛事日程',
      items: [
        { period: 'Entry', title: '全球作品征集期', body: '具体日期将在确定后公布。' },
        { period: 'Online', title: '线上展示', body: '投稿作品将在官方网站线上会场依次公开。' },
        { period: 'Vote', title: '大众人气票选', body: '参赛者和观众可以从多元视角关注作品的 IP 潜力。' },
        { period: 'Review', title: '专业评委复审', body: '专业评委将对作品进行综合评审。' },
        { period: 'Exhibition', title: '线下会场展示', body: '优秀作品将在东京六本木会场进行特别展示。' },
        { period: 'Award', title: '颁奖典礼与公布', body: '结果发表和相关活动信息将另行公布。' },
      ],
    },
    participation: {
      title: '参赛与合作',
      items: [
        {
          eyebrow: 'Partner Creator',
          title: '招募合作创作者',
          body: '正在招募 ASIA IP CONTEST 官方认可的参加创作者。',
        },
        {
          eyebrow: 'Sponsor',
          title: '招募赞助商',
          body: '赞助相关咨询请联系：info@ipcon-acg.com',
        },
      ],
    },
  },
  ja: {
    title: '開催情報',
    lead: 'ASIA IP CONTEST in Tokyo 2026のイベント概要、募集部門、スケジュール、参加に関する情報をまとめています。',
    overview: {
      eyebrow: 'Contest',
      name: 'ASIA IP CONTEST in Tokyo 2026',
      items: [
        { label: 'イベント名', value: 'ASIA IP CONTEST in Tokyo 2026（アジアIPコンテスト in Tokyo 2026）' },
        { label: 'テーマ', value: '決定次第公開' },
        { label: '参加費', value: '個人部門：JPY 10,000 / 法人部門：JPY 100,000' },
      ],
    },
    categories: {
      eyebrow: 'Categories',
      title: '募集部門',
      items: [
        {
          title: '個人部門（2D、3D、AI）',
          body: 'オリジナルキャラクターを対象に募集します。企業クリエイターの場合でも個人名義で参加できます。',
        },
        {
          title: '企業キャラクター部門',
          body: '自社オリジナルキャラクターで応募できます。新規、既存問わず応募可能で、自社キャラクターをアピールする場になります。',
        },
      ],
    },
    schedule: {
      title: 'スケジュール',
      items: [
        { period: 'Entry', title: 'グローバル作品募集期間', body: '具体的な日程は決定次第公開します。' },
        { period: 'Online', title: 'オンライン展示', body: '応募作品は公式ページのオンライン会場で順次公開予定です。' },
        { period: 'Vote', title: '一般人気投票', body: '参加者と来場者が多様な視点からIPの可能性に触れる機会をつくります。' },
        { period: 'Review', title: '専門審査員による審査', body: '専門審査員が作品を総合的に審査します。' },
        { period: 'Exhibition', title: 'リアル会場展示', body: '上位作品は東京・六本木の会場で特別展示予定です。' },
        { period: 'Award', title: '授賞式・結果発表', body: '結果発表と関連イベントの詳細は追って公開します。' },
      ],
    },
    participation: {
      title: '参加・協賛について',
      items: [
        {
          eyebrow: 'Partner Creator',
          title: 'パートナークリエイター募集中',
          body: 'ASIA IP CONTEST公認の参加クリエイターを募集しています。',
        },
        {
          eyebrow: 'Sponsor',
          title: 'スポンサー募集中',
          body: 'スポンサーに関するお問い合わせ：info@ipcon-acg.com',
        },
      ],
    },
  },
  en: {
    title: 'Event Info',
    lead: 'Find event details, categories, schedule, and participation information for ASIA IP CONTEST in Tokyo 2026.',
    overview: {
      eyebrow: 'Contest',
      name: 'ASIA IP CONTEST in Tokyo 2026',
      items: [
        { label: 'Event name', value: 'ASIA IP CONTEST in Tokyo 2026' },
        { label: 'Theme', value: 'To be announced' },
        { label: 'Entry fee', value: 'Individual categories: JPY 10,000 / Corporate category: JPY 100,000' },
      ],
    },
    categories: {
      eyebrow: 'Categories',
      title: 'Categories',
      items: [
        {
          title: 'Individual categories (2D, 3D, AI)',
          body: 'Original character works are accepted. Corporate creators may also participate under an individual name.',
        },
        {
          title: 'Corporate character category',
          body: 'Companies may submit original corporate characters, whether new or existing, as an opportunity to present their character assets.',
        },
      ],
    },
    schedule: {
      title: 'Schedule',
      items: [
        { period: 'Entry', title: 'Global submission period', body: 'Detailed dates will be announced once confirmed.' },
        { period: 'Online', title: 'Online exhibition', body: 'Submitted works will be published progressively in the online venue on the official website.' },
        { period: 'Vote', title: 'Public popularity vote', body: 'Participants and visitors can explore the IP potential of works from diverse perspectives.' },
        { period: 'Review', title: 'Professional jury review', body: 'Professional judges will conduct a comprehensive review of submitted works.' },
        { period: 'Exhibition', title: 'Physical venue exhibition', body: 'Top works are planned for special exhibition at a venue in Roppongi, Tokyo.' },
        { period: 'Award', title: 'Award ceremony and results', body: 'Details on results announcements and related events will be released later.' },
      ],
    },
    participation: {
      title: 'Participation and Sponsorship',
      items: [
        {
          eyebrow: 'Partner Creator',
          title: 'Partner creators wanted',
          body: 'We are recruiting official participating creators for ASIA IP CONTEST.',
        },
        {
          eyebrow: 'Sponsor',
          title: 'Sponsors wanted',
          body: 'For sponsorship inquiries, contact: info@ipcon-acg.com',
        },
      ],
    },
  },
} satisfies Record<LanguageCode, {
  title: string
  lead: string
  overview: {
    eyebrow: string
    name: string
    items: Array<{ label: string; value: string }>
  }
  categories: {
    eyebrow: string
    title: string
    items: Array<{ title: string; body: string }>
  }
  schedule: {
    title: string
    items: Array<{ period: string; title: string; body: string }>
  }
  participation: {
    title: string
    items: Array<{ eyebrow: string; title: string; body: string }>
  }
}>

const copy = computed(() => pageCopy[props.currentLanguage])
</script>
