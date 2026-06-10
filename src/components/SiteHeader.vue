<template>
  <header ref="headerRef">
    <div class="logo">
      <span class="logo-sub">ASIA IP CONTEST in Tokyo 2026</span>
      <span class="logo-main">
        アジアIPコンテスト <em>~Art Festa~</em>
      </span>
    </div>
    <div class="header-actions">
      <nav>
        <ul>
          <li
            v-for="item in navItems"
            :key="item.to"
          >
            <RouterLink class="nav-link" :to="item.to">
              <span class="nav-eyebrow">{{ item.eyebrow }}</span>
              <span class="nav-label">{{ t(item.labelKey) }}</span>
            </RouterLink>
          </li>
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

const navItems: Array<{ to: string; eyebrow: string; labelKey: TranslationKey }> = [
  { to: '/', eyebrow: 'HOME', labelKey: 'navHome' },
  { to: '/about', eyebrow: 'ABOUT US', labelKey: 'navAbout' },
  { to: '/event-info', eyebrow: 'EVENT INFO', labelKey: 'navEventInfo' },
  { to: '/guidelines', eyebrow: 'GUIDELINES', labelKey: 'navGuidelines' },
  { to: '/past-events', eyebrow: 'PAST EVENTS', labelKey: 'navPastEvents' },
]

const headerRef = ref<HTMLElement | null>(null)
useHeaderScroll(headerRef)
</script>
