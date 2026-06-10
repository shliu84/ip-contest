import type { AppEnv } from '../../_lib/env'
import { requireApplicant } from '../../_lib/authz'
import { ApiRequestError, handleApi, json, readJson } from '../../_lib/http'
import {
  assertRecord,
  createSubmissionNo,
  feeForDivision,
  isDivision,
  mapSubmission,
  type SubmissionDetailRow,
  type SubmissionFileRow,
} from '../../_lib/submissions'

type CreateSubmissionBody = {
  division?: unknown
}

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestGet: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const rows = await context.env.DB.prepare(detailSelect(
      'WHERE s.user_id = ?',
      'ORDER BY s.created_at DESC, s.id DESC',
    ))
      .bind(user.id)
      .all<SubmissionDetailRow>()

    return json({
      submissions: rows.results.map((row) => mapSubmissionListItem(row)),
    }, {
      headers: NO_STORE_HEADERS,
    })
  })
}

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const body = await readJson<CreateSubmissionBody>(context.request)
    assertRecord(body)

    if (!isDivision(body.division)) {
      throw new ApiRequestError('bad_request', 'Invalid division', 400)
    }

    const submissionId = crypto.randomUUID()
    const nowIso = new Date().toISOString()
    await context.env.DB.batch([
      context.env.DB.prepare(
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
         VALUES (?, ?, ?, 'draft', ?, ?, 'JPY', ?, ?)`,
      ).bind(
        submissionId,
        user.id,
        createSubmissionNo(),
        body.division,
        feeForDivision(body.division),
        nowIso,
        nowIso,
      ),
      context.env.DB.prepare(
        `INSERT INTO submission_profiles (submission_id, email)
         VALUES (?, ?)`,
      ).bind(submissionId, user.email),
      context.env.DB.prepare(
        `INSERT INTO submission_works (submission_id)
         VALUES (?)`,
      ).bind(submissionId),
    ])

    const submission = await loadSubmission(context.env.DB, submissionId, user.id)
    if (!submission) {
      throw new ApiRequestError('server_error', 'Created submission could not be loaded', 500)
    }

    return json({ submission }, {
      status: 201,
      headers: NO_STORE_HEADERS,
    })
  })
}

async function loadSubmission(db: D1Database, submissionId: string, userId: string) {
  const row = await db.prepare(detailSelect('WHERE s.id = ? AND s.user_id = ?'))
    .bind(submissionId, userId)
    .first<SubmissionDetailRow>()
  if (!row) {
    return null
  }

  const files = await db.prepare(
    `SELECT
       id,
       file_type,
       original_filename,
       content_type,
       size_bytes,
       uploaded_at
     FROM submission_files
     WHERE submission_id = ?
     ORDER BY uploaded_at ASC, id ASC`,
  )
    .bind(submissionId)
    .all<SubmissionFileRow>()

  return mapSubmission(row, files.results)
}

function detailSelect(whereClause: string, orderClause = '') {
  return `
    SELECT
      s.id,
      s.submission_no,
      s.status,
      s.division,
      s.fee_amount,
      s.currency,
      s.stripe_checkout_session_id,
      s.stripe_payment_intent_id,
      s.paid_at,
      s.submitted_at,
      s.created_at,
      s.updated_at,
      p.last_name,
      p.first_name,
      p.pen_name,
      p.email,
      p.phone,
      p.country_region,
      p.city,
      p.postal_code,
      p.prefecture,
      p.occupation,
      p.school,
      p.address,
      p.wechat_id,
      p.certificate_language,
      w.character_name,
      w.theme_and_setting,
      w.exhibition_info,
      w.payer_name,
      w.usage_permission,
      w.terms_accepted,
      (
        SELECT COUNT(*)
        FROM submission_files f
        WHERE f.submission_id = s.id
      ) AS file_count
    FROM submissions s
    JOIN submission_profiles p ON p.submission_id = s.id
    JOIN submission_works w ON w.submission_id = s.id
    ${whereClause}
    ${orderClause}
  `
}

function mapSubmissionListItem(row: SubmissionDetailRow) {
  return {
    id: row.id,
    submissionNo: row.submission_no,
    status: row.status,
    division: row.division,
    feeAmount: row.fee_amount,
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    characterName: row.character_name,
    fileCount: Number(row.file_count ?? 0),
  }
}
