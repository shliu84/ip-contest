<template>
  <header ref="headerRef">
    <div class="logo">
      ASIA IP <strong>2026</strong> <span>{{ t('logoSub') }}</span>
    </div>
    <div class="header-actions">
      <nav>
        <ul>
          <li><a href="/#hero">{{ t('navHome') }}</a></li>
          <li><a href="/#about">{{ t('navAbout') }}</a></li>
          <li><a href="/#news">{{ t('navNews') }}</a></li>
          <li><a href="/#timeline">{{ t('navTimeline') }}</a></li>
          <li><a href="/#tracks">{{ t('navTracks') }}</a></li>
          <li><a href="/#judges">{{ t('navJudges') }}</a></li>
          <li><a href="/#prizes">{{ t('navPrizes') }}</a></li>
        </ul>
      </nav>
      <div class="header-entry-links" role="group" :aria-label="t('ctaEntry')">
        <a class="header-entry-link" href="/login">{{ t('loginLink') }}</a>
        <a class="header-entry-link header-entry-link-primary" href="/login?redirect=/dashboard">
          {{ t('ctaEntry') }}
        </a>
      </div>
      <div class="lang-switcher" aria-label="Language selector">
        <button
          v-for="lang in languages"
          :key="lang.code"
          class="lang-btn"
          :class="{ active: currentLanguage === lang.code }"
          type="button"
          :aria-pressed="currentLanguage === lang.code"
          @click="setLanguage(lang.code)"
        >
          {{ lang.label }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHeaderScroll } from '../composables/useHeaderScroll'
import type { LanguageCode, TranslationKey } from '../i18n/translations'

defineProps<{
  currentLanguage: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: TranslationKey) => string
}>()

const languages: Array<{ code: LanguageCode; label: string }> = [
  { code: 'ja', label: '日' },
  { code: 'zh', label: '中' },
  { code: 'en', label: 'EN' },
]

const headerRef = ref<HTMLElement | null>(null)
useHeaderScroll(headerRef)
</script>
