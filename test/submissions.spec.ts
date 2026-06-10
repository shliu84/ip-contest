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

    const firstCreate = await createSubmission(firstCookie, { division: '2d' })
    await createSubmission(secondCookie, { division: 'ai' })
    const secondCreate = await createSubmission(firstCookie, { division: '3d' })

    const firstBody = await firstCreate.json()
    const secondBody = await secondCreate.json()
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
    const body = await response.json()
    expect(body.submissions).toHaveLength(2)
    expect(body.submissions.map((item: { division: string }) => item.division)).toEqual(['3d', '2d'])
  })
})
