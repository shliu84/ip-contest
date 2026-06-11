import { ApiRequestError } from './http'

export const COUNTRY_REGION_OPTIONS = ['JP', 'CN', 'TW', 'HK', 'KR', 'SG', 'TH', 'ID', 'MY', 'PH', 'VN', 'OTHER'] as const
export const PHONE_COUNTRY_CODE_OPTIONS = ['+81', '+86', '+886', '+852', '+82', '+65', '+66', '+62', '+60', '+63', '+84', 'OTHER'] as const
export const PREFECTURE_OPTIONS = [
  'outside_japan',
  'hokkaido',
  'aomori',
  'iwate',
  'miyagi',
  'akita',
  'yamagata',
  'fukushima',
  'ibaraki',
  'tochigi',
  'gunma',
  'saitama',
  'chiba',
  'tokyo',
  'kanagawa',
  'niigata',
  'toyama',
  'ishikawa',
  'fukui',
  'yamanashi',
  'nagano',
  'gifu',
  'shizuoka',
  'aichi',
  'mie',
  'shiga',
  'kyoto',
  'osaka',
  'hyogo',
  'nara',
  'wakayama',
  'tottori',
  'shimane',
  'okayama',
  'hiroshima',
  'yamaguchi',
  'tokushima',
  'kagawa',
  'ehime',
  'kochi',
  'fukuoka',
  'saga',
  'nagasaki',
  'kumamoto',
  'oita',
  'miyazaki',
  'kagoshima',
  'okinawa',
] as const
export const OCCUPATION_OPTIONS = ['student', 'company_employee', 'self_employed', 'creator', 'company_representative', 'other'] as const
export const CERTIFICATE_LANGUAGE_OPTIONS = ['ja', 'en', 'zh'] as const

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
  certificateLanguage: 'ja' | 'en' | 'zh'
}

type ApplicantProfileRow = {
  last_name: string
  first_name: string
  last_name_kana: string
  first_name_kana: string
  pen_name: string
  country_region: string
  phone_country_code: string
  phone_number: string
  postal_code: string
  prefecture: string
  city: string
  address_line1: string
  address_line2: string
  occupation: string
  school: string
  wechat_id: string
  certificate_language: 'ja' | 'en' | 'zh'
}

type ApplicantProfileInput = {
  lastName?: unknown
  firstName?: unknown
  lastNameKana?: unknown
  firstNameKana?: unknown
  penName?: unknown
  countryRegion?: unknown
  phoneCountryCode?: unknown
  phoneNumber?: unknown
  postalCode?: unknown
  prefecture?: unknown
  city?: unknown
  addressLine1?: unknown
  addressLine2?: unknown
  occupation?: unknown
  school?: unknown
  wechatId?: unknown
  certificateLanguage?: unknown
}

export function emptyApplicantProfile(): ApplicantProfile {
  return {
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    penName: '',
    countryRegion: '',
    phoneCountryCode: '',
    phoneNumber: '',
    postalCode: '',
    prefecture: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    occupation: '',
    school: '',
    wechatId: '',
    certificateLanguage: 'ja',
  }
}

export async function loadApplicantProfile(
  db: D1Database,
  userId: string,
): Promise<ApplicantProfile> {
  const row = await db.prepare(`
    SELECT
      last_name,
      first_name,
      last_name_kana,
      first_name_kana,
      pen_name,
      country_region,
      phone_country_code,
      phone_number,
      postal_code,
      prefecture,
      city,
      address_line1,
      address_line2,
      occupation,
      school,
      wechat_id,
      certificate_language
    FROM user_profiles
    WHERE user_id = ?
  `)
    .bind(userId)
    .first<ApplicantProfileRow>()

  if (!row) {
    return emptyApplicantProfile()
  }

  return {
    lastName: row.last_name,
    firstName: row.first_name,
    lastNameKana: row.last_name_kana,
    firstNameKana: row.first_name_kana,
    penName: row.pen_name,
    countryRegion: row.country_region,
    phoneCountryCode: row.phone_country_code,
    phoneNumber: row.phone_number,
    postalCode: row.postal_code,
    prefecture: row.prefecture,
    city: row.city,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    occupation: row.occupation,
    school: row.school,
    wechatId: row.wechat_id,
    certificateLanguage: row.certificate_language,
  }
}

export function parseApplicantProfile(
  value: unknown,
  mode: 'registration' | 'full',
): ApplicantProfile {
  if (!isRecord(value) || Array.isArray(value)) {
    throw new ApiRequestError('bad_request', 'Invalid profile body', 400)
  }

  const input = value as ApplicantProfileInput
  const profile: ApplicantProfile = {
    lastName: stringField(input, 'lastName'),
    firstName: stringField(input, 'firstName'),
    lastNameKana: stringField(input, 'lastNameKana'),
    firstNameKana: stringField(input, 'firstNameKana'),
    penName: stringField(input, 'penName'),
    countryRegion: stringField(input, 'countryRegion'),
    phoneCountryCode: stringField(input, 'phoneCountryCode'),
    phoneNumber: stringField(input, 'phoneNumber'),
    postalCode: stringField(input, 'postalCode'),
    prefecture: stringField(input, 'prefecture'),
    city: stringField(input, 'city'),
    addressLine1: stringField(input, 'addressLine1'),
    addressLine2: stringField(input, 'addressLine2'),
    occupation: stringField(input, 'occupation'),
    school: stringField(input, 'school'),
    wechatId: stringField(input, 'wechatId'),
    certificateLanguage: certificateLanguageField(input),
  }

  validateApplicantProfile(profile, mode)
  return profile
}

export function validateApplicantProfile(
  profile: ApplicantProfile,
  mode: 'registration' | 'full',
): void {
  if (!hasText(profile.lastName)
    || !hasText(profile.firstName)
    || !hasText(profile.countryRegion)
    || !hasText(profile.phoneCountryCode)
    || !hasText(profile.phoneNumber)
  ) {
    throw new ApiRequestError('bad_request', 'Invalid profile', 400)
  }

  if (!isCountryRegion(profile.countryRegion)) {
    throw new ApiRequestError('bad_request', 'Invalid country region', 400)
  }
  if (!isPhoneCountryCode(profile.phoneCountryCode)) {
    throw new ApiRequestError('bad_request', 'Invalid phone country code', 400)
  }
  if (!isCertificateLanguage(profile.certificateLanguage)) {
    throw new ApiRequestError('bad_request', 'Invalid certificate language', 400)
  }

  if (mode === 'full') {
    if (hasText(profile.prefecture) && !isPrefecture(profile.prefecture)) {
      throw new ApiRequestError('bad_request', 'Invalid prefecture', 400)
    }
    if (hasText(profile.occupation) && !isOccupation(profile.occupation)) {
      throw new ApiRequestError('bad_request', 'Invalid occupation', 400)
    }
    if (profile.occupation === 'student' && !hasText(profile.school)) {
      throw new ApiRequestError('bad_request', 'School is required for students', 400)
    }
  }
}

export async function upsertApplicantProfile(
  db: D1Database,
  userId: string,
  profile: ApplicantProfile,
): Promise<ApplicantProfile> {
  await db.prepare(`
    INSERT INTO user_profiles (
      user_id,
      last_name,
      first_name,
      last_name_kana,
      first_name_kana,
      pen_name,
      country_region,
      phone_country_code,
      phone_number,
      postal_code,
      prefecture,
      city,
      address_line1,
      address_line2,
      occupation,
      school,
      wechat_id,
      certificate_language,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT (user_id) DO UPDATE SET
      last_name = excluded.last_name,
      first_name = excluded.first_name,
      last_name_kana = excluded.last_name_kana,
      first_name_kana = excluded.first_name_kana,
      pen_name = excluded.pen_name,
      country_region = excluded.country_region,
      phone_country_code = excluded.phone_country_code,
      phone_number = excluded.phone_number,
      postal_code = excluded.postal_code,
      prefecture = excluded.prefecture,
      city = excluded.city,
      address_line1 = excluded.address_line1,
      address_line2 = excluded.address_line2,
      occupation = excluded.occupation,
      school = excluded.school,
      wechat_id = excluded.wechat_id,
      certificate_language = excluded.certificate_language,
      updated_at = datetime('now')
  `)
    .bind(
      userId,
      profile.lastName,
      profile.firstName,
      profile.lastNameKana,
      profile.firstNameKana,
      profile.penName,
      profile.countryRegion,
      profile.phoneCountryCode,
      profile.phoneNumber,
      profile.postalCode,
      profile.prefecture,
      profile.city,
      profile.addressLine1,
      profile.addressLine2,
      profile.occupation,
      profile.school,
      profile.wechatId,
      profile.certificateLanguage,
    )
    .run()

  return loadApplicantProfile(db, userId)
}

export function profilePhone(profile: ApplicantProfile) {
  if (profile.phoneCountryCode && profile.phoneNumber) {
    return `${profile.phoneCountryCode} ${profile.phoneNumber}`
  }
  return profile.phoneCountryCode || profile.phoneNumber
}

export function profileAddress(profile: ApplicantProfile) {
  if (profile.addressLine1 && profile.addressLine2) {
    return `${profile.addressLine1} ${profile.addressLine2}`
  }
  return profile.addressLine1 || profile.addressLine2
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function hasText(value: string) {
  return value.trim().length > 0
}

function stringField(record: ApplicantProfileInput, field: keyof ApplicantProfileInput): string {
  const value = record[field]
  if (value === undefined) {
    return ''
  }
  if (typeof value !== 'string') {
    throw new ApiRequestError('bad_request', 'Invalid profile body', 400)
  }
  return value
}

function certificateLanguageField(record: ApplicantProfileInput): 'ja' | 'en' | 'zh' {
  const value = record.certificateLanguage
  if (value === undefined) {
    return 'ja'
  }
  if (typeof value !== 'string') {
    throw new ApiRequestError('bad_request', 'Invalid profile body', 400)
  }
  return value as 'ja' | 'en' | 'zh'
}

function isOption<T extends string>(value: string, options: readonly T[]) {
  return (options as readonly string[]).includes(value)
}

function isCountryRegion(value: string): value is (typeof COUNTRY_REGION_OPTIONS)[number] {
  return isOption(value, COUNTRY_REGION_OPTIONS)
}

function isPhoneCountryCode(value: string): value is (typeof PHONE_COUNTRY_CODE_OPTIONS)[number] {
  return isOption(value, PHONE_COUNTRY_CODE_OPTIONS)
}

function isCertificateLanguage(value: string): value is (typeof CERTIFICATE_LANGUAGE_OPTIONS)[number] {
  return isOption(value, CERTIFICATE_LANGUAGE_OPTIONS)
}

function isPrefecture(value: string): value is (typeof PREFECTURE_OPTIONS)[number] {
  return isOption(value, PREFECTURE_OPTIONS)
}

function isOccupation(value: string): value is (typeof OCCUPATION_OPTIONS)[number] {
  return isOption(value, OCCUPATION_OPTIONS)
}
