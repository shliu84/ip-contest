<template>
  <main class="auth-page container">
    <div class="auth-panel">
      <div class="sec-title auth-title">
        <span>{{ t('authKicker') }}</span>
        <h2>{{ t('loginTitle') }}</h2>
        <p>{{ t('loginLead') }}</p>
      </div>

      <form class="auth-form" @submit.prevent="submit">
        <div class="form-field">
          <label for="login-email">{{ t('emailLabel') }}</label>
          <input
            id="login-email"
            v-model="email"
            autocomplete="email"
            type="email"
            required
            :disabled="isPending"
          >
        </div>

        <div class="form-field">
          <label for="login-password">{{ t('passwordLabel') }}</label>
          <input
            id="login-password"
            v-model="password"
            autocomplete="current-password"
            type="password"
            required
            :disabled="isPending"
          >
        </div>

        <p v-if="errorMessage" class="form-error" role="alert" aria-live="polite">
          {{ errorMessage }}
        </p>

        <div class="form-actions">
          <button class="btn btn-primary auth-submit" type="submit" :disabled="isPending">
            {{ isPending ? t('pendingLogin') : t('submitLogin') }}
          </button>
          <RouterLink class="auth-link" to="/forgot-password">
            {{ t('forgotPasswordLink') }}
          </RouterLink>
          <RouterLink class="auth-link" to="/register">{{ t('registerLink') }}</RouterLink>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import type { TranslationKey } from '../../i18n/translations'
import { ApiClientError } from '../../services/api'
import { useSession } from '../../stores/session'

const props = defineProps<{
  t: (key: TranslationKey) => string
}>()

const route = useRoute()
const router = useRouter()
const session = useSession()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isPending = ref(false)

async function submit() {
  errorMessage.value = ''
  isPending.value = true

  try {
    await session.login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string'
      && route.query.redirect.startsWith('/')
      && !route.query.redirect.startsWith('//')
      ? route.query.redirect
      : '/dashboard'
    await router.push(redirect)
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
      unauthorized: 'apiErrorUnauthorized',
      email_not_verified: 'apiErrorEmailNotVerified',
      request_failed: 'apiErrorRequestFailed',
    }
    return props.t(keyByCode[error.code] ?? 'errorGeneric')
  }

  return props.t('errorGeneric')
}
</script>
