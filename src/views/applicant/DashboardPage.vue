<template>
  <main class="auth-page container">
    <div class="auth-panel dashboard-panel">
      <div class="sec-title auth-title">
        <span>{{ t('dashboardKicker') }}</span>
        <h2>{{ t('dashboardTitle') }}</h2>
        <p>{{ t('dashboardLead') }}</p>
      </div>

      <section class="dashboard-summary" :aria-label="t('dashboardWelcome')">
        <dl>
          <div>
            <dt>{{ t('dashboardEmailLabel') }}</dt>
            <dd>{{ currentUser?.email }}</dd>
          </div>
          <div>
            <dt>{{ t('dashboardRoleLabel') }}</dt>
            <dd>{{ roleLabel }}</dd>
          </div>
        </dl>
      </section>

      <p v-if="dashboardError" class="form-error" role="alert" aria-live="polite">
        {{ dashboardError }}
      </p>

      <div class="form-actions">
        <button
          v-if="isApplicant"
          class="btn btn-primary auth-submit"
          type="button"
          :disabled="isCreatingDraft || isLoadingSubmissions || isLoggingOut"
          @click="createDraft"
        >
          {{ isCreatingDraft ? t('dashboardCreateDraftPending') : t('dashboardCreateDraft') }}
        </button>
        <button class="btn btn-outline auth-submit" type="button" :disabled="isLoggingOut || isCreatingDraft" @click="logout">
          {{ isLoggingOut ? t('dashboardLogoutPending') : t('dashboardLogout') }}
        </button>
      </div>

      <div v-if="!isApplicant" class="dashboard-empty" role="status">
        <h3>{{ t('dashboardSubmissionsUnavailableTitle') }}</h3>
        <p>{{ t('dashboardSubmissionsUnavailableText') }}</p>
      </div>

      <section v-else class="dashboard-submissions" :aria-label="t('dashboardSubmissionsTitle')">
        <div class="dashboard-section-heading">
          <h3>{{ t('dashboardSubmissionsTitle') }}</h3>
          <p>{{ t('dashboardSubmissionsLead') }}</p>
        </div>

        <p v-if="isLoadingSubmissions" class="form-success" role="status" aria-live="polite">
          {{ t('dashboardLoadingSubmissions') }}
        </p>

        <p v-else-if="submissionError" class="form-error" role="alert" aria-live="polite">
          {{ submissionError }}
        </p>

        <div v-else-if="submissions.length === 0" class="dashboard-empty" role="status">
          <h4>{{ t('dashboardEmptyTitle') }}</h4>
          <p>{{ t('dashboardEmptyText') }}</p>
        </div>

        <div v-else class="dashboard-table-wrap">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th scope="col">{{ t('dashboardSubmissionNo') }}</th>
                <th scope="col">{{ t('dashboardSubmissionWork') }}</th>
                <th scope="col">{{ t('dashboardSubmissionDivision') }}</th>
                <th scope="col">{{ t('dashboardSubmissionStatus') }}</th>
                <th scope="col">{{ t('dashboardSubmissionFee') }}</th>
                <th scope="col">{{ t('dashboardSubmissionFiles') }}</th>
                <th scope="col">{{ t('dashboardSubmissionCreated') }}</th>
                <th scope="col">{{ t('dashboardSubmissionUpdated') }}</th>
                <th scope="col">{{ t('dashboardSubmissionAction') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="submission in submissions" :key="submission.id">
                <td :data-label="t('dashboardSubmissionNo')">{{ submission.submissionNo }}</td>
                <td :data-label="t('dashboardSubmissionWork')">
                  {{ submission.characterName || t('dashboardUntitledSubmission') }}
                </td>
                <td :data-label="t('dashboardSubmissionDivision')">
                  {{ divisionLabel(submission.division) }}
                </td>
                <td :data-label="t('dashboardSubmissionStatus')">
                  {{ statusLabel(submission.status) }}
                </td>
                <td :data-label="t('dashboardSubmissionFee')">
                  {{ formatFee(submission.feeAmount, submission.currency) }}
                </td>
                <td :data-label="t('dashboardSubmissionFiles')">{{ submission.fileCount }}</td>
                <td :data-label="t('dashboardSubmissionCreated')">
                  {{ formatDate(submission.createdAt) }}
                </td>
                <td :data-label="t('dashboardSubmissionUpdated')">
                  {{ formatDate(submission.updatedAt) }}
                </td>
                <td :data-label="t('dashboardSubmissionAction')">
                  <RouterLink
                    class="auth-link"
                    :to="`/submissions/${submission.id}`"
                    :aria-label="submissionActionAriaLabel(submission)"
                  >
                    {{ submission.status === 'draft' ? t('dashboardEditSubmission') : t('dashboardViewSubmission') }}
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import type { TranslationKey } from '../../i18n/translations'
import { ApiClientError, createSubmission, listSubmissions } from '../../services/api'
import { useSession } from '../../stores/session'
import type { SubmissionDivision, SubmissionListItem, SubmissionStatus, UserRole } from '../../types/api'

const props = defineProps<{
  t: (key: TranslationKey) => string
}>()

const router = useRouter()
const session = useSession()
const currentUser = session.currentUser
const dashboardError = ref('')
const submissionError = ref('')
const submissions = ref<SubmissionListItem[]>([])
const isCreatingDraft = ref(false)
const isLoadingSubmissions = ref(false)
const isLoggingOut = ref(false)

const roleLabel = computed(() => {
  const keyByRole: Record<UserRole, TranslationKey> = {
    applicant: 'roleApplicant',
    committee: 'roleCommittee',
    judge: 'roleJudge',
    super_admin: 'roleSuperAdmin',
  }
  const role = currentUser.value?.role
  return role ? props.t(keyByRole[role]) : ''
})

const isApplicant = computed(() => currentUser.value?.role === 'applicant')

onMounted(() => {
  if (isApplicant.value) {
    void loadSubmissions()
  }
})

async function loadSubmissions() {
  submissionError.value = ''
  isLoadingSubmissions.value = true

  try {
    const response = await listSubmissions()
    submissions.value = response.submissions
  } catch (error) {
    submissionError.value = translatedError(error, 'dashboardLoadError')
  } finally {
    isLoadingSubmissions.value = false
  }
}

async function createDraft() {
  if (!isApplicant.value) {
    return
  }

  dashboardError.value = ''
  isCreatingDraft.value = true

  try {
    const response = await createSubmission({ division: '2d' })
    await router.push(`/submissions/${response.submission.id}`)
  } catch (error) {
    dashboardError.value = translatedError(error, 'errorGeneric')
  } finally {
    isCreatingDraft.value = false
  }
}

async function logout() {
  dashboardError.value = ''
  isLoggingOut.value = true
  try {
    await session.logout()
    await router.push('/login')
  } catch (error) {
    dashboardError.value = translatedError(error, 'errorGeneric')
  } finally {
    isLoggingOut.value = false
  }
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

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat(currentLocale(), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function submissionActionAriaLabel(submission: SubmissionListItem) {
  const action = submission.status === 'draft'
    ? props.t('dashboardEditSubmission')
    : props.t('dashboardViewSubmission')
  return `${action}: ${submissionAccessibleName(submission)}`
}

function submissionAccessibleName(submission: SubmissionListItem) {
  const title = submission.characterName || props.t('dashboardUntitledSubmission')
  return `${submission.submissionNo} ${title}`
}

function currentLocale() {
  return document.documentElement.lang || 'ja'
}

function translatedError(error: unknown, fallback: TranslationKey) {
  if (error instanceof ApiClientError) {
    const keyByCode: Record<string, TranslationKey> = {
      bad_request: 'apiErrorBadRequest',
      unauthorized: 'apiErrorUnauthorized',
      request_failed: 'apiErrorRequestFailed',
    }
    return props.t(keyByCode[error.code] ?? fallback)
  }

  return props.t(fallback)
}
</script>
