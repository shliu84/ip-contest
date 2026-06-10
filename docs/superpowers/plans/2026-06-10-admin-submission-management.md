# Admin Submission Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a lightweight admin operations backend where committee and super admin users can list submissions, inspect details, view uploaded file metadata, and progress early screening statuses.

**Architecture:** Add admin-only Pages Functions under `/api/admin/submissions`, backed by a focused admin submission mapper in `functions/_lib/admin-submissions.ts` and a `requireCommittee` authorization helper. The frontend adds typed API client methods and replaces existing admin placeholders with simple, functional Vue pages that reuse current dashboard styling.

**Tech Stack:** Cloudflare Pages Functions, D1, Vue 3, Vue Router, TypeScript, Vitest, existing `apiFetch` client and `auth.css` dashboard styles.

---

## File Structure

- Modify: `functions/_lib/authz.ts`
  - Add `requireCommittee()` for `committee` and `super_admin` API authorization.
- Create: `functions/_lib/admin-submissions.ts`
  - Own admin submission query helpers, admin response mapping, filter parsing, and status transition validation.
- Create: `functions/api/admin/submissions/index.ts`
  - `GET /api/admin/submissions`.
- Create: `functions/api/admin/submissions/[id].ts`
  - `GET /api/admin/submissions/:id`.
- Create: `functions/api/admin/submissions/[id]/status.ts`
  - `PATCH /api/admin/submissions/:id/status`.
- Create: `test/admin-submissions.spec.ts`
  - API tests for authorization, filters, detail, file metadata, and status transitions.
- Modify: `src/types/api.ts`
  - Add admin submission list/detail/request response types.
- Modify: `src/services/api.ts`
  - Add `listAdminSubmissions()`, `getAdminSubmission()`, and `updateAdminSubmissionStatus()`.
- Modify: `src/views/admin/AdminHomePage.vue`
  - Replace placeholder with simple admin route links.
- Modify: `src/views/admin/AdminSubmissionsPage.vue`
  - Add filters and staff-facing submissions table.
- Modify: `src/views/admin/AdminSubmissionDetailPage.vue`
  - Add detail, file metadata, and status action buttons.
- Modify: `src/styles/auth.css`
  - Add only small utility styles needed by the admin table/detail controls if existing classes are not enough.

---

### Task 1: Admin Authorization And Mapper Tests

**Files:**
- Create: `test/admin-submissions.spec.ts`
- Modify later: `functions/_lib/authz.ts`
- Create later: `functions/_lib/admin-submissions.ts`

- [ ] **Step 1: Write failing tests for admin authorization, list filters, detail, and status transitions**

Create `test/admin-submissions.spec.ts`:

```ts
import { env } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'
import { onRequestGet as onRequestGetAdminSubmissions } from '../functions/api/admin/submissions/index'
import {
  onRequestGet as onRequestGetAdminSubmission,
} from '../functions/api/admin/submissions/[id]'
import {
  onRequestPatch as onRequestPatchAdminSubmissionStatus,
} from '../functions/api/admin/submissions/[id]/status'
import { hashPassword } from '../functions/_lib/password'
import { createSession } from '../functions/_lib/session'
import { pagesContext } from './helpers/pages-context'

type Role = 'applicant' | 'committee' | 'judge' | 'super_admin'

type AdminListBody = {
  submissions: {
    id: string
    submissionNo: string
    applicantEmail: string
    status: string
    division: string
    feeAmount: number
    currency: string
    characterName: string
    fileCount: number
    createdAt: string
    updatedAt: string
    paidAt: string | null
    submittedAt: string | null
  }[]
}

type AdminDetailBody = {
  submission: {
    id: string
    applicant: {
      id: string
      email: string
      role: Role
      emailVerifiedAt: string | null
    }
    status: string
    division: string
    work: {
      characterName: string
    }
    files: {
      id: string
      fileType: string
      originalFilename: string
      contentType: string
      sizeBytes: number
      r2Key: string
      uploadedAt: string
    }[]
  }
}

async function insertUser(role: Role = 'applicant', email = `${crypto.randomUUID()}@example.com`) {
  const user = {
    id: crypto.randomUUID(),
    email,
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

async function insertSubmission(userId: string, input: {
  status: string
  division: string
  characterName: string
  submissionNo?: string
}) {
  const id = crypto.randomUUID()
  const submissionNo = input.submissionNo ?? `AIPC2026-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO submissions (
         id, user_id, submission_no, status, division, fee_amount, currency,
         paid_at, submitted_at, created_at, updated_at
       )
       VALUES (?, ?, ?, ?, ?, 10000, 'JPY', ?, ?, ?, ?)`,
    ).bind(
      id,
      userId,
      submissionNo,
      input.status,
      input.division,
      input.status === 'submitted' || input.status === 'screening' ? '2026-06-10T04:20:00.000Z' : null,
      input.status === 'submitted' || input.status === 'screening' ? '2026-06-10T04:30:00.000Z' : null,
      '2026-06-10T04:00:00.000Z',
      input.status === 'screening' ? '2026-06-10T05:00:00.000Z' : '2026-06-10T04:30:00.000Z',
    ),
    env.DB.prepare(
      `INSERT INTO submission_profiles (
         submission_id, last_name, first_name, email, country_region, certificate_language
       )
       VALUES (?, 'Yamada', 'Aki', 'aki@example.com', 'Japan', 'ja')`,
    ).bind(id),
    env.DB.prepare(
      `INSERT INTO submission_works (
         submission_id, character_name, theme_and_setting, payer_name, usage_permission, terms_accepted
       )
       VALUES (?, ?, 'Near-future festival', 'Aki Yamada', 1, 1)`,
    ).bind(id, input.characterName),
  ])
  return { id, submissionNo }
}

async function insertFile(submissionId: string) {
  const fileId = crypto.randomUUID()
  await env.DB.prepare(
    `INSERT INTO submission_files (
       id, submission_id, file_type, r2_key, original_filename, content_type, size_bytes, uploaded_at
     )
     VALUES (?, ?, 'online_a4_image', ?, 'entry.png', 'image/png', 1234, ?)`,
  )
    .bind(fileId, submissionId, `submissions/${submissionId}/entry.png`, '2026-06-10T04:10:00.000Z')
    .run()
  return fileId
}

async function listAdminSubmissions(cookie: string | undefined, query = '') {
  return await onRequestGetAdminSubmissions(pagesContext(new Request(
    `https://contest.example.com/api/admin/submissions${query}`,
    { headers: cookie ? { cookie } : {} },
  )))
}

async function getAdminSubmission(submissionId: string, cookie: string | undefined) {
  return await onRequestGetAdminSubmission(pagesContext(new Request(
    `https://contest.example.com/api/admin/submissions/${submissionId}`,
    { headers: cookie ? { cookie } : {} },
  )))
}

async function patchAdminSubmissionStatus(
  submissionId: string,
  cookie: string | undefined,
  body: unknown,
) {
  return await onRequestPatchAdminSubmissionStatus(pagesContext(new Request(
    `https://contest.example.com/api/admin/submissions/${submissionId}/status`,
    {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(body),
    },
  )))
}

async function jsonBody<T>(response: Response): Promise<T> {
  return await response.json() as T
}

describe('/api/admin/submissions', () => {
  it('requires committee or super admin access', async () => {
    const noSession = await listAdminSubmissions(undefined)
    expect(noSession.status).toBe(401)

    const applicant = await insertUser('applicant')
    const applicantCookie = await sessionCookie(applicant.id)
    const applicantResponse = await listAdminSubmissions(applicantCookie)
    expect(applicantResponse.status).toBe(403)

    const judge = await insertUser('judge')
    const judgeCookie = await sessionCookie(judge.id)
    const judgeResponse = await listAdminSubmissions(judgeCookie)
    expect(judgeResponse.status).toBe(403)

    const committee = await insertUser('committee')
    const committeeCookie = await sessionCookie(committee.id)
    const committeeResponse = await listAdminSubmissions(committeeCookie)
    expect(committeeResponse.status).toBe(200)
  })

  it('lists submissions with status, division, and keyword filters', async () => {
    const admin = await insertUser('super_admin')
    const applicant = await insertUser('applicant', 'creator@example.com')
    const adminCookie = await sessionCookie(admin.id)
    await insertSubmission(applicant.id, {
      status: 'submitted',
      division: '2d',
      characterName: 'Mira',
      submissionNo: 'AIPC2026-MIRA0001',
    })
    await insertSubmission(applicant.id, {
      status: 'screening',
      division: '3d',
      characterName: 'Nova',
      submissionNo: 'AIPC2026-NOVA0001',
    })

    const response = await listAdminSubmissions(adminCookie, '?status=submitted&division=2d&q=mira')

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    const body = await jsonBody<AdminListBody>(response)
    expect(body.submissions).toHaveLength(1)
    expect(body.submissions[0]).toMatchObject({
      applicantEmail: 'creator@example.com',
      status: 'submitted',
      division: '2d',
      characterName: 'Mira',
      fileCount: 0,
    })
  })

  it('returns admin detail with applicant and file metadata', async () => {
    const admin = await insertUser('committee')
    const applicant = await insertUser('applicant', 'artist@example.com')
    const adminCookie = await sessionCookie(admin.id)
    const submission = await insertSubmission(applicant.id, {
      status: 'submitted',
      division: 'ai',
      characterName: 'Lumen',
    })
    await insertFile(submission.id)

    const response = await getAdminSubmission(submission.id, adminCookie)

    expect(response.status).toBe(200)
    const body = await jsonBody<AdminDetailBody>(response)
    expect(body.submission).toMatchObject({
      id: submission.id,
      applicant: {
        id: applicant.id,
        email: 'artist@example.com',
        role: 'applicant',
      },
      status: 'submitted',
      division: 'ai',
      work: {
        characterName: 'Lumen',
      },
    })
    expect(body.submission.files[0]).toMatchObject({
      originalFilename: 'entry.png',
      contentType: 'image/png',
      sizeBytes: 1234,
      r2Key: `submissions/${submission.id}/entry.png`,
    })
  })

  it('returns 404 for a missing admin detail', async () => {
    const admin = await insertUser('committee')
    const adminCookie = await sessionCookie(admin.id)

    const response = await getAdminSubmission(crypto.randomUUID(), adminCookie)

    expect(response.status).toBe(404)
  })

  it('updates allowed screening statuses and rejects invalid transitions', async () => {
    const admin = await insertUser('committee')
    const applicant = await insertUser('applicant')
    const adminCookie = await sessionCookie(admin.id)
    const submitted = await insertSubmission(applicant.id, {
      status: 'submitted',
      division: '2d',
      characterName: 'Mira',
    })
    const draft = await insertSubmission(applicant.id, {
      status: 'draft',
      division: '2d',
      characterName: 'Draft',
    })

    const screeningResponse = await patchAdminSubmissionStatus(submitted.id, adminCookie, {
      status: 'screening',
    })
    expect(screeningResponse.status).toBe(200)
    const screeningBody = await jsonBody<AdminDetailBody>(screeningResponse)
    expect(screeningBody.submission.status).toBe('screening')

    const screenedInResponse = await patchAdminSubmissionStatus(submitted.id, adminCookie, {
      status: 'screened_in',
    })
    expect(screenedInResponse.status).toBe(200)
    const screenedInBody = await jsonBody<AdminDetailBody>(screenedInResponse)
    expect(screenedInBody.submission.status).toBe('screened_in')

    await expect(patchAdminSubmissionStatus(draft.id, adminCookie, { status: 'screening' }))
      .resolves.toMatchObject({ status: 409 })
    await expect(patchAdminSubmissionStatus(submitted.id, adminCookie, { status: 'assigned' }))
      .resolves.toMatchObject({ status: 409 })
    await expect(patchAdminSubmissionStatus(submitted.id, adminCookie, { status: 123 }))
      .resolves.toMatchObject({ status: 400 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- test/admin-submissions.spec.ts
```

Expected: FAIL because `functions/api/admin/submissions/index`, `functions/api/admin/submissions/[id]`, and `functions/api/admin/submissions/[id]/status` do not exist.

- [ ] **Step 3: Commit failing tests**

```bash
git add test/admin-submissions.spec.ts
git commit -m "test: cover admin submission management"
```

---

### Task 2: Admin Submission API

**Files:**
- Modify: `functions/_lib/authz.ts`
- Create: `functions/_lib/admin-submissions.ts`
- Create: `functions/api/admin/submissions/index.ts`
- Create: `functions/api/admin/submissions/[id].ts`
- Create: `functions/api/admin/submissions/[id]/status.ts`
- Test: `test/admin-submissions.spec.ts`

- [ ] **Step 1: Add committee authorization helper**

Modify `functions/_lib/authz.ts`:

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

export async function requireCommittee(db: D1Database, request: Request): Promise<SessionUser> {
  const user = await requireUser(db, request)
  if (user.role !== 'committee' && user.role !== 'super_admin') {
    throw new ApiRequestError('forbidden', 'Committee access required', 403)
  }
  return user
}
```

- [ ] **Step 2: Add admin submission helper**

Create `functions/_lib/admin-submissions.ts`:

```ts
import { ApiRequestError } from './http'
import {
  DIVISIONS,
  type SubmissionDivision,
  type SubmissionStatus,
} from './submissions'

const STATUS_VALUES = [
  'draft',
  'payment_pending',
  'submitted',
  'screening',
  'screened_in',
  'screened_out',
  'assigned',
  'reviewed',
  'withdrawn',
] as const

const ALLOWED_STATUS_TRANSITIONS: Record<string, readonly SubmissionStatus[]> = {
  submitted: ['screening', 'screened_in', 'screened_out', 'withdrawn'],
  screening: ['screened_in', 'screened_out', 'withdrawn'],
}

export type AdminSubmissionRow = {
  id: string
  submission_no: string
  status: SubmissionStatus
  division: SubmissionDivision
  fee_amount: number
  currency: string
  paid_at: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
  applicant_id: string
  applicant_email: string
  applicant_role: 'applicant' | 'committee' | 'judge' | 'super_admin'
  applicant_email_verified_at: string | null
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
  certificate_language: string
  character_name: string
  theme_and_setting: string
  exhibition_info: string
  payer_name: string
  usage_permission: number
  terms_accepted: number
  file_count: number | string | null
}

export type AdminSubmissionFileRow = {
  id: string
  file_type: string
  r2_key: string
  original_filename: string
  content_type: string
  size_bytes: number
  uploaded_at: string
}

export type AdminSubmissionFilters = {
  status: SubmissionStatus | null
  division: SubmissionDivision | null
  q: string
  limit: number
}

export function parseAdminSubmissionFilters(url: URL): AdminSubmissionFilters {
  const status = url.searchParams.get('status')
  const division = url.searchParams.get('division')
  const q = (url.searchParams.get('q') ?? '').trim()
  const requestedLimit = Number(url.searchParams.get('limit') ?? 50)
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 100)
    : 50

  if (status !== null && !isSubmissionStatus(status)) {
    throw new ApiRequestError('bad_request', 'Invalid status filter', 400)
  }
  if (division !== null && !(DIVISIONS as readonly string[]).includes(division)) {
    throw new ApiRequestError('bad_request', 'Invalid division filter', 400)
  }

  return {
    status,
    division: division as SubmissionDivision | null,
    q,
    limit,
  }
}

export function adminSubmissionSelect(whereClause: string, orderClause = '') {
  return `
    SELECT
      s.id,
      s.submission_no,
      s.status,
      s.division,
      s.fee_amount,
      s.currency,
      s.paid_at,
      s.submitted_at,
      s.created_at,
      s.updated_at,
      u.id AS applicant_id,
      u.email AS applicant_email,
      u.role AS applicant_role,
      u.email_verified_at AS applicant_email_verified_at,
      p.last_name,
      p.first_name,
      p.pen_name,
      p.email,
      p.phone,
      p.country_region,
      p.city,
      p.postal_code,
      p.prefecture,
      p.occupation,
      p.school,
      p.address,
      p.wechat_id,
      p.certificate_language,
      w.character_name,
      w.theme_and_setting,
      w.exhibition_info,
      w.payer_name,
      w.usage_permission,
      w.terms_accepted,
      (
        SELECT COUNT(*)
        FROM submission_files f
        WHERE f.submission_id = s.id
      ) AS file_count
    FROM submissions s
    JOIN users u ON u.id = s.user_id
    JOIN submission_profiles p ON p.submission_id = s.id
    JOIN submission_works w ON w.submission_id = s.id
    ${whereClause}
    ${orderClause}
  `
}

export async function listAdminSubmissions(db: D1Database, filters: AdminSubmissionFilters) {
  const where: string[] = []
  const bindings: unknown[] = []

  if (filters.status) {
    where.push('s.status = ?')
    bindings.push(filters.status)
  }
  if (filters.division) {
    where.push('s.division = ?')
    bindings.push(filters.division)
  }
  if (filters.q) {
    const q = `%${filters.q.toLowerCase()}%`
    where.push(`(
      LOWER(s.submission_no) LIKE ?
      OR LOWER(u.email) LIKE ?
      OR LOWER(w.character_name) LIKE ?
    )`)
    bindings.push(q, q, q)
  }

  const rows = await db.prepare(adminSubmissionSelect(
    where.length > 0 ? `WHERE ${where.join(' AND ')}` : '',
    'ORDER BY s.updated_at DESC, s.created_at DESC, s.id DESC LIMIT ?',
  ))
    .bind(...bindings, filters.limit)
    .all<AdminSubmissionRow>()

  return rows.results.map(mapAdminSubmissionListItem)
}

export async function loadAdminSubmission(db: D1Database, submissionId: string) {
  const row = await db.prepare(adminSubmissionSelect('WHERE s.id = ?'))
    .bind(submissionId)
    .first<AdminSubmissionRow>()
  if (!row) {
    return null
  }

  const files = await db.prepare(
    `SELECT
       id,
       file_type,
       r2_key,
       original_filename,
       content_type,
       size_bytes,
       uploaded_at
     FROM submission_files
     WHERE submission_id = ?
     ORDER BY uploaded_at ASC, id ASC`,
  )
    .bind(submissionId)
    .all<AdminSubmissionFileRow>()

  return mapAdminSubmission(row, files.results)
}

export function parseAdminStatusBody(value: unknown): SubmissionStatus {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ApiRequestError('bad_request', 'Invalid request body', 400)
  }

  const status = (value as Record<string, unknown>).status
  if (!isSubmissionStatus(status)) {
    throw new ApiRequestError('bad_request', 'Invalid status', 400)
  }

  return status
}

export function assertAdminStatusTransition(
  currentStatus: SubmissionStatus,
  nextStatus: SubmissionStatus,
) {
  if (!ALLOWED_STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus)) {
    throw new ApiRequestError('invalid_submission', 'Status transition is not allowed', 409)
  }
}

function mapAdminSubmissionListItem(row: AdminSubmissionRow) {
  return {
    id: row.id,
    submissionNo: row.submission_no,
    applicantEmail: row.applicant_email,
    status: row.status,
    division: row.division,
    feeAmount: row.fee_amount,
    currency: row.currency,
    characterName: row.character_name,
    fileCount: Number(row.file_count ?? 0),
    paidAt: row.paid_at,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapAdminSubmission(row: AdminSubmissionRow, files: AdminSubmissionFileRow[]) {
  return {
    ...mapAdminSubmissionListItem(row),
    applicant: {
      id: row.applicant_id,
      email: row.applicant_email,
      role: row.applicant_role,
      emailVerifiedAt: row.applicant_email_verified_at,
    },
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
      r2Key: file.r2_key,
      originalFilename: file.original_filename,
      contentType: file.content_type,
      sizeBytes: file.size_bytes,
      uploadedAt: file.uploaded_at,
    })),
  }
}

function isSubmissionStatus(value: unknown): value is SubmissionStatus {
  return typeof value === 'string' && (STATUS_VALUES as readonly string[]).includes(value)
}
```

- [ ] **Step 3: Add admin list endpoint**

Create `functions/api/admin/submissions/index.ts`:

```ts
import type { AppEnv } from '../../../_lib/env'
import { requireCommittee } from '../../../_lib/authz'
import { handleApi, json } from '../../../_lib/http'
import {
  listAdminSubmissions,
  parseAdminSubmissionFilters,
} from '../../../_lib/admin-submissions'

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestGet: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    await requireCommittee(context.env.DB, context.request)
    const filters = parseAdminSubmissionFilters(new URL(context.request.url))
    const submissions = await listAdminSubmissions(context.env.DB, filters)

    return json({ submissions }, {
      headers: NO_STORE_HEADERS,
    })
  })
}
```

- [ ] **Step 4: Add admin detail endpoint**

Create `functions/api/admin/submissions/[id].ts`:

```ts
import type { AppEnv } from '../../../_lib/env'
import { requireCommittee } from '../../../_lib/authz'
import { loadAdminSubmission } from '../../../_lib/admin-submissions'
import { ApiRequestError, handleApi, json } from '../../../_lib/http'

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestGet: PagesFunction<AppEnv, 'id'> = async (context) => {
  return handleApi(async () => {
    await requireCommittee(context.env.DB, context.request)
    const submission = await loadAdminSubmission(context.env.DB, context.params.id)
    if (!submission) {
      throw new ApiRequestError('not_found', 'Submission not found', 404)
    }

    return json({ submission }, {
      headers: NO_STORE_HEADERS,
    })
  })
}
```

- [ ] **Step 5: Add admin status endpoint**

Create `functions/api/admin/submissions/[id]/status.ts`:

```ts
import type { AppEnv } from '../../../../_lib/env'
import { requireCommittee } from '../../../../_lib/authz'
import {
  assertAdminStatusTransition,
  loadAdminSubmission,
  parseAdminStatusBody,
} from '../../../../_lib/admin-submissions'
import { changedRows } from '../../../../_lib/submissions'
import { ApiRequestError, handleApi, json, readJson } from '../../../../_lib/http'

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestPatch: PagesFunction<AppEnv, 'id'> = async (context) => {
  return handleApi(async () => {
    await requireCommittee(context.env.DB, context.request)

    const current = await loadAdminSubmission(context.env.DB, context.params.id)
    if (!current) {
      throw new ApiRequestError('not_found', 'Submission not found', 404)
    }

    const nextStatus = parseAdminStatusBody(await readJson<unknown>(context.request))
    assertAdminStatusTransition(current.status, nextStatus)

    const nowIso = new Date().toISOString()
    const result = await context.env.DB.prepare(
      `UPDATE submissions
       SET status = ?,
           updated_at = ?
       WHERE id = ? AND status = ?`,
    )
      .bind(nextStatus, nowIso, context.params.id, current.status)
      .run()
    if (changedRows(result) === 0) {
      throw new ApiRequestError('invalid_submission', 'Status transition is not allowed', 409)
    }

    const submission = await loadAdminSubmission(context.env.DB, context.params.id)
    if (!submission) {
      throw new ApiRequestError('server_error', 'Updated submission could not be loaded', 500)
    }

    return json({ submission }, {
      headers: NO_STORE_HEADERS,
    })
  })
}
```

- [ ] **Step 6: Run focused admin API tests**

Run:

```bash
npm test -- test/admin-submissions.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Commit admin API**

```bash
git add functions/_lib/authz.ts functions/_lib/admin-submissions.ts functions/api/admin/submissions test/admin-submissions.spec.ts
git commit -m "feat: add admin submission APIs"
```

---

### Task 3: Admin Frontend Types And Client

**Files:**
- Modify: `src/types/api.ts`
- Modify: `src/services/api.ts`

- [ ] **Step 1: Add admin API types**

Modify `src/types/api.ts` after `SubmissionResponse`:

```ts
export type AdminSubmissionListItem = {
  id: string
  submissionNo: string
  applicantEmail: string
  status: SubmissionStatus
  division: SubmissionDivision
  feeAmount: number
  currency: 'JPY'
  characterName: string
  fileCount: number
  paidAt: string | null
  submittedAt: string | null
  createdAt: string
  updatedAt: string
}

export type AdminSubmissionFile = SubmissionFile & {
  r2Key: string
}

export type AdminSubmission = AdminSubmissionListItem & {
  applicant: CurrentUser
  profile: SubmissionProfile
  work: SubmissionWork
  files: AdminSubmissionFile[]
}

export type AdminSubmissionListFilters = {
  status?: SubmissionStatus | ''
  division?: SubmissionDivision | ''
  q?: string
}

export type AdminSubmissionListResponse = {
  submissions: AdminSubmissionListItem[]
}

export type AdminSubmissionResponse = {
  submission: AdminSubmission
}

export type UpdateAdminSubmissionStatusRequest = {
  status: SubmissionStatus
}
```

- [ ] **Step 2: Add admin API client methods**

Modify the import from `src/types/api.ts` in `src/services/api.ts` to include:

```ts
  AdminSubmissionListFilters,
  AdminSubmissionListResponse,
  AdminSubmissionResponse,
  UpdateAdminSubmissionStatusRequest,
```

Add these functions after `mockConfirmPayment()`:

```ts
export function listAdminSubmissions(filters: AdminSubmissionListFilters = {}) {
  const search = new URLSearchParams()
  if (filters.status) {
    search.set('status', filters.status)
  }
  if (filters.division) {
    search.set('division', filters.division)
  }
  if (filters.q?.trim()) {
    search.set('q', filters.q.trim())
  }

  const query = search.toString()
  return apiFetch<AdminSubmissionListResponse>(
    `/api/admin/submissions${query ? `?${query}` : ''}`,
  )
}

export function getAdminSubmission(id: string) {
  return apiFetch<AdminSubmissionResponse>(`/api/admin/submissions/${encodeURIComponent(id)}`)
}

export function updateAdminSubmissionStatus(
  id: string,
  body: UpdateAdminSubmissionStatusRequest,
) {
  return apiFetch<AdminSubmissionResponse>(
    `/api/admin/submissions/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  )
}
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run test:typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit frontend API client**

```bash
git add src/types/api.ts src/services/api.ts
git commit -m "feat: add admin submission api client"
```

---

### Task 4: Admin Pages

**Files:**
- Modify: `src/views/admin/AdminHomePage.vue`
- Modify: `src/views/admin/AdminSubmissionsPage.vue`
- Modify: `src/views/admin/AdminSubmissionDetailPage.vue`
- Modify: `src/styles/auth.css`

- [ ] **Step 1: Replace admin home placeholder**

Replace `src/views/admin/AdminHomePage.vue`:

```vue
<template>
  <main class="section-padding container">
    <div class="auth-panel dashboard-panel">
      <div class="sec-title">
        <span>Admin</span>
        <h2>Operations</h2>
        <p>Manage contest submissions and staff workflows.</p>
      </div>

      <div class="admin-link-grid">
        <RouterLink class="admin-link-card" to="/admin/submissions">
          <strong>Submissions</strong>
          <span>Review submitted entries and update screening status.</span>
        </RouterLink>
        <RouterLink class="admin-link-card" to="/admin/users">
          <strong>Users</strong>
          <span>Placeholder for account management.</span>
        </RouterLink>
        <RouterLink class="admin-link-card" to="/admin/exports">
          <strong>Exports</strong>
          <span>Placeholder for CSV and report exports.</span>
        </RouterLink>
      </div>
    </div>
  </main>
</template>
```

- [ ] **Step 2: Replace admin submissions list placeholder**

Replace `src/views/admin/AdminSubmissionsPage.vue`:

```vue
<template>
  <main class="section-padding container">
    <div class="auth-panel dashboard-panel">
      <div class="sec-title">
        <span>Admin</span>
        <h2>Submissions</h2>
      </div>

      <form class="admin-filter-bar" @submit.prevent="loadSubmissions">
        <label>
          <span>Status</span>
          <select v-model="filters.status">
            <option value="">All</option>
            <option v-for="status in statuses" :key="status" :value="status">
              {{ statusLabel(status) }}
            </option>
          </select>
        </label>
        <label>
          <span>Division</span>
          <select v-model="filters.division">
            <option value="">All</option>
            <option v-for="division in divisions" :key="division" :value="division">
              {{ divisionLabel(division) }}
            </option>
          </select>
        </label>
        <label>
          <span>Search</span>
          <input v-model.trim="filters.q" type="search" placeholder="No, email, work" />
        </label>
        <button class="btn btn-primary" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Loading...' : 'Refresh' }}
        </button>
      </form>

      <p v-if="loadError" class="form-error" role="alert">{{ loadError }}</p>
      <p v-else-if="isLoading" class="dashboard-empty" role="status">Loading submissions...</p>
      <p v-else-if="submissions.length === 0" class="dashboard-empty" role="status">
        No submissions match the current filters.
      </p>

      <div v-else class="dashboard-table-wrap">
        <table class="dashboard-table">
          <thead>
            <tr>
              <th scope="col">No.</th>
              <th scope="col">Applicant</th>
              <th scope="col">Work</th>
              <th scope="col">Division</th>
              <th scope="col">Status</th>
              <th scope="col">Fee</th>
              <th scope="col">Files</th>
              <th scope="col">Updated</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="submission in submissions" :key="submission.id">
              <td data-label="No.">{{ submission.submissionNo }}</td>
              <td data-label="Applicant">{{ submission.applicantEmail }}</td>
              <td data-label="Work">{{ submission.characterName || 'Untitled' }}</td>
              <td data-label="Division">{{ divisionLabel(submission.division) }}</td>
              <td data-label="Status">{{ statusLabel(submission.status) }}</td>
              <td data-label="Fee">{{ formatFee(submission.feeAmount, submission.currency) }}</td>
              <td data-label="Files">{{ submission.fileCount }}</td>
              <td data-label="Updated">{{ formatDate(submission.updatedAt) }}</td>
              <td data-label="Action">
                <RouterLink class="auth-link" :to="`/admin/submissions/${submission.id}`">
                  Detail
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
import { listAdminSubmissions } from '../../services/api'
import type {
  AdminSubmissionListItem,
  SubmissionDivision,
  SubmissionStatus,
} from '../../types/api'

const statuses: SubmissionStatus[] = [
  'submitted',
  'screening',
  'screened_in',
  'screened_out',
  'withdrawn',
]
const divisions: SubmissionDivision[] = ['2d', '3d', 'ai', 'corporate']

const filters = reactive({
  status: '' as SubmissionStatus | '',
  division: '' as SubmissionDivision | '',
  q: '',
})
const submissions = ref<AdminSubmissionListItem[]>([])
const isLoading = ref(false)
const loadError = ref('')

onMounted(() => {
  void loadSubmissions()
})

async function loadSubmissions() {
  isLoading.value = true
  loadError.value = ''
  try {
    const response = await listAdminSubmissions(filters)
    submissions.value = response.submissions
  } catch {
    loadError.value = 'Unable to load submissions. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function divisionLabel(division: SubmissionDivision) {
  return {
    '2d': '2D',
    '3d': '3D',
    ai: 'AI',
    corporate: 'Corporate',
  }[division]
}

function statusLabel(status: SubmissionStatus) {
  return status.replaceAll('_', ' ')
}

function formatFee(amount: number, currency: string) {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : '-'
}
</script>
```

- [ ] **Step 3: Replace admin submission detail placeholder**

Replace `src/views/admin/AdminSubmissionDetailPage.vue`:

```vue
<template>
  <main class="section-padding container">
    <div class="auth-panel dashboard-panel">
      <div class="sec-title">
        <span>Admin</span>
        <h2>Submission Detail</h2>
      </div>

      <RouterLink class="auth-link" to="/admin/submissions">Back to submissions</RouterLink>

      <p v-if="loadError" class="form-error" role="alert">{{ loadError }}</p>
      <p v-else-if="isLoading" class="dashboard-empty" role="status">Loading submission...</p>

      <template v-else-if="submission">
        <section class="dashboard-summary" aria-label="Submission summary">
          <dl>
            <div><dt>No.</dt><dd>{{ submission.submissionNo }}</dd></div>
            <div><dt>Applicant</dt><dd>{{ submission.applicant.email }}</dd></div>
            <div><dt>Division</dt><dd>{{ divisionLabel(submission.division) }}</dd></div>
            <div><dt>Status</dt><dd>{{ statusLabel(submission.status) }}</dd></div>
            <div><dt>Fee</dt><dd>{{ formatFee(submission.feeAmount, submission.currency) }}</dd></div>
            <div><dt>Submitted</dt><dd>{{ formatDate(submission.submittedAt) }}</dd></div>
          </dl>
        </section>

        <section class="admin-actions" aria-label="Status actions">
          <h3>Status Actions</h3>
          <div class="form-actions">
            <button
              v-for="status in nextStatuses"
              :key="status"
              class="btn btn-outline"
              type="button"
              :disabled="isUpdating"
              @click="changeStatus(status)"
            >
              {{ statusLabel(status) }}
            </button>
          </div>
          <p v-if="updateError" class="form-error" role="alert">{{ updateError }}</p>
          <p v-if="updateSuccess" class="form-success" role="status">{{ updateSuccess }}</p>
        </section>

        <section class="dashboard-submissions">
          <div class="dashboard-section-heading">
            <h3>Profile</h3>
          </div>
          <dl class="admin-detail-list">
            <div><dt>Name</dt><dd>{{ submission.profile.lastName }} {{ submission.profile.firstName }}</dd></div>
            <div><dt>Country</dt><dd>{{ submission.profile.countryRegion || '-' }}</dd></div>
            <div><dt>Phone</dt><dd>{{ submission.profile.phone || '-' }}</dd></div>
            <div><dt>Contact email</dt><dd>{{ submission.profile.email || '-' }}</dd></div>
          </dl>
        </section>

        <section class="dashboard-submissions">
          <div class="dashboard-section-heading">
            <h3>Work</h3>
          </div>
          <dl class="admin-detail-list">
            <div><dt>Character</dt><dd>{{ submission.work.characterName || '-' }}</dd></div>
            <div><dt>Theme</dt><dd>{{ submission.work.themeAndSetting || '-' }}</dd></div>
            <div><dt>Exhibition</dt><dd>{{ submission.work.exhibitionInfo || '-' }}</dd></div>
            <div><dt>Payer</dt><dd>{{ submission.work.payerName || '-' }}</dd></div>
          </dl>
        </section>

        <section class="dashboard-submissions">
          <div class="dashboard-section-heading">
            <h3>Files</h3>
          </div>
          <p v-if="submission.files.length === 0" class="dashboard-empty">No files uploaded.</p>
          <div v-else class="dashboard-table-wrap">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th scope="col">Filename</th>
                  <th scope="col">Type</th>
                  <th scope="col">Size</th>
                  <th scope="col">Uploaded</th>
                  <th scope="col">R2 key</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="file in submission.files" :key="file.id">
                  <td data-label="Filename">{{ file.originalFilename }}</td>
                  <td data-label="Type">{{ file.fileType }}</td>
                  <td data-label="Size">{{ formatBytes(file.sizeBytes) }}</td>
                  <td data-label="Uploaded">{{ formatDate(file.uploadedAt) }}</td>
                  <td data-label="R2 key">{{ file.r2Key }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  getAdminSubmission,
  updateAdminSubmissionStatus,
} from '../../services/api'
import type {
  AdminSubmission,
  SubmissionDivision,
  SubmissionStatus,
} from '../../types/api'

const route = useRoute()
const submission = ref<AdminSubmission | null>(null)
const isLoading = ref(false)
const isUpdating = ref(false)
const loadError = ref('')
const updateError = ref('')
const updateSuccess = ref('')

const nextStatuses = computed<SubmissionStatus[]>(() => {
  if (!submission.value) {
    return []
  }
  if (submission.value.status === 'submitted') {
    return ['screening', 'screened_in', 'screened_out', 'withdrawn']
  }
  if (submission.value.status === 'screening') {
    return ['screened_in', 'screened_out', 'withdrawn']
  }
  return []
})

onMounted(() => {
  void loadSubmission()
})

async function loadSubmission() {
  const id = route.params.id
  if (typeof id !== 'string') {
    loadError.value = 'Submission id is missing.'
    return
  }

  isLoading.value = true
  loadError.value = ''
  try {
    const response = await getAdminSubmission(id)
    submission.value = response.submission
  } catch {
    loadError.value = 'Unable to load submission. Please try again.'
  } finally {
    isLoading.value = false
  }
}

async function changeStatus(status: SubmissionStatus) {
  if (!submission.value || isUpdating.value) {
    return
  }

  isUpdating.value = true
  updateError.value = ''
  updateSuccess.value = ''
  try {
    const response = await updateAdminSubmissionStatus(submission.value.id, { status })
    submission.value = response.submission
    updateSuccess.value = 'Status updated.'
  } catch {
    updateError.value = 'Unable to update status. Please refresh and try again.'
  } finally {
    isUpdating.value = false
  }
}

function divisionLabel(division: SubmissionDivision) {
  return {
    '2d': '2D',
    '3d': '3D',
    ai: 'AI',
    corporate: 'Corporate',
  }[division]
}

function statusLabel(status: SubmissionStatus) {
  return status.replaceAll('_', ' ')
}

function formatFee(amount: number, currency: string) {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : '-'
}

function formatBytes(value: number) {
  return `${Math.ceil(value / 1024)} KB`
}
</script>
```

- [ ] **Step 4: Add minimal admin utility styles**

Append to `src/styles/auth.css`:

```css
.admin-link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.admin-link-card {
  display: grid;
  gap: 0.35rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
}

.admin-link-card span {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.92rem;
}

.admin-filter-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  align-items: end;
  margin: 1.5rem 0;
}

.admin-filter-bar label,
.admin-detail-list div {
  display: grid;
  gap: 0.35rem;
}

.admin-filter-bar span,
.admin-detail-list dt {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.82rem;
  text-transform: uppercase;
}

.admin-filter-bar input,
.admin-filter-bar select {
  width: 100%;
  min-height: 2.75rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  padding: 0 0.75rem;
}

.admin-actions {
  margin: 1.5rem 0;
}

.admin-detail-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
```

- [ ] **Step 5: Run frontend verification**

Run:

```bash
npm run test:typecheck
npm run build
```

Expected: both PASS.

- [ ] **Step 6: Commit admin pages**

```bash
git add src/views/admin/AdminHomePage.vue src/views/admin/AdminSubmissionsPage.vue src/views/admin/AdminSubmissionDetailPage.vue src/styles/auth.css
git commit -m "feat: add admin submission pages"
```

---

### Task 5: Full Verification

**Files:**
- All modified files from prior tasks.

- [ ] **Step 1: Run full test suite**

Run:

```bash
npm test
```

Expected: all test files PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run test:typecheck
```

Expected: PASS.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: PASS and `dist/` generated.

- [ ] **Step 4: Inspect git history and status**

Run:

```bash
git status --short --branch
git log --oneline --max-count=8
```

Expected: working tree has no unintended source changes beyond generated build artifacts ignored by git; recent commits are the admin spec, admin tests, admin API, admin client, and admin pages.

- [ ] **Step 5: Push branch or prepare PR according to user direction**

If working directly on `main` and the user wants deployment:

```bash
git push origin main
```

If working on a feature branch:

```bash
git push origin admin-submission-management
```

Expected: push succeeds.

---

## Self-Review

- Spec coverage: authorization, list filters, detail, file metadata, status transitions, admin home, list page, detail page, and verification are all mapped to tasks.
- Placeholder scan: no `TBD`, `TODO`, incomplete task, or unspecified test remains in this plan.
- Type consistency: backend status and division types use existing `SubmissionStatus` and `SubmissionDivision`; frontend admin types match the planned API response names.
- Scope check: Stripe, exports, user management, real downloads, judge assignment, and UI polish remain out of scope.
