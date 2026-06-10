<template>
  <section id="prizes" class="section-padding container">
    <div class="sec-title">
      <span>Prizes & Awards</span>
      <h2>{{ t('prizesTitle') }}</h2>
    </div>
    <div class="prize-layout">
      <div
        v-for="prize in prizes"
        :key="prize.titleKey"
        class="glass-card prize-card"
        :class="{ gold: prize.isGold }"
      >
        <div class="prize-title">{{ t(prize.titleKey) }}</div>
        <div class="prize-amount"><span>¥</span> {{ prize.amount }}</div>
        <p>{{ t(prize.textKey) }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TranslationKey } from '../i18n/translations'

defineProps<{
  t: (key: TranslationKey) => string
}>()

const prizes: Array<{
  amount: string
  titleKey: TranslationKey
  textKey: TranslationKey
  isGold?: boolean
}> = [
  { amount: '100,000', titleKey: 'silverTitle', textKey: 'silverText' },
  { amount: '300,000', titleKey: 'goldTitle', textKey: 'goldText', isGold: true },
  { amount: 'VOTE', titleKey: 'popularTitle', textKey: 'popularText' },
  { amount: 'OMAKE', titleKey: 'omakeTitle', textKey: 'omakeText' },
]
</script>
