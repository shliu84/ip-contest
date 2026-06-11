<template>
  <main class="auth-page container">
    <div class="auth-panel dashboard-panel submission-editor-panel">
      <div class="sec-title auth-title">
        <span>{{ t('submissionEditorKicker') }}</span>
        <h2>{{ t('submissionEditorTitle') }}</h2>
        <p>{{ t('submissionEditorLead') }}</p>
      </div>

      <p v-if="isLoading" class="form-success" role="status" aria-live="polite">
        {{ t('submissionEditorLoading') }}
      </p>

      <template v-else-if="loadError">
        <p class="form-error" role="alert" aria-live="polite">{{ loadError }}</p>
        <div class="form-actions">
          <RouterLink class="auth-link" to="/dashboard">{{ t('submissionBackToDashboard') }}</RouterLink>
        </div>
      </template>

      <template v-else-if="submission">
        <section class="dashboard-summary submission-editor-summary" :aria-label="t('submissionDetailsTitle')">
          <dl>
            <div>
              <dt>{{ t('submissionNoLabel') }}</dt>
              <dd>{{ submission.submissionNo }}</dd>
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

        <p v-if="isReadOnly" class="form-error" role="status">
          {{ t('submissionReadOnlyNotice') }}
        </p>

        <p v-if="saveSuccess" class="form-success" role="status" aria-live="polite">
          {{ saveSuccess }}
        </p>
        <p v-if="saveError" class="form-error" role="alert" aria-live="polite">
          {{ saveError }}
        </p>

        <form class="auth-form submission-editor-form" @submit.prevent="saveSubmission">
          <section class="submission-editor-section" :aria-labelledby="divisionHeadingId">
            <div class="dashboard-section-heading">
              <h3 :id="divisionHeadingId">{{ t('submissionDetailsTitle') }}</h3>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label for="submission-division">{{ t('submissionDivisionLabel') }}</label>
                <select id="submission-division" v-model="form.division" :disabled="controlsDisabled">
                  <option v-for="division in divisionOptions" :key="division" :value="division">
                    {{ divisionLabel(division) }}
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label for="submission-certificate-language">{{ t('certificateLanguageLabel') }}</label>
                <select
                  id="submission-certificate-language"
                  v-model="form.profile.certificateLanguage"
                  :disabled="controlsDisabled"
                >
                  <option value="ja">{{ t('certificateLanguageJa') }}</option>
                  <option value="en">{{ t('certificateLanguageEn') }}</option>
                  <option value="zh">{{ t('certificateLanguageZh') }}</option>
                </select>
              </div>
            </div>
          </section>

          <section class="submission-editor-section" :aria-labelledby="profileHeadingId">
            <div class="dashboard-section-heading">
              <h3 :id="profileHeadingId">{{ t('submissionProfileTitle') }}</h3>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label for="profile-last-name">{{ t('profileLastNameLabel') }}</label>
                <input id="profile-last-name" v-model="form.profile.lastName" type="text" :disabled="controlsDisabled">
              </div>

              <div class="form-field">
                <label for="profile-first-name">{{ t('profileFirstNameLabel') }}</label>
                <input id="profile-first-name" v-model="form.profile.firstName" type="text" :disabled="controlsDisabled">
              </div>

              <div class="form-field">
                <label for="profile-pen-name">{{ t('profilePenNameLabel') }}</label>
                <input id="profile-pen-name" v-model="form.profile.penName" type="text" :disabled="controlsDisabled">
              </div>

              <div class="form-field">
                <label for="profile-email">{{ t('emailLabel') }}</label>
                <input id="profile-email" v-model="form.profile.email" type="email" :disabled="controlsDisabled">
              </div>

              <div class="form-field">
                <label for="profile-phone">{{ t('profilePhoneLabel') }}</label>
                <input id="profile-phone" v-model="form.profile.phone" type="tel" :disabled="controlsDisabled">
              </div>

              <div class="form-field">
                <label for="profile-country-region">{{ t('profileCountryRegionLabel') }}</label>
                <input
                  id="profile-country-region"
                  v-model="form.profile.countryRegion"
                  type="text"
                  :disabled="controlsDisabled"
                >
              </div>

              <div class="form-field">
                <label for="profile-city">{{ t('profileCityLabel') }}</label>
                <input id="profile-city" v-model="form.profile.city" type="text" :disabled="controlsDisabled">
              </div>

              <div class="form-field">
                <label for="profile-prefecture">{{ t('profilePrefectureLabel') }}</label>
                <input id="profile-prefecture" v-model="form.profile.prefecture" type="text" :disabled="controlsDisabled">
              </div>

              <div class="form-field">
                <label for="profile-postal-code">{{ t('profilePostalCodeLabel') }}</label>
                <input id="profile-postal-code" v-model="form.profile.postalCode" type="text" :disabled="controlsDisabled">
              </div>

              <div class="form-field">
                <label for="profile-occupation">{{ t('profileOccupationLabel') }}</label>
                <input id="profile-occupation" v-model="form.profile.occupation" type="text" :disabled="controlsDisabled">
              </div>

              <div class="form-field">
                <label for="profile-school">{{ t('profileSchoolLabel') }}</label>
                <input id="profile-school" v-model="form.profile.school" type="text" :disabled="controlsDisabled">
              </div>

              <div class="form-field">
                <label for="profile-wechat">{{ t('profileWechatLabel') }}</label>
                <input id="profile-wechat" v-model="form.profile.wechatId" type="text" :disabled="controlsDisabled">
              </div>

              <div class="form-field form-field-wide">
                <label for="profile-address">{{ t('profileAddressLabel') }}</label>
                <textarea id="profile-address" v-model="form.profile.address" rows="3" :disabled="controlsDisabled" />
              </div>
            </div>
          </section>

          <section class="submission-editor-section" :aria-labelledby="workHeadingId">
            <div class="dashboard-section-heading">
              <h3 :id="workHeadingId">{{ t('submissionWorkTitle') }}</h3>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label for="work-character-name">{{ t('workCharacterNameLabel') }}</label>
                <input
                  id="work-character-name"
                  v-model="form.work.characterName"
                  type="text"
                  :disabled="controlsDisabled"
                >
              </div>

              <div class="form-field">
                <label for="work-payer-name">{{ t('workPayerNameLabel') }}</label>
                <input id="work-payer-name" v-model="form.work.payerName" type="text" :disabled="controlsDisabled">
              </div>

              <div class="form-field form-field-wide">
                <label for="work-theme-setting">{{ t('workThemeAndSettingLabel') }}</label>
                <textarea
                  id="work-theme-setting"
                  v-model="form.work.themeAndSetting"
                  rows="5"
                  :disabled="controlsDisabled"
                />
              </div>

              <div class="form-field form-field-wide">
                <label for="work-exhibition-info">{{ t('workExhibitionInfoLabel') }}</label>
                <textarea
                  id="work-exhibition-info"
                  v-model="form.work.exhibitionInfo"
                  rows="4"
                  :disabled="controlsDisabled"
                />
              </div>
            </div>

            <div class="checkbox-grid">
              <label class="checkbox-field">
                <input v-model="form.work.usagePermission" type="checkbox" :disabled="controlsDisabled">
                <span>{{ t('workUsagePermissionLabel') }}</span>
              </label>
              <label class="checkbox-field">
                <input v-model="form.work.termsAccepted" type="checkbox" :disabled="controlsDisabled">
                <span>{{ t('workTermsAcceptedLabel') }}</span>
              </label>
            </div>
            <details class="submission-terms-details">
              <summary>{{ t('submissionTermsDetails') }}</summary>
              <p>{{ t('submissionTermsPlaceholder') }}</p>
            </details>
          </section>

          <div class="form-actions submission-editor-actions">
            <button class="btn btn-primary auth-submit" type="submit" :disabled="controlsDisabled">
              {{ isSaving ? t('submissionSavePending') : t('submissionSave') }}
            </button>
            <button
              v-if="!isReadOnly"
              class="btn btn-outline auth-submit"
              type="button"
              :disabled="controlsDisabled"
              @click="proceedToPayment"
            >
              {{ isProceedingToPayment ? t('submissionProceedPending') : t('submissionProceedToPayment') }}
            </button>
            <RouterLink class="auth-link" to="/dashboard">{{ t('submissionBackToDashboard') }}</RouterLink>
          </div>
        </form>

        <section class="submission-editor-section submission-file-section" :aria-labelledby="filesHeadingId">
          <div class="dashboard-section-heading">
            <h3 :id="filesHeadingId">{{ t('submissionFilesTitle') }}</h3>
          </div>

          <div class="submission-file-groups">
            <article v-for="fileType in visibleFileTypes" :key="fileType" class="submission-file-group">
              <div class="submission-file-group-header">
                <h4>{{ fileTypeLabel(fileType) }}</h4>
                <label
                  v-if="fileType !== 'unedited_original_ai'"
                  class="file-upload-control"
                  :class="{ 'is-disabled': uploadDisabled }"
                >
                  <span>
                    {{ uploadingType === fileType ? t('submissionUploadPending') : t('submissionUploadFile') }}
                  </span>
                  <input
                    type="file"
                    :accept="acceptedUploadTypes"
                    :aria-label="uploadAriaLabel(fileType)"
                    :disabled="uploadDisabled"
                    @change="uploadFile(fileType, $event)"
                  >
                </label>
              </div>

              <p v-if="uploadErrors[fileType]" class="form-error" role="alert" aria-live="polite">
                {{ uploadErrors[fileType] }}
              </p>

              <div v-if="groupedFiles[fileType].length === 0" class="dashboard-empty" role="status">
                <p>{{ t('submissionNoFiles') }}</p>
              </div>

              <div v-else class="dashboard-table-wrap submission-file-table-wrap">
                <table class="dashboard-table submission-file-table">
                  <thead>
                    <tr>
                      <th scope="col">{{ t('submissionFileNameLabel') }}</th>
                      <th scope="col">{{ t('submissionFileSizeLabel') }}</th>
                      <th scope="col">{{ t('submissionFileUploadedAtLabel') }}</th>
                      <th scope="col">{{ t('dashboardSubmissionAction') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="file in groupedFiles[fileType]" :key="file.id">
                      <td :data-label="t('submissionFileNameLabel')">{{ file.originalFilename }}</td>
                      <td :data-label="t('submissionFileSizeLabel')">{{ formatBytes(file.sizeBytes) }}</td>
                      <td :data-label="t('submissionFileUploadedAtLabel')">{{ formatDateTime(file.uploadedAt) }}</td>
                      <td :data-label="t('dashboardSubmissionAction')">
                        <button
                          class="auth-text-button"
                          type="button"
                          :aria-label="deleteFileAriaLabel(file)"
                          :disabled="deleteDisabled"
                          @click="deleteFile(file.id)"
                        >
                          {{ isDeletingFile(file.id) ? t('submissionDeletePending') : t('submissionDeleteFile') }}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </section>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import type { TranslationKey } from '../../i18n/translations'
import {
  ApiClientError,
  createSubmission,
  deleteSubmissionFile,
  getSubmission,
  submitSubmission,
  updateSubmission,
  uploadSubmissionFile,
} from '../../services/api'
import type {
  CertificateLanguage,
  Submission,
  SubmissionDivision,
  SubmissionFile,
  SubmissionFileType,
  SubmissionProfile,
  SubmissionStatus,
  SubmissionWork,
  UpdateSubmissionRequest,
} from '../../types/api'

const props = defineProps<{
  t: (key: TranslationKey) => string
}>()

const route = useRoute()
const router = useRouter()

const maxUploadBytes = 10 * 1024 * 1024
const acceptedUploadTypes = 'image/jpeg,image/png,image/webp'
const allowedContentTypes = new Set(acceptedUploadTypes.split(','))

const divisionOptions: SubmissionDivision[] = ['2d', '3d', 'ai', 'corporate']
const allFileTypes: SubmissionFileType[] = [
  'online_a4_image',
  'physical_a2_image',
  'process_or_prompt_screenshot',
  'unedited_original_ai',
]
const guidelineFileTypes: SubmissionFileType[] = [
  'online_a4_image',
  'physical_a2_image',
  'process_or_prompt_screenshot',
]

const divisionHeadingId = 'submission-division-heading'
const profileHeadingId = 'submission-profile-heading'
const workHeadingId = 'submission-work-heading'
const filesHeadingId = 'submission-files-heading'

const submission = ref<Submission | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const isProceedingToPayment = ref(false)
const loadError = ref('')
const saveError = ref('')
const saveSuccess = ref('')
const uploadingType = ref<SubmissionFileType | null>(null)
const uploadErrors = reactive<Record<SubmissionFileType, string>>(emptyUploadErrors())
const deletingFileIds = ref<Set<string>>(new Set())
let loadSequence = 0

const form = reactive<UpdateSubmissionRequest>({
  division: '2d',
  profile: emptyProfile(),
  work: emptyWork(),
})

const isReadOnly = computed(() => submission.value?.status !== 'draft')
const hasDeletingFiles = computed(() => deletingFileIds.value.size > 0)
const hasActiveUpload = computed(() => uploadingType.value !== null)
const hasFileMutation = computed(() => hasActiveUpload.value || hasDeletingFiles.value)
const controlsDisabled = computed(() => (
  isReadOnly.value
  || isSaving.value
  || isProceedingToPayment.value
  || hasFileMutation.value
))
const uploadDisabled = computed(() => (
  isReadOnly.value
  || isSaving.value
  || isProceedingToPayment.value
  || hasFileMutation.value
))
const deleteDisabled = computed(() => (
  isReadOnly.value
  || isSaving.value
  || isProceedingToPayment.value
  || hasActiveUpload.value
  || hasDeletingFiles.value
))

const groupedFiles = computed<Record<SubmissionFileType, SubmissionFile[]>>(() => {
  const groups: Record<SubmissionFileType, SubmissionFile[]> = {
    online_a4_image: [],
    physical_a2_image: [],
    process_or_prompt_screenshot: [],
    unedited_original_ai: [],
  }

  for (const file of submission.value?.files ?? []) {
    groups[file.fileType].push(file)
  }

  return groups
})

const visibleFileTypes = computed<SubmissionFileType[]>(() => (
  groupedFiles.value.unedited_original_ai.length > 0
    ? [...guidelineFileTypes, 'unedited_original_ai']
    : guidelineFileTypes
))

watch(
  () => `${String(route.name)}:${routeSubmissionId() ?? ''}`,
  () => {
    void initialize()
  },
  { immediate: true },
)

async function initialize() {
  const sequence = ++loadSequence
  isLoading.value = true
  isSaving.value = false
  isProceedingToPayment.value = false
  loadError.value = ''
  saveError.value = ''
  saveSuccess.value = ''
  uploadingType.value = null
  deletingFileIds.value = new Set()
  resetUploadErrors()

  try {
    if (route.name === 'submission-new') {
      const response = await createSubmission({ division: '2d' })
      if (sequence !== loadSequence || route.name !== 'submission-new') {
        return
      }
      applySubmission(response.submission)
      await router.replace(`/submissions/${response.submission.id}`)
      return
    }

    const id = routeSubmissionId()
    if (!id) {
      throw new Error('Missing submission id')
    }

    const loadedSubmission = await fetchSubmission(id)
    if (sequence === loadSequence && isCurrentSubmissionRoute(loadedSubmission.id)) {
      applySubmission(loadedSubmission)
    }
  } catch (error) {
    if (sequence === loadSequence) {
      loadError.value = translatedError(error, 'submissionLoadError')
      submission.value = null
    }
  } finally {
    if (sequence === loadSequence) {
      isLoading.value = false
    }
  }
}

async function fetchSubmission(id: string) {
  const response = await getSubmission(id)
  return response.submission
}

function applySubmission(nextSubmission: Submission) {
  submission.value = nextSubmission
  form.division = nextSubmission.division
  form.profile = { ...nextSubmission.profile }
  form.work = { ...nextSubmission.work }
}

async function saveSubmission() {
  if (!submission.value || controlsDisabled.value) {
    return
  }

  const submissionId = submission.value.id
  isSaving.value = true
  saveError.value = ''
  saveSuccess.value = ''

  try {
    const response = await updateSubmission(submissionId, {
      division: form.division,
      profile: { ...form.profile },
      work: { ...form.work },
    })
    if (isCurrentSubmissionRoute(submissionId)) {
      applySubmission(response.submission)
      saveSuccess.value = props.t('submissionSaveSuccess')
    }
  } catch (error) {
    if (isCurrentSubmissionRoute(submissionId)) {
      saveError.value = translatedError(error, 'submissionSaveError')
    }
  } finally {
    if (isCurrentSubmissionRoute(submissionId)) {
      isSaving.value = false
    }
  }
}

async function proceedToPayment() {
  if (!submission.value || controlsDisabled.value) {
    return
  }

  const submissionId = submission.value.id
  isProceedingToPayment.value = true
  saveError.value = ''
  saveSuccess.value = ''

  try {
    const response = await submitSubmission(submissionId)
    if (isCurrentSubmissionRoute(submissionId)) {
      applySubmission(response.submission)
      await router.push(`/submissions/${submissionId}/payment`)
    }
  } catch (error) {
    if (isCurrentSubmissionRoute(submissionId)) {
      saveError.value = translatedError(error, 'submissionProceedError')
    }
  } finally {
    if (isCurrentSubmissionRoute(submissionId)) {
      isProceedingToPayment.value = false
    }
  }
}

async function uploadFile(fileType: SubmissionFileType, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file || !submission.value || isReadOnly.value || uploadDisabled.value) {
    return
  }

  const submissionId = submission.value.id
  uploadErrors[fileType] = ''

  if (!allowedContentTypes.has(file.type)) {
    uploadErrors[fileType] = props.t('submissionUploadTypeError')
    return
  }

  if (file.size > maxUploadBytes) {
    uploadErrors[fileType] = props.t('submissionUploadSizeError')
    return
  }

  uploadingType.value = fileType

  try {
    const buffer = await file.arrayBuffer()
    if (buffer.byteLength > maxUploadBytes) {
      uploadErrors[fileType] = props.t('submissionUploadSizeError')
      return
    }

    const response = await uploadSubmissionFile(submissionId, {
      fileType,
      filename: file.name,
      contentType: file.type,
      dataBase64: arrayBufferToBase64(buffer),
    })
    if (isCurrentSubmissionRoute(submissionId)) {
      applySubmission(response.submission)
    }
  } catch (error) {
    if (isCurrentSubmissionRoute(submissionId)) {
      uploadErrors[fileType] = translatedError(error, 'submissionUploadError')
    }
  } finally {
    if (isCurrentSubmissionRoute(submissionId)) {
      uploadingType.value = null
    }
  }
}

async function deleteFile(fileId: string) {
  if (!submission.value || isReadOnly.value || deleteDisabled.value) {
    return
  }

  const submissionId = submission.value.id
  setFileDeleting(fileId, true)
  saveError.value = ''

  try {
    await deleteSubmissionFile(submissionId, fileId)
    const loadedSubmission = await fetchSubmission(submissionId)
    if (isCurrentSubmissionRoute(submissionId)) {
      applySubmission(loadedSubmission)
    }
  } catch (error) {
    if (isCurrentSubmissionRoute(submissionId)) {
      saveError.value = translatedError(error, 'submissionDeleteError')
    }
  } finally {
    if (isCurrentSubmissionRoute(submissionId)) {
      setFileDeleting(fileId, false)
    }
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return window.btoa(binary)
}

function emptyProfile(): SubmissionProfile {
  return {
    lastName: '',
    firstName: '',
    penName: '',
    email: '',
    phone: '',
    countryRegion: '',
    city: '',
    postalCode: '',
    prefecture: '',
    occupation: '',
    school: '',
    address: '',
    wechatId: '',
    certificateLanguage: 'ja' satisfies CertificateLanguage,
  }
}

function emptyWork(): SubmissionWork {
  return {
    characterName: '',
    themeAndSetting: '',
    exhibitionInfo: '',
    payerName: '',
    usagePermission: false,
    termsAccepted: false,
  }
}

function emptyUploadErrors(): Record<SubmissionFileType, string> {
  return {
    online_a4_image: '',
    physical_a2_image: '',
    process_or_prompt_screenshot: '',
    unedited_original_ai: '',
  }
}

function resetUploadErrors() {
  const empty = emptyUploadErrors()
  for (const fileType of allFileTypes) {
    uploadErrors[fileType] = empty[fileType]
  }
}

function setFileDeleting(fileId: string, isDeleting: boolean) {
  const next = new Set(deletingFileIds.value)
  if (isDeleting) {
    next.add(fileId)
  } else {
    next.delete(fileId)
  }
  deletingFileIds.value = next
}

function isDeletingFile(fileId: string) {
  return deletingFileIds.value.has(fileId)
}

function routeSubmissionId() {
  const id = route.params.id
  return typeof id === 'string' ? id : id?.[0]
}

function isCurrentSubmissionRoute(submissionId: string) {
  return route.name === 'submission-edit' && routeSubmissionId() === submissionId
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

function fileTypeLabel(fileType: SubmissionFileType) {
  const keyByFileType: Record<SubmissionFileType, TranslationKey> = {
    online_a4_image: 'submissionFileOnlineA4Image',
    physical_a2_image: 'submissionFilePhysicalA2Image',
    process_or_prompt_screenshot: 'submissionFileProcessScreenshot',
    unedited_original_ai: 'submissionFileUneditedOriginalAi',
  }
  return props.t(keyByFileType[fileType])
}

function uploadAriaLabel(fileType: SubmissionFileType) {
  return `${props.t('submissionUploadFile')}: ${fileTypeLabel(fileType)}`
}

function deleteFileAriaLabel(file: SubmissionFile) {
  return `${props.t('submissionDeleteFile')}: ${file.originalFilename}`
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

function translatedError(error: unknown, fallback: TranslationKey) {
  if (error instanceof ApiClientError) {
    const keyByCode: Record<string, TranslationKey> = {
      bad_request: 'apiErrorBadRequest',
      unauthorized: 'apiErrorUnauthorized',
      forbidden: 'apiErrorUnauthorized',
      not_found: 'submissionLoadError',
      conflict: 'apiErrorConflict',
      invalid_submission: 'apiErrorInvalidSubmission',
      request_failed: 'apiErrorRequestFailed',
    }
    return props.t(keyByCode[error.code] ?? fallback)
  }

  return props.t(fallback)
}
</script>
