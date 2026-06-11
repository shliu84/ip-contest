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
  lastName: string
  firstName: string
  countryRegion: string
  phoneCountryCode: string
  phoneNumber: string
}

export type ForgotPasswordRequest = {
  email: string
}

export type ResetPasswordRequest = {
  token: string
  password: string
}

export type SubmissionDivision = '2d' | '3d' | 'ai' | 'corporate'

export type SubmissionStatus =
  | 'draft'
  | 'payment_pending'
  | 'submitted'
  | 'screening'
  | 'screened_in'
  | 'screened_out'
  | 'assigned'
  | 'reviewed'
  | 'withdrawn'

export type CertificateLanguage = 'ja' | 'en' | 'zh'

export type SubmissionFileType =
  | 'online_a4_image'
  | 'physical_a2_image'
  | 'process_or_prompt_screenshot'
  | 'unedited_original_ai'

export type SubmissionProfile = {
  lastName: string
  firstName: string
  penName: string
  email: string
  phone: string
  countryRegion: string
  city: string
  postalCode: string
  prefecture: string
  occupation: string
  school: string
  address: string
  wechatId: string
  certificateLanguage: CertificateLanguage
}

export type ApplicantProfile = {
  lastName: string
  firstName: string
  lastNameKana: string
  firstNameKana: string
  penName: string
  countryRegion: string
  phoneCountryCode: string
  phoneNumber: string
  postalCode: string
  prefecture: string
  city: string
  addressLine1: string
  addressLine2: string
  occupation: string
  school: string
  wechatId: string
  certificateLanguage: CertificateLanguage
}

export type ProfileResponse = {
  profile: ApplicantProfile
}

export type SubmissionWork = {
  characterName: string
  themeAndSetting: string
  exhibitionInfo: string
  payerName: string
  usagePermission: boolean
  termsAccepted: boolean
}

export type SubmissionFile = {
  id: string
  fileType: SubmissionFileType
  originalFilename: string
  contentType: string
  sizeBytes: number
  uploadedAt: string
}

export type Submission = {
  id: string
  submissionNo: string
  status: SubmissionStatus
  division: SubmissionDivision
  feeAmount: number
  currency: 'JPY'
  stripeCheckoutSessionId: string | null
  stripePaymentIntentId: string | null
  paidAt: string | null
  submittedAt: string | null
  createdAt: string
  updatedAt: string
  profile: SubmissionProfile
  work: SubmissionWork
  files: SubmissionFile[]
}

export type SubmissionListItem = Pick<
  Submission,
  'id' | 'submissionNo' | 'status' | 'division' | 'feeAmount' | 'currency' | 'createdAt' | 'updatedAt'
> & {
  characterName: string
  fileCount: number
}

export type SubmissionListResponse = {
  submissions: SubmissionListItem[]
}

export type SubmissionResponse = {
  submission: Submission
}

export type AdminSubmissionListItem = {
  id: string
  submissionNo: string
  applicantEmail: string
  status: SubmissionStatus
  division: SubmissionDivision
  feeAmount: number
  currency: 'JPY'
  characterName: string
  fileCount: number
  paidAt: string | null
  submittedAt: string | null
  createdAt: string
  updatedAt: string
}

export type AdminSubmissionFile = SubmissionFile & {
  r2Key: string
}

export type AdminSubmission = AdminSubmissionListItem & {
  applicant: CurrentUser
  profile: SubmissionProfile
  work: SubmissionWork
  files: AdminSubmissionFile[]
}

export type AdminSubmissionListFilters = {
  status?: SubmissionStatus | ''
  division?: SubmissionDivision | ''
  q?: string
}

export type AdminSubmissionListResponse = {
  submissions: AdminSubmissionListItem[]
}

export type AdminSubmissionResponse = {
  submission: AdminSubmission
}

export type CreateSubmissionRequest = {
  division: SubmissionDivision
}

export type UpdateSubmissionRequest = {
  division: SubmissionDivision
  profile: SubmissionProfile
  work: SubmissionWork
}

export type UploadSubmissionFileRequest = {
  fileType: SubmissionFileType
  filename: string
  contentType: string
  dataBase64: string
}

export type CheckoutPaymentRequest = {
  submissionId: string
}

export type CheckoutPaymentResponse = {
  checkoutUrl: string
}

export type UpdateAdminSubmissionStatusRequest = {
  status: SubmissionStatus
}
