<template>
  <section id="hero" class="hero container">
    <div class="hero-badge">{{ t('heroBadge') }}</div>
    <h1 v-html="t('heroTitle')" />
    <div class="hero-subtitle">{{ t('heroSubtitle') }}</div>
    <p>{{ t('heroLead') }}</p>
    <dl class="hero-meta-strip" aria-label="Contest overview">
      <div>
        <dt>{{ t('heroMetaVenueLabel') }}</dt>
        <dd>{{ t('heroMetaVenueValue') }}</dd>
      </div>
      <div>
        <dt>{{ t('heroMetaEntryLabel') }}</dt>
        <dd>{{ t('heroMetaEntryValue') }}</dd>
      </div>
      <div>
        <dt>{{ t('heroMetaDeadlineLabel') }}</dt>
        <dd>{{ t('heroMetaDeadlineValue') }}</dd>
      </div>
      <div>
        <dt>{{ t('heroMetaCategoriesLabel') }}</dt>
        <dd>{{ t('heroMetaCategoriesValue') }}</dd>
      </div>
    </dl>
    <div class="cta-group">
      <a href="/login?redirect=/dashboard" class="btn btn-primary">{{ t('ctaEntry') }}</a>
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
