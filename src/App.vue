<template>
  <canvas ref="canvasRef" id="lineCanvas"></canvas>

  <SiteHeader
    :current-language="currentLanguage"
    :set-language="setLanguage"
    :t="t"
  />

  <RouterView v-slot="{ Component, route }">
    <component
      :is="Component"
      v-bind="route.meta.usesLanguage ? { t, currentLanguage } : route.meta.usesTranslations ? { t } : {}"
    />
  </RouterView>

  <SiteFooter :t="t" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import { useLanguage } from './composables/useLanguage'
import { useRibbonCanvas } from './composables/useRibbonCanvas'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { currentLanguage, setLanguage, t } = useLanguage()

useRibbonCanvas(canvasRef)
</script>
