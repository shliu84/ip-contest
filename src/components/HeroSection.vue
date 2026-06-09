<template>
  <section id="hero" class="hero container">
    <div class="hero-badge">{{ t('heroBadge') }}</div>
    <h1 v-html="t('heroTitle')" />
    <p>{{ t('heroLead') }}</p>
    <div class="cta-group">
      <a href="#" class="btn btn-primary">{{ t('ctaEntry') }}</a>
      <a href="#about" class="btn btn-outline">{{ t('ctaAbout') }}</a>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TranslationKey } from '../i18n/translations'

defineProps<{
  t: (key: TranslationKey) => string
}>()
</script>
