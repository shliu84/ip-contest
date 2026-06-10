import { bytesToBase64Url } from './encoding'

export function createToken() {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)))
}

export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(token),
  )
  return bytesToBase64Url(new Uint8Array(digest))
}
