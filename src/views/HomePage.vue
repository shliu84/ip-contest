<template>
  <main>
    <nav class="home-section-dots" aria-label="Homepage sections">
      <a
        v-for="item in sectionDots"
        :key="item.href"
        class="home-section-dot"
        :class="{ active: activeSectionHref === item.href }"
        :href="item.href"
        :aria-label="item.label"
        :data-label="item.label"
        @click="activeSectionHref = item.href"
      >
        <span class="home-section-dot-label">{{ item.label }}</span>
        <span class="home-section-dot-mark" aria-hidden="true"></span>
      </a>
    </nav>
    <HeroSection :t="t" />
    <AboutSection :t="t" />
    <NewsSection :t="t" />
    <TimelineSection :t="t" />
    <TracksSection :t="t" />
    <BenefitsSection :current-language="currentLanguage" />
    <JudgesSection :current-language="currentLanguage" :t="t" />
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import AboutSection from '../components/AboutSection.vue'
import BenefitsSection from '../components/BenefitsSection.vue'
import HeroSection from '../components/HeroSection.vue'
import JudgesSection from '../components/JudgesSection.vue'
import NewsSection from '../components/NewsSection.vue'
import TimelineSection from '../components/TimelineSection.vue'
import TracksSection from '../components/TracksSection.vue'
import type { LanguageCode, TranslationKey } from '../i18n/translations'

defineProps<{
  currentLanguage: LanguageCode
  t: (key: TranslationKey) => string
}>()

const sectionDots = [
  { href: '#hero', label: 'Top' },
  { href: '#about', label: 'About' },
  { href: '#news', label: 'News' },
  { href: '#timeline', label: 'Schedule' },
  { href: '#tracks', label: 'Categories' },
  { href: '#benefits', label: 'Benefits' },
  { href: '#judges', label: 'Judges' },
]

const activeSectionHref = ref('#hero')

const updateActiveSection = () => {
  const anchorLine = window.innerHeight * 0.42
  let currentHref = sectionDots[0].href
  for (const item of sectionDots) {
    const element = document.querySelector<HTMLElement>(item.href)
    if (element && element.getBoundingClientRect().top <= anchorLine) {
      currentHref = item.href
    }
  }
  activeSectionHref.value = currentHref
}

onMounted(() => {
  updateActiveSection()
  window.addEventListener('scroll', updateActiveSection, { passive: true })
  window.addEventListener('resize', updateActiveSection)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveSection)
  window.removeEventListener('resize', updateActiveSection)
})
</script>
