import type { AppEnv } from '../../_lib/env'
import { handleApi, json } from '../../_lib/http'
import {
  parseCheckoutSessionCompletedEvent,
  verifyStripeWebhook,
} from '../../_lib/stripe'

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const payload = await context.request.text()
    await verifyStripeWebhook(
      payload,
      context.request.headers.get('stripe-signature'),
      context.env.STRIPE_WEBHOOK_SECRET,
    )

    const event = parseCheckoutSessionCompletedEvent(payload)
    if (!event) {
      return json({ ok: true }, { headers: NO_STORE_HEADERS })
    }

    const session = event.data.object
    const submissionId = session.metadata?.submission_id
    const nowIso = new Date().toISOString()
    await context.env.DB.prepare(
      `UPDATE submissions
       SET status = 'submitted',
           stripe_checkout_session_id = COALESCE(stripe_checkout_session_id, ?),
           stripe_payment_intent_id = ?,
           paid_at = ?,
           submitted_at = ?,
           updated_at = ?
       WHERE id = ? AND status = 'payment_pending'`,
    )
      .bind(
        session.id,
        session.payment_intent,
        nowIso,
        nowIso,
        nowIso,
        submissionId,
      )
      .run()

    return json({ ok: true }, { headers: NO_STORE_HEADERS })
  })
}
