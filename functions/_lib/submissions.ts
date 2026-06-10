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

export function createSubmissionNo() {
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  const suffix = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())
    .join('')
  return `AIPC2026-${suffix}`
}
