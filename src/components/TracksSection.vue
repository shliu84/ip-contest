<template>
  <section id="tracks" class="section-padding container">
    <div class="sec-title">
      <span>Categories</span>
      <h2>{{ t('tracksTitle') }}</h2>
    </div>
    <div class="tracks-grid">
      <div
        v-for="track in tracks"
        :key="track.titleKey"
        class="glass-card track-card"
      >
        <div class="track-icon">{{ track.icon }}</div>
        <h3>{{ t(track.titleKey) }}</h3>
        <p>{{ t(track.textKey) }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TranslationKey } from '../i18n/translations'

defineProps<{
  t: (key: TranslationKey) => string
}>()

const tracks: Array<{ icon: string; titleKey: TranslationKey; textKey: TranslationKey }> = [
  { icon: '2D', titleKey: 'track1Title', textKey: 'track1Text' },
  { icon: '3DCG', titleKey: 'track2Title', textKey: 'track2Text' },
  { icon: 'AI', titleKey: 'track3Title', textKey: 'track3Text' },
  { icon: 'CORP', titleKey: 'track4Title', textKey: 'track4Text' },
]
</script>
