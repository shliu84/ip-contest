<template>
  <footer class="site-footer">
    <div class="container site-footer-inner">
      <div class="footer-logo-groups">
        <section
          v-for="group in footerGroups"
          :key="group.eyebrow"
          class="footer-logo-group"
        >
          <div class="footer-logo-group-title">
            <span>{{ group.eyebrow }}</span>
            <h2>{{ group.title }}</h2>
          </div>
          <div class="footer-logo-grid" :style="{ '--footer-logo-columns': String(group.columns) }">
            <div
              v-for="index in group.count"
              :key="index"
              class="footer-logo-placeholder"
              aria-hidden="true"
            >
              LOGO
            </div>
          </div>
        </section>
      </div>
      <p>{{ t('footer') }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LanguageCode, TranslationKey } from '../i18n/translations'

const props = defineProps<{
  currentLanguage: LanguageCode
  t: (key: TranslationKey) => string
}>()

const footerCopies = {
  zh: [
    { eyebrow: 'Organizer', title: '主办', count: 1, columns: 1 },
    { eyebrow: 'Co-Organizer', title: '共同主办', count: 3, columns: 3 },
    { eyebrow: 'Collaboration', title: '合作企业', count: 10, columns: 5 },
    { eyebrow: 'Support', title: '后援', count: 2, columns: 2 },
    { eyebrow: 'Legal Support', title: '知识产权法律支援', count: 2, columns: 2 },
  ],
  ja: [
    { eyebrow: 'Organizer', title: '主催', count: 1, columns: 1 },
    { eyebrow: 'Co-Organizer', title: '共催', count: 3, columns: 3 },
    { eyebrow: 'Collaboration', title: '協力企業', count: 10, columns: 5 },
    { eyebrow: 'Support', title: '後援', count: 2, columns: 2 },
    { eyebrow: 'Legal Support', title: '知的財産法律支援', count: 2, columns: 2 },
  ],
  en: [
    { eyebrow: 'Organizer', title: 'Organizer', count: 1, columns: 1 },
    { eyebrow: 'Co-Organizer', title: 'Co-Organizer', count: 3, columns: 3 },
    { eyebrow: 'Collaboration', title: 'Collaboration', count: 10, columns: 5 },
    { eyebrow: 'Support', title: 'Support', count: 2, columns: 2 },
    { eyebrow: 'Legal Support', title: 'Legal Support', count: 2, columns: 2 },
  ],
} satisfies Record<LanguageCode, Array<{ eyebrow: string; title: string; count: number; columns: number }>>

const footerGroups = computed(() => footerCopies[props.currentLanguage])
</script>
