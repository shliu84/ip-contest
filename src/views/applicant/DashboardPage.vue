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

      <section v-if="isApplicant" class="dashboard-submissions" :aria-label="t('profileSectionTitle')">
        <div class="dashboard-section-heading">
          <h3>{{ t('profileSectionTitle') }}</h3>
          <p>{{ t('profileSectionLead') }}</p>
        </div>

        <p v-if="isLoadingProfile" class="form-success" role="status" aria-live="polite">
          {{ t('profileLoading') }}
        </p>

        <p v-if="profileError" class="form-error" role="alert" aria-live="polite">
          {{ profileError }}
        </p>

        <p v-if="profileSuccess" class="form-success" role="status" aria-live="polite">
          {{ profileSuccess }}
        </p>

        <div v-if="profileError && !hasLoadedProfile && !isLoadingProfile" class="form-actions">
          <button class="btn btn-outline auth-submit" type="button" @click="loadProfile">
            {{ t('profileRetry') }}
          </button>
        </div>

        <form v-if="!isLoadingProfile && hasLoadedProfile" class="auth-form" @submit.prevent="saveProfile">
          <div class="form-grid">
            <div class="form-field">
              <label for="profile-account-last-name">{{ t('profileLastNameLabel') }}</label>
              <input
                id="profile-account-last-name"
                v-model="profile.lastName"
                type="text"
                required
                :disabled="isSavingProfile"
              >
            </div>

            <div class="form-field">
              <label for="profile-account-first-name">{{ t('profileFirstNameLabel') }}</label>
              <input
                id="profile-account-first-name"
                v-model="profile.firstName"
                type="text"
                required
                :disabled="isSavingProfile"
              >
            </div>

            <div class="form-field">
              <label for="profile-account-last-name-kana">{{ t('profileLastNameKanaLabel') }}</label>
              <input
                id="profile-account-last-name-kana"
                v-model="profile.lastNameKana"
                type="text"
                :disabled="isSavingProfile"
              >
            </div>

            <div class="form-field">
              <label for="profile-account-first-name-kana">{{ t('profileFirstNameKanaLabel') }}</label>
              <input
                id="profile-account-first-name-kana"
                v-model="profile.firstNameKana"
                type="text"
                :disabled="isSavingProfile"
              >
            </div>

            <div class="form-field">
              <label for="profile-account-pen-name">{{ t('profilePenNameLabel') }}</label>
              <input
                id="profile-account-pen-name"
                v-model="profile.penName"
                type="text"
                :disabled="isSavingProfile"
              >
            </div>

            <div class="form-field">
              <label for="profile-account-country-region">{{ t('countryRegionLabel') }}</label>
              <select
                id="profile-account-country-region"
                v-model="profile.countryRegion"
                required
                :disabled="isSavingProfile"
              >
                <option value="" disabled>{{ t('selectPlaceholder') }}</option>
                <option v-for="option in countryRegionOptions" :key="option.value" :value="option.value">
                  {{ t(option.labelKey) }}
                </option>
              </select>
            </div>

            <div class="form-field">
              <label for="profile-account-phone-code">{{ t('phoneCountryCodeLabel') }}</label>
              <select
                id="profile-account-phone-code"
                v-model="profile.phoneCountryCode"
                required
                :disabled="isSavingProfile"
              >
                <option value="" disabled>{{ t('selectPlaceholder') }}</option>
                <option v-for="code in phoneCountryCodeOptions" :key="code" :value="code">
                  {{ code }}
                </option>
              </select>
            </div>

            <div class="form-field">
              <label for="profile-account-phone-number">{{ t('phoneNumberLabel') }}</label>
              <input
                id="profile-account-phone-number"
                v-model="profile.phoneNumber"
                type="tel"
                required
                :disabled="isSavingProfile"
              >
            </div>

            <div class="form-field">
              <label for="profile-account-postal-code">{{ t('profilePostalCodeLabel') }}</label>
              <input
                id="profile-account-postal-code"
                v-model="profile.postalCode"
                type="text"
                :disabled="isSavingProfile"
              >
            </div>

            <div class="form-field">
              <label for="profile-account-prefecture">{{ t('profilePrefectureLabel') }}</label>
              <select id="profile-account-prefecture" v-model="profile.prefecture" :disabled="isSavingProfile">
                <option value="" disabled>{{ t('prefecturePlaceholder') }}</option>
                <option v-for="option in prefectureOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="form-field">
              <label for="profile-account-city">{{ t('profileCityLabel') }}</label>
              <input id="profile-account-city" v-model="profile.city" type="text" :disabled="isSavingProfile">
            </div>

            <div class="form-field">
              <label for="profile-account-address-line1">{{ t('profileAddressLine1Label') }}</label>
              <input
                id="profile-account-address-line1"
                v-model="profile.addressLine1"
                type="text"
                :disabled="isSavingProfile"
              >
            </div>

            <div class="form-field">
              <label for="profile-account-address-line2">{{ t('profileAddressLine2Label') }}</label>
              <input
                id="profile-account-address-line2"
                v-model="profile.addressLine2"
                type="text"
                :disabled="isSavingProfile"
              >
            </div>

            <div class="form-field">
              <label for="profile-account-occupation">{{ t('profileOccupationLabel') }}</label>
              <select id="profile-account-occupation" v-model="profile.occupation" :disabled="isSavingProfile">
                <option value="" disabled>{{ t('selectPlaceholder') }}</option>
                <option v-for="option in occupationOptions" :key="option.value" :value="option.value">
                  {{ t(option.labelKey) }}
                </option>
              </select>
            </div>

            <div v-if="profile.occupation === 'student'" class="form-field">
              <label for="profile-account-school">{{ t('profileSchoolLabel') }}</label>
              <input
                id="profile-account-school"
                v-model="profile.school"
                type="text"
                required
                :disabled="isSavingProfile"
              >
            </div>

            <div class="form-field">
              <label for="profile-account-wechat">{{ t('profileWechatLabel') }}</label>
              <input id="profile-account-wechat" v-model="profile.wechatId" type="text" :disabled="isSavingProfile">
            </div>

            <div class="form-field">
              <label for="profile-account-certificate-language">{{ t('certificateLanguageLabel') }}</label>
              <select
                id="profile-account-certificate-language"
                v-model="profile.certificateLanguage"
                :disabled="isSavingProfile"
              >
                <option value="ja">{{ t('certificateLanguageJa') }}</option>
                <option value="en">{{ t('certificateLanguageEn') }}</option>
                <option value="zh">{{ t('certificateLanguageZh') }}</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary auth-submit" type="submit" :disabled="isSavingProfile">
              {{ isSavingProfile ? t('profileSavePending') : t('profileSave') }}
            </button>
          </div>
        </form>
      </section>

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
                    :to="submissionActionPath(submission)"
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
import {
  ApiClientError,
  createSubmission,
  getProfile,
  listSubmissions,
  updateProfile,
} from '../../services/api'
import {
  countryRegionOptions,
  phoneCountryCodeOptions,
  prefectureOptions,
  occupationOptions,
} from '../../constants/profile-options'
import { useSession } from '../../stores/session'
import type {
  ApplicantProfile,
  SubmissionDivision,
  SubmissionListItem,
  SubmissionStatus,
  UserRole,
} from '../../types/api'
import { submissionActionPath } from './dashboard-routing'

const props = defineProps<{
  t: (key: TranslationKey) => string
}>()

const router = useRouter()
const session = useSession()
const currentUser = session.currentUser
const dashboardError = ref('')
const submissionError = ref('')
const profile = ref<ApplicantProfile>(emptyProfile())
const submissions = ref<SubmissionListItem[]>([])
const isCreatingDraft = ref(false)
const isLoadingSubmissions = ref(false)
const isLoggingOut = ref(false)
const isLoadingProfile = ref(false)
const isSavingProfile = ref(false)
const profileError = ref('')
const profileSuccess = ref('')
const hasLoadedProfile = ref(false)

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
    void loadProfile()
    void loadSubmissions()
  }
})

function emptyProfile(): ApplicantProfile {
  return {
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    penName: '',
    countryRegion: '',
    phoneCountryCode: '',
    phoneNumber: '',
    postalCode: '',
    prefecture: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    occupation: '',
    school: '',
    wechatId: '',
    certificateLanguage: 'ja',
  }
}

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

async function loadProfile() {
  profileError.value = ''
  isLoadingProfile.value = true
  try {
    const response = await getProfile()
    profile.value = response.profile
    hasLoadedProfile.value = true
  } catch (error) {
    profileError.value = translatedError(error, 'profileLoadError')
  } finally {
    isLoadingProfile.value = false
  }
}

async function saveProfile() {
  profileError.value = ''
  profileSuccess.value = ''
  isSavingProfile.value = true
  try {
    const response = await updateProfile(profile.value)
    profile.value = response.profile
    profileSuccess.value = props.t('profileSaveSuccess')
  } catch (error) {
    profileError.value = translatedError(error, 'profileSaveError')
  } finally {
    isSavingProfile.value = false
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
