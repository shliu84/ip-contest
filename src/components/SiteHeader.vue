<template>
  <header ref="headerRef">
    <div class="logo">
      <span class="logo-sub">ASIA IP CONTEST in Tokyo 2026</span>
      <span class="logo-main">
        アジアIPコンテスト <em>~Art Festa~</em>
      </span>
    </div>
    <div class="header-actions">
      <nav class="desktop-nav">
        <ul>
          <li
            v-for="item in navItems"
            :key="item.to"
          >
            <RouterLink
              class="nav-link"
              :class="{ 'nav-link-en': currentLanguage === 'en' }"
              :to="item.to"
              @click="scrollToTop"
            >
              <span v-if="currentLanguage !== 'en'" class="nav-eyebrow">{{ item.eyebrow }}</span>
              <span class="nav-label">{{ t(item.labelKey) }}</span>
            </RouterLink>
          </li>
        </ul>
      </nav>
      <div class="header-entry-links" role="group" :aria-label="t('headerEntry')">
        <a class="header-entry-link" href="/login">{{ t('headerLogin') }}</a>
        <a class="header-entry-link header-entry-link-primary" href="/login?redirect=/dashboard">
          {{ t('headerEntry') }}
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
      <div
        class="mobile-lang-switcher"
        :class="{ open: isMobileLanguageOpen }"
        aria-label="Language selector"
      >
        <button
          class="mobile-lang-current"
          type="button"
          :aria-expanded="isMobileLanguageOpen"
          @click="isMobileLanguageOpen = !isMobileLanguageOpen"
        >
          {{ currentLanguageLabel }}
        </button>
        <div class="mobile-lang-menu">
          <button
            v-for="lang in mobileLanguageOptions"
            :key="lang.code"
            class="mobile-lang-option"
            type="button"
            @click="chooseLanguage(lang.code)"
          >
            {{ lang.label }}
          </button>
        </div>
      </div>
    </div>
  </header>
  <nav class="mobile-bottom-nav" aria-label="Mobile navigation">
    <ul>
      <li
        v-for="item in navItems"
        :key="item.to"
      >
        <RouterLink
          class="nav-link"
          :class="{ 'nav-link-en': currentLanguage === 'en' }"
          :to="item.to"
          @click="scrollToTop"
        >
          <span v-if="currentLanguage !== 'en'" class="nav-eyebrow">{{ item.eyebrow }}</span>
          <span class="nav-label">{{ t(item.labelKey) }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHeaderScroll } from '../composables/useHeaderScroll'
import type { LanguageCode, TranslationKey } from '../i18n/translations'

const props = defineProps<{
  currentLanguage: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: TranslationKey) => string
}>()

const languages: Array<{ code: LanguageCode; label: string }> = [
  { code: 'ja', label: 'JA' },
  { code: 'zh', label: 'ZH' },
  { code: 'en', label: 'EN' },
]

const navItems: Array<{ to: string; eyebrow: string; labelKey: TranslationKey }> = [
  { to: '/', eyebrow: 'HOME', labelKey: 'navHome' },
  { to: '/about', eyebrow: 'ABOUT US', labelKey: 'navAbout' },
  { to: '/event-info', eyebrow: 'EVENT INFO', labelKey: 'navEventInfo' },
  { to: '/guidelines', eyebrow: 'GUIDELINES', labelKey: 'navGuidelines' },
  { to: '/past-events', eyebrow: 'PAST EVENTS', labelKey: 'navPastEvents' },
]

const isMobileLanguageOpen = ref(false)
const headerRef = ref<HTMLElement | null>(null)
const currentLanguageLabel = computed(() => {
  return languages.find((lang) => lang.code === props.currentLanguage)?.label ?? 'JA'
})
const mobileLanguageOptions = computed(() => {
  return languages.filter((lang) => lang.code !== props.currentLanguage)
})

function chooseLanguage(lang: LanguageCode) {
  props.setLanguage(lang)
  isMobileLanguageOpen.value = false
}

function scrollToTop() {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

useHeaderScroll(headerRef)
</script>
