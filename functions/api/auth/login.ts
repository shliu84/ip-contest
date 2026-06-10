import type { AppEnv } from '../../_lib/env'
import { ApiRequestError, handleApi, json, readJson } from '../../_lib/http'
import { hashPassword, verifyPassword } from '../../_lib/password'
import { createSession } from '../../_lib/session'
import { normalizeEmail, validateEmail } from '../../_lib/validation'

type LoginBody = {
  email?: unknown
  password?: unknown
}

type LoginUserRow = {
  id: string
  email: string
  password_hash: string
  role: 'applicant' | 'committee' | 'judge' | 'super_admin'
  email_verified_at: string | null
}

const INVALID_LOGIN_MESSAGE = 'Invalid email or password'
const INVALID_LOGIN_PADDING_PASSWORD = 'invalid login padding'
const MAX_LOGIN_PASSWORD_LENGTH = 128

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const body = await readJson<LoginBody>(context.request)
    if (!isRecord(body) || Array.isArray(body)) {
      throw new ApiRequestError('bad_request', 'Invalid login body', 400)
    }
    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
      throw new ApiRequestError('bad_request', 'Invalid login body', 400)
    }

    const email = normalizeEmail(body.email)
    if (!validateEmail(email)) {
      throw new ApiRequestError('bad_request', 'Invalid email', 400)
    }

    if (isPasswordTooLong(body.password)) {
      await hashPassword(INVALID_LOGIN_PADDING_PASSWORD)
      throw invalidLogin()
    }

    const user = await context.env.DB.prepare(
      `SELECT id, email, password_hash, role, email_verified_at
       FROM users
       WHERE email = ?`,
    )
      .bind(email)
      .first<LoginUserRow>()

    if (!user) {
      await hashPassword(body.password)
      throw invalidLogin()
    }

    const passwordMatches = await verifyPassword(body.password, user.password_hash)
    if (!passwordMatches) {
      throw invalidLogin()
    }

    if (user.email_verified_at === null) {
      throw new ApiRequestError(
        'email_not_verified',
        'Email address is not verified',
        403,
      )
    }

    const { cookie } = await createSession(
      context.env.DB,
      user.id,
      context.env.APP_BASE_URL,
    )

    return json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerifiedAt: user.email_verified_at,
      },
    }, {
      headers: {
        'cache-control': 'no-store',
        'set-cookie': cookie,
      },
    })
  })
}

function invalidLogin() {
  return new ApiRequestError('unauthorized', INVALID_LOGIN_MESSAGE, 401)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPasswordTooLong(password: string) {
  return Array.from(password).length > MAX_LOGIN_PASSWORD_LENGTH
}
