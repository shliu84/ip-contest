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
