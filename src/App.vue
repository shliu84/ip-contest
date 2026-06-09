<template>
  <canvas ref="canvasRef" id="lineCanvas"></canvas>

  <SiteHeader
    :current-language="currentLanguage"
    :set-language="setLanguage"
    :t="t"
  />

  <main>
    <HeroSection :t="t" />
    <AboutSection :t="t" />
    <NewsSection :t="t" />
    <TimelineSection :t="t" />
    <TracksSection :t="t" />
    <JudgesSection :t="t" />
    <PrizesSection :t="t" />
  </main>

  <SiteFooter :t="t" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AboutSection from './components/AboutSection.vue'
import HeroSection from './components/HeroSection.vue'
import JudgesSection from './components/JudgesSection.vue'
import NewsSection from './components/NewsSection.vue'
import PrizesSection from './components/PrizesSection.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import TimelineSection from './components/TimelineSection.vue'
import TracksSection from './components/TracksSection.vue'
import { useLanguage } from './composables/useLanguage'
import { useRibbonCanvas } from './composables/useRibbonCanvas'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { currentLanguage, setLanguage, t } = useLanguage()

useRibbonCanvas(canvasRef)
</script>
