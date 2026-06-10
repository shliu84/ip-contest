import type { AppEnv } from '../../_lib/env'
import { ApiRequestError, handleApi, json, readJson } from '../../_lib/http'
import { hashToken } from '../../_lib/tokens'

type VerificationTokenRow = {
  id: string
  user_id: string
}

type VerifyEmailBody = {
  token?: unknown
}

function methodNotAllowed() {
  return json(
    { error: { code: 'bad_request', message: 'Use POST to verify email' } },
    {
      status: 405,
      headers: { allow: 'POST' },
    },
  )
}

export const onRequestGet: PagesFunction<AppEnv> = async () => {
  return methodNotAllowed()
}

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const queryToken = new URL(context.request.url).searchParams.get('token')
    let bodyToken: unknown

    if (context.request.headers.get('content-type')?.includes('application/json')) {
      const body = await readJson<VerifyEmailBody>(context.request)
      if (body && typeof body === 'object' && !Array.isArray(body)) {
        bodyToken = body.token
      }
    }

    const token = typeof bodyToken === 'string' ? bodyToken : queryToken
    if (!token) {
      throw new ApiRequestError('bad_request', 'Invalid verification token', 400)
    }

    const tokenHash = await hashToken(token)
    const row = await context.env.DB.prepare(
      `SELECT id, user_id
       FROM email_verification_tokens
       WHERE token_hash = ?`,
    )
      .bind(tokenHash)
      .first<VerificationTokenRow>()

    if (!row) {
      throw new ApiRequestError('bad_request', 'Invalid verification token', 400)
    }

    const nowIso = new Date().toISOString()
    const [claimed, updatedUser] = await context.env.DB.batch([
      context.env.DB.prepare(
        `UPDATE email_verification_tokens
         SET used_at = ?
         WHERE id = ?
           AND used_at IS NULL
           AND expires_at > ?`,
      ).bind(nowIso, row.id, nowIso),
      context.env.DB.prepare(
        `UPDATE users
         SET email_verified_at = ?, updated_at = ?
         WHERE id = ?
           AND EXISTS (
             SELECT 1
             FROM email_verification_tokens
             WHERE id = ?
               AND used_at = ?
           )`,
      ).bind(nowIso, nowIso, row.user_id, row.id, nowIso),
    ])

    if (claimed.meta.changes !== 1) {
      throw new ApiRequestError('bad_request', 'Invalid verification token', 400)
    }

    if (updatedUser.meta.changes !== 1) {
      throw new Error('Verified token did not update a user')
    }

    return json({ ok: true }, { headers: { 'cache-control': 'no-store' } })
  })
}
