<template>
  <main class="auth-page container">
    <div class="auth-panel dashboard-panel admin-dashboard-panel">
      <div class="sec-title auth-title">
        <span>Admin</span>
        <h2>Submission Detail</h2>
        <p v-if="submission">{{ submission.submissionNo }}</p>
      </div>

      <p v-if="isLoading" class="form-success" role="status" aria-live="polite">
        Loading submission.
      </p>

      <p v-else-if="loadError" class="form-error" role="alert" aria-live="polite">
        {{ loadError }}
      </p>

      <template v-else-if="submission">
        <p v-if="statusSuccess" class="form-success" role="status" aria-live="polite">
          {{ statusSuccess }}
        </p>
        <p v-if="statusError" class="form-error" role="alert" aria-live="polite">
          {{ statusError }}
        </p>

        <section class="dashboard-summary" aria-label="Submission summary">
          <dl>
            <div>
              <dt>Submission No.</dt>
              <dd>{{ submission.submissionNo }}</dd>
            </div>
            <div>
              <dt>Applicant</dt>
              <dd>{{ submission.applicantEmail }}</dd>
            </div>
            <div>
              <dt>Character</dt>
              <dd>{{ submission.characterName || 'Untitled' }}</dd>
            </div>
            <div>
              <dt>Division</dt>
              <dd>{{ divisionLabel(submission.division) }}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{{ statusLabel(submission.status) }}</dd>
            </div>
            <div>
              <dt>Fee</dt>
              <dd>{{ formatFee(submission.feeAmount, submission.currency) }}</dd>
            </div>
            <div>
              <dt>Paid</dt>
              <dd>{{ formatOptionalDateTime(submission.paidAt, 'Not paid') }}</dd>
            </div>
            <div>
              <dt>Submitted</dt>
              <dd>{{ formatOptionalDateTime(submission.submittedAt, 'Not submitted') }}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{{ formatDateTime(submission.updatedAt) }}</dd>
            </div>
          </dl>
        </section>

        <section v-if="statusActions.length > 0" class="admin-detail-section" aria-label="Status actions">
          <div class="dashboard-section-heading">
            <h3>Status Actions</h3>
          </div>
          <div class="form-actions">
            <button
              v-for="status in statusActions"
              :key="status"
              class="btn btn-outline auth-submit"
              type="button"
              :disabled="isUpdatingStatus"
              @click="updateStatus(status)"
            >
              {{ actionLabel(status) }}
            </button>
          </div>
        </section>

        <section class="admin-detail-section dashboard-summary" aria-label="Applicant profile">
          <div class="dashboard-section-heading">
            <h3>Applicant Profile</h3>
          </div>
          <dl>
            <div>
              <dt>User ID</dt>
              <dd>{{ submission.applicant.id }}</dd>
            </div>
            <div>
              <dt>User email</dt>
              <dd>{{ submission.applicant.email }}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{{ roleLabel(submission.applicant.role) }}</dd>
            </div>
            <div>
              <dt>Email verified</dt>
              <dd>{{ formatOptionalDateTime(submission.applicant.emailVerifiedAt, 'Not verified') }}</dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{{ fullName }}</dd>
            </div>
            <div>
              <dt>Pen name</dt>
              <dd>{{ fieldValue(submission.profile.penName) }}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{{ fieldValue(submission.profile.email) }}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{{ fieldValue(submission.profile.phone) }}</dd>
            </div>
            <div>
              <dt>Country / Region</dt>
              <dd>{{ fieldValue(submission.profile.countryRegion) }}</dd>
            </div>
            <div>
              <dt>Prefecture</dt>
              <dd>{{ fieldValue(submission.profile.prefecture) }}</dd>
            </div>
            <div>
              <dt>City</dt>
              <dd>{{ fieldValue(submission.profile.city) }}</dd>
            </div>
            <div>
              <dt>Postal code</dt>
              <dd>{{ fieldValue(submission.profile.postalCode) }}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{{ fieldValue(submission.profile.address) }}</dd>
            </div>
            <div>
              <dt>Occupation</dt>
              <dd>{{ fieldValue(submission.profile.occupation) }}</dd>
            </div>
            <div>
              <dt>School</dt>
              <dd>{{ fieldValue(submission.profile.school) }}</dd>
            </div>
            <div>
              <dt>WeChat ID</dt>
              <dd>{{ fieldValue(submission.profile.wechatId) }}</dd>
            </div>
            <div>
              <dt>Certificate language</dt>
              <dd>{{ certificateLanguageLabel(submission.profile.certificateLanguage) }}</dd>
            </div>
          </dl>
        </section>

        <section class="admin-detail-section dashboard-summary" aria-label="Work details">
          <div class="dashboard-section-heading">
            <h3>Work</h3>
          </div>
          <dl>
            <div>
              <dt>Character name</dt>
              <dd>{{ fieldValue(submission.work.characterName) }}</dd>
            </div>
            <div>
              <dt>Theme and setting</dt>
              <dd>{{ fieldValue(submission.work.themeAndSetting) }}</dd>
            </div>
            <div>
              <dt>Exhibition info</dt>
              <dd>{{ fieldValue(submission.work.exhibitionInfo) }}</dd>
            </div>
            <div>
              <dt>Payer name</dt>
              <dd>{{ fieldValue(submission.work.payerName) }}</dd>
            </div>
            <div>
              <dt>Usage permission</dt>
              <dd>{{ booleanLabel(submission.work.usagePermission) }}</dd>
            </div>
            <div>
              <dt>Terms accepted</dt>
              <dd>{{ booleanLabel(submission.work.termsAccepted) }}</dd>
            </div>
          </dl>
        </section>

        <section class="admin-detail-section" aria-label="Files">
          <div class="dashboard-section-heading">
            <h3>Files</h3>
          </div>

          <div v-if="submission.files.length === 0" class="dashboard-empty" role="status">
            <h4>No files uploaded.</h4>
            <p>This submission has no files.</p>
          </div>

          <div v-else class="dashboard-table-wrap">
            <table class="dashboard-table admin-files-table">
              <thead>
                <tr>
                  <th scope="col">Type</th>
                  <th scope="col">Filename</th>
                  <th scope="col">Content type</th>
                  <th scope="col">Size</th>
                  <th scope="col">Uploaded</th>
                  <th scope="col">R2 key</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="file in submission.files" :key="file.id">
                  <td data-label="Type">{{ fileTypeLabel(file.fileType) }}</td>
                  <td data-label="Filename">{{ file.originalFilename }}</td>
                  <td data-label="Content type">{{ file.contentType }}</td>
                  <td data-label="Size">{{ formatBytes(file.sizeBytes) }}</td>
                  <td data-label="Uploaded">{{ formatDateTime(file.uploadedAt) }}</td>
                  <td data-label="R2 key">{{ file.r2Key }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>

      <div class="form-actions">
        <RouterLink class="auth-link" to="/admin/submissions">
          Back to submissions
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ApiClientError, getAdminSubmission, updateAdminSubmissionStatus } from '../../services/api'
import type {
  AdminSubmission,
  CertificateLanguage,
  SubmissionDivision,
  SubmissionFileType,
  SubmissionStatus,
  UserRole,
} from '../../types/api'

const route = useRoute()

const submission = ref<AdminSubmission | null>(null)
const isLoading = ref(false)
const isUpdatingStatus = ref(false)
const loadError = ref('')
const statusError = ref('')
const statusSuccess = ref('')
let loadRequestId = 0

const submissionId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? id[0] : id
})

const statusActions = computed<SubmissionStatus[]>(() => {
  const status = submission.value?.status
  if (status === 'submitted') {
    return ['screening', 'screened_in', 'screened_out', 'withdrawn']
  }
  if (status === 'screening') {
    return ['screened_in', 'screened_out', 'withdrawn']
  }
  return []
})

const fullName = computed(() => {
  if (!submission.value) {
    return ''
  }
  const { lastName, firstName } = submission.value.profile
  return fieldValue([lastName, firstName].filter(Boolean).join(' '))
})

watch(
  submissionId,
  (id) => {
    void loadSubmission(id)
  },
  { immediate: true },
)

async function loadSubmission(id: string) {
  const requestId = ++loadRequestId
  submission.value = null
  loadError.value = ''
  statusError.value = ''
  statusSuccess.value = ''
  isLoading.value = true

  try {
    const response = await getAdminSubmission(id)
    if (requestId !== loadRequestId) {
      return
    }
    submission.value = response.submission
  } catch (error) {
    if (requestId !== loadRequestId) {
      return
    }
    loadError.value = errorText(error, 'Failed to load submission.')
  } finally {
    if (requestId === loadRequestId) {
      isLoading.value = false
    }
  }
}

async function updateStatus(status: SubmissionStatus) {
  if (isUpdatingStatus.value || !submission.value) {
    return
  }

  const targetSubmissionId = submission.value.id
  statusError.value = ''
  statusSuccess.value = ''
  isUpdatingStatus.value = true

  try {
    const response = await updateAdminSubmissionStatus(targetSubmissionId, { status })
    if (targetSubmissionId !== submissionId.value) {
      return
    }
    submission.value = response.submission
    statusSuccess.value = 'Status updated.'
  } catch (error) {
    if (targetSubmissionId !== submissionId.value) {
      return
    }
    statusError.value = errorText(error, 'Failed to update status.')
  } finally {
    isUpdatingStatus.value = false
  }
}

function divisionLabel(division: SubmissionDivision) {
  const labels: Record<SubmissionDivision, string> = {
    '2d': '2D',
    '3d': '3D',
    ai: 'AI',
    corporate: 'Corporate',
  }
  return labels[division]
}

function statusLabel(status: SubmissionStatus) {
  const labels: Record<SubmissionStatus, string> = {
    draft: 'Draft',
    payment_pending: 'Payment pending',
    submitted: 'Submitted',
    screening: 'Screening',
    screened_in: 'Screened in',
    screened_out: 'Screened out',
    assigned: 'Assigned',
    reviewed: 'Reviewed',
    withdrawn: 'Withdrawn',
  }
  return labels[status]
}

function actionLabel(status: SubmissionStatus) {
  return `Set ${statusLabel(status).toLowerCase()}`
}

function roleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    applicant: 'Applicant',
    committee: 'Committee',
    judge: 'Judge',
    super_admin: 'Super admin',
  }
  return labels[role]
}

function certificateLanguageLabel(language: CertificateLanguage) {
  const labels: Record<CertificateLanguage, string> = {
    ja: 'Japanese',
    en: 'English',
    zh: 'Chinese',
  }
  return labels[language]
}

function fileTypeLabel(fileType: SubmissionFileType) {
  const labels: Record<SubmissionFileType, string> = {
    online_a4_image: 'Online A4 image',
    physical_a2_image: 'Physical A2 image',
    process_or_prompt_screenshot: 'Process or prompt screenshot',
    unedited_original_ai: 'Unedited original AI',
  }
  return labels[fileType]
}

function booleanLabel(value: boolean) {
  return value ? 'Yes' : 'No'
}

function fieldValue(value: string) {
  return value.trim() || 'Not provided'
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

function formatOptionalDateTime(value: string | null, fallback: string) {
  return value ? formatDateTime(value) : fallback
}

function formatDateTime(value: string) {
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

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${new Intl.NumberFormat(currentLocale(), { maximumFractionDigits: 1 }).format(value)} ${units[unitIndex]}`
}

function currentLocale() {
  return document.documentElement.lang || 'ja'
}

function errorText(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) {
    return error.message || fallback
  }
  return fallback
}
</script>
