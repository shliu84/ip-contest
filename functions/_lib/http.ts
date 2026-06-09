export type ApiErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'server_error'

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

export async function readJson<T>(request: Request): Promise<T> {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error('Expected application/json')
  }
  return request.json() as Promise<T>
}
