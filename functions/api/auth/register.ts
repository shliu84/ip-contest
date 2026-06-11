import type { AppEnv } from '../../_lib/env'
import { VERIFICATION_TOKEN_SECONDS } from '../../_lib/auth-constants'
import { sendEmail } from '../../_lib/email'
import { ApiRequestError, handleApi, json, readJson } from '../../_lib/http'
import { hashPassword } from '../../_lib/password'
import { createToken, hashToken } from '../../_lib/tokens'
import { parseApplicantProfile } from '../../_lib/profile'
import {
  normalizeEmail,
  validateEmail,
  validatePassword,
} from '../../_lib/validation'

type RegisterBody = {
  email?: unknown
  password?: unknown
  lastName?: unknown
  firstName?: unknown
  countryRegion?: unknown
  phoneCountryCode?: unknown
  phoneNumber?: unknown
}

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const body = await readJson<RegisterBody>(context.request)
    if (!isRecord(body) || Array.isArray(body)) {
      throw new ApiRequestError('bad_request', 'Invalid registration body', 400)
    }
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
    const profile = parseApplicantProfile(body, 'registration')

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
    const verificationUrl = verificationUrlFor(context.env.APP_BASE_URL, rawToken)

    try {
      await context.env.DB.batch([
        context.env.DB.prepare(
          `INSERT INTO users (id, email, password_hash, role, created_at, updated_at)
           VALUES (?, ?, ?, 'applicant', ?, ?)`,
        ).bind(userId, email, passwordHash, nowIso, nowIso),
        context.env.DB.prepare(
          `INSERT INTO user_profiles (
             user_id,
             last_name,
             first_name,
             country_region,
             phone_country_code,
             phone_number,
             certificate_language,
             created_at,
             updated_at
           )
           VALUES (?, ?, ?, ?, ?, ?, 'ja', ?, ?)`,
        ).bind(
          userId,
          profile.lastName,
          profile.firstName,
          profile.countryRegion,
          profile.phoneCountryCode,
          profile.phoneNumber,
          nowIso,
          nowIso,
        ),
        context.env.DB.prepare(
          `INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at)
           VALUES (?, ?, ?, ?, ?)`,
        ).bind(tokenId, userId, tokenHash, expiresAt, nowIso),
      ])
    } catch (error) {
      if (isDuplicateEmailError(error)) {
        throw new ApiRequestError('conflict', 'Email already registered', 409)
      }
      throw error
    }

    try {
      await sendEmail(context.env, {
        to: email,
        subject: 'Verify your ASIA IP CONTEST account',
        html: [
          '<p>Please verify your email address for ASIA IP CONTEST.</p>',
          `<p><a href="${escapeHtml(verificationUrl)}">${escapeHtml(verificationUrl)}</a></p>`,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function verificationUrlFor(appBaseUrl: string, rawToken: string) {
  const url = new URL('/verify-email', appBaseUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('APP_BASE_URL must use http or https')
  }
  url.searchParams.set('token', rawToken)
  return url.toString()
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      case "'":
        return '&#39;'
      default:
        return character
    }
  })
}

function isDuplicateEmailError(error: unknown) {
  return error instanceof Error
    && /UNIQUE constraint failed: users\.email/i.test(error.message)
}
