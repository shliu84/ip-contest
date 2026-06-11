<template>
  <header ref="headerRef">
    <RouterLink class="logo" to="/" aria-label="ASIA IP CONTEST in Tokyo 2026 home" @click="scrollToTop">
      <span class="logo-sub">ASIA IP CONTEST in Tokyo 2026</span>
      <span class="logo-main">
        アジアIPコンテスト <em>~Art Festa~</em>
      </span>
    </RouterLink>
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
      <button
        class="header-contact-button"
        type="button"
        :aria-label="contactCopy.openLabel"
        @click="openContact"
      >
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75A2.25 2.25 0 0 1 6 4.5h12a2.25 2.25 0 0 1 2.25 2.25v10.5A2.25 2.25 0 0 1 18 19.5H6a2.25 2.25 0 0 1-2.25-2.25V6.75Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 7.5 6.26 4.7a2.1 2.1 0 0 0 2.48 0l6.26-4.7" />
        </svg>
      </button>
      <div class="header-entry-links" role="group" :aria-label="t('headerEntry')">
        <a class="header-entry-link header-user-link" :href="headerLoginHref">{{ headerLoginLabel }}</a>
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
  <div
    v-if="isContactOpen"
    class="contact-modal-backdrop"
    role="presentation"
    @click.self="closeContact"
  >
    <section
      class="contact-modal"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="contactTitleId"
    >
      <div class="contact-modal-head">
        <div>
          <span>{{ contactCopy.eyebrow }}</span>
          <h2 :id="contactTitleId">{{ contactCopy.title }}</h2>
        </div>
        <button class="contact-modal-close" type="button" :aria-label="contactCopy.closeLabel" @click="closeContact">
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form class="contact-form" @submit.prevent="submitContact">
        <div class="contact-form-grid">
          <label>
            <span>{{ contactCopy.lastName }}</span>
            <input v-model="contactForm.lastName" required type="text" autocomplete="family-name">
          </label>
          <label>
            <span>{{ contactCopy.firstName }}</span>
            <input v-model="contactForm.firstName" required type="text" autocomplete="given-name">
          </label>
          <label>
            <span>{{ contactCopy.lastNameKana }}</span>
            <input v-model="contactForm.lastNameKana" required type="text">
          </label>
          <label>
            <span>{{ contactCopy.firstNameKana }}</span>
            <input v-model="contactForm.firstNameKana" required type="text">
          </label>
        </div>
        <label>
          <span>{{ contactCopy.type }}</span>
          <select v-model="contactForm.type" required>
            <option value="sponsor">{{ contactCopy.sponsor }}</option>
            <option value="participant">{{ contactCopy.participant }}</option>
          </select>
        </label>
        <label>
          <span>{{ contactCopy.email }}</span>
          <input v-model="contactForm.email" required type="email" autocomplete="email">
        </label>
        <label>
          <span>{{ contactCopy.message }}</span>
          <textarea v-model="contactForm.message" rows="5"></textarea>
        </label>
        <button class="contact-submit" type="submit">{{ contactCopy.submit }}</button>
        <p v-if="contactStatus" class="contact-status">{{ contactCopy.sent }}</p>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useHeaderScroll } from '../composables/useHeaderScroll'
import type { LanguageCode, TranslationKey } from '../i18n/translations'
import { useSession } from '../stores/session'

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
const isContactOpen = ref(false)
const contactStatus = ref(false)
const headerRef = ref<HTMLElement | null>(null)
const contactTitleId = 'contact-modal-title'
const session = useSession()
const currentUser = session.currentUser
const currentLanguageLabel = computed(() => {
  return languages.find((lang) => lang.code === props.currentLanguage)?.label ?? 'JA'
})
const mobileLanguageOptions = computed(() => {
  return languages.filter((lang) => lang.code !== props.currentLanguage)
})
const headerLoginLabel = computed(() => currentUser.value?.email ?? props.t('headerLogin'))
const headerLoginHref = computed(() => currentUser.value ? '/dashboard' : '/login')
const contactForm = reactive({
  lastName: '',
  firstName: '',
  lastNameKana: '',
  firstNameKana: '',
  type: 'sponsor',
  email: '',
  message: '',
})
const contactCopies = {
  zh: {
    openLabel: '打开咨询表单',
    closeLabel: '关闭咨询表单',
    eyebrow: 'CONTACT',
    title: '咨询',
    lastName: '姓*',
    firstName: '名*',
    lastNameKana: '姓（片假名）*',
    firstNameKana: '名（片假名）*',
    type: '咨询类型*',
    sponsor: '赞助相关',
    participant: '参赛者相关',
    email: '邮箱*',
    message: '咨询内容',
    submit: '提交',
    sent: '已收到咨询内容。正式发送功能将在后续接入。',
  },
  ja: {
    openLabel: 'お問い合わせフォームを開く',
    closeLabel: 'お問い合わせフォームを閉じる',
    eyebrow: 'CONTACT',
    title: 'お問い合わせ',
    lastName: '姓*',
    firstName: '名*',
    lastNameKana: '姓（カタカナ）*',
    firstNameKana: '名（カタカナ）*',
    type: 'お問い合わせ種別*',
    sponsor: 'スポンサー関連',
    participant: '参加者関連',
    email: 'メール*',
    message: 'お問い合わせ内容',
    submit: '投稿',
    sent: 'お問い合わせ内容を受け付けました。送信機能は後日接続予定です。',
  },
  en: {
    openLabel: 'Open contact form',
    closeLabel: 'Close contact form',
    eyebrow: 'CONTACT',
    title: 'Contact',
    lastName: 'Last Name*',
    firstName: 'First Name*',
    lastNameKana: 'Last Name (Katakana)*',
    firstNameKana: 'First Name (Katakana)*',
    type: 'Inquiry Type*',
    sponsor: 'Sponsorship',
    participant: 'Participant',
    email: 'Email*',
    message: 'Message',
    submit: 'Submit',
    sent: 'Your inquiry has been recorded. Delivery will be connected later.',
  },
} satisfies Record<LanguageCode, Record<string, string>>
const contactCopy = computed(() => contactCopies[props.currentLanguage])

function chooseLanguage(lang: LanguageCode) {
  props.setLanguage(lang)
  isMobileLanguageOpen.value = false
}

function openContact() {
  isContactOpen.value = true
  contactStatus.value = false
}

function closeContact() {
  isContactOpen.value = false
}

function submitContact() {
  contactStatus.value = true
}

function scrollToTop() {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

useHeaderScroll(headerRef)
</script>
