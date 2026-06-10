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
  { date: '07.01 - 10.07', key: 'timeline1' },
  { date: '2026.10~', key: 'timeline2', isMuted: true },
  { date: '2026.10~11', key: 'timeline3', isMuted: true },
  { date: '2026.11', key: 'timeline5', isMuted: true },
  { date: '2026.11', key: 'timeline4', isMuted: true },
]
</script>
