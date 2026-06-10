<template>
  <section id="news" class="section-padding container">
    <div class="sec-title">
      <span>News</span>
      <h2>{{ t('newsTitle') }}</h2>
    </div>
    <div class="news-list">
      <article class="glass-card news-item">
        <div class="news-date">2026.07.01</div>
        <div>
          <h3>{{ t('news1Title') }}</h3>
          <p>{{ t('news1Text') }}</p>
        </div>
      </article>
      <article class="glass-card news-item">
        <div class="news-date">2026.07.01</div>
        <div>
          <h3>{{ t('news2Title') }}</h3>
          <p>{{ t('news2Text') }}</p>
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
</script>
