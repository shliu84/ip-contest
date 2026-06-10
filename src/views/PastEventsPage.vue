<template>
  <main>
    <section class="subpage-hero container">
      <div class="subpage-kicker">PAST EVENTS</div>
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.lead }}</p>
    </section>

    <section class="section-padding container">
      <div class="past-events-grid">
        <article
          v-for="event in copy.events"
          :key="event.title"
          class="glass-card past-event-card"
        >
          <div class="past-event-year">{{ event.year }}</div>
          <h2>{{ event.title }}</h2>
          <p>{{ event.body }}</p>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LanguageCode, TranslationKey } from '../i18n/translations'

const props = defineProps<{
  currentLanguage: LanguageCode
  t: (key: TranslationKey) => string
}>()

const pageCopy = {
  zh: {
    title: '往届比赛',
    lead: '回顾 ASIA IP CONTEST 的往届展示、获奖作品与线上会场。',
    events: [
      {
        year: '2025',
        title: '线上会场',
        body: '2025 年线上会场信息将作为创作者作品展示与交流入口继续整理。',
      },
      {
        year: '2024',
        title: 'ASIA IP Contest in Tokyo 2024',
        body: '往届获奖信息、OMAKE 奖和法人角色部门相关记录将在此页面持续更新。',
      },
    ],
  },
  ja: {
    title: '過去大会',
    lead: 'ASIA IP CONTESTの過去展示、受賞作品、オンライン会場を紹介します。',
    events: [
      {
        year: '2025',
        title: 'オンライン会場',
        body: '2025年オンライン会場の情報を、作品展示とクリエイター交流の入口として整理していきます。',
      },
      {
        year: '2024',
        title: 'ASIA IP Contest in Tokyo 2024',
        body: '過去の受賞情報、OMAKE賞、法人キャラクター部門の記録をこのページで更新していきます。',
      },
    ],
  },
  en: {
    title: 'Past Events',
    lead: 'Explore previous ASIA IP CONTEST exhibitions, award-winning works, and online venues.',
    events: [
      {
        year: '2025',
        title: 'Online Venue',
        body: 'Information from the 2025 online venue will be organized as an entry point for work showcases and creator connections.',
      },
      {
        year: '2024',
        title: 'ASIA IP Contest in Tokyo 2024',
        body: 'Past award information, OMAKE Award records, and corporate character category records will be updated here.',
      },
    ],
  },
} satisfies Record<LanguageCode, {
  title: string
  lead: string
  events: Array<{ year: string; title: string; body: string }>
}>

const copy = computed(() => pageCopy[props.currentLanguage])
</script>
