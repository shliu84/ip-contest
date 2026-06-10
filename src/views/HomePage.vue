<template>
  <main>
    <HeroSection :t="t" />
    <AboutSection :t="t" />
    <NewsSection :t="t" />
    <TimelineSection :t="t" />
    <TracksSection :t="t" />
    <BenefitsSection />
    <JudgesSection :t="t" />
    <PrizesSection :t="t" />
  </main>
</template>

<script setup lang="ts">
import AboutSection from '../components/AboutSection.vue'
import BenefitsSection from '../components/BenefitsSection.vue'
import HeroSection from '../components/HeroSection.vue'
import JudgesSection from '../components/JudgesSection.vue'
import NewsSection from '../components/NewsSection.vue'
import PrizesSection from '../components/PrizesSection.vue'
import TimelineSection from '../components/TimelineSection.vue'
import TracksSection from '../components/TracksSection.vue'
import type { TranslationKey } from '../i18n/translations'

defineProps<{
  t: (key: TranslationKey) => string
}>()
</script>
