import { env } from 'cloudflare:workers'
import { describe, expect, it, vi } from 'vitest'
import { onRequestGet, onRequestPost } from '../functions/api/submissions/index'
import {
  onRequestGet as onRequestGetSubmission,
  onRequestPatch as onRequestPatchSubmission,
} from '../functions/api/submissions/[id]'
import { onRequestPost as onRequestPostUploadUrl } from '../functions/api/submissions/[id]/upload-url'
import { onRequestDelete as onRequestDeleteFile } from '../functions/api/submissions/[id]/files/[fileId]'
import { onRequestPost as onRequestPostSubmit } from '../functions/api/submissions/[id]/submit'
import { onRequestPost as onRequestPostMockConfirm } from '../functions/api/payments/mock-confirm'
import { hashPassword } from '../functions/_lib/password'
import { createSession } from '../functions/_lib/session'
import {
  MAX_DRAFT_SUBMISSIONS_PER_USER,
  MAX_FILES_PER_SUBMISSION,
} from '../functions/_lib/submissions'
import { pagesContext } from './helpers/pages-context'

type SubmissionResponseBody = {
  submission: {
    id: string
    submissionNo: string
    status: string
    division: string
    feeAmount: number
    currency: string
    paidAt: string | null
    submittedAt: string | null
    profile: {
      lastName: string
      firstName: string
      penName?: string
      email?: string
      phone?: string
      countryRegion?: string
      city?: string
      postalCode?: string
      prefecture?: string
      occupation?: string
      school?: string
      address?: string
      wechatId?: string
      certificateLanguage: string
    }
    work: {
      characterName: string
      themeAndSetting?: string
      exhibitionInfo?: string
      payerName?: string
      usagePermission: boolean
      termsAccepted: boolean
    }
    files: {
      id: string
      fileType: string
      originalFilename: string
      contentType: string
      sizeBytes: number
      uploadedAt: string
    }[]
    fileCount?: unknown
  }
}

type SubmissionListItem = {
  id: string
  submissionNo: string
  status: string
  division: string
  feeAmount: number
  currency: string
  createdAt: string
  updatedAt: string
  characterName: string
  fileCount: number
}

type SubmissionListResponseBody = {
  submissions: SubmissionListItem[]
}

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

async function createSubmission(cookie: string | undefined, body: unknown) {
  return await onRequestPost(pagesContext(new Request(
    'https://contest.example.com/api/submissions',
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

async function listSubmissions(cookie?: string) {
  return await onRequestGet(pagesContext(new Request(
    'https://contest.example.com/api/submissions',
    {
      headers: cookie ? { cookie } : {},
    },
  )))
}

async function getSubmission(submissionId: string, cookie?: string) {
  return await onRequestGetSubmission(pagesContext(new Request(
    `https://contest.example.com/api/submissions/${submissionId}`,
    {
      headers: cookie ? { cookie } : {},
    },
  )))
}

async function updateSubmission(submissionId: string, cookie: string | undefined, body: unknown) {
  return await onRequestPatchSubmission(pagesContext(new Request(
    `https://contest.example.com/api/submissions/${submissionId}`,
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

async function uploadSubmissionFile(submissionId: string, cookie: string | undefined, body: unknown) {
  return await onRequestPostUploadUrl(pagesContext(new Request(
    `https://contest.example.com/api/submissions/${submissionId}/upload-url`,
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

async function deleteSubmissionFile(
  submissionId: string,
  fileId: string,
  cookie: string | undefined,
) {
  return await onRequestDeleteFile(pagesContext(new Request(
    `https://contest.example.com/api/submissions/${submissionId}/files/${fileId}`,
    {
      method: 'DELETE',
      headers: cookie ? { cookie } : {},
    },
  )))
}

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

async function jsonBody<T>(response: Response): Promise<T> {
  return await response.json() as T
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

function validSubmissionUpdate(email: string) {
  return {
    division: '3d',
    profile: {
      lastName: '',
      firstName: '',
      penName: '',
      email,
      phone: '',
      countryRegion: '',
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
      characterName: '',
      themeAndSetting: '',
      exhibitionInfo: '',
      payerName: '',
      usagePermission: false,
      termsAccepted: false,
    },
  }
}

describe('/api/submissions', () => {
  it('requires an applicant session for listing and creating submissions', async () => {
    const noSessionList = await listSubmissions()
    expect(noSessionList.status).toBe(401)

    const noSessionCreate = await createSubmission(undefined, { division: '2d' })
    expect(noSessionCreate.status).toBe(401)

    const committee = await insertUser('committee')
    const committeeCookie = await sessionCookie(committee.id)
    const committeeList = await listSubmissions(committeeCookie)
    expect(committeeList.status).toBe(403)

    const committeeCreate = await createSubmission(committeeCookie, { division: '2d' })
    expect(committeeCreate.status).toBe(403)
  })

  it('creates a draft with server-derived fee and empty profile/work rows', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)

    const response = await createSubmission(cookie, { division: 'corporate' })

    expect(response.status).toBe(201)
    const body = await jsonBody<SubmissionResponseBody>(response)
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
    expect(body.submission).not.toHaveProperty('fileCount')
  })

  it('limits active drafts per applicant account', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)

    for (let index = 0; index < MAX_DRAFT_SUBMISSIONS_PER_USER; index += 1) {
      await expect(createSubmission(cookie, { division: '2d' }))
        .resolves.toMatchObject({ status: 201 })
    }

    const response = await createSubmission(cookie, { division: '2d' })
    const body = await jsonBody<{ error: { code: string } }>(response)

    expect(response.status).toBe(409)
    expect(body.error.code).toBe('quota_exceeded')
  })

  it('rejects draft creation if the quota is reached after the precheck', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)

    for (let index = 0; index < MAX_DRAFT_SUBMISSIONS_PER_USER - 1; index += 1) {
      await expect(createSubmission(cookie, { division: '2d' }))
        .resolves.toMatchObject({ status: 201 })
    }

    const originalBatch = env.DB.batch.bind(env.DB)
    const batchSpy = vi.spyOn(env.DB, 'batch')
    batchSpy.mockImplementationOnce(async (statements) => {
      await env.DB.prepare(
        `INSERT INTO submissions (
           id,
           user_id,
           submission_no,
           status,
           division,
           fee_amount,
           currency,
           created_at,
           updated_at
         )
         VALUES (?, ?, ?, 'draft', '2d', 10000, 'JPY', ?, ?)`,
      )
        .bind(
          crypto.randomUUID(),
          user.id,
          `AIPC2026-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          '2026-06-10T04:00:00.000Z',
          '2026-06-10T04:00:00.000Z',
        )
        .run()
      return await originalBatch(statements)
    })

    try {
      const response = await createSubmission(cookie, { division: '2d' })
      const body = await jsonBody<{ error: { code: string } }>(response)

      expect(response.status).toBe(409)
      expect(body.error.code).toBe('quota_exceeded')
    } finally {
      batchSpy.mockRestore()
    }

    const count = await env.DB.prepare(
      `SELECT COUNT(*) AS count
       FROM submissions
       WHERE user_id = ? AND status = 'draft'`,
    )
      .bind(user.id)
      .first<{ count: number | string }>()
    expect(Number(count?.count ?? 0)).toBe(MAX_DRAFT_SUBMISSIONS_PER_USER)
  })

  it('lists only the current applicant submissions ordered newest first', async () => {
    const firstUser = await insertUser()
    const secondUser = await insertUser()
    const firstCookie = await sessionCookie(firstUser.id)
    const secondCookie = await sessionCookie(secondUser.id)

    const firstCreate = await createSubmission(firstCookie, { division: '2d' })
    await createSubmission(secondCookie, { division: 'ai' })
    const secondCreate = await createSubmission(firstCookie, { division: '3d' })

    const firstBody = await jsonBody<SubmissionResponseBody>(firstCreate)
    const secondBody = await jsonBody<SubmissionResponseBody>(secondCreate)
    await env.DB.prepare(
      `UPDATE submissions
       SET created_at = ?
       WHERE id = ? AND user_id = ?`,
    )
      .bind('2026-06-10T04:00:00.000Z', firstBody.submission.id, firstUser.id)
      .run()
    await env.DB.prepare(
      `UPDATE submissions
       SET created_at = ?
       WHERE id = ? AND user_id = ?`,
    )
      .bind('2026-06-10T04:05:00.000Z', secondBody.submission.id, firstUser.id)
      .run()

    const response = await listSubmissions(firstCookie)

    expect(response.status).toBe(200)
    const body = await jsonBody<SubmissionListResponseBody>(response)
    expect(body.submissions).toHaveLength(2)
    expect(body.submissions.map((item) => item.division)).toEqual(['3d', '2d'])
    expect(body.submissions[0]).toMatchObject({
      characterName: '',
      fileCount: 0,
    })
    expect(Object.keys(body.submissions[0]).sort()).toEqual([
      'id',
      'submissionNo',
      'status',
      'division',
      'feeAmount',
      'currency',
      'createdAt',
      'updatedAt',
      'characterName',
      'fileCount',
    ].sort())
  })

  it('loads a full submission by id for the owner and returns 404 for another applicant', async () => {
    const owner = await insertUser()
    const otherApplicant = await insertUser()
    const ownerCookie = await sessionCookie(owner.id)
    const otherCookie = await sessionCookie(otherApplicant.id)
    const createResponse = await createSubmission(ownerCookie, { division: '2d' })
    const createBody = await jsonBody<SubmissionResponseBody>(createResponse)
    await env.DB.prepare(
      `INSERT INTO submission_files (
         id,
         submission_id,
         file_type,
         r2_key,
         original_filename,
         content_type,
         size_bytes,
         uploaded_at
       )
       VALUES (?, ?, 'online_a4_image', ?, 'entry.png', 'image/png', 1234, ?)`,
    )
      .bind(
        crypto.randomUUID(),
        createBody.submission.id,
        `submissions/${createBody.submission.id}/entry.png`,
        '2026-06-10T04:10:00.000Z',
      )
      .run()

    const ownerResponse = await getSubmission(createBody.submission.id, ownerCookie)
    const otherResponse = await getSubmission(createBody.submission.id, otherCookie)

    expect(ownerResponse.status).toBe(200)
    expect(ownerResponse.headers.get('cache-control')).toBe('no-store')
    const ownerBody = await jsonBody<SubmissionResponseBody>(ownerResponse)
    expect(ownerBody.submission).toMatchObject({
      id: createBody.submission.id,
      division: '2d',
      files: [{
        fileType: 'online_a4_image',
        originalFilename: 'entry.png',
        contentType: 'image/png',
        sizeBytes: 1234,
      }],
    })
    expect(otherResponse.status).toBe(404)
  })

  it('updates draft profile and work fields with server-derived fee for the selected division', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)
    const createResponse = await createSubmission(cookie, { division: '2d' })
    const createBody = await jsonBody<SubmissionResponseBody>(createResponse)

    const response = await updateSubmission(createBody.submission.id, cookie, {
      division: 'corporate',
      feeAmount: 1,
      profile: {
        lastName: 'Yamada',
        firstName: 'Aki',
        penName: 'Aki Pen',
        email: 'aki@example.com',
        phone: '+81-90-0000-0000',
        countryRegion: 'Japan',
        city: 'Tokyo',
        postalCode: '100-0001',
        prefecture: 'Tokyo',
        occupation: 'Designer',
        school: 'Art School',
        address: '1-1 Chiyoda',
        wechatId: 'aki-wechat',
        certificateLanguage: 'en',
      },
      work: {
        characterName: 'Mira',
        themeAndSetting: 'Near-future festival',
        exhibitionInfo: 'Tokyo preview',
        payerName: 'Aki Yamada',
        usagePermission: true,
        termsAccepted: true,
      },
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    const body = await jsonBody<SubmissionResponseBody>(response)
    expect(body.submission).toMatchObject({
      id: createBody.submission.id,
      division: 'corporate',
      feeAmount: 100000,
      profile: {
        lastName: 'Yamada',
        firstName: 'Aki',
        penName: 'Aki Pen',
        email: 'aki@example.com',
        certificateLanguage: 'en',
      },
      work: {
        characterName: 'Mira',
        themeAndSetting: 'Near-future festival',
        usagePermission: true,
        termsAccepted: true,
      },
    })
  })

  it('returns 400 for invalid update bodies and divisions', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)
    const createResponse = await createSubmission(cookie, { division: '2d' })
    const createBody = await jsonBody<SubmissionResponseBody>(createResponse)
    const validBody = {
      division: '3d',
      profile: {
        lastName: '',
        firstName: '',
        penName: '',
        email: user.email,
        phone: '',
        countryRegion: '',
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
        characterName: '',
        themeAndSetting: '',
        exhibitionInfo: '',
        payerName: '',
        usagePermission: false,
        termsAccepted: false,
      },
    }

    await expect(updateSubmission(createBody.submission.id, cookie, null))
      .resolves.toMatchObject({ status: 400 })
    await expect(updateSubmission(createBody.submission.id, cookie, {
      ...validBody,
      division: 'not-a-division',
    })).resolves.toMatchObject({ status: 400 })
    await expect(updateSubmission(createBody.submission.id, cookie, {
      ...validBody,
      profile: {
        ...validBody.profile,
        certificateLanguage: 'fr',
      },
    })).resolves.toMatchObject({ status: 400 })
    await expect(updateSubmission(createBody.submission.id, cookie, {
      ...validBody,
      work: {
        ...validBody.work,
        usagePermission: 'yes',
      },
    })).resolves.toMatchObject({ status: 400 })
  })

  it('returns 409 invalid_submission when patching a non-draft submission', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)
    const createResponse = await createSubmission(cookie, { division: '2d' })
    const createBody = await jsonBody<SubmissionResponseBody>(createResponse)
    await env.DB.prepare(
      `UPDATE submissions
       SET status = 'payment_pending'
       WHERE id = ? AND user_id = ?`,
    )
      .bind(createBody.submission.id, user.id)
      .run()

    const response = await updateSubmission(createBody.submission.id, cookie, {
      division: '3d',
      profile: {
        lastName: '',
        firstName: '',
        penName: '',
        email: user.email,
        phone: '',
        countryRegion: '',
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
        characterName: '',
        themeAndSetting: '',
        exhibitionInfo: '',
        payerName: '',
        usagePermission: false,
        termsAccepted: false,
      },
    })
    const body = await jsonBody<{ error: { code: string } }>(response)

    expect(response.status).toBe(409)
    expect(body.error.code).toBe('invalid_submission')
  })

  it('rejects a draft patch if the status changes before the write lands', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)
    const createResponse = await createSubmission(cookie, { division: '2d' })
    const createBody = await jsonBody<SubmissionResponseBody>(createResponse)
    const originalBatch = env.DB.batch.bind(env.DB)
    const batchSpy = vi.spyOn(env.DB, 'batch')

    batchSpy.mockImplementationOnce(async (statements) => {
      await env.DB.prepare(
        `UPDATE submissions
         SET status = 'payment_pending'
         WHERE id = ? AND user_id = ?`,
      )
        .bind(createBody.submission.id, user.id)
        .run()
      return await originalBatch(statements)
    })

    try {
      const response = await updateSubmission(
        createBody.submission.id,
        cookie,
        validSubmissionUpdate(user.email),
      )
      const body = await jsonBody<{ error: { code: string } }>(response)

      expect(response.status).toBe(409)
      expect(body.error.code).toBe('invalid_submission')
    } finally {
      batchSpy.mockRestore()
    }

    const row = await env.DB.prepare(
      `SELECT division
       FROM submissions
       WHERE id = ?`,
    )
      .bind(createBody.submission.id)
      .first<{ division: string }>()
    expect(row?.division).toBe('2d')
  })

  it('uploads a PNG base64 payload to the owner draft and stores metadata plus bytes', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)
    const createResponse = await createSubmission(cookie, { division: '2d' })
    const createBody = await jsonBody<SubmissionResponseBody>(createResponse)
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

    const response = await uploadSubmissionFile(createBody.submission.id, cookie, {
      fileType: 'online_a4_image',
      filename: ' entry art.png ',
      contentType: 'image/png',
      dataBase64: btoa(String.fromCharCode(...bytes)),
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    const body = await jsonBody<SubmissionResponseBody>(response)
    expect(body.submission.files).toHaveLength(1)
    expect(body.submission.files[0]).toMatchObject({
      fileType: 'online_a4_image',
      originalFilename: ' entry art.png ',
      contentType: 'image/png',
      sizeBytes: bytes.byteLength,
    })

    const row = await env.DB.prepare(
      `SELECT submission_id, file_type, r2_key, original_filename, content_type, size_bytes
       FROM submission_files
       WHERE id = ?`,
    )
      .bind(body.submission.files[0].id)
      .first<{
        submission_id: string
        file_type: string
        r2_key: string
        original_filename: string
        content_type: string
        size_bytes: number
      }>()
    expect(row).toMatchObject({
      submission_id: createBody.submission.id,
      file_type: 'online_a4_image',
      original_filename: ' entry art.png ',
      content_type: 'image/png',
      size_bytes: bytes.byteLength,
    })
    expect(row?.r2_key).toMatch(
      new RegExp(
        `^submissions/${body.submission.submissionNo}/online_a4_image/\\d+-[0-9a-f-]+-entry-art\\.png$`,
      ),
    )

    const object = await env.SUBMISSION_BUCKET.get(row!.r2_key)
    expect(object).not.toBeNull()
    expect(new Uint8Array(await object!.arrayBuffer())).toEqual(bytes)
  })

  it('returns 404 when another applicant uploads to a draft they do not own', async () => {
    const owner = await insertUser()
    const otherApplicant = await insertUser()
    const ownerCookie = await sessionCookie(owner.id)
    const otherCookie = await sessionCookie(otherApplicant.id)
    const createResponse = await createSubmission(ownerCookie, { division: '2d' })
    const createBody = await jsonBody<SubmissionResponseBody>(createResponse)

    const response = await uploadSubmissionFile(createBody.submission.id, otherCookie, {
      fileType: 'online_a4_image',
      filename: 'entry.png',
      contentType: 'image/png',
      dataBase64: btoa('png'),
    })

    expect(response.status).toBe(404)
  })

  it('returns 409 invalid_submission when uploading after payment is pending', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)
    const createResponse = await createSubmission(cookie, { division: '2d' })
    const createBody = await jsonBody<SubmissionResponseBody>(createResponse)
    await env.DB.prepare(
      `UPDATE submissions
       SET status = 'payment_pending'
       WHERE id = ? AND user_id = ?`,
    )
      .bind(createBody.submission.id, user.id)
      .run()

    const response = await uploadSubmissionFile(createBody.submission.id, cookie, {
      fileType: 'online_a4_image',
      filename: 'entry.png',
      contentType: 'image/png',
      dataBase64: btoa('png'),
    })
    const body = await jsonBody<{ error: { code: string } }>(response)

    expect(response.status).toBe(409)
    expect(body.error.code).toBe('invalid_submission')
  })

  it('returns 400 for invalid upload base64 data', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)
    const createResponse = await createSubmission(cookie, { division: '2d' })
    const createBody = await jsonBody<SubmissionResponseBody>(createResponse)

    const response = await uploadSubmissionFile(createBody.submission.id, cookie, {
      fileType: 'online_a4_image',
      filename: 'entry.png',
      contentType: 'image/png',
      dataBase64: 'not base64!',
    })

    expect(response.status).toBe(400)
  })

  it('returns 400 for encoded upload payloads that exceed the decoded size guard', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)
    const createResponse = await createSubmission(cookie, { division: '2d' })
    const createBody = await jsonBody<SubmissionResponseBody>(createResponse)
    const atobSpy = vi.spyOn(globalThis, 'atob')

    try {
      const response = await uploadSubmissionFile(createBody.submission.id, cookie, {
        fileType: 'online_a4_image',
        filename: 'entry.png',
        contentType: 'image/png',
        dataBase64: 'A'.repeat(13_981_018),
      })

      expect(response.status).toBe(400)
      expect(atobSpy).not.toHaveBeenCalled()
    } finally {
      atobSpy.mockRestore()
    }
  })

  it('stores different R2 keys for two uploads with the same filename and type', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)
    const createResponse = await createSubmission(cookie, { division: '2d' })
    const createBody = await jsonBody<SubmissionResponseBody>(createResponse)
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1_780_000_000_000)

    try {
      const uploadBody = {
        fileType: 'online_a4_image',
        filename: 'entry.png',
        contentType: 'image/png',
        dataBase64: btoa('png'),
      }
      await uploadSubmissionFile(createBody.submission.id, cookie, uploadBody)
      await uploadSubmissionFile(createBody.submission.id, cookie, uploadBody)
    } finally {
      nowSpy.mockRestore()
    }

    const rows = await env.DB.prepare(
      `SELECT r2_key
       FROM submission_files
       WHERE submission_id = ?
       ORDER BY uploaded_at ASC, id ASC`,
    )
      .bind(createBody.submission.id)
      .all<{ r2_key: string }>()
    expect(rows.results).toHaveLength(2)
    expect(rows.results[0].r2_key).not.toBe(rows.results[1].r2_key)
  })

  it('limits files per submission', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)
    const createResponse = await createSubmission(cookie, { division: '2d' })
    const createBody = await jsonBody<SubmissionResponseBody>(createResponse)

    for (let index = 0; index < MAX_FILES_PER_SUBMISSION; index += 1) {
      await expect(uploadSubmissionFile(createBody.submission.id, cookie, {
        fileType: 'online_a4_image',
        filename: `entry-${index}.png`,
        contentType: 'image/png',
        dataBase64: btoa(`png-${index}`),
      })).resolves.toMatchObject({ status: 200 })
    }

    const response = await uploadSubmissionFile(createBody.submission.id, cookie, {
      fileType: 'online_a4_image',
      filename: 'entry-over-limit.png',
      contentType: 'image/png',
      dataBase64: btoa('png-over-limit'),
    })
    const body = await jsonBody<{ error: { code: string } }>(response)

    expect(response.status).toBe(409)
    expect(body.error.code).toBe('quota_exceeded')
  })

  it('rejects an upload if the status changes before metadata is stored', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)
    const createResponse = await createSubmission(cookie, { division: '2d' })
    const createBody = await jsonBody<SubmissionResponseBody>(createResponse)
    const originalPut = env.SUBMISSION_BUCKET.put.bind(env.SUBMISSION_BUCKET)
    const putSpy = vi.spyOn(env.SUBMISSION_BUCKET, 'put')

    putSpy.mockImplementationOnce(async (...args) => {
      await env.DB.prepare(
        `UPDATE submissions
         SET status = 'payment_pending'
         WHERE id = ? AND user_id = ?`,
      )
        .bind(createBody.submission.id, user.id)
        .run()
      return await originalPut(...args)
    })

    try {
      const response = await uploadSubmissionFile(createBody.submission.id, cookie, {
        fileType: 'online_a4_image',
        filename: 'entry.png',
        contentType: 'image/png',
        dataBase64: btoa('png'),
      })
      const body = await jsonBody<{ error: { code: string } }>(response)

      expect(response.status).toBe(409)
      expect(body.error.code).toBe('invalid_submission')
    } finally {
      putSpy.mockRestore()
    }

    const files = await env.DB.prepare(
      `SELECT id
       FROM submission_files
       WHERE submission_id = ?`,
    )
      .bind(createBody.submission.id)
      .all<{ id: string }>()
    expect(files.results).toHaveLength(0)
  })

  it('deletes a draft file metadata row and R2 object', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)
    const createResponse = await createSubmission(cookie, { division: '2d' })
    const createBody = await jsonBody<SubmissionResponseBody>(createResponse)
    const uploadResponse = await uploadSubmissionFile(createBody.submission.id, cookie, {
      fileType: 'online_a4_image',
      filename: 'entry.png',
      contentType: 'image/png',
      dataBase64: btoa('png-bytes'),
    })
    const uploadBody = await jsonBody<SubmissionResponseBody>(uploadResponse)
    const fileId = uploadBody.submission.files[0].id
    const row = await env.DB.prepare(
      `SELECT r2_key
       FROM submission_files
       WHERE id = ?`,
    )
      .bind(fileId)
      .first<{ r2_key: string }>()
    expect(row).not.toBeNull()

    const response = await deleteSubmissionFile(createBody.submission.id, fileId, cookie)
    const body = await jsonBody<{ ok: boolean }>(response)

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(body).toEqual({ ok: true })
    await expect(env.DB.prepare(
      `SELECT id
       FROM submission_files
       WHERE id = ?`,
    ).bind(fileId).first()).resolves.toBeNull()
    await expect(env.SUBMISSION_BUCKET.get(row!.r2_key)).resolves.toBeNull()
  })

  it('rejects a file delete if the status changes before metadata is removed', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)
    const createResponse = await createSubmission(cookie, { division: '2d' })
    const createBody = await jsonBody<SubmissionResponseBody>(createResponse)
    const uploadResponse = await uploadSubmissionFile(createBody.submission.id, cookie, {
      fileType: 'online_a4_image',
      filename: 'entry.png',
      contentType: 'image/png',
      dataBase64: btoa('png-bytes'),
    })
    const uploadBody = await jsonBody<SubmissionResponseBody>(uploadResponse)
    const fileId = uploadBody.submission.files[0].id
    const row = await env.DB.prepare(
      `SELECT r2_key
       FROM submission_files
       WHERE id = ?`,
    )
      .bind(fileId)
      .first<{ r2_key: string }>()
    const originalPrepare = env.DB.prepare.bind(env.DB)
    const prepareSpy = vi.spyOn(env.DB, 'prepare')

    prepareSpy.mockImplementation((query) => {
      const statement = originalPrepare(query)
      if (typeof query === 'string' && query.includes('DELETE FROM submission_files')) {
        const originalBind = statement.bind.bind(statement)
        return {
          ...statement,
          bind(...values: unknown[]) {
            const bound = originalBind(...values)
            const originalRun = bound.run.bind(bound)
            return {
              ...bound,
              async run() {
                await env.DB.prepare(
                  `UPDATE submissions
                   SET status = 'payment_pending'
                   WHERE id = ? AND user_id = ?`,
                )
                  .bind(createBody.submission.id, user.id)
                  .run()
                return await originalRun()
              },
            }
          },
        } as D1PreparedStatement
      }
      return statement
    })

    try {
      const response = await deleteSubmissionFile(createBody.submission.id, fileId, cookie)
      const body = await jsonBody<{ error: { code: string } }>(response)

      expect(response.status).toBe(409)
      expect(body.error.code).toBe('invalid_submission')
    } finally {
      prepareSpy.mockRestore()
    }

    await expect(env.DB.prepare(
      `SELECT id
       FROM submission_files
       WHERE id = ?`,
    ).bind(fileId).first()).resolves.not.toBeNull()
    await expect(env.SUBMISSION_BUCKET.get(row!.r2_key)).resolves.not.toBeNull()
  })

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
})
