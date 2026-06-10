<template>
  <main class="auth-page container">
    <div class="auth-panel dashboard-panel admin-dashboard-panel">
      <div class="sec-title auth-title">
        <span>Admin</span>
        <h2>Submissions</h2>
        <p>Review submitted contest entries.</p>
      </div>

      <form class="auth-form admin-filter-form" @submit.prevent="loadSubmissions">
        <div class="form-field">
          <label for="admin-submission-status">Status</label>
          <select id="admin-submission-status" v-model="filters.status" :disabled="isLoading">
            <option value="">All statuses</option>
            <option v-for="status in statusOptions" :key="status" :value="status">
              {{ statusLabel(status) }}
            </option>
          </select>
        </div>

        <div class="form-field">
          <label for="admin-submission-division">Division</label>
          <select id="admin-submission-division" v-model="filters.division" :disabled="isLoading">
            <option value="">All divisions</option>
            <option v-for="division in divisionOptions" :key="division" :value="division">
              {{ divisionLabel(division) }}
            </option>
          </select>
        </div>

        <div class="form-field">
          <label for="admin-submission-search">Keyword</label>
          <input
            id="admin-submission-search"
            v-model="filters.q"
            type="search"
            :disabled="isLoading"
            placeholder="Search submissions"
          >
        </div>

        <div class="form-actions admin-filter-actions">
          <button class="btn btn-primary auth-submit" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Loading' : 'Refresh' }}
          </button>
        </div>
      </form>

      <p v-if="isLoading" class="form-success" role="status" aria-live="polite">
        Loading submissions.
      </p>

      <p v-else-if="errorMessage" class="form-error" role="alert" aria-live="polite">
        {{ errorMessage }}
      </p>

      <div v-else-if="submissions.length === 0" class="dashboard-empty" role="status">
        <h3>No submissions found.</h3>
        <p>Try changing the filters or refresh the list.</p>
      </div>

      <div v-else class="dashboard-table-wrap">
        <table class="dashboard-table admin-submissions-table">
          <thead>
            <tr>
              <th scope="col">Submission No.</th>
              <th scope="col">Applicant</th>
              <th scope="col">Character</th>
              <th scope="col">Division</th>
              <th scope="col">Status</th>
              <th scope="col">Fee</th>
              <th scope="col">Files</th>
              <th scope="col">Updated / Submitted</th>
              <th scope="col">Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="submission in submissions" :key="submission.id">
              <td data-label="Submission No.">{{ submission.submissionNo }}</td>
              <td data-label="Applicant">{{ submission.applicantEmail }}</td>
              <td data-label="Character">{{ submission.characterName || 'Untitled' }}</td>
              <td data-label="Division">{{ divisionLabel(submission.division) }}</td>
              <td data-label="Status">{{ statusLabel(submission.status) }}</td>
              <td data-label="Fee">{{ formatFee(submission.feeAmount, submission.currency) }}</td>
              <td data-label="Files">{{ submission.fileCount }}</td>
              <td data-label="Updated / Submitted">
                <span>{{ formatDateTime(submission.updatedAt) }}</span>
                <span class="admin-muted-line">
                  Submitted: {{ formatOptionalDateTime(submission.submittedAt) }}
                </span>
              </td>
              <td data-label="Detail">
                <RouterLink class="auth-link" :to="`/admin/submissions/${submission.id}`">
                  View
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ApiClientError, listAdminSubmissions } from '../../services/api'
import type {
  AdminSubmissionListFilters,
  AdminSubmissionListItem,
  SubmissionDivision,
  SubmissionStatus,
} from '../../types/api'

const statusOptions: SubmissionStatus[] = [
  'draft',
  'payment_pending',
  'submitted',
  'screening',
  'screened_in',
  'screened_out',
  'assigned',
  'reviewed',
  'withdrawn',
]

const divisionOptions: SubmissionDivision[] = ['2d', '3d', 'ai', 'corporate']

const filters = reactive<AdminSubmissionListFilters>({
  status: '',
  division: '',
  q: '',
})
const submissions = ref<AdminSubmissionListItem[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

onMounted(() => {
  void loadSubmissions()
})

async function loadSubmissions() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await listAdminSubmissions(filters)
    submissions.value = response.submissions
  } catch (error) {
    errorMessage.value = errorText(error, 'Failed to load submissions.')
  } finally {
    isLoading.value = false
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

function formatOptionalDateTime(value: string | null) {
  return value ? formatDateTime(value) : 'Not submitted'
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
