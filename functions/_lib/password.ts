import { PASSWORD_ITERATIONS } from './auth-constants'
import { base64UrlToBytes, bytesToBase64Url } from './encoding'

const ALGORITHM = 'pbkdf2_sha256'
const SALT_BYTES = 16
const KEY_BYTES = 32

async function derivePassword(password: string, salt: Uint8Array) {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: PASSWORD_ITERATIONS,
    },
    passwordKey,
    KEY_BYTES * 8,
  )

  return new Uint8Array(bits)
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false
  }

  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index]
  }
  return difference === 0
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await derivePassword(password, salt)

  return [
    ALGORITHM,
    PASSWORD_ITERATIONS,
    bytesToBase64Url(salt),
    bytesToBase64Url(hash),
  ].join('$')
}

export async function verifyPassword(password: string, encoded: string) {
  try {
    const parts = encoded.split('$')
    if (
      parts.length !== 4
      || parts[0] !== ALGORITHM
      || parts[1] !== String(PASSWORD_ITERATIONS)
    ) {
      return false
    }

    const salt = base64UrlToBytes(parts[2])
    const storedHash = base64UrlToBytes(parts[3])
    if (salt.length !== SALT_BYTES || storedHash.length !== KEY_BYTES) {
      return false
    }

    const derivedHash = await derivePassword(password, salt)
    return constantTimeEqual(derivedHash, storedHash)
  } catch {
    return false
  }
}
