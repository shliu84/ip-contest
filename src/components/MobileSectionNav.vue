<template>
  <div class="mobile-section-nav" :class="{ open: isOpen }">
    <div class="mobile-section-nav-panel">
      <a
        v-for="item in items"
        :key="item.href"
        class="mobile-section-nav-link"
        :class="[
          { active: activeHref === item.href },
          item.level === 1 ? 'mobile-section-nav-link-child' : 'mobile-section-nav-link-parent',
        ]"
        :href="item.href"
        @click="close"
      >
        {{ item.label }}
      </a>
    </div>
    <button
      class="mobile-section-nav-toggle"
      type="button"
      :aria-expanded="isOpen"
      :aria-label="label"
      @click="isOpen = !isOpen"
    >
      <svg
        class="mobile-section-nav-icon mobile-section-nav-icon-menu"
        aria-hidden="true"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.8"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
      <svg
        class="mobile-section-nav-icon mobile-section-nav-icon-close"
        aria-hidden="true"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.8"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  label: string
  activeHref: string
  items: Array<{ label: string; href: string; level?: number }>
}>()

const isOpen = ref(false)

function close() {
  isOpen.value = false
}
</script>
