import type { AppEnv } from '../../../_lib/env'
import { requireApplicant } from '../../../_lib/authz'
import { ApiRequestError, handleApi, json } from '../../../_lib/http'
import {
  assertDraft,
  assertReadyForPayment,
  changedRows,
  loadSubmission,
} from '../../../_lib/submissions'

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const submissionId = submissionIdFromContext(context)
    const submission = await loadSubmission(context.env.DB, submissionId, user.id)
    if (!submission) {
      throw new ApiRequestError('not_found', 'Submission not found', 404)
    }
    assertDraft(submission.status)
    assertReadyForPayment(submission)

    const nowIso = new Date().toISOString()
    const result = await context.env.DB.prepare(
      `UPDATE submissions
       SET status = 'payment_pending',
           updated_at = ?
       WHERE id = ? AND user_id = ? AND status = 'draft'
         AND EXISTS (
           SELECT 1
           FROM submission_profiles p
           WHERE p.submission_id = submissions.id
             AND TRIM(p.last_name) <> ''
             AND TRIM(p.first_name) <> ''
             AND TRIM(p.email) <> ''
             AND TRIM(p.phone) <> ''
             AND TRIM(p.country_region) <> ''
         )
         AND EXISTS (
           SELECT 1
           FROM submission_works w
           WHERE w.submission_id = submissions.id
             AND TRIM(w.character_name) <> ''
             AND TRIM(w.theme_and_setting) <> ''
             AND TRIM(w.payer_name) <> ''
             AND w.usage_permission = 1
             AND w.terms_accepted = 1
         )
         AND EXISTS (
           SELECT 1
           FROM submission_files f
           WHERE f.submission_id = submissions.id
             AND f.file_type = 'online_a4_image'
         )
         AND EXISTS (
           SELECT 1
           FROM submission_files f
           WHERE f.submission_id = submissions.id
             AND f.file_type = 'physical_a2_image'
         )
         AND EXISTS (
           SELECT 1
           FROM submission_files f
           WHERE f.submission_id = submissions.id
             AND f.file_type = 'process_or_prompt_screenshot'
         )`,
    )
      .bind(nowIso, submissionId, user.id)
      .run()
    if (changedRows(result) === 0) {
      const currentSubmission = await loadSubmission(context.env.DB, submissionId, user.id)
      if (!currentSubmission) {
        throw new ApiRequestError('not_found', 'Submission not found', 404)
      }
      assertDraft(currentSubmission.status)
      assertReadyForPayment(currentSubmission)
      throw new ApiRequestError('invalid_submission', 'Only draft submissions can be changed', 409)
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
