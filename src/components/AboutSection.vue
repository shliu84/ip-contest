<template>
  <section id="about" class="section-padding container">
    <div class="glass-card about-card">
      <div class="about-kicker">{{ t('aboutKicker') }}</div>
      <h2>{{ t('aboutTitle') }}</h2>
      <p>{{ t('aboutText1') }}</p>
      <p>{{ t('aboutText2') }}</p>
      <p>{{ t('aboutText3') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TranslationKey } from '../i18n/translations'

defineProps<{
  t: (key: TranslationKey) => string
}>()
</script>
