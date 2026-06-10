<template>
  <main class="auth-page container">
    <div class="auth-panel dashboard-panel">
      <div class="sec-title auth-title">
        <span>{{ t('paymentKicker') }}</span>
        <h2>{{ t('paymentSuccessTitle') }}</h2>
      </div>

      <template v-if="!routeSubmissionId">
        <p class="form-error" role="alert" aria-live="polite">
          {{ t('paymentSuccessMissing') }}
        </p>
        <div class="form-actions">
          <RouterLink class="auth-link" to="/dashboard">{{ t('submissionBackToDashboard') }}</RouterLink>
        </div>
      </template>

      <p v-else-if="isLoading" class="form-success" role="status" aria-live="polite">
        {{ t('paymentLoading') }}
      </p>

      <template v-else-if="loadError">
        <p class="form-error" role="alert" aria-live="polite">{{ loadError }}</p>
        <div class="form-actions">
          <RouterLink class="auth-link" to="/dashboard">{{ t('submissionBackToDashboard') }}</RouterLink>
        </div>
      </template>

      <template v-else-if="submission">
        <p
          v-if="submission.status === 'submitted'"
          class="form-success"
          role="status"
          aria-live="polite"
        >
          {{ t('paymentSuccessLead') }}
        </p>

        <p v-else class="form-error" role="status" aria-live="polite">
          {{ t('paymentUnavailable') }}
        </p>

        <section class="dashboard-summary" :aria-label="t('submissionDetailsTitle')">
          <dl>
            <div>
              <dt>{{ t('submissionNoLabel') }}</dt>
              <dd>{{ submission.submissionNo }}</dd>
            </div>
            <div>
              <dt>{{ t('dashboardSubmissionWork') }}</dt>
              <dd>{{ submission.work.characterName || t('dashboardUntitledSubmission') }}</dd>
            </div>
            <div>
              <dt>{{ t('dashboardSubmissionStatus') }}</dt>
              <dd>{{ statusLabel(submission.status) }}</dd>
            </div>
            <div>
              <dt>{{ t('paymentPaidAt') }}</dt>
              <dd>{{ formatDateTime(submission.paidAt) }}</dd>
            </div>
            <div>
              <dt>{{ t('paymentSubmittedAt') }}</dt>
              <dd>{{ formatDateTime(submission.submittedAt) }}</dd>
            </div>
          </dl>
        </section>

        <div class="form-actions">
          <RouterLink
            v-if="submission.status !== 'submitted'"
            class="auth-link"
            :to="`/submissions/${encodeURIComponent(submission.id)}/payment`"
          >
            {{ t('paymentReturnToPayment') }}
          </RouterLink>
          <RouterLink class="auth-link" to="/dashboard">{{ t('submissionBackToDashboard') }}</RouterLink>
        </div>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { TranslationKey } from '../../i18n/translations'
import { ApiClientError, getSubmission } from '../../services/api'
import type { Submission, SubmissionStatus } from '../../types/api'

const props = defineProps<{
  t: (key: TranslationKey) => string
}>()

const route = useRoute()
const submission = ref<Submission | null>(null)
const isLoading = ref(false)
const loadError = ref('')
let loadSequence = 0

const routeSubmissionId = computed(() => {
  const id = route.query.submissionId
  return typeof id === 'string' ? id : id?.[0]
})

watch(
  routeSubmissionId,
  () => {
    void loadSubmission()
  },
  { immediate: true },
)

async function loadSubmission() {
  const sequence = ++loadSequence
  const id = routeSubmissionId.value
  loadError.value = ''
  submission.value = null

  if (!id) {
    isLoading.value = false
    return
  }

  isLoading.value = true

  try {
    const response = await getSubmission(id)
    if (sequence === loadSequence && routeSubmissionId.value === id) {
      submission.value = response.submission
    }
  } catch (error) {
    if (sequence === loadSequence) {
      loadError.value = translatedError(error, 'paymentLoadError')
    }
  } finally {
    if (sequence === loadSequence) {
      isLoading.value = false
    }
  }
}

function statusLabel(status: SubmissionStatus) {
  const keyByStatus: Record<SubmissionStatus, TranslationKey> = {
    draft: 'submissionStatusDraft',
    payment_pending: 'submissionStatusPaymentPending',
    submitted: 'submissionStatusSubmitted',
    screening: 'submissionStatusScreening',
    screened_in: 'submissionStatusScreenedIn',
    screened_out: 'submissionStatusScreenedOut',
    assigned: 'submissionStatusAssigned',
    reviewed: 'submissionStatusReviewed',
    withdrawn: 'submissionStatusWithdrawn',
  }
  return props.t(keyByStatus[status])
}

function formatDateTime(value: string | null) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(currentLocale(), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function currentLocale() {
  return document.documentElement.lang || 'ja'
}

function translatedError(error: unknown, fallback: TranslationKey) {
  if (error instanceof ApiClientError) {
    const keyByCode: Record<string, TranslationKey> = {
      bad_request: 'apiErrorBadRequest',
      unauthorized: 'apiErrorUnauthorized',
      forbidden: 'apiErrorUnauthorized',
      not_found: 'submissionLoadError',
      conflict: 'apiErrorInvalidSubmission',
      invalid_submission: 'apiErrorInvalidSubmission',
      request_failed: 'apiErrorRequestFailed',
    }
    return props.t(keyByCode[error.code] ?? fallback)
  }

  return props.t(fallback)
}
</script>
