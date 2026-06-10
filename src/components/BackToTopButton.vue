<template>
  <button
    class="back-to-top"
    :class="{ visible: isVisible }"
    type="button"
    aria-label="Back to top"
    @click="scrollToTop"
  >
    ↑
  </button>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const isVisible = ref(false)

const updateVisibility = () => {
  isVisible.value = window.scrollY > 420
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  updateVisibility()
  window.addEventListener('scroll', updateVisibility, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateVisibility)
})
</script>
