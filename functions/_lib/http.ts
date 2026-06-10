export type ApiErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'invalid_submission'
  | 'quota_exceeded'
  | 'email_not_verified'
  | 'email_delivery_failed'
  | 'server_error'

export class ApiRequestError extends Error {
  code: ApiErrorCode
  status: number

  constructor(code: ApiErrorCode, message: string, status = 400) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = code
    this.status = status
  }
}

export function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json; charset=utf-8')
  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  })
}

export function apiError(code: ApiErrorCode, message: string, status = 400) {
  return json({ error: { code, message } }, { status })
}

export function handleApi(handler: () => Promise<Response>) {
  return handler().catch((error: unknown) => {
    if (error instanceof ApiRequestError) {
      return apiError(error.code, error.message, error.status)
    }
    console.error(error)
    return apiError('server_error', 'Internal server error', 500)
  })
}

export async function readJson<T>(request: Request): Promise<T> {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new ApiRequestError('bad_request', 'Expected application/json', 400)
  }

  try {
    return await request.json() as T
  } catch {
    throw new ApiRequestError('bad_request', 'Malformed JSON body', 400)
  }
}
