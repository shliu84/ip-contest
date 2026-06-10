import { ApiRequestError } from './http'

export type SubmissionDivision = '2d' | '3d' | 'ai' | 'corporate'
export type SubmissionStatus =
  | 'draft'
  | 'payment_pending'
  | 'submitted'
  | 'screening'
  | 'screened_in'
  | 'screened_out'
  | 'assigned'
  | 'reviewed'
  | 'withdrawn'

export const DIVISIONS = ['2d', '3d', 'ai', 'corporate'] as const
export const MAX_DRAFT_SUBMISSIONS_PER_USER = 20
export const MAX_FILES_PER_SUBMISSION = 12

export type SubmissionDetailRow = {
  id: string
  submission_no: string
  status: SubmissionStatus
  division: SubmissionDivision
  fee_amount: number
  currency: string
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  paid_at: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
  last_name: string
  first_name: string
  pen_name: string
  email: string
  phone: string
  country_region: string
  city: string
  postal_code: string
  prefecture: string
  occupation: string
  school: string
  address: string
  wechat_id: string
  certificate_language: string
  character_name: string
  theme_and_setting: string
  exhibition_info: string
  payer_name: string
  usage_permission: number
  terms_accepted: number
  file_count?: number | string | null
}

export type SubmissionFileRow = {
  id: string
  file_type: string
  original_filename: string
  content_type: string
  size_bytes: number
  uploaded_at: string
}

export function isDivision(value: unknown): value is SubmissionDivision {
  return typeof value === 'string' && (DIVISIONS as readonly string[]).includes(value)
}

export function feeForDivision(division: SubmissionDivision) {
  return division === 'corporate' ? 100000 : 10000
}

export function assertRecord(
  value: unknown,
  message = 'Invalid request body',
): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ApiRequestError('bad_request', message, 400)
  }
}

export function assertDraft(status: SubmissionStatus) {
  if (status !== 'draft') {
    throw new ApiRequestError('invalid_submission', 'Only draft submissions can be changed', 409)
  }
}

export function changedRows(result: D1Result) {
  return Number(result.meta.changes ?? 0)
}

export async function loadSubmission(db: D1Database, submissionId: string, userId: string) {
  const row = await db.prepare(submissionDetailSelect('WHERE s.id = ? AND s.user_id = ?'))
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

export function submissionDetailSelect(whereClause: string, orderClause = '') {
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

export function createSubmissionNo() {
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  const suffix = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())
    .join('')
  return `AIPC2026-${suffix}`
}

export function mapSubmission(row: SubmissionDetailRow, files: SubmissionFileRow[] = []) {
  return {
    id: row.id,
    submissionNo: row.submission_no,
    status: row.status,
    division: row.division,
    feeAmount: row.fee_amount,
    currency: row.currency,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    paidAt: row.paid_at,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    profile: {
      lastName: row.last_name,
      firstName: row.first_name,
      penName: row.pen_name,
      email: row.email,
      phone: row.phone,
      countryRegion: row.country_region,
      city: row.city,
      postalCode: row.postal_code,
      prefecture: row.prefecture,
      occupation: row.occupation,
      school: row.school,
      address: row.address,
      wechatId: row.wechat_id,
      certificateLanguage: row.certificate_language,
    },
    work: {
      characterName: row.character_name,
      themeAndSetting: row.theme_and_setting,
      exhibitionInfo: row.exhibition_info,
      payerName: row.payer_name,
      usagePermission: row.usage_permission === 1,
      termsAccepted: row.terms_accepted === 1,
    },
    files: files.map((file) => ({
      id: file.id,
      fileType: file.file_type,
      originalFilename: file.original_filename,
      contentType: file.content_type,
      sizeBytes: file.size_bytes,
      uploadedAt: file.uploaded_at,
    })),
  }
}
