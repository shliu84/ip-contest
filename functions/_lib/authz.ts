import { ApiRequestError } from './http'
import { getSessionUser, type SessionUser } from './session'

export async function requireUser(db: D1Database, request: Request): Promise<SessionUser> {
  const user = await getSessionUser(db, request)
  if (!user) {
    throw new ApiRequestError('unauthorized', 'Authentication required', 401)
  }
  return user
}

export async function requireApplicant(db: D1Database, request: Request): Promise<SessionUser> {
  const user = await requireUser(db, request)
  if (user.role !== 'applicant') {
    throw new ApiRequestError('forbidden', 'Applicant access required', 403)
  }
  return user
}

export async function requireCommittee(db: D1Database, request: Request): Promise<SessionUser> {
  const user = await requireUser(db, request)
  if (user.role !== 'committee' && user.role !== 'super_admin') {
    throw new ApiRequestError('forbidden', 'Committee access required', 403)
  }
  return user
}
