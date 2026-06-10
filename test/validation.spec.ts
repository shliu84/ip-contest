import { describe, expect, it } from 'vitest'
import {
  PASSWORD_ITERATIONS,
  RESET_TOKEN_SECONDS,
  SESSION_COOKIE,
  SESSION_SECONDS,
  VERIFICATION_TOKEN_SECONDS,
} from '../functions/_lib/auth-constants'
import { base64UrlToBytes, bytesToBase64Url } from '../functions/_lib/encoding'
import {
  normalizeEmail,
  validateEmail,
  validatePassword,
} from '../functions/_lib/validation'

describe('authentication constants', () => {
  it('uses the required security and expiration settings', () => {
    expect(PASSWORD_ITERATIONS).toBe(310_000)
    expect(VERIFICATION_TOKEN_SECONDS).toBe(24 * 60 * 60)
    expect(RESET_TOKEN_SECONDS).toBe(60 * 60)
    expect(SESSION_SECONDS).toBe(7 * 24 * 60 * 60)
    expect(SESSION_COOKIE).toBe('aipc_session')
  })
})

describe('base64url encoding', () => {
  it('roundtrips bytes without padding or unsafe characters', () => {
    const bytes = new Uint8Array([251, 255, 239, 0, 1])
    const encoded = bytesToBase64Url(bytes)

    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(Array.from(base64UrlToBytes(encoded))).toEqual(Array.from(bytes))
  })

  it('throws for malformed input', () => {
    expect(() => base64UrlToBytes('***')).toThrow()
  })
})

describe('email validation', () => {
  it('normalizes surrounding whitespace and case', () => {
    expect(normalizeEmail('  Person@Example.COM \n')).toBe('person@example.com')
  })

  it('accepts a valid email at the maximum length', () => {
    const email = `${'a'.repeat(242)}@example.com`

    expect(email).toHaveLength(254)
    expect(validateEmail(email)).toBe(true)
  })

  it('rejects emails over 254 characters or without a dotted domain', () => {
    const tooLong = `${'a'.repeat(243)}@example.com`

    expect(validateEmail(tooLong)).toBe(false)
    expect(validateEmail('person@example')).toBe(false)
    expect(validateEmail('person @example.com')).toBe(false)
  })
})

describe('password validation', () => {
  it('counts Unicode code points at the 10 and 128 boundaries', () => {
    expect(validatePassword('😀'.repeat(9))).toBe(false)
    expect(validatePassword('😀'.repeat(10))).toBe(true)
    expect(validatePassword('😀'.repeat(128))).toBe(true)
    expect(validatePassword('😀'.repeat(129))).toBe(false)
  })
})
