import type { AppEnv } from '../../../_lib/env'
import { requireApplicant } from '../../../_lib/authz'
import { ApiRequestError, handleApi, json, readJson } from '../../../_lib/http'
import { submissionObjectKey } from '../../../_lib/r2'
import {
  assertDraft,
  assertRecord,
  changedRows,
  loadSubmission,
  MAX_FILES_PER_SUBMISSION,
} from '../../../_lib/submissions'

type UploadBody = {
  fileType: FileType
  filename: string
  contentType: ContentType
  dataBase64: string
}

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

const FILE_TYPES = [
  'online_a4_image',
  'physical_a2_image',
  'process_or_prompt_screenshot',
  'unedited_original_ai',
] as const

const CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const

type FileType = typeof FILE_TYPES[number]
type ContentType = typeof CONTENT_TYPES[number]

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const MAX_ENCODED_UPLOAD_CHARS = Math.ceil(MAX_UPLOAD_BYTES / 3) * 4

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const submissionId = submissionIdFromContext(context)
    const submission = await loadSubmission(context.env.DB, submissionId, user.id)
    if (!submission) {
      throw new ApiRequestError('not_found', 'Submission not found', 404)
    }
    assertDraft(submission.status)

    const upload = parseUploadBody(await readJson<unknown>(context.request))
    const bytes = decodeBase64(upload.dataBase64)
    if (bytes.byteLength > MAX_UPLOAD_BYTES) {
      throw new ApiRequestError('bad_request', 'Uploaded file is too large', 400)
    }
    await assertFileQuota(context.env.DB, submissionId)

    const fileId = crypto.randomUUID()
    const r2Key = submissionObjectKey({
      submissionNo: submission.submissionNo,
      fileType: upload.fileType,
      fileId,
      filename: upload.filename,
    })
    await context.env.SUBMISSION_BUCKET.put(r2Key, bytes, {
      httpMetadata: {
        contentType: upload.contentType,
      },
    })

    const nowIso = new Date().toISOString()
    try {
      const result = await context.env.DB.prepare(
        `INSERT INTO submission_files (
            id,
            submission_id,
            file_type,
            r2_key,
            original_filename,
            content_type,
            size_bytes,
            uploaded_at
          )
          SELECT ?, ?, ?, ?, ?, ?, ?, ?
          WHERE EXISTS (
            SELECT 1
            FROM submissions
            WHERE id = ? AND user_id = ? AND status = 'draft'
          )
          AND (
            SELECT COUNT(*)
            FROM submission_files
            WHERE submission_id = ?
          ) < ?`,
      )
        .bind(
          fileId,
          submissionId,
          upload.fileType,
          r2Key,
          upload.filename,
          upload.contentType,
          bytes.byteLength,
          nowIso,
          submissionId,
          user.id,
          submissionId,
          MAX_FILES_PER_SUBMISSION,
        )
        .run()
      if (changedRows(result) === 0) {
        await context.env.SUBMISSION_BUCKET.delete(r2Key)
        await assertSubmissionStillDraft(context.env.DB, submissionId, user.id)
        throw new ApiRequestError('quota_exceeded', 'File limit reached', 409)
      }
    } catch (error) {
      if (error instanceof ApiRequestError) {
        throw error
      }
      try {
        await context.env.SUBMISSION_BUCKET.delete(r2Key)
      } catch (deleteError) {
        console.error(deleteError)
      }
      throw error
    }

    const updatedSubmission = await loadSubmission(context.env.DB, submissionId, user.id)
    if (!updatedSubmission) {
      throw new ApiRequestError('server_error', 'Updated submission could not be loaded', 500)
    }

    return json({ submission: updatedSubmission }, {
      headers: NO_STORE_HEADERS,
    })
  })
}

function parseUploadBody(value: unknown): UploadBody {
  assertRecord(value)
  const fileType = value.fileType
  const filename = value.filename
  const contentType = value.contentType
  const dataBase64 = value.dataBase64

  if (!isFileType(fileType)) {
    throw new ApiRequestError('bad_request', 'Invalid file type', 400)
  }
  if (typeof filename !== 'string') {
    throw new ApiRequestError('bad_request', 'Invalid request body', 400)
  }
  if (!isContentType(contentType)) {
    throw new ApiRequestError('bad_request', 'Invalid content type', 400)
  }
  if (typeof dataBase64 !== 'string') {
    throw new ApiRequestError('bad_request', 'Invalid request body', 400)
  }

  return {
    fileType,
    filename,
    contentType,
    dataBase64,
  }
}

function isFileType(value: unknown): value is FileType {
  return typeof value === 'string' && (FILE_TYPES as readonly string[]).includes(value)
}

function isContentType(value: unknown): value is ContentType {
  return typeof value === 'string' && (CONTENT_TYPES as readonly string[]).includes(value)
}

function decodeBase64(value: string) {
  if (value.length > MAX_ENCODED_UPLOAD_CHARS) {
    throw new ApiRequestError('bad_request', 'Uploaded file is too large', 400)
  }

  let binary: string
  try {
    binary = atob(value)
  } catch {
    throw new ApiRequestError('bad_request', 'Invalid base64 data', 400)
  }

  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

async function assertFileQuota(db: D1Database, submissionId: string) {
  const row = await db.prepare(
    `SELECT COUNT(*) AS count
     FROM submission_files
     WHERE submission_id = ?`,
  )
    .bind(submissionId)
    .first<{ count: number | string }>()
  if (Number(row?.count ?? 0) >= MAX_FILES_PER_SUBMISSION) {
    throw new ApiRequestError('quota_exceeded', 'File limit reached', 409)
  }
}

async function assertSubmissionStillDraft(db: D1Database, submissionId: string, userId: string) {
  const row = await db.prepare(
    `SELECT status
     FROM submissions
     WHERE id = ? AND user_id = ?`,
  )
    .bind(submissionId, userId)
    .first<{ status: string }>()
  if (row?.status !== 'draft') {
    throw new ApiRequestError('invalid_submission', 'Only draft submissions can be changed', 409)
  }
}

function submissionIdFromContext(context: Parameters<PagesFunction<AppEnv>>[0]) {
  const idParam = context.params.id
  if (typeof idParam === 'string' && idParam.length > 0) {
    return idParam
  }
  if (Array.isArray(idParam) && typeof idParam[0] === 'string' && idParam[0].length > 0) {
    return idParam[0]
  }

  const segments = new URL(context.request.url).pathname.split('/').filter(Boolean)
  const submissionsIndex = segments.indexOf('submissions')
  const fallbackId = submissionsIndex >= 0 ? segments[submissionsIndex + 1] : undefined
  if (fallbackId) {
    return decodeURIComponent(fallbackId)
  }

  throw new ApiRequestError('not_found', 'Submission not found', 404)
}
