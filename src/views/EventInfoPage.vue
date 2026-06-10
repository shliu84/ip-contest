<template>
  <main>
    <section class="subpage-hero container">
      <div class="subpage-kicker">EVENT INFO</div>
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.lead }}</p>
    </section>
    <TimelineSection :t="t" />
    <PrizesSection :t="t" />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PrizesSection from '../components/PrizesSection.vue'
import TimelineSection from '../components/TimelineSection.vue'
import type { LanguageCode, TranslationKey } from '../i18n/translations'

const props = defineProps<{
  currentLanguage: LanguageCode
  t: (key: TranslationKey) => string
}>()

const pageCopy = {
  zh: {
    title: '举办信息',
    lead: '查看赛事日程、评审安排、颁奖与展示相关信息。',
  },
  ja: {
    title: '開催情報',
    lead: 'スケジュール、審査、授賞式、展示に関する情報をまとめています。',
  },
  en: {
    title: 'Event Info',
    lead: 'Find schedule, judging, award ceremony, and exhibition information.',
  },
} satisfies Record<LanguageCode, { title: string; lead: string }>

const copy = computed(() => pageCopy[props.currentLanguage])
</script>
