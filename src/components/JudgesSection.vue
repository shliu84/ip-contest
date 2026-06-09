<template>
  <section id="judges" class="section-padding container">
    <div class="sec-title">
      <span>Judge Board</span>
      <h2>{{ t('judgesTitle') }}</h2>
    </div>
    <div class="judges-grid">
      <article
        v-for="judge in judges"
        :key="judge"
        class="glass-card judge-card"
      >
        <div class="judge-avatar">J{{ String(judge).padStart(2, '0') }}</div>
        <div class="judge-content">
          <div class="judge-number">Judge {{ String(judge).padStart(2, '0') }}</div>
          <h3>{{ t('judgeNamePlaceholder') }}</h3>
          <p class="judge-role">{{ t('judgeRolePlaceholder') }}</p>
          <p class="judge-bio">{{ t('judgeBioPlaceholder') }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TranslationKey } from '../i18n/translations'

defineProps<{
  t: (key: TranslationKey) => string
}>()

const judges = Array.from({ length: 10 }, (_, index) => index + 1)
</script>
