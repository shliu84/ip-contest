import { computed, ref, watchEffect } from 'vue'
import { translations, type LanguageCode, type TranslationKey } from '../i18n/translations'

const storageKey = 'asiaIpContestLanguage'

function getInitialLanguage(): LanguageCode {
  const saved = localStorage.getItem(storageKey)
  if (saved === 'zh' || saved === 'ja' || saved === 'en') return saved
  return 'ja'
}

export function useLanguage() {
  const currentLanguage = ref<LanguageCode>(getInitialLanguage())
  const copy = computed(() => translations[currentLanguage.value])

  const setLanguage = (lang: LanguageCode) => {
    currentLanguage.value = lang
    localStorage.setItem(storageKey, lang)
  }

  const t = (key: TranslationKey) => copy.value[key]

  watchEffect(() => {
    document.documentElement.lang = copy.value.lang
    document.title = copy.value.title
  })

  return {
    currentLanguage,
    setLanguage,
    t,
  }
}
