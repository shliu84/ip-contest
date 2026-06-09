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
    const message = await response.text()
    throw new Error(message || `Request failed with ${response.status}`)
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
