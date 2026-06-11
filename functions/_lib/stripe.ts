import { ApiRequestError } from './http'
import type { SubmissionModel } from './submissions'

type StripeCheckoutSessionResponse = {
  id?: unknown
  url?: unknown
  error?: {
    message?: unknown
  }
}

export type CheckoutSessionCompletedEvent = {
  type: 'checkout.session.completed'
  data: {
    object: {
      id: string
      payment_intent: string | null
      metadata?: {
        submission_id?: string
      }
    }
  }
}

export async function createStripeCheckoutSession(params: {
  secretKey: string
  appBaseUrl: string
  submission: SubmissionModel
}) {
  const successUrl = new URL('/payment/success', params.appBaseUrl)
  successUrl.searchParams.set('submissionId', params.submission.id)
  const cancelUrl = new URL('/payment/cancel', params.appBaseUrl)
  cancelUrl.searchParams.set('submissionId', params.submission.id)

  const form = new URLSearchParams()
  form.set('mode', 'payment')
  form.set('client_reference_id', params.submission.id)
  form.set('success_url', successUrl.toString())
  form.set('cancel_url', cancelUrl.toString())
  form.set('metadata[submission_id]', params.submission.id)
  form.set('line_items[0][quantity]', '1')
  form.set('line_items[0][price_data][currency]', params.submission.currency.toLowerCase())
  form.set('line_items[0][price_data][unit_amount]', String(params.submission.feeAmount))
  form.set(
    'line_items[0][price_data][product_data][name]',
    `ASIA IP CONTEST ${params.submission.division.toUpperCase()} entry`,
  )

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${params.secretKey}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  })
  const body = await response.json<StripeCheckoutSessionResponse>()

  if (!response.ok) {
    const message = typeof body.error?.message === 'string'
      ? body.error.message
      : 'Stripe Checkout Session could not be created'
    throw new ApiRequestError('server_error', message, 502)
  }
  if (typeof body.id !== 'string' || typeof body.url !== 'string') {
    throw new ApiRequestError('server_error', 'Stripe Checkout Session response was invalid', 502)
  }

  return {
    id: body.id,
    url: body.url,
  }
}

export async function verifyStripeWebhook(
  payload: string,
  signatureHeader: string | null,
  webhookSecret: string,
) {
  const signature = parseStripeSignature(signatureHeader)
  const expected = await hmacSha256Hex(webhookSecret, `${signature.timestamp}.${payload}`)
  if (!timingSafeEqualHex(signature.signature, expected)) {
    throw new ApiRequestError('bad_request', 'Invalid Stripe webhook signature', 400)
  }
}

export function parseCheckoutSessionCompletedEvent(payload: string) {
  let value: unknown
  try {
    value = JSON.parse(payload)
  } catch {
    throw new ApiRequestError('bad_request', 'Malformed Stripe webhook payload', 400)
  }

  if (!isRecord(value) || value.type !== 'checkout.session.completed') {
    return null
  }
  const data = value.data
  const object = isRecord(data) ? data.object : undefined
  const metadata = isRecord(object) ? object.metadata : undefined
  const sessionId = isRecord(object) ? object.id : undefined
  const paymentIntent = isRecord(object) ? object.payment_intent : undefined
  const submissionId = isRecord(metadata) ? metadata.submission_id : undefined

  if (
    typeof sessionId !== 'string'
    || (paymentIntent !== null && typeof paymentIntent !== 'string')
    || typeof submissionId !== 'string'
    || submissionId.trim().length === 0
  ) {
    throw new ApiRequestError('bad_request', 'Invalid Checkout Session webhook payload', 400)
  }

  return {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: sessionId,
        payment_intent: paymentIntent,
        metadata: {
          submission_id: submissionId,
        },
      },
    },
  } satisfies CheckoutSessionCompletedEvent
}

function parseStripeSignature(signatureHeader: string | null) {
  if (!signatureHeader) {
    throw new ApiRequestError('bad_request', 'Missing Stripe webhook signature', 400)
  }

  const parts = signatureHeader.split(',')
  const timestamp = parts
    .map((part) => part.split('='))
    .find(([key]) => key === 't')?.[1]
  const signature = parts
    .map((part) => part.split('='))
    .find(([key]) => key === 'v1')?.[1]

  if (!timestamp || !signature || !/^\d+$/.test(timestamp) || !/^[a-f0-9]+$/i.test(signature)) {
    throw new ApiRequestError('bad_request', 'Invalid Stripe webhook signature', 400)
  }

  return {
    timestamp,
    signature,
  }
}

async function hmacSha256Hex(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(value),
  )
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function timingSafeEqualHex(left: string, right: string) {
  const normalizedLeft = left.toLowerCase()
  const normalizedRight = right.toLowerCase()
  if (normalizedLeft.length !== normalizedRight.length) {
    return false
  }

  let difference = 0
  for (let index = 0; index < normalizedLeft.length; index += 1) {
    difference |= normalizedLeft.charCodeAt(index) ^ normalizedRight.charCodeAt(index)
  }
  return difference === 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
