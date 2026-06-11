import type { AppEnv } from '../../_lib/env'
import { requireApplicant } from '../../_lib/authz'
import { ApiRequestError, handleApi, json, readJson } from '../../_lib/http'
import { createStripeCheckoutSession } from '../../_lib/stripe'
import {
  assertPaymentPending,
  assertRecord,
  changedRows,
  loadSubmission,
} from '../../_lib/submissions'

type CheckoutBody = {
  submissionId: string
}

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const body = parseCheckoutBody(await readJson<unknown>(context.request))
    const submission = await loadSubmission(context.env.DB, body.submissionId, user.id)
    if (!submission) {
      throw new ApiRequestError('not_found', 'Submission not found', 404)
    }
    assertPaymentPending(submission.status)

    const session = await createStripeCheckoutSession({
      secretKey: context.env.STRIPE_SECRET_KEY,
      appBaseUrl: context.env.APP_BASE_URL,
      submission,
    })

    const result = await context.env.DB.prepare(
      `UPDATE submissions
       SET stripe_checkout_session_id = ?,
           updated_at = ?
       WHERE id = ? AND user_id = ? AND status = 'payment_pending'`,
    )
      .bind(session.id, new Date().toISOString(), body.submissionId, user.id)
      .run()
    if (changedRows(result) === 0) {
      throw new ApiRequestError(
        'invalid_submission',
        'Only payment pending submissions can start checkout',
        409,
      )
    }

    return json({
      checkoutUrl: session.url,
    }, {
      headers: NO_STORE_HEADERS,
    })
  })
}

function parseCheckoutBody(value: unknown): CheckoutBody {
  assertRecord(value)
  const submissionId = value.submissionId
  if (typeof submissionId !== 'string' || submissionId.trim().length === 0) {
    throw new ApiRequestError('bad_request', 'Invalid request body', 400)
  }

  return {
    submissionId,
  }
}
