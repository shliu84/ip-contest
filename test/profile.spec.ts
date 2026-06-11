import { env } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'
import { onRequestGet, onRequestPatch } from '../functions/api/profile'
import { hashPassword } from '../functions/_lib/password'
import { createSession } from '../functions/_lib/session'
import { pagesContext } from './helpers/pages-context'

type ProfileResponseBody = {
  profile: {
    lastName: string
    firstName: string
    lastNameKana: string
    firstNameKana: string
    penName: string
    countryRegion: string
    phoneCountryCode: string
    phoneNumber: string
    postalCode: string
    prefecture: string
    city: string
    addressLine1: string
    addressLine2: string
    occupation: string
    school: string
    wechatId: string
    certificateLanguage: 'ja' | 'en' | 'zh'
  }
}

type ErrorResponseBody = {
  error: {
    code: string
    message: string
  }
}

async function insertUser(role: 'applicant' | 'committee' = 'applicant') {
  const user = {
    id: crypto.randomUUID(),
    email: `${crypto.randomUUID()}@example.com`,
    password: 'correct horse battery staple',
    role,
    emailVerifiedAt: '2026-06-10T00:00:00.000Z',
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
  const { cookie } = await createSession(env.DB, userId, 'https://contest.example.com')
  return cookie
}

async function requestGet(cookie?: string) {
  return await onRequestGet(pagesContext(new Request(
    'https://contest.example.com/api/profile',
    {
      headers: cookie ? { cookie } : {},
    },
  )))
}

async function requestPatch(cookie: string | undefined, body: unknown) {
  return await onRequestPatch(pagesContext(new Request(
    'https://contest.example.com/api/profile',
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
  return response.json() as Promise<T>
}

function validProfile(overrides: Partial<ProfileResponseBody['profile']> = {}) {
  return {
    lastName: 'Yamada',
    firstName: 'Aki',
    lastNameKana: 'Yamada',
    firstNameKana: 'Aki',
    penName: 'Mika',
    countryRegion: 'JP',
    phoneCountryCode: '+81',
    phoneNumber: '08012345678',
    postalCode: '123-4567',
    prefecture: 'tokyo',
    city: 'Shibuya',
    addressLine1: '1-2-3',
    addressLine2: 'Apt 4',
    occupation: 'student',
    school: 'Sample High School',
    wechatId: 'wechat-id',
    certificateLanguage: 'en',
    ...overrides,
  }
}

describe('/api/profile', () => {
  it('GET /api/profile requires applicant session', async () => {
    const noSession = await requestGet()
    const committee = await insertUser('committee')
    const committeeCookie = await sessionCookie(committee.id)
    const committeeResponse = await requestGet(committeeCookie)
    const committeeBody = await jsonBody<ErrorResponseBody>(committeeResponse)

    expect(noSession.status).toBe(401)
    expect(committeeResponse.status).toBe(403)
    expect(committeeBody.error.code).toBe('forbidden')
  })

  it('GET /api/profile returns an empty default profile for a legacy applicant', async () => {
    const user = await insertUser('applicant')
    const cookie = await sessionCookie(user.id)
    const response = await requestGet(cookie)
    const body = await jsonBody<ProfileResponseBody>(response)

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(body).toEqual({
      profile: {
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
      },
    })
  })

  it('PATCH /api/profile updates and returns a valid applicant profile', async () => {
    const user = await insertUser('applicant')
    const cookie = await sessionCookie(user.id)
    const response = await requestPatch(cookie, validProfile())
    const body = await jsonBody<ProfileResponseBody>(response)

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(body).toEqual({ profile: validProfile() })
  })

  it('PATCH /api/profile requires school when occupation is student', async () => {
    const user = await insertUser('applicant')
    const cookie = await sessionCookie(user.id)
    const response = await requestPatch(cookie, validProfile({ occupation: 'student', school: '' }))
    const body = await jsonBody<ErrorResponseBody>(response)

    expect(response.status).toBe(400)
    expect(body.error.code).toBe('bad_request')
  })

  it('PATCH /api/profile rejects unsupported select values', async () => {
    const user = await insertUser('applicant')
    const cookie = await sessionCookie(user.id)
    const response = await requestPatch(cookie, validProfile({ countryRegion: 'MARS' }))
    const body = await jsonBody<ErrorResponseBody>(response)

    expect(response.status).toBe(400)
    expect(body.error.code).toBe('bad_request')
  })
})
