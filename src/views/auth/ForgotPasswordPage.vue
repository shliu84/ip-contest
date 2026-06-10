<template>
  <main class="auth-page container">
    <div class="auth-panel">
      <div class="sec-title auth-title">
        <span>{{ t('authKicker') }}</span>
        <h2>{{ t('forgotTitle') }}</h2>
        <p>{{ t('forgotLead') }}</p>
      </div>

      <form class="auth-form" @submit.prevent="submit">
        <div class="form-field">
          <label for="forgot-email">{{ t('emailLabel') }}</label>
          <input
            id="forgot-email"
            v-model="email"
            autocomplete="email"
            type="email"
            required
            :disabled="isPending"
          >
        </div>

        <p v-if="successMessage" class="form-success" role="status" aria-live="polite">
          {{ successMessage }}
        </p>
        <p v-if="errorMessage" class="form-error" role="alert" aria-live="polite">
          {{ errorMessage }}
        </p>

        <div class="form-actions">
          <button class="btn btn-primary auth-submit" type="submit" :disabled="isPending">
            {{ isPending ? t('pendingForgot') : t('submitForgot') }}
          </button>
          <RouterLink class="auth-link" to="/login">{{ t('backToLogin') }}</RouterLink>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { TranslationKey } from '../../i18n/translations'
import { ApiClientError, requestPasswordReset } from '../../services/api'

const props = defineProps<{
  t: (key: TranslationKey) => string
}>()

const email = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isPending = ref(false)

async function submit() {
  errorMessage.value = ''
  successMessage.value = ''
  isPending.value = true

  try {
    await requestPasswordReset({ email: email.value })
    successMessage.value = props.t('successForgotText')
  } catch (error) {
    errorMessage.value = translatedError(error)
  } finally {
    isPending.value = false
  }
}

function translatedError(error: unknown) {
  if (error instanceof ApiClientError) {
    const keyByCode: Record<string, TranslationKey> = {
      bad_request: 'apiErrorBadRequest',
      request_failed: 'apiErrorRequestFailed',
    }
    return props.t(keyByCode[error.code] ?? 'errorGeneric')
  }

  return props.t('errorGeneric')
}
</script>
