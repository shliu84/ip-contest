export type UserRole = 'applicant' | 'committee' | 'judge' | 'super_admin'

export type CurrentUser = {
  id: string
  email: string
  role: UserRole
  emailVerifiedAt: string | null
}

export type MeResponse = {
  user: CurrentUser | null
}

export type ApiOkResponse = {
  ok: true
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  user: CurrentUser
}

export type RegisterRequest = {
  email: string
  password: string
}

export type ForgotPasswordRequest = {
  email: string
}

export type ResetPasswordRequest = {
  token: string
  password: string
}
