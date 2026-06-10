import { env } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'
import { onRequestGet as onRequestGetAdminSubmissions } from '../functions/api/admin/submissions/index'
import { onRequestGet as onRequestGetAdminSubmission } from '../functions/api/admin/submissions/[id]'
import { onRequestPatch as onRequestPatchAdminSubmissionStatus } from '../functions/api/admin/submissions/[id]/status'
import { createSession } from '../functions/_lib/session'
import { pagesContext } from './helpers/pages-context'

type UserRole = 'applicant' | 'committee' | 'judge' | 'super_admin'
type SubmissionStatus =
  | 'draft'
  | 'payment_pending'
  | 'submitted'
  | 'screening'
  | 'screened_in'
  | 'screened_out'
  | 'assigned'
  | 'reviewed'
  | 'withdrawn'
type SubmissionDivision = '2d' | '3d' | 'ai' | 'corporate'

type AdminSubmissionListItem = {
  id: string
  submissionNo: string
  applicantEmail: string
  status: SubmissionStatus
  division: SubmissionDivision
  feeAmount: number
  currency: string
  characterName: string
  fileCount: number
  createdAt: string
  updatedAt: string
  paidAt: string | null
  submittedAt: string | null
}

type AdminSubmissionListBody = {
  submissions: AdminSubmissionListItem[]
}

type AdminSubmissionDetailBody = {
  submission: AdminSubmissionListItem & {
    applicant: {
      id: string
      email: string
      role: UserRole
      emailVerifiedAt: string | null
    }
    profile: {
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
      certificateLanguage: string
    }
    work: {
      characterName: string
      themeAndSetting: string
      exhibitionInfo: string
      payerName: string
      usagePermission: boolean
      termsAccepted: boolean
    }
    files: {
      id: string
      fileType: string
      r2Key: string
      originalFilename: string
      contentType: string
      sizeBytes: number
      uploadedAt: string
    }[]
  }
}

async function insertUser(role: UserRole, email = `${crypto.randomUUID()}@example.com`) {
  const user = {
    id: crypto.randomUUID(),
    email,
    role,
  }

  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, role, email_verified_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(user.id, user.email, 'password-hash', user.role, '2026-06-10T01:00:00.000Z')
    .run()

  return user
}

async function sessionCookie(userId: string) {
  const { cookie } = await createSession(env.DB, userId, 'https://contest.example.com')
  return cookie
}

async function insertSubmission(input: {
  userId: string
  applicantEmail: string
  submissionNo?: string
  status?: SubmissionStatus
  division?: SubmissionDivision
  lastName?: string
  firstName?: string
  characterName?: string
  themeAndSetting?: string
  r2Key?: string
  createdAt?: string
  updatedAt?: string
}) {
  const submission = {
    id: crypto.randomUUID(),
    submissionNo: input.submissionNo ?? `AIPC2026-${crypto.randomUUID().slice(0, 8)}`,
    status: input.status ?? 'submitted',
    division: input.division ?? '2d',
    lastName: input.lastName ?? 'Yamada',
    firstName: input.firstName ?? 'Aki',
    characterName: input.characterName ?? 'Aurora Pilot',
    themeAndSetting: input.themeAndSetting ?? 'Near-future city',
    r2Key: input.r2Key ?? `submissions/${crypto.randomUUID()}/entry.png`,
    createdAt: input.createdAt ?? '2026-06-10T02:00:00.000Z',
    updatedAt: input.updatedAt ?? input.createdAt ?? '2026-06-10T02:00:00.000Z',
  }

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO submissions (
         id, user_id, submission_no, status, division, fee_amount, currency,
         paid_at, submitted_at, created_at, updated_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      submission.id,
      input.userId,
      submission.submissionNo,
      submission.status,
      submission.division,
      submission.division === 'corporate' ? 100000 : 10000,
      'JPY',
      '2026-06-10T01:30:00.000Z',
      '2026-06-10T01:45:00.000Z',
      submission.createdAt,
      submission.updatedAt,
    ),
    env.DB.prepare(
      `INSERT INTO submission_profiles (
         submission_id, last_name, first_name, pen_name, email, phone,
         country_region, city, postal_code, prefecture, occupation, school,
         address, wechat_id, certificate_language
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      submission.id,
      submission.lastName,
      submission.firstName,
      `${submission.firstName} ${submission.lastName}`,
      input.applicantEmail,
      '+81-90-0000-0000',
      'Japan',
      'Tokyo',
      '100-0001',
      'Tokyo',
      'Designer',
      '',
      '1-1 Chiyoda',
      'aki-yamada',
      'ja',
    ),
    env.DB.prepare(
      `INSERT INTO submission_works (
         submission_id, character_name, theme_and_setting, exhibition_info,
         payer_name, usage_permission, terms_accepted
       )
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      submission.id,
      submission.characterName,
      submission.themeAndSetting,
      'First shown at a school festival',
      `${submission.firstName} ${submission.lastName}`,
      1,
      1,
    ),
    env.DB.prepare(
      `INSERT INTO submission_files (
         id, submission_id, file_type, r2_key, original_filename,
         content_type, size_bytes, uploaded_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      crypto.randomUUID(),
      submission.id,
      'online_a4_image',
      submission.r2Key,
      'entry.png',
      'image/png',
      123456,
      '2026-06-10T01:40:00.000Z',
    ),
  ])

  return submission
}

async function listAdminSubmissions(cookie: string | undefined, query = '') {
  return await onRequestGetAdminSubmissions(pagesContext(new Request(
    `https://contest.example.com/api/admin/submissions${query}`,
    {
      headers: cookie ? { cookie } : {},
    },
  )))
}

async function getAdminSubmission(submissionId: string, cookie: string | undefined) {
  return await onRequestGetAdminSubmission(pagesContext(new Request(
    `https://contest.example.com/api/admin/submissions/${submissionId}`,
    {
      headers: cookie ? { cookie } : {},
    },
  )))
}

async function updateAdminSubmissionStatus(
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

async function storedSubmissionStatus(submissionId: string) {
  const row = await env.DB.prepare('SELECT status FROM submissions WHERE id = ?')
    .bind(submissionId)
    .first<{ status: SubmissionStatus }>()
  return row?.status
}

describe('/api/admin/submissions authorization', () => {
  it('requires a committee or super admin session', async () => {
    const applicant = await insertUser('applicant', 'applicant@example.com')
    const committee = await insertUser('committee', 'committee@example.com')
    const judge = await insertUser('judge', 'judge@example.com')
    const superAdmin = await insertUser('super_admin', 'super-admin@example.com')
    const submission = await insertSubmission({
      userId: applicant.id,
      applicantEmail: applicant.email,
      submissionNo: 'AIPC2026-AUTH',
    })
    const applicantCookie = await sessionCookie(applicant.id)
    const committeeCookie = await sessionCookie(committee.id)
    const judgeCookie = await sessionCookie(judge.id)
    const superAdminCookie = await sessionCookie(superAdmin.id)

    const unauthenticated = await listAdminSubmissions(undefined)
    const applicantResponse = await listAdminSubmissions(applicantCookie)
    const judgeResponse = await listAdminSubmissions(judgeCookie)
    const committeeResponse = await listAdminSubmissions(committeeCookie)
    const superAdminResponse = await listAdminSubmissions(superAdminCookie)

    expect(unauthenticated.status).toBe(401)
    expect(applicantResponse.status).toBe(403)
    expect(judgeResponse.status).toBe(403)
    expect(committeeResponse.status).toBe(200)
    expect(superAdminResponse.status).toBe(200)

    const unauthenticatedDetail = await getAdminSubmission(submission.id, undefined)
    const applicantDetail = await getAdminSubmission(submission.id, applicantCookie)
    const judgeDetail = await getAdminSubmission(submission.id, judgeCookie)
    const committeeDetail = await getAdminSubmission(submission.id, committeeCookie)

    expect(unauthenticatedDetail.status).toBe(401)
    expect(applicantDetail.status).toBe(403)
    expect(judgeDetail.status).toBe(403)
    expect(committeeDetail.status).toBe(200)

    const unauthenticatedStatus = await updateAdminSubmissionStatus(submission.id, undefined, {
      status: 'screening',
    })
    const applicantStatus = await updateAdminSubmissionStatus(submission.id, applicantCookie, {
      status: 'screening',
    })
    const judgeStatus = await updateAdminSubmissionStatus(submission.id, judgeCookie, {
      status: 'screening',
    })
    const committeeStatus = await updateAdminSubmissionStatus(submission.id, committeeCookie, {
      status: 'screening',
    })

    expect(unauthenticatedStatus.status).toBe(401)
    expect(applicantStatus.status).toBe(403)
    expect(judgeStatus.status).toBe(403)
    expect(committeeStatus.status).toBe(200)
  })
})

describe('/api/admin/submissions list', () => {
  it('filters submissions by status, division, and search query', async () => {
    const admin = await insertUser('committee', 'committee-filters@example.com')
    const firstApplicant = await insertUser('applicant', 'aurora@example.com')
    const secondApplicant = await insertUser('applicant', 'bravo@example.com')
    const thirdApplicant = await insertUser('applicant', 'charlie@example.com')
    const cookie = await sessionCookie(admin.id)

    const submitted2d = await insertSubmission({
      userId: firstApplicant.id,
      applicantEmail: firstApplicant.email,
      submissionNo: 'AIPC2026-FILTER-2D',
      status: 'submitted',
      division: '2d',
      lastName: 'Sato',
      firstName: 'Aoi',
      characterName: 'Aurora Pilot',
      createdAt: '2026-06-10T02:00:00.000Z',
    })
    const screening3d = await insertSubmission({
      userId: secondApplicant.id,
      applicantEmail: secondApplicant.email,
      submissionNo: 'AIPC2026-FILTER-3D',
      status: 'screening',
      division: '3d',
      lastName: 'Tanaka',
      firstName: 'Ren',
      characterName: 'Beacon Runner',
      createdAt: '2026-06-10T03:00:00.000Z',
    })
    await insertSubmission({
      userId: thirdApplicant.id,
      applicantEmail: thirdApplicant.email,
      submissionNo: 'AIPC2026-FILTER-AI',
      status: 'screened_in',
      division: 'ai',
      lastName: 'Chen',
      firstName: 'Mei',
      characterName: 'Cipher Garden',
      createdAt: '2026-06-10T04:00:00.000Z',
    })

    const byStatus = await jsonBody<AdminSubmissionListBody>(
      await listAdminSubmissions(cookie, '?status=screening'),
    )
    const byDivision = await jsonBody<AdminSubmissionListBody>(
      await listAdminSubmissions(cookie, '?division=2d'),
    )
    const byQuery = await jsonBody<AdminSubmissionListBody>(
      await listAdminSubmissions(cookie, '?q=aurora'),
    )

    expect(byStatus.submissions.map((submission) => submission.id)).toEqual([screening3d.id])
    expect(byDivision.submissions.map((submission) => submission.id)).toEqual([submitted2d.id])
    expect(byQuery.submissions.map((submission) => submission.id)).toEqual([submitted2d.id])
    expect(byQuery.submissions[0]).toMatchObject({
      id: submitted2d.id,
      submissionNo: 'AIPC2026-FILTER-2D',
      applicantEmail: firstApplicant.email,
      status: 'submitted',
      division: '2d',
      feeAmount: 10000,
      currency: 'JPY',
      characterName: 'Aurora Pilot',
      fileCount: 1,
      createdAt: '2026-06-10T02:00:00.000Z',
      updatedAt: '2026-06-10T02:00:00.000Z',
      paidAt: '2026-06-10T01:30:00.000Z',
      submittedAt: '2026-06-10T01:45:00.000Z',
    })
  })

  it('orders submissions by most recently updated first', async () => {
    const admin = await insertUser('committee', 'committee-order@example.com')
    const firstApplicant = await insertUser('applicant', 'older-created@example.com')
    const secondApplicant = await insertUser('applicant', 'newer-created@example.com')
    const cookie = await sessionCookie(admin.id)

    const recentlyUpdated = await insertSubmission({
      userId: firstApplicant.id,
      applicantEmail: firstApplicant.email,
      submissionNo: 'AIPC2026-ORDER-UPDATED',
      createdAt: '2026-06-10T02:00:00.000Z',
      updatedAt: '2026-06-10T06:00:00.000Z',
    })
    const newerCreated = await insertSubmission({
      userId: secondApplicant.id,
      applicantEmail: secondApplicant.email,
      submissionNo: 'AIPC2026-ORDER-CREATED',
      createdAt: '2026-06-10T05:00:00.000Z',
      updatedAt: '2026-06-10T05:00:00.000Z',
    })

    const body = await jsonBody<AdminSubmissionListBody>(
      await listAdminSubmissions(cookie, '?q=AIPC2026-ORDER'),
    )

    expect(body.submissions.map((submission) => submission.id)).toEqual([
      recentlyUpdated.id,
      newerCreated.id,
    ])
  })
})

describe('/api/admin/submissions/:id detail', () => {
  it('returns applicant and file metadata including r2Key', async () => {
    const admin = await insertUser('super_admin', 'super-admin-detail@example.com')
    const applicant = await insertUser('applicant', 'detail-applicant@example.com')
    const cookie = await sessionCookie(admin.id)
    const submission = await insertSubmission({
      userId: applicant.id,
      applicantEmail: applicant.email,
      submissionNo: 'AIPC2026-DETAIL',
      status: 'submitted',
      division: 'corporate',
      lastName: 'Suzuki',
      firstName: 'Nao',
      characterName: 'Archive Sentinel',
      themeAndSetting: 'A library orbiting the moon',
      r2Key: 'submissions/detail/entry.png',
    })

    const response = await getAdminSubmission(submission.id, cookie)
    const body = await jsonBody<AdminSubmissionDetailBody>(response)

    expect(response.status).toBe(200)
    expect(body.submission).toMatchObject({
      id: submission.id,
      submissionNo: 'AIPC2026-DETAIL',
      applicantEmail: applicant.email,
      status: 'submitted',
      division: 'corporate',
      feeAmount: 100000,
      currency: 'JPY',
      characterName: 'Archive Sentinel',
      fileCount: 1,
      paidAt: '2026-06-10T01:30:00.000Z',
      submittedAt: '2026-06-10T01:45:00.000Z',
      createdAt: '2026-06-10T02:00:00.000Z',
      updatedAt: '2026-06-10T02:00:00.000Z',
      applicant: {
        id: applicant.id,
        email: applicant.email,
        role: 'applicant',
        emailVerifiedAt: '2026-06-10T01:00:00.000Z',
      },
      profile: {
        lastName: 'Suzuki',
        firstName: 'Nao',
        penName: 'Nao Suzuki',
        email: applicant.email,
        phone: '+81-90-0000-0000',
        countryRegion: 'Japan',
        city: 'Tokyo',
        postalCode: '100-0001',
        prefecture: 'Tokyo',
        occupation: 'Designer',
        school: '',
        address: '1-1 Chiyoda',
        wechatId: 'aki-yamada',
        certificateLanguage: 'ja',
      },
      work: {
        characterName: 'Archive Sentinel',
        themeAndSetting: 'A library orbiting the moon',
        exhibitionInfo: 'First shown at a school festival',
        payerName: 'Nao Suzuki',
        usagePermission: true,
        termsAccepted: true,
      },
    })
    expect(body.submission.files).toEqual([
      expect.objectContaining({
        fileType: 'online_a4_image',
        r2Key: 'submissions/detail/entry.png',
        originalFilename: 'entry.png',
        contentType: 'image/png',
        sizeBytes: 123456,
      }),
    ])
  })

  it('returns 404 for a missing submission', async () => {
    const admin = await insertUser('committee', 'committee-missing@example.com')
    const response = await getAdminSubmission(crypto.randomUUID(), await sessionCookie(admin.id))

    expect(response.status).toBe(404)
  })
})

describe('/api/admin/submissions/:id/status', () => {
  it('allows submitted to screening to screened_in transitions', async () => {
    const admin = await insertUser('committee', 'committee-status@example.com')
    const applicant = await insertUser('applicant', 'status-applicant@example.com')
    const cookie = await sessionCookie(admin.id)
    const submission = await insertSubmission({
      userId: applicant.id,
      applicantEmail: applicant.email,
      submissionNo: 'AIPC2026-STATUS',
      status: 'submitted',
    })

    const screening = await updateAdminSubmissionStatus(submission.id, cookie, {
      status: 'screening',
    })

    expect(screening.status).toBe(200)
    await expect(screening.json()).resolves.toMatchObject({
      submission: {
        id: submission.id,
        status: 'screening',
      },
    })
    await expect(storedSubmissionStatus(submission.id)).resolves.toBe('screening')

    const screenedIn = await updateAdminSubmissionStatus(submission.id, cookie, {
      status: 'screened_in',
    })

    expect(screenedIn.status).toBe(200)
    await expect(screenedIn.json()).resolves.toMatchObject({
      submission: {
        id: submission.id,
        status: 'screened_in',
      },
    })
  })

  it('rejects draft, assigned, and malformed status transitions', async () => {
    const admin = await insertUser('super_admin', 'super-admin-status@example.com')
    const applicant = await insertUser('applicant', 'status-reject-applicant@example.com')
    const cookie = await sessionCookie(admin.id)
    const draftSubmission = await insertSubmission({
      userId: applicant.id,
      applicantEmail: applicant.email,
      submissionNo: 'AIPC2026-STATUS-DRAFT',
      status: 'draft',
    })
    const submittedSubmission = await insertSubmission({
      userId: applicant.id,
      applicantEmail: applicant.email,
      submissionNo: 'AIPC2026-STATUS-SUBMITTED',
      status: 'submitted',
    })

    const fromDraft = await updateAdminSubmissionStatus(draftSubmission.id, cookie, {
      status: 'screening',
    })
    const toAssigned = await updateAdminSubmissionStatus(submittedSubmission.id, cookie, {
      status: 'assigned',
    })
    const malformed = await updateAdminSubmissionStatus(submittedSubmission.id, cookie, {
      status: 'not-a-real-status',
    })

    expect(fromDraft.status).toBe(409)
    expect(toAssigned.status).toBe(409)
    expect(malformed.status).toBe(400)
  })
})
