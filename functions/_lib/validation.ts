const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export function validateEmail(value: string) {
  return value.length <= 254 && EMAIL_PATTERN.test(value)
}

export function validatePassword(value: string) {
  const length = Array.from(value).length
  return length >= 10 && length <= 128
}
