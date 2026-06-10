<template>
  <main class="auth-page container">
    <div class="auth-panel">
      <div class="sec-title auth-title">
        <span>{{ t('authKicker') }}</span>
        <h2>{{ t('resetTitle') }}</h2>
        <p>{{ t('resetLead') }}</p>
      </div>

      <div v-if="isSuccess" class="form-success" role="status" aria-live="polite">
        <span>{{ t('successResetText') }}</span>
        <RouterLink class="auth-link" to="/login">{{ t('loginLink') }}</RouterLink>
      </div>

      <form v-else class="auth-form" @submit.prevent="submit">
        <div class="form-field">
          <label for="reset-password">{{ t('passwordLabel') }}</label>
          <input
            id="reset-password"
            v-model="password"
            autocomplete="new-password"
            type="password"
            required
            minlength="10"
            maxlength="128"
            :disabled="isPending || !token"
          >
        </div>

        <div class="form-field">
          <label for="reset-confirm-password">{{ t('confirmPasswordLabel') }}</label>
          <input
            id="reset-confirm-password"
            v-model="confirmPassword"
            autocomplete="new-password"
            type="password"
            required
            minlength="10"
            maxlength="128"
            :disabled="isPending || !token"
          >
        </div>

        <p v-if="errorMessage" class="form-error" role="alert" aria-live="polite">
          {{ errorMessage }}
        </p>

        <div class="form-actions">
          <button class="btn btn-primary auth-submit" type="submit" :disabled="isPending || !token">
            {{ isPending ? t('pendingReset') : t('submitReset') }}
          </button>
          <RouterLink class="auth-link" to="/login">{{ t('backToLogin') }}</RouterLink>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { TranslationKey } from '../../i18n/translations'
import { ApiClientError, resetPassword } from '../../services/api'

const props = defineProps<{
  t: (key: TranslationKey) => string
}>()

const route = useRoute()
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref(token.value ? '' : props.t('missingTokenError'))
const isPending = ref(false)
const isSuccess = ref(false)

async function submit() {
  errorMessage.value = ''

  if (!token.value) {
    errorMessage.value = props.t('missingTokenError')
    return
  }

  if (Array.from(password.value).length < 10) {
    errorMessage.value = props.t('errorPasswordRequirements')
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = props.t('errorPasswordMismatch')
    return
  }

  isPending.value = true
  try {
    await resetPassword({
      token: token.value,
      password: password.value,
    })
    password.value = ''
    confirmPassword.value = ''
    isSuccess.value = true
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
