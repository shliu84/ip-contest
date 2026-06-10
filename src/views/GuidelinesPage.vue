<template>
  <main>
    <section class="subpage-hero container">
      <div class="subpage-kicker">GUIDELINES</div>
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.lead }}</p>
    </section>
    <TracksSection :t="t" />
    <BenefitsSection :current-language="currentLanguage" />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BenefitsSection from '../components/BenefitsSection.vue'
import TracksSection from '../components/TracksSection.vue'
import type { LanguageCode, TranslationKey } from '../i18n/translations'

const props = defineProps<{
  currentLanguage: LanguageCode
  t: (key: TranslationKey) => string
}>()

const pageCopy = {
  zh: {
    title: '募集要项',
    lead: '确认投稿赛道、参赛优势、奖金与展示机会。',
  },
  ja: {
    title: '募集要項',
    lead: '応募部門、参加メリット、賞金、展示機会について確認できます。',
  },
  en: {
    title: 'Guidelines',
    lead: 'Review categories, participation benefits, prizes, and exhibition opportunities.',
  },
} satisfies Record<LanguageCode, { title: string; lead: string }>

const copy = computed(() => pageCopy[props.currentLanguage])
</script>
