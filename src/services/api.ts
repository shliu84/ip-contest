import type {
  ApiOkResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from '../types/api'

type ApiErrorPayload = {
  error?: {
    code?: unknown
    message?: unknown
  }
}

export class ApiClientError extends Error {
  code: string
  status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.status = status
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const hasBody = init.body !== undefined && init.body !== null
  const shouldDefaultJson =
    hasBody &&
    typeof init.body === 'string' &&
    !headers.has('content-type')

  if (shouldDefaultJson) {
    headers.set('content-type', 'application/json')
  }

  const response = await fetch(path, {
    credentials: 'include',
    ...init,
    headers,
  })

  if (!response.ok) {
    const text = await response.text()
    const responseType = response.headers.get('content-type') || ''

    if (text && responseType.includes('application/json')) {
      try {
        const data = JSON.parse(text) as ApiErrorPayload
        const code = data.error?.code
        const message = data.error?.message
        if (typeof code === 'string' && typeof message === 'string') {
          throw new ApiClientError(message, code, response.status)
        }
      } catch (error) {
        if (error instanceof ApiClientError) {
          throw error
        }
      }
    }

    throw new ApiClientError(
      text || `Request failed with ${response.status}`,
      'request_failed',
      response.status,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  const responseType = response.headers.get('content-type') || ''
  if (responseType.includes('application/json')) {
    return JSON.parse(text) as T
  }

  return text as T
}

export function register(body: RegisterRequest) {
  return apiFetch<ApiOkResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function login(body: LoginRequest) {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function logout() {
  return apiFetch<ApiOkResponse>('/api/auth/logout', {
    method: 'POST',
  })
}

export function verifyEmail(token: string) {
  const params = new URLSearchParams({ token })
  return apiFetch<ApiOkResponse>(`/api/auth/verify-email?${params.toString()}`)
}

export function requestPasswordReset(body: ForgotPasswordRequest) {
  return apiFetch<ApiOkResponse>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function resetPassword(body: ResetPasswordRequest) {
  return apiFetch<ApiOkResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
