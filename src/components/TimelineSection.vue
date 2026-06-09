<template>
  <section id="timeline" class="section-padding container">
    <div class="sec-title">
      <span>Timeline</span>
      <h2>{{ t('timelineTitle') }}</h2>
    </div>
    <div class="timeline-wrapper">
      <div
        v-for="item in timelineItems"
        :key="item.key"
        class="time-node"
      >
        <div class="time-dot" :class="{ 'time-dot-muted': item.isMuted }" />
        <h3>{{ item.date }}</h3>
        <p v-html="t(item.key)" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TranslationKey } from '../i18n/translations'

defineProps<{
  t: (key: TranslationKey) => string
}>()

const timelineItems: Array<{ date: string; key: TranslationKey; isMuted?: boolean }> = [
  { date: '06.01 - 08.31', key: 'timeline1' },
  { date: '09.01 - 09.15', key: 'timeline2', isMuted: true },
  { date: '09.16 - 09.30', key: 'timeline3', isMuted: true },
  { date: '10.15', key: 'timeline4', isMuted: true },
]
</script>
