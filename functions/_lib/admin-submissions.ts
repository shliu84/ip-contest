import { ApiRequestError } from './http'
import { assertRecord, changedRows, isDivision, type SubmissionDivision, type SubmissionStatus } from './submissions'
import type { SessionUser } from './session'

export type AdminSubmissionFilters = {
  status?: SubmissionStatus
  division?: SubmissionDivision
  q?: string
  limit: number
}

export type AdminSubmissionRow = {
  id: string
  submission_no: string
  applicant_id: string
  applicant_email: string
  applicant_role: SessionUser['role']
  status: SubmissionStatus
  division: SubmissionDivision
  fee_amount: number
  currency: string
  paid_at: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
  last_name: string
  first_name: string
  profile_email: string
  character_name: string
  theme_and_setting: string
  file_count?: number | string | null
}

export type AdminSubmissionFileRow = {
  id: string
  file_type: string
  r2_key: string
  original_filename: string
  content_type: string
  size_bytes: number
  uploaded_at: string
}

export type AdminStatusBody = {
  status: SubmissionStatus
}

const STATUSES = [
  'draft',
  'payment_pending',
  'submitted',
  'screening',
  'screened_in',
  'screened_out',
  'assigned',
  'reviewed',
  'withdrawn',
] as const

const ADMIN_STATUS_TRANSITIONS: Partial<Record<SubmissionStatus, readonly SubmissionStatus[]>> = {
  submitted: ['screening', 'screened_in', 'screened_out', 'withdrawn'],
  screening: ['screened_in', 'screened_out', 'withdrawn'],
}

export function parseAdminSubmissionFilters(url: URL): AdminSubmissionFilters {
  const status = url.searchParams.get('status')
  const division = url.searchParams.get('division')
  const query = url.searchParams.get('q')?.trim()
  const limitParam = Number(url.searchParams.get('limit') ?? 50)
  const limit = Number.isFinite(limitParam) ? Math.min(100, Math.max(1, Math.trunc(limitParam))) : 50

  if (status !== null && !isStatus(status)) {
    throw new ApiRequestError('bad_request', 'Invalid status', 400)
  }
  if (division !== null && !isDivision(division)) {
    throw new ApiRequestError('bad_request', 'Invalid division', 400)
  }

  return {
    ...(status ? { status } : {}),
    ...(division ? { division } : {}),
    ...(query ? { q: query } : {}),
    limit,
  }
}

export async function listAdminSubmissions(
  db: D1Database,
  filters: AdminSubmissionFilters,
) {
  const { whereClause, params } = adminFilterWhere(filters)
  const rows = await db.prepare(adminSubmissionSelect(
    whereClause,
    'ORDER BY s.created_at DESC, s.id DESC LIMIT ?',
  ))
    .bind(...params, filters.limit)
    .all<AdminSubmissionRow>()

  return rows.results.map(mapAdminSubmissionListItem)
}

export async function loadAdminSubmission(db: D1Database, id: string) {
  const row = await db.prepare(adminSubmissionSelect('WHERE s.id = ?'))
    .bind(id)
    .first<AdminSubmissionRow>()
  if (!row) {
    return null
  }

  const files = await db.prepare(
    `SELECT
       id,
       file_type,
       r2_key,
       original_filename,
       content_type,
       size_bytes,
       uploaded_at
     FROM submission_files
     WHERE submission_id = ?
     ORDER BY uploaded_at ASC, id ASC`,
  )
    .bind(id)
    .all<AdminSubmissionFileRow>()

  return mapAdminSubmissionDetail(row, files.results)
}

export function parseAdminStatusBody(value: unknown): AdminStatusBody {
  assertRecord(value)
  if (!isStatus(value.status)) {
    throw new ApiRequestError('bad_request', 'Invalid status', 400)
  }

  return { status: value.status }
}

export function assertAdminStatusTransition(current: SubmissionStatus, next: SubmissionStatus) {
  if (!ADMIN_STATUS_TRANSITIONS[current]?.includes(next)) {
    throw new ApiRequestError('invalid_submission', 'Invalid submission status transition', 409)
  }
}

export async function updateAdminSubmissionStatus(
  db: D1Database,
  id: string,
  current: SubmissionStatus,
  next: SubmissionStatus,
) {
  const nowIso = new Date().toISOString()
  const result = await db.prepare(
    `UPDATE submissions
     SET status = ?,
         updated_at = ?
     WHERE id = ? AND status = ?`,
  )
    .bind(next, nowIso, id, current)
    .run()

  if (changedRows(result) === 0) {
    throw new ApiRequestError('invalid_submission', 'Invalid submission status transition', 409)
  }

  return await loadAdminSubmission(db, id)
}

function adminFilterWhere(filters: AdminSubmissionFilters) {
  const clauses: string[] = []
  const params: unknown[] = []

  if (filters.status) {
    clauses.push('s.status = ?')
    params.push(filters.status)
  }
  if (filters.division) {
    clauses.push('s.division = ?')
    params.push(filters.division)
  }
  if (filters.q) {
    clauses.push(`(
      s.submission_no LIKE ?
      OR u.email LIKE ?
      OR p.email LIKE ?
      OR p.last_name LIKE ?
      OR p.first_name LIKE ?
      OR w.character_name LIKE ?
    )`)
    const query = `%${filters.q}%`
    params.push(query, query, query, query, query, query)
  }

  return {
    whereClause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  }
}

function adminSubmissionSelect(whereClause: string, orderClause = '') {
  return `
    SELECT
      s.id,
      s.submission_no,
      u.id AS applicant_id,
      u.email AS applicant_email,
      u.role AS applicant_role,
      s.status,
      s.division,
      s.fee_amount,
      s.currency,
      s.paid_at,
      s.submitted_at,
      s.created_at,
      s.updated_at,
      p.last_name,
      p.first_name,
      p.email AS profile_email,
      w.character_name,
      w.theme_and_setting,
      (
        SELECT COUNT(*)
        FROM submission_files f
        WHERE f.submission_id = s.id
      ) AS file_count
    FROM submissions s
    JOIN users u ON u.id = s.user_id
    JOIN submission_profiles p ON p.submission_id = s.id
    JOIN submission_works w ON w.submission_id = s.id
    ${whereClause}
    ${orderClause}
  `
}

function mapAdminSubmissionListItem(row: AdminSubmissionRow) {
  return {
    id: row.id,
    submissionNo: row.submission_no,
    applicantEmail: row.applicant_email,
    status: row.status,
    division: row.division,
    feeAmount: row.fee_amount,
    currency: row.currency,
    characterName: row.character_name,
    fileCount: Number(row.file_count ?? 0),
    paidAt: row.paid_at,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapAdminSubmissionDetail(row: AdminSubmissionRow, files: AdminSubmissionFileRow[]) {
  return {
    ...mapAdminSubmissionListItem(row),
    applicant: {
      id: row.applicant_id,
      email: row.applicant_email,
      role: row.applicant_role,
    },
    profile: {
      lastName: row.last_name,
      firstName: row.first_name,
      email: row.profile_email,
    },
    work: {
      characterName: row.character_name,
      themeAndSetting: row.theme_and_setting,
    },
    files: files.map((file) => ({
      id: file.id,
      fileType: file.file_type,
      r2Key: file.r2_key,
      originalFilename: file.original_filename,
      contentType: file.content_type,
      sizeBytes: file.size_bytes,
      uploadedAt: file.uploaded_at,
    })),
  }
}

function isStatus(value: unknown): value is SubmissionStatus {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value)
}
