import type { AppEnv } from '../../_lib/env'
import { VERIFICATION_TOKEN_SECONDS } from '../../_lib/auth-constants'
import { sendEmail } from '../../_lib/email'
import { ApiRequestError, handleApi, json, readJson } from '../../_lib/http'
import { hashPassword } from '../../_lib/password'
import { createToken, hashToken } from '../../_lib/tokens'
import {
  normalizeEmail,
  validateEmail,
  validatePassword,
} from '../../_lib/validation'

type RegisterBody = {
  email?: unknown
  password?: unknown
}

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const body = await readJson<RegisterBody>(context.request)
    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
      throw new ApiRequestError('bad_request', 'Invalid registration body', 400)
    }

    const email = normalizeEmail(body.email)
    if (!validateEmail(email)) {
      throw new ApiRequestError('bad_request', 'Invalid email', 400)
    }
    if (!validatePassword(body.password)) {
      throw new ApiRequestError('bad_request', 'Invalid password', 400)
    }

    const existingUser = await context.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?',
    )
      .bind(email)
      .first<{ id: string }>()
    if (existingUser) {
      throw new ApiRequestError('conflict', 'Email already registered', 409)
    }

    const userId = crypto.randomUUID()
    const tokenId = crypto.randomUUID()
    const rawToken = createToken()
    const tokenHash = await hashToken(rawToken)
    const now = Date.now()
    const nowIso = new Date(now).toISOString()
    const expiresAt = new Date(now + VERIFICATION_TOKEN_SECONDS * 1000).toISOString()
    const passwordHash = await hashPassword(body.password)

    await context.env.DB.batch([
      context.env.DB.prepare(
        `INSERT INTO users (id, email, password_hash, role, created_at, updated_at)
         VALUES (?, ?, ?, 'applicant', ?, ?)`,
      ).bind(userId, email, passwordHash, nowIso, nowIso),
      context.env.DB.prepare(
        `INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      ).bind(tokenId, userId, tokenHash, expiresAt, nowIso),
    ])

    const verificationUrl = `${context.env.APP_BASE_URL}/verify-email?token=${
      encodeURIComponent(rawToken)
    }`

    try {
      await sendEmail(context.env, {
        to: email,
        subject: 'Verify your ASIA IP CONTEST account',
        html: [
          '<p>Please verify your email address for ASIA IP CONTEST.</p>',
          `<p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
        ].join(''),
      })
    } catch {
      await context.env.DB.batch([
        context.env.DB.prepare(
          'DELETE FROM email_verification_tokens WHERE user_id = ?',
        ).bind(userId),
        context.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId),
      ])
      throw new ApiRequestError(
        'email_delivery_failed',
        'Unable to send verification email',
        502,
      )
    }

    return json({ ok: true }, { status: 201 })
  })
}
