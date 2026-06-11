<template>
  <main class="auth-page container">
    <div class="auth-panel dashboard-panel">
      <div class="sec-title auth-title">
        <span>{{ t('paymentKicker') }}</span>
        <h2>{{ t('paymentTitle') }}</h2>
        <p>{{ t('paymentLead') }}</p>
      </div>

      <p v-if="isLoading" class="form-success" role="status" aria-live="polite">
        {{ t('paymentLoading') }}
      </p>

      <template v-else-if="loadError">
        <p class="form-error" role="alert" aria-live="polite">{{ loadError }}</p>
        <div class="form-actions">
          <RouterLink class="auth-link" to="/dashboard">{{ t('submissionBackToDashboard') }}</RouterLink>
        </div>
      </template>

      <template v-else-if="submission">
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
              <dt>{{ t('dashboardSubmissionDivision') }}</dt>
              <dd>{{ divisionLabel(submission.division) }}</dd>
            </div>
            <div>
              <dt>{{ t('dashboardSubmissionStatus') }}</dt>
              <dd>{{ statusLabel(submission.status) }}</dd>
            </div>
            <div>
              <dt>{{ t('dashboardSubmissionFee') }}</dt>
              <dd>{{ formatFee(submission.feeAmount, submission.currency) }}</dd>
            </div>
          </dl>
        </section>

        <p v-if="confirmError" class="form-error" role="alert" aria-live="polite">
          {{ confirmError }}
        </p>

        <p v-if="submission.status === 'submitted'" class="form-success" role="status" aria-live="polite">
          {{ t('paymentAlreadySubmitted') }}
        </p>

        <p
          v-else-if="submission.status !== 'draft' && submission.status !== 'payment_pending'"
          class="form-error"
          role="status"
          aria-live="polite"
        >
          {{ t('paymentUnavailable') }}
        </p>

        <div class="form-actions">
          <button
            v-if="submission.status === 'payment_pending'"
            class="btn btn-primary auth-submit"
            type="button"
            :disabled="isConfirming"
            @click="confirmPayment"
          >
            {{ isConfirming ? t('paymentCheckoutPending') : t('paymentCheckout') }}
          </button>

          <RouterLink v-if="submission.status === 'draft'" class="auth-link" :to="`/submissions/${submission.id}`">
            {{ t('paymentBackToEditor') }}
          </RouterLink>

          <RouterLink
            v-if="submission.status === 'submitted'"
            class="auth-link"
            :to="paymentSuccessPath(submission.id)"
          >
            {{ t('dashboardViewSubmission') }}
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
import { ApiClientError, createCheckout, getSubmission } from '../../services/api'
import type { Submission, SubmissionDivision, SubmissionStatus } from '../../types/api'

const props = defineProps<{
  t: (key: TranslationKey) => string
}>()

const route = useRoute()

const submission = ref<Submission | null>(null)
const isLoading = ref(false)
const isConfirming = ref(false)
const loadError = ref('')
const confirmError = ref('')
let loadSequence = 0

const routeSubmissionId = computed(() => {
  const id = route.params.id
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
  isLoading.value = true
  isConfirming.value = false
  loadError.value = ''
  confirmError.value = ''
  submission.value = null

  try {
    if (!id) {
      throw new Error('Missing submission id')
    }

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

async function confirmPayment() {
  if (!submission.value || submission.value.status !== 'payment_pending' || isConfirming.value) {
    return
  }

  const submissionId = submission.value.id
  isConfirming.value = true
  confirmError.value = ''

  try {
    const response = await createCheckout({ submissionId })
    if (routeSubmissionId.value === submissionId) {
      window.location.assign(response.checkoutUrl)
    }
  } catch (error) {
    if (routeSubmissionId.value === submissionId) {
      confirmError.value = translatedError(error, 'paymentCheckoutError')
    }
  } finally {
    if (routeSubmissionId.value === submissionId) {
      isConfirming.value = false
    }
  }
}

function paymentSuccessPath(submissionId: string) {
  return `/payment/success?submissionId=${encodeURIComponent(submissionId)}`
}

function divisionLabel(division: SubmissionDivision) {
  const keyByDivision: Record<SubmissionDivision, TranslationKey> = {
    '2d': 'submissionDivision2d',
    '3d': 'submissionDivision3d',
    ai: 'submissionDivisionAi',
    corporate: 'submissionDivisionCorporate',
  }
  return props.t(keyByDivision[division])
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

function formatFee(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(currentLocale(), {
      style: 'currency',
      currency,
      currencyDisplay: 'code',
    }).format(amount)
  } catch {
    return `${new Intl.NumberFormat(currentLocale()).format(amount)} ${currency}`
  }
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
