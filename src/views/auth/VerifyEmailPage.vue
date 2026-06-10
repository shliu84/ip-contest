<template>
  <main class="auth-page container">
    <div class="auth-panel">
      <div class="sec-title auth-title">
        <span>{{ t('authKicker') }}</span>
        <h2>{{ t('verifyTitle') }}</h2>
        <p>{{ t('verifyLead') }}</p>
      </div>

      <p v-if="isPending" class="form-success" role="status" aria-live="polite">
        {{ t('pendingVerify') }}
      </p>

      <div v-else-if="isSuccess" class="form-success" role="status" aria-live="polite">
        <span>{{ t('successVerifyText') }}</span>
        <RouterLink class="auth-link" to="/login">{{ t('loginLink') }}</RouterLink>
      </div>

      <div v-else-if="errorMessage" class="form-error" role="alert" aria-live="polite">
        <span>{{ errorMessage }}</span>
        <RouterLink class="auth-link" to="/login">{{ t('loginLink') }}</RouterLink>
      </div>

      <div v-else class="form-actions">
        <button class="btn btn-primary auth-submit" type="button" @click="confirmVerification">
          {{ t('submitVerify') }}
        </button>
        <RouterLink class="auth-link" to="/login">{{ t('loginLink') }}</RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { TranslationKey } from '../../i18n/translations'
import { verifyEmail } from '../../services/api'

const props = defineProps<{
  t: (key: TranslationKey) => string
}>()

const route = useRoute()
const token = typeof route.query.token === 'string' ? route.query.token : ''
const isPending = ref(false)
const isSuccess = ref(false)
const errorMessage = ref(token ? '' : props.t('missingTokenError'))

async function confirmVerification() {
  if (!token) {
    errorMessage.value = props.t('missingTokenError')
    return
  }

  isPending.value = true
  errorMessage.value = ''

  try {
    await verifyEmail(token)
    isSuccess.value = true
  } catch {
    errorMessage.value = props.t('errorVerifyText')
  } finally {
    isPending.value = false
  }
}
</script>
