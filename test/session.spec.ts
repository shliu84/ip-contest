import { env } from 'cloudflare:workers'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { onRequestGet } from '../functions/api/me'
import {
  clearSessionCookie,
  createSession,
  deleteSession,
  getSessionUser,
} from '../functions/_lib/session'
import { hashToken } from '../functions/_lib/tokens'
import { pagesContext } from './helpers/pages-context'

const HTTPS_APP = 'https://contest.example.com'
const HTTP_APP = 'http://localhost:5173'

afterEach(() => {
  vi.useRealTimers()
})

async function insertUser(overrides: {
  id?: string
  email?: string
  role?: 'applicant' | 'committee' | 'judge' | 'super_admin'
  emailVerifiedAt?: string | null
} = {}) {
  const user = {
    id: overrides.id ?? crypto.randomUUID(),
    email: overrides.email ?? 'session@example.com',
    role: overrides.role ?? 'applicant',
    emailVerifiedAt: 'emailVerifiedAt' in overrides
      ? overrides.emailVerifiedAt
      : '2026-06-10T01:00:00.000Z',
  }

  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, role, email_verified_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(user.id, user.email, 'password-hash', user.role, user.emailVerifiedAt)
    .run()

  return user
}

function requestWithCookie(cookie?: string) {
  return new Request('https://contest.example.com/api/me', {
    headers: cookie ? { cookie } : {},
  })
}

async function storedSession(token: string) {
  return await env.DB.prepare(
    `SELECT id, token_hash, expires_at, last_seen_at
     FROM sessions
     WHERE token_hash = ?`,
  )
    .bind(await hashToken(token))
    .first<{
      id: string
      token_hash: string
      expires_at: string
      last_seen_at: string
    }>()
}

describe('sessions', () => {
  it('creates a session with only the token hash stored in the database', async () => {
    const user = await insertUser()

    const { cookie, token } = await createSession(env.DB, user.id, HTTPS_APP)
    const session = await storedSession(token)

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(session?.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
    expect(session?.token_hash).toBe(await hashToken(token))
    expect(session?.token_hash).not.toBe(token)
    expect(cookie).toContain(`aipc_session=${token}`)
  })

  it('sets HttpOnly Lax root cookie flags with a seven day max age', async () => {
    const user = await insertUser()

    const { cookie } = await createSession(env.DB, user.id, HTTP_APP)

    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Lax')
    expect(cookie).toContain('Path=/')
    expect(cookie).toContain('Max-Age=604800')
  })

  it('omits Secure for HTTP app URLs and includes it for HTTPS app URLs', async () => {
    const user = await insertUser()

    const httpSession = await createSession(env.DB, user.id, HTTP_APP)
    const httpsSession = await createSession(env.DB, user.id, HTTPS_APP)

    expect(httpSession.cookie).not.toContain('Secure')
    expect(httpsSession.cookie).toContain('Secure')
  })

  it('loads a user from a valid session cookie', async () => {
    const user = await insertUser({
      email: 'judge@example.com',
      role: 'judge',
      emailVerifiedAt: '2026-06-10T02:00:00.000Z',
    })
    const { cookie } = await createSession(env.DB, user.id, HTTPS_APP)

    await expect(getSessionUser(env.DB, requestWithCookie(cookie))).resolves.toEqual({
      id: user.id,
      email: 'judge@example.com',
      role: 'judge',
      emailVerifiedAt: '2026-06-10T02:00:00.000Z',
    })
  })

  it('returns null for a missing session cookie', async () => {
    await expect(getSessionUser(env.DB, requestWithCookie())).resolves.toBeNull()
  })

  it('returns null for an unknown session token', async () => {
    await expect(
      getSessionUser(env.DB, requestWithCookie('aipc_session=missing-token')),
    ).resolves.toBeNull()
  })

  it('returns null for expired sessions and deletes them', async () => {
    const user = await insertUser()
    const { token } = await createSession(env.DB, user.id, HTTPS_APP)
    await env.DB.prepare(
      `UPDATE sessions
       SET expires_at = ?
       WHERE token_hash = ?`,
    )
      .bind('2026-06-09T00:00:00.000Z', await hashToken(token))
      .run()

    const result = await getSessionUser(env.DB, requestWithCookie(`aipc_session=${token}`))
    const remaining = await storedSession(token)

    expect(result).toBeNull()
    expect(remaining).toBeNull()
  })

  it('only updates last_seen_at after the fifteen minute throttle window', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-10T03:00:00.000Z'))
    const user = await insertUser()
    const { token } = await createSession(env.DB, user.id, HTTPS_APP)
    await env.DB.prepare(
      `UPDATE sessions
       SET last_seen_at = ?
       WHERE token_hash = ?`,
    )
      .bind('2026-06-10T02:46:00.000Z', await hashToken(token))
      .run()

    await getSessionUser(env.DB, requestWithCookie(`aipc_session=${token}`))
    expect((await storedSession(token))?.last_seen_at).toBe('2026-06-10T02:46:00.000Z')

    await env.DB.prepare(
      `UPDATE sessions
       SET last_seen_at = ?
       WHERE token_hash = ?`,
    )
      .bind('2026-06-10T02:44:00.000Z', await hashToken(token))
      .run()

    await getSessionUser(env.DB, requestWithCookie(`aipc_session=${token}`))
    expect((await storedSession(token))?.last_seen_at).toBe('2026-06-10T03:00:00.000Z')
  })

  it('deletes the session identified by the current cookie', async () => {
    const user = await insertUser()
    const { token } = await createSession(env.DB, user.id, HTTPS_APP)

    await deleteSession(env.DB, requestWithCookie(`aipc_session=${token}`))

    expect(await storedSession(token)).toBeNull()
    await expect(deleteSession(env.DB, requestWithCookie())).resolves.toBeUndefined()
  })

  it('creates an expired clear cookie with matching flags', () => {
    const httpCookie = clearSessionCookie(HTTP_APP)
    const httpsCookie = clearSessionCookie(HTTPS_APP)

    expect(httpCookie).toContain('aipc_session=')
    expect(httpCookie).toContain('HttpOnly')
    expect(httpCookie).toContain('SameSite=Lax')
    expect(httpCookie).toContain('Path=/')
    expect(httpCookie).toContain('Max-Age=0')
    expect(httpCookie).not.toContain('Secure')
    expect(httpsCookie).toContain('Secure')
  })
})

describe('/api/me', () => {
  it('returns a null user without a valid session', async () => {
    const response = await onRequestGet(pagesContext(requestWithCookie()))

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({ user: null })
  })

  it('returns the session user JSON for a valid session', async () => {
    const user = await insertUser({
      email: 'committee@example.com',
      role: 'committee',
      emailVerifiedAt: null,
    })
    const { cookie } = await createSession(env.DB, user.id, HTTPS_APP)

    const response = await onRequestGet(pagesContext(requestWithCookie(cookie)))

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({
      user: {
        id: user.id,
        email: 'committee@example.com',
        role: 'committee',
        emailVerifiedAt: null,
      },
    })
  })
})
