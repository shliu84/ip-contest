import { env } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'
import { onRequestGet, onRequestPost } from '../functions/api/submissions/index'
import {
  onRequestGet as onRequestGetSubmission,
  onRequestPatch as onRequestPatchSubmission,
} from '../functions/api/submissions/[id]'
import { hashPassword } from '../functions/_lib/password'
import { createSession } from '../functions/_lib/session'
import { pagesContext } from './helpers/pages-context'

type SubmissionResponseBody = {
  submission: {
    id: string
    submissionNo: string
    status: string
    division: string
    feeAmount: number
    currency: string
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

async function jsonBody<T>(response: Response): Promise<T> {
  return await response.json() as T
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
})
