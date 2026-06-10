<template>
  <main class="auth-page container">
    <div class="auth-panel dashboard-panel">
      <div class="sec-title auth-title">
        <span>{{ t('paymentKicker') }}</span>
        <h2>{{ t('paymentCancelTitle') }}</h2>
        <p>{{ t('paymentCancelLead') }}</p>
      </div>

      <div class="form-actions">
        <RouterLink v-if="routeSubmissionId" class="auth-link" :to="paymentPath(routeSubmissionId)">
          {{ t('paymentReturnToPayment') }}
        </RouterLink>
        <RouterLink class="auth-link" to="/dashboard">{{ t('submissionBackToDashboard') }}</RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { TranslationKey } from '../../i18n/translations'

defineProps<{
  t: (key: TranslationKey) => string
}>()

const route = useRoute()

const routeSubmissionId = computed(() => {
  const id = route.query.submissionId
  return typeof id === 'string' ? id : id?.[0]
})

function paymentPath(submissionId: string) {
  return `/submissions/${encodeURIComponent(submissionId)}/payment`
}
</script>
