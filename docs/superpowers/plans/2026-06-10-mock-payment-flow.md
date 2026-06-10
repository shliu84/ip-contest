# Mock Payment Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let applicants submit complete draft entries into a sandbox payment flow and simulate successful payment so entries become official `submitted` records.

**Architecture:** Add two applicant-only Pages Functions: a draft submit endpoint under the submission resource and a sandbox mock payment confirmation endpoint under payments. Reuse the existing submission mapper, ownership checks, write-time status predicates, API client pattern, and auth/dashboard styling. Keep Stripe out of scope so a later Stripe plan can replace only the payment provider boundary.

**Tech Stack:** Cloudflare Pages Functions, D1, R2 metadata already in D1, Vue 3, Vue Router, TypeScript, Vitest with `cloudflare:test`.

---

## File Structure

- Create `functions/api/submissions/[id]/submit.ts`: validates owned draft submissions and moves them to `payment_pending`.
- Create `functions/api/payments/mock-confirm.ts`: validates owned `payment_pending` submissions and moves them to `submitted`.
- Modify `functions/_lib/submissions.ts`: add payment validation/status helpers; keep mapping logic here.
- Modify `test/submissions.spec.ts`: add submit and mock-confirm endpoint helpers plus API tests.
- Modify `src/types/api.ts`: add `MockConfirmPaymentRequest`.
- Modify `src/services/api.ts`: add `submitSubmission()` and `mockConfirmPayment()`.
- Modify `src/i18n/translations.ts`: add localized payment and submit labels/errors.
- Modify `src/views/applicant/SubmissionEditorPage.vue`: add "Proceed to Payment" for drafts and call submit endpoint.
- Modify `src/views/applicant/PaymentPage.vue`: replace the current stub with a state-backed mock payment page.
- Modify `src/views/applicant/PaymentSuccessPage.vue`: replace the current stub with submitted-state confirmation.
- Modify `src/views/applicant/PaymentCancelPage.vue`: replace the current stub with recovery navigation.
- Do not modify `src/styles/auth.css` in this plan unless build or review finds an actual layout defect; the planned UI reuses existing `auth-panel`, `dashboard-summary`, `form-actions`, `form-success`, and `form-error` styles.

---

### Task 1: Add Submit And Mock Payment API Tests

**Files:**
- Modify: `test/submissions.spec.ts`

- [ ] **Step 1: Add endpoint imports and test helpers**

Add imports near the existing submission endpoint imports:

```ts
import { onRequestPost as onRequestPostSubmit } from '../functions/api/submissions/[id]/submit'
import { onRequestPost as onRequestPostMockConfirm } from '../functions/api/payments/mock-confirm'
```

Add helpers after `deleteSubmissionFile()`:

```ts
async function submitSubmission(submissionId: string, cookie: string | undefined) {
  return await onRequestPostSubmit(pagesContext(new Request(
    `https://contest.example.com/api/submissions/${submissionId}/submit`,
    {
      method: 'POST',
      headers: cookie ? { cookie } : {},
    },
  )))
}

async function mockConfirmPayment(cookie: string | undefined, body: unknown) {
  return await onRequestPostMockConfirm(pagesContext(new Request(
    'https://contest.example.com/api/payments/mock-confirm',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(body),
    },
  )))
}

function completeSubmissionUpdate(email: string) {
  return {
    division: '2d',
    profile: {
      lastName: 'Yamada',
      firstName: 'Aki',
      penName: '',
      email,
      phone: '',
      countryRegion: 'Japan',
      city: '',
      postalCode: '',
      prefecture: '',
      occupation: '',
      school: '',
      address: '',
      wechatId: '',
      certificateLanguage: 'ja',
    },
    work: {
      characterName: 'Mira',
      themeAndSetting: 'Near-future festival',
      exhibitionInfo: '',
      payerName: 'Aki Yamada',
      usagePermission: true,
      termsAccepted: true,
    },
  }
}

async function createCompleteDraft(cookie: string, email: string) {
  const createResponse = await createSubmission(cookie, { division: '2d' })
  const createBody = await jsonBody<SubmissionResponseBody>(createResponse)
  await updateSubmission(createBody.submission.id, cookie, completeSubmissionUpdate(email))
  await uploadSubmissionFile(createBody.submission.id, cookie, {
    fileType: 'online_a4_image',
    filename: 'entry.png',
    contentType: 'image/png',
    dataBase64: btoa('png-bytes'),
  })
  return createBody.submission.id
}
```

- [ ] **Step 2: Add draft submit tests**

Append these tests inside `describe('/api/submissions', () => { ... })`:

```ts
it('submits a complete draft for mock payment', async () => {
  const user = await insertUser()
  const cookie = await sessionCookie(user.id)
  const submissionId = await createCompleteDraft(cookie, user.email)

  const response = await submitSubmission(submissionId, cookie)
  const body = await jsonBody<SubmissionResponseBody>(response)

  expect(response.status).toBe(200)
  expect(body.submission).toMatchObject({
    id: submissionId,
    status: 'payment_pending',
    paidAt: null,
    submittedAt: null,
  })
})

it('rejects incomplete drafts before payment', async () => {
  const user = await insertUser()
  const cookie = await sessionCookie(user.id)
  const createResponse = await createSubmission(cookie, { division: '2d' })
  const createBody = await jsonBody<SubmissionResponseBody>(createResponse)

  const response = await submitSubmission(createBody.submission.id, cookie)
  const body = await jsonBody<{ error: { code: string } }>(response)

  expect(response.status).toBe(400)
  expect(body.error.code).toBe('bad_request')
})

it('requires ownership and draft status when submitting for payment', async () => {
  const owner = await insertUser()
  const other = await insertUser()
  const ownerCookie = await sessionCookie(owner.id)
  const otherCookie = await sessionCookie(other.id)
  const submissionId = await createCompleteDraft(ownerCookie, owner.email)

  await expect(submitSubmission(submissionId, otherCookie))
    .resolves.toMatchObject({ status: 404 })
  await expect(submitSubmission(submissionId, ownerCookie))
    .resolves.toMatchObject({ status: 200 })
  await expect(submitSubmission(submissionId, ownerCookie))
    .resolves.toMatchObject({ status: 409 })
})
```

- [ ] **Step 3: Add mock payment tests**

Append:

```ts
it('mock-confirms a payment pending submission as submitted', async () => {
  const user = await insertUser()
  const cookie = await sessionCookie(user.id)
  const submissionId = await createCompleteDraft(cookie, user.email)
  await submitSubmission(submissionId, cookie)

  const response = await mockConfirmPayment(cookie, { submissionId })
  const body = await jsonBody<SubmissionResponseBody>(response)

  expect(response.status).toBe(200)
  expect(body.submission.status).toBe('submitted')
  expect(body.submission.paidAt).toMatch(/^2026-|^20/)
  expect(body.submission.submittedAt).toMatch(/^2026-|^20/)

  await expect(updateSubmission(submissionId, cookie, completeSubmissionUpdate(user.email)))
    .resolves.toMatchObject({ status: 409 })
  await expect(uploadSubmissionFile(submissionId, cookie, {
    fileType: 'online_a4_image',
    filename: 'after-submit.png',
    contentType: 'image/png',
    dataBase64: btoa('png'),
  })).resolves.toMatchObject({ status: 409 })
})

it('requires ownership and payment_pending status for mock confirmation', async () => {
  const owner = await insertUser()
  const other = await insertUser()
  const ownerCookie = await sessionCookie(owner.id)
  const otherCookie = await sessionCookie(other.id)
  const submissionId = await createCompleteDraft(ownerCookie, owner.email)

  await expect(mockConfirmPayment(ownerCookie, { submissionId }))
    .resolves.toMatchObject({ status: 409 })
  await submitSubmission(submissionId, ownerCookie)
  await expect(mockConfirmPayment(otherCookie, { submissionId }))
    .resolves.toMatchObject({ status: 404 })
  await expect(mockConfirmPayment(ownerCookie, { submissionId }))
    .resolves.toMatchObject({ status: 200 })
  await expect(mockConfirmPayment(ownerCookie, { submissionId }))
    .resolves.toMatchObject({ status: 409 })
})
```

- [ ] **Step 4: Run tests to verify failure**

Run: `npm test -- test/submissions.spec.ts`

Expected: FAIL because `functions/api/submissions/[id]/submit` and `functions/api/payments/mock-confirm` do not exist yet.

- [ ] **Step 5: Commit failing tests**

Do not commit failing tests alone. Keep them unstaged until Task 2 implementation makes them pass.

---

### Task 2: Implement Submit And Mock Payment APIs

**Files:**
- Create: `functions/api/submissions/[id]/submit.ts`
- Create: `functions/api/payments/mock-confirm.ts`
- Modify: `functions/_lib/submissions.ts`
- Test: `test/submissions.spec.ts`

- [ ] **Step 1: Add validation helpers**

In `functions/_lib/submissions.ts`, add after `assertDraft()`:

```ts
export function assertPaymentPending(status: SubmissionStatus) {
  if (status !== 'payment_pending') {
    throw new ApiRequestError('invalid_submission', 'Only payment pending submissions can be confirmed', 409)
  }
}

export function assertReadyForPayment(submission: ReturnType<typeof mapSubmission>) {
  const missingProfile = [
    submission.profile.lastName,
    submission.profile.firstName,
    submission.profile.email,
    submission.profile.countryRegion,
  ].some((value) => value.trim().length === 0)
  const missingWork = [
    submission.work.characterName,
    submission.work.themeAndSetting,
    submission.work.payerName,
  ].some((value) => value.trim().length === 0)

  if (
    missingProfile
    || missingWork
    || !submission.work.usagePermission
    || !submission.work.termsAccepted
    || submission.files.length === 0
  ) {
    throw new ApiRequestError('bad_request', 'Submission is incomplete', 400)
  }
}
```

If TypeScript rejects `ReturnType<typeof mapSubmission>` because `mapSubmission` is declared later, move the helper below `mapSubmission` or introduce:

```ts
export type SubmissionModel = ReturnType<typeof mapSubmission>
```

after `mapSubmission`, then use `SubmissionModel`.

- [ ] **Step 2: Create submit endpoint**

Create `functions/api/submissions/[id]/submit.ts`:

```ts
import type { AppEnv } from '../../../_lib/env'
import { requireApplicant } from '../../../_lib/authz'
import { ApiRequestError, handleApi, json } from '../../../_lib/http'
import {
  assertDraft,
  assertReadyForPayment,
  changedRows,
  loadSubmission,
} from '../../../_lib/submissions'

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const submissionId = submissionIdFromContext(context)
    const submission = await loadSubmission(context.env.DB, submissionId, user.id)
    if (!submission) {
      throw new ApiRequestError('not_found', 'Submission not found', 404)
    }
    assertDraft(submission.status)
    assertReadyForPayment(submission)

    const nowIso = new Date().toISOString()
    const result = await context.env.DB.prepare(
      `UPDATE submissions
       SET status = 'payment_pending',
           updated_at = ?
       WHERE id = ? AND user_id = ? AND status = 'draft'`,
    )
      .bind(nowIso, submissionId, user.id)
      .run()
    if (changedRows(result) === 0) {
      throw new ApiRequestError('invalid_submission', 'Only draft submissions can be changed', 409)
    }

    const updatedSubmission = await loadSubmission(context.env.DB, submissionId, user.id)
    if (!updatedSubmission) {
      throw new ApiRequestError('server_error', 'Updated submission could not be loaded', 500)
    }

    return json({ submission: updatedSubmission }, { headers: NO_STORE_HEADERS })
  })
}

function submissionIdFromContext(context: Parameters<PagesFunction<AppEnv>>[0]) {
  const idParam = context.params.id
  if (typeof idParam === 'string' && idParam.length > 0) {
    return idParam
  }
  if (Array.isArray(idParam) && typeof idParam[0] === 'string' && idParam[0].length > 0) {
    return idParam[0]
  }

  const segments = new URL(context.request.url).pathname.split('/').filter(Boolean)
  const submissionsIndex = segments.indexOf('submissions')
  const fallbackId = submissionsIndex >= 0 ? segments[submissionsIndex + 1] : undefined
  if (fallbackId) {
    return decodeURIComponent(fallbackId)
  }

  throw new ApiRequestError('not_found', 'Submission not found', 404)
}
```

- [ ] **Step 3: Create mock confirm endpoint**

Create `functions/api/payments/mock-confirm.ts`:

```ts
import type { AppEnv } from '../../_lib/env'
import { requireApplicant } from '../../_lib/authz'
import { ApiRequestError, handleApi, json, readJson } from '../../_lib/http'
import {
  assertPaymentPending,
  assertRecord,
  changedRows,
  loadSubmission,
} from '../../_lib/submissions'

type MockConfirmBody = {
  submissionId?: unknown
}

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const body = await readJson<MockConfirmBody>(context.request)
    assertRecord(body)
    if (typeof body.submissionId !== 'string' || body.submissionId.length === 0) {
      throw new ApiRequestError('bad_request', 'Invalid submission id', 400)
    }

    const submission = await loadSubmission(context.env.DB, body.submissionId, user.id)
    if (!submission) {
      throw new ApiRequestError('not_found', 'Submission not found', 404)
    }
    assertPaymentPending(submission.status)

    const nowIso = new Date().toISOString()
    const result = await context.env.DB.prepare(
      `UPDATE submissions
       SET status = 'submitted',
           paid_at = ?,
           submitted_at = ?,
           updated_at = ?
       WHERE id = ? AND user_id = ? AND status = 'payment_pending'`,
    )
      .bind(nowIso, nowIso, nowIso, body.submissionId, user.id)
      .run()
    if (changedRows(result) === 0) {
      throw new ApiRequestError('invalid_submission', 'Only payment pending submissions can be confirmed', 409)
    }

    const updatedSubmission = await loadSubmission(context.env.DB, body.submissionId, user.id)
    if (!updatedSubmission) {
      throw new ApiRequestError('server_error', 'Updated submission could not be loaded', 500)
    }

    return json({ submission: updatedSubmission }, { headers: NO_STORE_HEADERS })
  })
}
```

- [ ] **Step 4: Run target tests**

Run: `npm test -- test/submissions.spec.ts`

Expected: PASS for all submission tests.

- [ ] **Step 5: Run typecheck**

Run: `npm run test:typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add functions/_lib/submissions.ts functions/api/submissions/[id]/submit.ts functions/api/payments/mock-confirm.ts test/submissions.spec.ts
git commit -m "feat: add mock payment submission APIs"
```

---

### Task 3: Add Frontend API Client Types

**Files:**
- Modify: `src/types/api.ts`
- Modify: `src/services/api.ts`

- [ ] **Step 1: Add request type**

In `src/types/api.ts`, add after `UploadSubmissionFileRequest`:

```ts
export type MockConfirmPaymentRequest = {
  submissionId: string
}
```

- [ ] **Step 2: Import type in API client**

In `src/services/api.ts`, include `MockConfirmPaymentRequest` in the type import list:

```ts
import type {
  ApiOkResponse,
  CreateSubmissionRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  MockConfirmPaymentRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SubmissionListResponse,
  SubmissionResponse,
  UpdateSubmissionRequest,
  UploadSubmissionFileRequest,
} from '../types/api'
```

- [ ] **Step 3: Add client functions**

Append after `deleteSubmissionFile()`:

```ts
export function submitSubmission(id: string) {
  return apiFetch<SubmissionResponse>(`/api/submissions/${encodeURIComponent(id)}/submit`, {
    method: 'POST',
  })
}

export function mockConfirmPayment(body: MockConfirmPaymentRequest) {
  return apiFetch<SubmissionResponse>('/api/payments/mock-confirm', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
```

- [ ] **Step 4: Run typecheck/build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/api.ts src/services/api.ts
git commit -m "feat: add mock payment api client"
```

---

### Task 4: Add Submit-To-Payment Action In Editor

**Files:**
- Modify: `src/views/applicant/SubmissionEditorPage.vue`
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Add translation keys**

In `src/i18n/translations.ts`, add to `TranslationKey`:

```ts
  | 'submissionProceedToPayment'
  | 'submissionProceedPending'
  | 'submissionProceedError'
```

Add zh translations near submission editor strings:

```ts
    submissionProceedToPayment: '进入付款',
    submissionProceedPending: '正在准备付款...',
    submissionProceedError: '无法进入付款，请检查投稿内容后重试。',
```

Add ja:

```ts
    submissionProceedToPayment: '支払いへ進む',
    submissionProceedPending: '支払い準備中...',
    submissionProceedError: '支払いへ進めませんでした。応募内容を確認して再度お試しください。',
```

Add en:

```ts
    submissionProceedToPayment: 'Proceed to Payment',
    submissionProceedPending: 'Preparing payment...',
    submissionProceedError: 'Payment could not be prepared. Please check the submission and try again.',
```

- [ ] **Step 2: Import API function**

In `SubmissionEditorPage.vue`, add `submitSubmission` to the existing API import:

```ts
import {
  ApiClientError,
  createSubmission,
  deleteSubmissionFile,
  getSubmission,
  submitSubmission,
  updateSubmission,
  uploadSubmissionFile,
} from '../../services/api'
```

- [ ] **Step 3: Add pending state**

Add near `isSaving`:

```ts
const isProceedingToPayment = ref(false)
```

Update `controlsDisabled`:

```ts
const controlsDisabled = computed(() => (
  isReadOnly.value
  || isSaving.value
  || isProceedingToPayment.value
  || hasFileMutation.value
))
```

Update `uploadDisabled` and `deleteDisabled` similarly to include `isProceedingToPayment.value`.

- [ ] **Step 4: Add button in form actions**

Inside `.submission-editor-actions`, after Save button:

```vue
<button
  v-if="!isReadOnly"
  class="btn btn-outline auth-submit"
  type="button"
  :disabled="controlsDisabled"
  @click="proceedToPayment"
>
  {{ isProceedingToPayment ? t('submissionProceedPending') : t('submissionProceedToPayment') }}
</button>
```

- [ ] **Step 5: Add handler**

Add after `saveSubmission()`:

```ts
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
```

- [ ] **Step 6: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/views/applicant/SubmissionEditorPage.vue src/i18n/translations.ts
git commit -m "feat: proceed from draft to payment"
```

---

### Task 5: Implement Mock Payment Page

**Files:**
- Modify: `src/views/applicant/PaymentPage.vue`
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Add payment translations**

Add keys:

```ts
  | 'paymentKicker'
  | 'paymentTitle'
  | 'paymentLead'
  | 'paymentLoading'
  | 'paymentLoadError'
  | 'paymentMockConfirm'
  | 'paymentMockConfirmPending'
  | 'paymentMockConfirmError'
  | 'paymentBackToEditor'
  | 'paymentAlreadySubmitted'
  | 'paymentUnavailable'
```

Add concise zh/ja/en values. Use standard action copy, not themed labels:

```ts
paymentKicker: '付款',
paymentTitle: '确认付款',
paymentLead: '确认投稿金额，并在沙盒环境中模拟付款成功。',
paymentLoading: '正在读取投稿...',
paymentLoadError: '无法读取付款信息，请稍后再试。',
paymentMockConfirm: '模拟付款成功',
paymentMockConfirmPending: '正在确认...',
paymentMockConfirmError: '无法确认付款，请稍后再试。',
paymentBackToEditor: '返回投稿编辑',
paymentAlreadySubmitted: '该投稿已完成提交。',
paymentUnavailable: '当前状态无法付款。',
```

- [ ] **Step 2: Replace `PaymentPage.vue`**

Use this structure:

```vue
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
      <p v-else-if="errorMessage" class="form-error" role="alert" aria-live="polite">
        {{ errorMessage }}
      </p>

      <template v-else-if="submission">
        <section class="dashboard-summary" :aria-label="t('submissionDetailsTitle')">
          <dl>
            <div><dt>{{ t('submissionNoLabel') }}</dt><dd>{{ submission.submissionNo }}</dd></div>
            <div><dt>{{ t('dashboardSubmissionWork') }}</dt><dd>{{ submission.work.characterName || t('dashboardUntitledSubmission') }}</dd></div>
            <div><dt>{{ t('dashboardSubmissionDivision') }}</dt><dd>{{ divisionLabel(submission.division) }}</dd></div>
            <div><dt>{{ t('dashboardSubmissionStatus') }}</dt><dd>{{ statusLabel(submission.status) }}</dd></div>
            <div><dt>{{ t('dashboardSubmissionFee') }}</dt><dd>{{ formatFee(submission.feeAmount, submission.currency) }}</dd></div>
          </dl>
        </section>

        <p v-if="actionMessage" class="form-success" role="status" aria-live="polite">{{ actionMessage }}</p>
        <p v-if="actionError" class="form-error" role="alert" aria-live="polite">{{ actionError }}</p>

        <div class="form-actions">
          <button
            v-if="submission.status === 'payment_pending'"
            class="btn btn-primary auth-submit"
            type="button"
            :disabled="isConfirming"
            @click="confirmPayment"
          >
            {{ isConfirming ? t('paymentMockConfirmPending') : t('paymentMockConfirm') }}
          </button>
          <RouterLink v-if="submission.status === 'draft'" class="auth-link" :to="`/submissions/${submission.id}`">
            {{ t('paymentBackToEditor') }}
          </RouterLink>
          <RouterLink class="auth-link" to="/dashboard">{{ t('submissionBackToDashboard') }}</RouterLink>
        </div>
      </template>
    </div>
  </main>
</template>
```

Implement script setup with `useRoute`, `useRouter`, `getSubmission`, `mockConfirmPayment`, the same label/format helpers used by editor/dashboard, and `translatedError()`.

- [ ] **Step 3: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/views/applicant/PaymentPage.vue src/i18n/translations.ts
git commit -m "feat: add mock payment page"
```

---

### Task 6: Implement Payment Success And Cancel Pages

**Files:**
- Modify: `src/views/applicant/PaymentSuccessPage.vue`
- Modify: `src/views/applicant/PaymentCancelPage.vue`
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Add success/cancel translations**

Add keys:

```ts
  | 'paymentSuccessTitle'
  | 'paymentSuccessLead'
  | 'paymentSuccessMissing'
  | 'paymentSubmittedAt'
  | 'paymentPaidAt'
  | 'paymentCancelTitle'
  | 'paymentCancelLead'
  | 'paymentReturnToPayment'
```

Add zh/ja/en values:

```ts
paymentSuccessTitle: '投稿已完成',
paymentSuccessLead: '付款已确认，投稿已正式提交。',
paymentSuccessMissing: '无法确认投稿信息。',
paymentSubmittedAt: '提交时间',
paymentPaidAt: '付款时间',
paymentCancelTitle: '付款已取消',
paymentCancelLead: '投稿仍保留在待付款状态。你可以返回付款页继续。',
paymentReturnToPayment: '返回付款页',
```

- [ ] **Step 2: Replace success page**

Implement `PaymentSuccessPage.vue` to:

- Read `submissionId` from `route.query.submissionId`.
- If missing, show `paymentSuccessMissing`.
- Load with `getSubmission(submissionId)`.
- Show submission number, status, `paidAt`, and `submittedAt`.
- Link to `/dashboard`.
- If loaded status is not `submitted`, also link to `/submissions/:id/payment`.

- [ ] **Step 3: Replace cancel page**

Implement `PaymentCancelPage.vue` to:

- Read optional `submissionId` from query.
- Show `paymentCancelTitle` and `paymentCancelLead`.
- If `submissionId` exists, link to `/submissions/:id/payment`.
- Always link to `/dashboard`.

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/applicant/PaymentSuccessPage.vue src/views/applicant/PaymentCancelPage.vue src/i18n/translations.ts
git commit -m "feat: add payment result pages"
```

---

### Task 7: Final Verification And Review

**Files:**
- Review all changed files.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm test
npm run test:typecheck
npm run build
```

Expected:

- `npm test`: all test files pass.
- `npm run test:typecheck`: exit 0.
- `npm run build`: exit 0.

- [ ] **Step 2: Inspect final diff**

Run:

```bash
git status --short --branch
git log --oneline --max-count=10
```

Expected:

- Working tree is clean after commits.
- Commits are focused and in the same branch.

- [ ] **Step 3: Request code review**

Use `superpowers:requesting-code-review` or a fresh review subagent to check:

- Submit endpoint validation and status predicates.
- Mock payment endpoint ownership and status predicates.
- Frontend routing around payment success/cancel.
- Accessibility of new buttons and status messages.
- No Stripe dependency or real payment implication.

- [ ] **Step 4: Fix review findings**

If review finds Critical or Important issues:

1. Use `superpowers:receiving-code-review`.
2. Verify the finding locally.
3. Add or update a failing test first.
4. Implement the smallest fix.
5. Re-run `npm test`, `npm run test:typecheck`, and `npm run build`.
6. Commit with a focused `fix:` message.

- [ ] **Step 5: Finish branch**

Use `superpowers:verification-before-completion`, then `superpowers:finishing-a-development-branch`.

---

## Self-Review

- Spec coverage: API submit, mock confirm, frontend editor/payment/success/cancel, data/security, and tests are each mapped to tasks.
- Scope check: this plan intentionally excludes Stripe SDK, webhook verification, refunds, admin payment reconciliation, and schema changes.
- Type consistency: uses existing `SubmissionResponse`, `SubmissionStatus`, `SubmissionDivision`, `ApiClientError`, and existing route paths.
- Open-item scan: no implementation step contains unresolved marker text or open-ended work.
