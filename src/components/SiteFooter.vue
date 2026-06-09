<template>
  <footer>
    <div class="container">
      <p>{{ t('footer') }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import type { TranslationKey } from '../i18n/translations'

defineProps<{
  t: (key: TranslationKey) => string
}>()
</script>
