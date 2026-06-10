import type { SubmissionStatus } from '../../types/api'

type SubmissionRouteTarget = {
  id: string
  status: SubmissionStatus
}

export function submissionActionPath(submission: SubmissionRouteTarget) {
  const encodedId = encodeURIComponent(submission.id)
  if (submission.status === 'payment_pending') {
    return `/submissions/${encodedId}/payment`
  }

  return `/submissions/${encodedId}`
}
