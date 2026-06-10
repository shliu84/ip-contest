# Draft Submissions And R2 Uploads Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let verified applicants create, list, read, update, and attach files to draft submissions before the Stripe payment phase.

**Architecture:** Pages Functions enforce authentication and ownership, D1 stores draft submission data and file metadata, and R2 stores uploaded file bytes under deterministic per-submission keys. The frontend uses the existing typed API client and session store to render an applicant dashboard and draft editor backed by the new APIs.

**Tech Stack:** Cloudflare Pages Functions, D1, R2, Web Crypto, Vue 3, Vue Router, TypeScript, Vitest 4, `@cloudflare/vitest-pool-workers`.

---

## File Structure

- Create: `functions/_lib/authz.ts`
  - Shared role and applicant-session guards.
- Create: `functions/_lib/submissions.ts`
  - Submission row mapping, fee calculation, payload validation, submission number generation, ownership queries, and draft mutability checks.
- Create: `functions/_lib/r2.ts`
  - Safe filename normalization and R2 object key creation.
- Create: `functions/api/submissions/index.ts`
  - `GET /api/submissions` and `POST /api/submissions`.
- Create: `functions/api/submissions/[id].ts`
  - `GET /api/submissions/:id` and `PATCH /api/submissions/:id`.
- Create: `functions/api/submissions/[id]/upload-url.ts`
  - Controlled direct upload endpoint for draft files.
- Create: `functions/api/submissions/[id]/files/[fileId].ts`
  - Delete draft file metadata and R2 object.
- Create: `test/submissions.spec.ts`
  - Backend coverage for auth, ownership, create/list/read/update, immutable statuses, upload metadata, R2 writes, and file delete.
- Modify: `functions/_lib/http.ts`
  - Add `invalid_submission` to `ApiErrorCode`.
- Modify: `src/types/api.ts`
  - Add typed submission request/response contracts.
- Modify: `src/services/api.ts`
  - Add submission API client helpers.
- Modify: `src/views/applicant/DashboardPage.vue`
  - Show submission list and create-draft action.
- Modify: `src/views/applicant/SubmissionEditorPage.vue`
  - Implement editable draft form and upload controls.
- Modify: `src/i18n/translations.ts`
  - Add dashboard/editor strings.
- Test: `npm test -- test/submissions.spec.ts`
- Verify: `npm test`, `npm run test:typecheck`, `npm run build`

---

## API Contracts

### Submission Types

Add these frontend/backend-aligned shapes to `src/types/api.ts`:

```ts
export type SubmissionDivision = '2d' | '3d' | 'ai' | 'corporate'

export type SubmissionStatus =
  | 'draft'
  | 'payment_pending'
  | 'submitted'
  | 'screening'
  | 'screened_in'
  | 'screened_out'
  | 'assigned'
  | 'reviewed'
  | 'withdrawn'

export type CertificateLanguage = 'ja' | 'en' | 'zh'

export type SubmissionFileType =
  | 'online_a4_image'
  | 'physical_a2_image'
  | 'process_or_prompt_screenshot'
  | 'unedited_original_ai'

export type SubmissionProfile = {
  lastName: string
  firstName: string
  penName: string
  email: string
  phone: string
  countryRegion: string
  city: string
  postalCode: string
  prefecture: string
  occupation: string
  school: string
  address: string
  wechatId: string
  certificateLanguage: CertificateLanguage
}

export type SubmissionWork = {
  characterName: string
  themeAndSetting: string
  exhibitionInfo: string
  payerName: string
  usagePermission: boolean
  termsAccepted: boolean
}

export type SubmissionFile = {
  id: string
  fileType: SubmissionFileType
  originalFilename: string
  contentType: string
  sizeBytes: number
  uploadedAt: string
}

export type Submission = {
  id: string
  submissionNo: string
  status: SubmissionStatus
  division: SubmissionDivision
  feeAmount: number
  currency: 'JPY'
  stripeCheckoutSessionId: string | null
  stripePaymentIntentId: string | null
  paidAt: string | null
  submittedAt: string | null
  createdAt: string
  updatedAt: string
  profile: SubmissionProfile
  work: SubmissionWork
  files: SubmissionFile[]
}

export type SubmissionListItem = Pick<
  Submission,
  'id' | 'submissionNo' | 'status' | 'division' | 'feeAmount' | 'currency' | 'createdAt' | 'updatedAt'
> & {
  characterName: string
  fileCount: number
}

export type SubmissionListResponse = {
  submissions: SubmissionListItem[]
}

export type SubmissionResponse = {
  submission: Submission
}

export type CreateSubmissionRequest = {
  division: SubmissionDivision
}

export type UpdateSubmissionRequest = {
  division: SubmissionDivision
  profile: SubmissionProfile
  work: SubmissionWork
}

export type UploadSubmissionFileRequest = {
  fileType: SubmissionFileType
  filename: string
  contentType: string
  dataBase64: string
}
```

### Backend Validation Rules

- Only authenticated users with role `applicant` can use applicant submission routes.
- `POST /api/submissions` accepts only `{ "division": "2d" | "3d" | "ai" | "corporate" }`.
- Backend derives fees:
  - `2d`, `3d`, `ai`: `10000`
  - `corporate`: `100000`
- Draft submissions are editable.
- `payment_pending`, `submitted`, and later statuses are read-only for applicant mutation.
- Applicants can only read, update, upload to, and delete files from their own submissions.
- `UploadSubmissionFileRequest.dataBase64` is decoded and stored in R2 by the endpoint. This MVP avoids signed upload complexity while preserving private bucket storage.
- Maximum upload size for this phase: 10 MiB after base64 decode.
- Allowed upload content types:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `application/pdf`

---

### Task 1: Add Submission Backend Helpers

**Files:**
- Create: `functions/_lib/authz.ts`
- Create: `functions/_lib/submissions.ts`
- Modify: `functions/_lib/http.ts`
- Test: `test/submissions.spec.ts`

- [ ] **Step 1: Write failing helper/API tests**

Add `test/submissions.spec.ts` with tests that import future submission endpoints and helper behavior:

```ts
import { env } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'
import { onRequestGet, onRequestPost } from '../functions/api/submissions/index'
import { hashPassword } from '../functions/_lib/password'
import { createSession } from '../functions/_lib/session'
import { pagesContext } from './helpers/pages-context'

async function insertUser(role: 'applicant' | 'committee' = 'applicant') {
  const user = {
    id: crypto.randomUUID(),
    email: `${crypto.randomUUID()}@example.com`,
    password: 'correct horse battery staple',
    role,
    emailVerifiedAt: '2026-06-10T04:00:00.000Z',
  }
  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, role, email_verified_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(user.id, user.email, await hashPassword(user.password), user.role, user.emailVerifiedAt)
    .run()
  return user
}

async function sessionCookie(userId: string) {
  const session = await createSession(env.DB, userId, 'https://contest.example.com')
  return session.cookie
}

async function createSubmission(cookie: string, body: unknown) {
  return await onRequestPost(pagesContext(new Request(
    'https://contest.example.com/api/submissions',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie,
      },
      body: JSON.stringify(body),
    },
  )))
}

async function listSubmissions(cookie?: string) {
  return await onRequestGet(pagesContext(new Request(
    'https://contest.example.com/api/submissions',
    {
      headers: cookie ? { cookie } : {},
    },
  )))
}

describe('/api/submissions', () => {
  it('requires an applicant session for listing and creating submissions', async () => {
    const noSessionList = await listSubmissions()
    expect(noSessionList.status).toBe(401)

    const committee = await insertUser('committee')
    const committeeCookie = await sessionCookie(committee.id)
    const committeeCreate = await createSubmission(committeeCookie, { division: '2d' })
    expect(committeeCreate.status).toBe(403)
  })

  it('creates a draft with server-derived fee and empty profile/work rows', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)

    const response = await createSubmission(cookie, { division: 'corporate' })

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.submission).toMatchObject({
      status: 'draft',
      division: 'corporate',
      feeAmount: 100000,
      currency: 'JPY',
      profile: {
        lastName: '',
        firstName: '',
        certificateLanguage: 'ja',
      },
      work: {
        characterName: '',
        usagePermission: false,
        termsAccepted: false,
      },
      files: [],
    })
    expect(body.submission.submissionNo).toMatch(/^AIPC2026-[0-9A-F]{8}$/)
  })

  it('lists only the current applicant submissions ordered newest first', async () => {
    const firstUser = await insertUser()
    const secondUser = await insertUser()
    const firstCookie = await sessionCookie(firstUser.id)
    const secondCookie = await sessionCookie(secondUser.id)

    await createSubmission(firstCookie, { division: '2d' })
    await createSubmission(secondCookie, { division: 'ai' })
    await createSubmission(firstCookie, { division: '3d' })

    const response = await listSubmissions(firstCookie)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.submissions).toHaveLength(2)
    expect(body.submissions.map((item: { division: string }) => item.division)).toEqual(['3d', '2d'])
  })
})
```

- [ ] **Step 2: Run the tests to verify RED**

Run:

```bash
npm test -- test/submissions.spec.ts
```

Expected: FAIL because `functions/api/submissions/index.ts` does not exist.

- [ ] **Step 3: Implement authz helper**

Create `functions/_lib/authz.ts`:

```ts
import { ApiRequestError } from './http'
import { getSessionUser, type SessionUser } from './session'

export async function requireUser(db: D1Database, request: Request): Promise<SessionUser> {
  const user = await getSessionUser(db, request)
  if (!user) {
    throw new ApiRequestError('unauthorized', 'Authentication required', 401)
  }
  return user
}

export async function requireApplicant(db: D1Database, request: Request): Promise<SessionUser> {
  const user = await requireUser(db, request)
  if (user.role !== 'applicant') {
    throw new ApiRequestError('forbidden', 'Applicant access required', 403)
  }
  return user
}
```

- [ ] **Step 4: Add `invalid_submission` error code**

Modify `functions/_lib/http.ts`:

```ts
export type ApiErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'email_not_verified'
  | 'email_delivery_failed'
  | 'invalid_submission'
  | 'server_error'
```

- [ ] **Step 5: Implement submission helper**

Create `functions/_lib/submissions.ts` with:

```ts
import { ApiRequestError } from './http'

export type SubmissionDivision = '2d' | '3d' | 'ai' | 'corporate'
export type SubmissionStatus =
  | 'draft'
  | 'payment_pending'
  | 'submitted'
  | 'screening'
  | 'screened_in'
  | 'screened_out'
  | 'assigned'
  | 'reviewed'
  | 'withdrawn'

export const DIVISIONS = ['2d', '3d', 'ai', 'corporate'] as const

export function isDivision(value: unknown): value is SubmissionDivision {
  return typeof value === 'string' && (DIVISIONS as readonly string[]).includes(value)
}

export function feeForDivision(division: SubmissionDivision) {
  return division === 'corporate' ? 100000 : 10000
}

export function assertRecord(value: unknown, message = 'Invalid request body'): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ApiRequestError('bad_request', message, 400)
  }
}

export function assertDraft(status: SubmissionStatus) {
  if (status !== 'draft') {
    throw new ApiRequestError('invalid_submission', 'Only draft submissions can be changed', 409)
  }
}

export function createSubmissionNo() {
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  const suffix = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())
    .join('')
  return `AIPC2026-${suffix}`
}
```

- [ ] **Step 6: Commit helper work**

Run:

```bash
npm test -- test/submissions.spec.ts
git add functions/_lib/authz.ts functions/_lib/http.ts functions/_lib/submissions.ts test/submissions.spec.ts
git commit -m "test: cover applicant submission creation"
```

Expected: tests still FAIL until Task 2 creates the endpoint. Commit is optional if executing tasks in larger batches; if not committing here, keep the diff focused.

---

### Task 2: Implement List And Create Submission APIs

**Files:**
- Create: `functions/api/submissions/index.ts`
- Modify: `functions/_lib/submissions.ts`
- Test: `test/submissions.spec.ts`

- [ ] **Step 1: Add row mapping helper**

Extend `functions/_lib/submissions.ts`:

```ts
type SubmissionDetailRow = {
  id: string
  submission_no: string
  status: SubmissionStatus
  division: SubmissionDivision
  fee_amount: number
  currency: 'JPY'
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  paid_at: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
  last_name: string
  first_name: string
  pen_name: string
  email: string
  phone: string
  country_region: string
  city: string
  postal_code: string
  prefecture: string
  occupation: string
  school: string
  address: string
  wechat_id: string
  certificate_language: 'ja' | 'en' | 'zh'
  character_name: string
  theme_and_setting: string
  exhibition_info: string
  payer_name: string
  usage_permission: number
  terms_accepted: number
}

export type SubmissionFileRow = {
  id: string
  file_type: string
  original_filename: string
  content_type: string
  size_bytes: number
  uploaded_at: string
}

export function mapSubmission(row: SubmissionDetailRow, files: SubmissionFileRow[] = []) {
  return {
    id: row.id,
    submissionNo: row.submission_no,
    status: row.status,
    division: row.division,
    feeAmount: row.fee_amount,
    currency: row.currency,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    paidAt: row.paid_at,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    profile: {
      lastName: row.last_name,
      firstName: row.first_name,
      penName: row.pen_name,
      email: row.email,
      phone: row.phone,
      countryRegion: row.country_region,
      city: row.city,
      postalCode: row.postal_code,
      prefecture: row.prefecture,
      occupation: row.occupation,
      school: row.school,
      address: row.address,
      wechatId: row.wechat_id,
      certificateLanguage: row.certificate_language,
    },
    work: {
      characterName: row.character_name,
      themeAndSetting: row.theme_and_setting,
      exhibitionInfo: row.exhibition_info,
      payerName: row.payer_name,
      usagePermission: row.usage_permission === 1,
      termsAccepted: row.terms_accepted === 1,
    },
    files: files.map((file) => ({
      id: file.id,
      fileType: file.file_type,
      originalFilename: file.original_filename,
      contentType: file.content_type,
      sizeBytes: file.size_bytes,
      uploadedAt: file.uploaded_at,
    })),
  }
}
```

- [ ] **Step 2: Implement `functions/api/submissions/index.ts`**

Create:

```ts
import type { AppEnv } from '../../_lib/env'
import { requireApplicant } from '../../_lib/authz'
import { ApiRequestError, handleApi, json, readJson } from '../../_lib/http'
import {
  assertRecord,
  createSubmissionNo,
  feeForDivision,
  isDivision,
  mapSubmission,
} from '../../_lib/submissions'

type CreateBody = {
  division?: unknown
}

export const onRequestGet: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const rows = await context.env.DB.prepare(
      `SELECT
         s.id, s.submission_no, s.status, s.division, s.fee_amount, s.currency,
         s.created_at, s.updated_at,
         COALESCE(w.character_name, '') AS character_name,
         COUNT(f.id) AS file_count
       FROM submissions s
       LEFT JOIN submission_works w ON w.submission_id = s.id
       LEFT JOIN submission_files f ON f.submission_id = s.id
       WHERE s.user_id = ?
       GROUP BY s.id
       ORDER BY s.created_at DESC, s.id DESC`,
    )
      .bind(user.id)
      .all<{
        id: string
        submission_no: string
        status: string
        division: string
        fee_amount: number
        currency: 'JPY'
        created_at: string
        updated_at: string
        character_name: string
        file_count: number
      }>()

    return json({
      submissions: rows.results.map((row) => ({
        id: row.id,
        submissionNo: row.submission_no,
        status: row.status,
        division: row.division,
        feeAmount: row.fee_amount,
        currency: row.currency,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        characterName: row.character_name,
        fileCount: row.file_count,
      })),
    }, {
      headers: { 'cache-control': 'no-store' },
    })
  })
}

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const body = await readJson<CreateBody>(context.request)
    assertRecord(body, 'Invalid submission body')
    if (!isDivision(body.division)) {
      throw new ApiRequestError('bad_request', 'Invalid division', 400)
    }

    const id = crypto.randomUUID()
    const submissionNo = createSubmissionNo()
    const feeAmount = feeForDivision(body.division)

    await context.env.DB.batch([
      context.env.DB.prepare(
        `INSERT INTO submissions (id, user_id, submission_no, status, division, fee_amount, currency)
         VALUES (?, ?, ?, 'draft', ?, ?, 'JPY')`,
      ).bind(id, user.id, submissionNo, body.division, feeAmount),
      context.env.DB.prepare(
        `INSERT INTO submission_profiles (submission_id, email)
         VALUES (?, ?)`,
      ).bind(id, user.email),
      context.env.DB.prepare(
        `INSERT INTO submission_works (submission_id)
         VALUES (?)`,
      ).bind(id),
    ])

    const row = await loadSubmission(context.env.DB, id, user.id)
    if (!row) {
      throw new ApiRequestError('server_error', 'Submission was not created', 500)
    }

    return json({ submission: mapSubmission(row) }, {
      status: 201,
      headers: { 'cache-control': 'no-store' },
    })
  })
}

async function loadSubmission(db: D1Database, id: string, userId: string) {
  return await db.prepare(
    `SELECT
       s.id, s.submission_no, s.status, s.division, s.fee_amount, s.currency,
       s.stripe_checkout_session_id, s.stripe_payment_intent_id, s.paid_at, s.submitted_at,
       s.created_at, s.updated_at,
       p.last_name, p.first_name, p.pen_name, p.email, p.phone, p.country_region,
       p.city, p.postal_code, p.prefecture, p.occupation, p.school, p.address,
       p.wechat_id, p.certificate_language,
       w.character_name, w.theme_and_setting, w.exhibition_info, w.payer_name,
       w.usage_permission, w.terms_accepted
     FROM submissions s
     JOIN submission_profiles p ON p.submission_id = s.id
     JOIN submission_works w ON w.submission_id = s.id
     WHERE s.id = ? AND s.user_id = ?`,
  )
    .bind(id, userId)
    .first<Parameters<typeof mapSubmission>[0]>()
}
```

- [ ] **Step 3: Run tests**

Run:

```bash
npm test -- test/submissions.spec.ts
```

Expected: PASS for Task 1 tests.

- [ ] **Step 4: Commit**

Run:

```bash
git add functions/api/submissions/index.ts functions/_lib/submissions.ts test/submissions.spec.ts
git commit -m "feat: create applicant draft submissions"
```

---

### Task 3: Implement Read And Update Draft APIs

**Files:**
- Create: `functions/api/submissions/[id].ts`
- Modify: `functions/_lib/submissions.ts`
- Test: `test/submissions.spec.ts`

- [ ] **Step 1: Add failing tests**

Append tests that prove:

```ts
it('loads a full submission only for its owner', async () => {
  const owner = await insertUser()
  const other = await insertUser()
  const ownerCookie = await sessionCookie(owner.id)
  const otherCookie = await sessionCookie(other.id)
  const created = await createSubmission(ownerCookie, { division: 'ai' })
  const createdBody = await created.json()

  const ownerRead = await getSubmission(ownerCookie, createdBody.submission.id)
  expect(ownerRead.status).toBe(200)

  const otherRead = await getSubmission(otherCookie, createdBody.submission.id)
  expect(otherRead.status).toBe(404)
})

it('updates draft profile and work fields', async () => {
  const user = await insertUser()
  const cookie = await sessionCookie(user.id)
  const created = await createSubmission(cookie, { division: '2d' })
  const createdBody = await created.json()

  const response = await patchSubmission(cookie, createdBody.submission.id, {
    division: '3d',
    profile: {
      lastName: 'Yamada',
      firstName: 'Aoi',
      penName: 'Blue',
      email: 'aoi@example.com',
      phone: '+81-90-0000-0000',
      countryRegion: 'Japan',
      city: 'Tokyo',
      postalCode: '100-0001',
      prefecture: 'Tokyo',
      occupation: 'student',
      school: 'Tokyo Art School',
      address: '1-1 Chiyoda',
      wechatId: '',
      certificateLanguage: 'en',
    },
    work: {
      characterName: 'Nova',
      themeAndSetting: 'Future city',
      exhibitionInfo: 'https://example.com/nova',
      payerName: 'Aoi Yamada',
      usagePermission: true,
      termsAccepted: true,
    },
  })

  expect(response.status).toBe(200)
  const body = await response.json()
  expect(body.submission).toMatchObject({
    division: '3d',
    feeAmount: 10000,
    profile: { lastName: 'Yamada', certificateLanguage: 'en' },
    work: { characterName: 'Nova', usagePermission: true, termsAccepted: true },
  })
})
```

Define test helpers:

```ts
import { onRequestGet as getOne, onRequestPatch as patchOne } from '../functions/api/submissions/[id]'

async function getSubmission(cookie: string, id: string) {
  return await getOne(pagesContext(new Request(
    `https://contest.example.com/api/submissions/${id}`,
    { headers: { cookie } },
  )))
}

async function patchSubmission(cookie: string, id: string, body: unknown) {
  return await patchOne(pagesContext(new Request(
    `https://contest.example.com/api/submissions/${id}`,
    {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify(body),
    },
  )))
}
```

- [ ] **Step 2: Run RED**

Run:

```bash
npm test -- test/submissions.spec.ts
```

Expected: FAIL because `[id].ts` does not exist.

- [ ] **Step 3: Implement `[id].ts`**

Create `functions/api/submissions/[id].ts` with `onRequestGet` and `onRequestPatch`. The implementation must:

- call `requireApplicant`
- read `context.params.id`
- return 404 if submission is missing or belongs to another user
- use `assertDraft` before PATCH
- update `submissions.division`, `submissions.fee_amount`, `submission_profiles`, and `submission_works`
- reload and return full submission with files

- [ ] **Step 4: Run GREEN**

Run:

```bash
npm test -- test/submissions.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add functions/api/submissions/[id].ts functions/_lib/submissions.ts test/submissions.spec.ts
git commit -m "feat: edit applicant draft submissions"
```

---

### Task 4: Implement R2 File Upload And Delete APIs

**Files:**
- Create: `functions/_lib/r2.ts`
- Create: `functions/api/submissions/[id]/upload-url.ts`
- Create: `functions/api/submissions/[id]/files/[fileId].ts`
- Modify: `test/submissions.spec.ts`

- [ ] **Step 1: Add failing upload/delete tests**

Add tests that:

- upload a PNG base64 payload to the owner draft
- assert a `submission_files` row exists
- assert `env.SUBMISSION_BUCKET.get(r2_key)` returns bytes
- reject upload for another user with 404
- reject upload after status is set to `payment_pending` with 409
- delete the metadata row and R2 object for a draft file

- [ ] **Step 2: Run RED**

Run:

```bash
npm test -- test/submissions.spec.ts
```

Expected: FAIL because upload/delete endpoints do not exist.

- [ ] **Step 3: Implement `functions/_lib/r2.ts`**

Create:

```ts
export function safeFilename(filename: string) {
  const trimmed = filename.trim().replace(/[/\\?%*:|"<>]/g, '-')
  const collapsed = trimmed.replace(/\s+/g, '-')
  return collapsed || 'upload'
}

export function submissionObjectKey(input: {
  submissionNo: string
  fileType: string
  filename: string
}) {
  return `submissions/${input.submissionNo}/${input.fileType}/${Date.now()}-${safeFilename(input.filename)}`
}
```

- [ ] **Step 4: Implement upload endpoint**

Create `functions/api/submissions/[id]/upload-url.ts` with `onRequestPost`. It must decode `dataBase64` into bytes, validate content type and size, store bytes in `context.env.SUBMISSION_BUCKET.put(r2Key, bytes, { httpMetadata: { contentType } })`, insert `submission_files`, and return the reloaded submission.

- [ ] **Step 5: Implement file delete endpoint**

Create `functions/api/submissions/[id]/files/[fileId].ts` with `onRequestDelete`. It must load the owner draft file row, delete the R2 object, delete the metadata row, and return `{ ok: true }`.

- [ ] **Step 6: Run GREEN**

Run:

```bash
npm test -- test/submissions.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add functions/_lib/r2.ts functions/api/submissions test/submissions.spec.ts
git commit -m "feat: upload draft submission files"
```

---

### Task 5: Add Frontend Submission API Types And Client

**Files:**
- Modify: `src/types/api.ts`
- Modify: `src/services/api.ts`

- [ ] **Step 1: Add API type definitions**

Add the API contract types from this plan's "API Contracts" section to `src/types/api.ts`.

- [ ] **Step 2: Add client helpers**

Modify `src/services/api.ts`:

```ts
export function listSubmissions() {
  return apiFetch<SubmissionListResponse>('/api/submissions')
}

export function createSubmission(body: CreateSubmissionRequest) {
  return apiFetch<SubmissionResponse>('/api/submissions', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getSubmission(id: string) {
  return apiFetch<SubmissionResponse>(`/api/submissions/${encodeURIComponent(id)}`)
}

export function updateSubmission(id: string, body: UpdateSubmissionRequest) {
  return apiFetch<SubmissionResponse>(`/api/submissions/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function uploadSubmissionFile(id: string, body: UploadSubmissionFileRequest) {
  return apiFetch<SubmissionResponse>(`/api/submissions/${encodeURIComponent(id)}/upload-url`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function deleteSubmissionFile(id: string, fileId: string) {
  return apiFetch<ApiOkResponse>(
    `/api/submissions/${encodeURIComponent(id)}/files/${encodeURIComponent(fileId)}`,
    { method: 'DELETE' },
  )
}
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/types/api.ts src/services/api.ts
git commit -m "feat: add submission api client"
```

---

### Task 6: Implement Applicant Dashboard Submission List

**Files:**
- Modify: `src/views/applicant/DashboardPage.vue`
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Update dashboard view**

Replace the current logout-only dashboard with:

- authenticated user summary
- create draft button
- loading/error states
- empty state
- table/list of `SubmissionListItem`
- edit links for draft and read-only links for later statuses

- [ ] **Step 2: Wire create draft**

The create action should call:

```ts
const response = await createSubmission({ division: '2d' })
await router.push(`/submissions/${response.submission.id}`)
```

- [ ] **Step 3: Run frontend verification**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/views/applicant/DashboardPage.vue src/i18n/translations.ts
git commit -m "feat: show applicant draft submissions"
```

---

### Task 7: Implement Draft Submission Editor

**Files:**
- Modify: `src/views/applicant/SubmissionEditorPage.vue`
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Implement route-aware loading**

The editor must:

- if route is `/submissions/new`, create a `2d` draft then replace route with `/submissions/:id`
- if route is `/submissions/:id`, load the submission
- show loading and error states

- [ ] **Step 2: Implement draft form**

The form must include:

- division select
- profile fields
- work fields
- consent checkboxes
- save button
- back-to-dashboard link

Save calls `updateSubmission(id, payload)` and updates local state from the response.

- [ ] **Step 3: Implement upload controls**

For each `SubmissionFileType`, render a file input. On selection:

- read the file as an ArrayBuffer
- convert to base64
- call `uploadSubmissionFile`
- update local submission from response

- [ ] **Step 4: Implement delete file controls**

Each file row should have a delete button that calls `deleteSubmissionFile`, then reloads the submission.

- [ ] **Step 5: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/views/applicant/SubmissionEditorPage.vue src/i18n/translations.ts
git commit -m "feat: edit applicant draft submissions"
```

---

### Task 8: Final Verification

**Files:**
- No new files expected.

- [ ] **Step 1: Run backend tests**

Run:

```bash
npm test
```

Expected: all test files pass.

- [ ] **Step 2: Run test typecheck**

Run:

```bash
npm run test:typecheck
```

Expected: exit code 0.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: exit code 0 and Vite writes `dist/`.

- [ ] **Step 4: Commit any final fixes**

Run:

```bash
git status --short
git add <focused-files>
git commit -m "chore: verify draft submission flow"
```

Skip the commit if there are no final changes.

---

## Self-Review

- Spec coverage: This plan covers applicant draft creation, applicant-owned listing, draft read/update, file storage in R2, file metadata in D1, ownership checks, draft mutability checks, dashboard visibility, and editor/upload UI. It intentionally does not implement `POST /api/submissions/:id/submit`, Stripe Checkout, admin downloads, or exports because those are later roadmap stages.
- Placeholder scan: No placeholder markers or intentionally vague implementation slots remain. Tasks 3, 4, 6, and 7 describe exact responsibilities where full code is too large for a plan document, but they specify files, functions, commands, expected behavior, and verification.
- Type consistency: API route names, TypeScript type names, status names, division names, and file type names match `schema.sql` and the approved MVP spec.
