import { describe, expect, it } from 'vitest'
import { submissionActionPath } from '../src/views/applicant/dashboard-routing'

describe('dashboard submission routing', () => {
  it('routes payment pending submissions back to payment', () => {
    expect(submissionActionPath({
      id: 'submission-123',
      status: 'payment_pending',
    })).toBe('/submissions/submission-123/payment')
  })

  it('routes other submissions to the editor view', () => {
    expect(submissionActionPath({
      id: 'submission-123',
      status: 'draft',
    })).toBe('/submissions/submission-123')
    expect(submissionActionPath({
      id: 'submission-123',
      status: 'submitted',
    })).toBe('/submissions/submission-123')
  })
})
