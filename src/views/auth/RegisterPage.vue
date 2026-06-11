<template>
  <main class="auth-page container">
    <div class="auth-panel">
      <div class="sec-title auth-title">
        <span>{{ t('authKicker') }}</span>
        <h2>{{ t('registerTitle') }}</h2>
        <p>{{ t('registerLead') }}</p>
      </div>

      <div v-if="isSuccess" class="form-success" role="status" aria-live="polite">
        <strong>{{ t('successRegisterTitle') }}</strong>
        <span>{{ t('successRegisterText') }}</span>
        <div class="form-actions">
          <RouterLink class="auth-link" to="/login">{{ t('loginLink') }}</RouterLink>
          <button class="auth-text-button" type="button" @click="resetForm">
            {{ t('retryRegister') }}
          </button>
        </div>
      </div>

      <form v-else class="auth-form" @submit.prevent="submit">
        <div class="form-field">
          <label for="register-email">{{ t('emailLabel') }}</label>
          <input
            id="register-email"
            v-model="email"
            autocomplete="email"
            type="email"
            required
            :disabled="isPending"
          >
        </div>

        <div class="form-field">
          <label for="register-password">{{ t('passwordLabel') }}</label>
          <input
            id="register-password"
            v-model="password"
            autocomplete="new-password"
            type="password"
            required
            minlength="10"
            maxlength="128"
            :disabled="isPending"
          >
        </div>

        <div class="form-field">
          <label for="register-confirm-password">{{ t('confirmPasswordLabel') }}</label>
          <input
            id="register-confirm-password"
            v-model="confirmPassword"
            autocomplete="new-password"
            type="password"
            required
            minlength="10"
            maxlength="128"
            :disabled="isPending"
          >
        </div>

        <div class="dashboard-section-heading">
          <h3>{{ t('registerApplicantTitle') }}</h3>
        </div>

        <div class="form-grid">
          <div class="form-field">
            <label for="register-last-name">{{ t('profileLastNameLabel') }}</label>
            <input id="register-last-name" v-model="lastName" autocomplete="family-name" type="text" required :disabled="isPending">
          </div>

          <div class="form-field">
            <label for="register-first-name">{{ t('profileFirstNameLabel') }}</label>
            <input id="register-first-name" v-model="firstName" autocomplete="given-name" type="text" required :disabled="isPending">
          </div>

          <div class="form-field">
            <label for="register-country-region">{{ t('countryRegionLabel') }}</label>
            <select id="register-country-region" v-model="countryRegion" required :disabled="isPending">
              <option value="" disabled>{{ t('selectPlaceholder') }}</option>
              <option v-for="option in countryRegionOptions" :key="option.value" :value="option.value">
                {{ t(option.labelKey) }}
              </option>
            </select>
          </div>

          <div class="form-field">
            <label for="register-phone-country-code">{{ t('phoneCountryCodeLabel') }}</label>
            <select id="register-phone-country-code" v-model="phoneCountryCode" required :disabled="isPending">
              <option value="" disabled>{{ t('selectPlaceholder') }}</option>
              <option v-for="code in phoneCountryCodeOptions" :key="code" :value="code">{{ code }}</option>
            </select>
          </div>

          <div class="form-field">
            <label for="register-phone-number">{{ t('phoneNumberLabel') }}</label>
            <input id="register-phone-number" v-model="phoneNumber" autocomplete="tel-national" type="tel" required :disabled="isPending">
          </div>
        </div>

        <p v-if="errorMessage" class="form-error" role="alert" aria-live="polite">
          {{ errorMessage }}
        </p>

        <div class="form-actions">
          <button class="btn btn-primary auth-submit" type="submit" :disabled="isPending">
            {{ isPending ? t('pendingRegister') : t('submitRegister') }}
          </button>
          <RouterLink class="auth-link" to="/login">{{ t('loginLink') }}</RouterLink>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ApiClientError, register } from '../../services/api'
import type { TranslationKey } from '../../i18n/translations'
import { countryRegionOptions, phoneCountryCodeOptions } from '../../constants/profile-options'

const props = defineProps<{
  t: (key: TranslationKey) => string
}>()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const lastName = ref('')
const firstName = ref('')
const countryRegion = ref('')
const phoneCountryCode = ref('')
const phoneNumber = ref('')
const errorMessage = ref('')
const isPending = ref(false)
const isSuccess = ref(false)

async function submit() {
  errorMessage.value = ''

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
    await register({
      email: email.value,
      password: password.value,
      lastName: lastName.value,
      firstName: firstName.value,
      countryRegion: countryRegion.value,
      phoneCountryCode: phoneCountryCode.value,
      phoneNumber: phoneNumber.value,
    })
    isSuccess.value = true
    password.value = ''
    confirmPassword.value = ''
  } catch (error) {
    errorMessage.value = translatedError(error)
  } finally {
    isPending.value = false
  }
}

function resetForm() {
  isSuccess.value = false
  errorMessage.value = ''
}

function translatedError(error: unknown) {
  if (error instanceof ApiClientError) {
    const keyByCode: Record<string, TranslationKey> = {
      bad_request: 'apiErrorBadRequest',
      conflict: 'apiErrorConflict',
      email_delivery_failed: 'apiErrorEmailDeliveryFailed',
      request_failed: 'apiErrorRequestFailed',
    }
    return props.t(keyByCode[error.code] ?? 'errorGeneric')
  }

  return props.t('errorGeneric')
}
</script>
