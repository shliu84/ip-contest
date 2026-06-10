import type { AppEnv } from '../../_lib/env'
import { requireApplicant } from '../../_lib/authz'
import { ApiRequestError, handleApi, json, readJson } from '../../_lib/http'
import {
  assertDraft,
  assertRecord,
  feeForDivision,
  isDivision,
  loadSubmission,
  type SubmissionDivision,
} from '../../_lib/submissions'

type SubmissionUpdate = {
  division: SubmissionDivision
  profile: {
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
    certificateLanguage: 'ja' | 'en' | 'zh'
  }
  work: {
    characterName: string
    themeAndSetting: string
    exhibitionInfo: string
    payerName: string
    usagePermission: boolean
    termsAccepted: boolean
  }
}

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

const PROFILE_STRING_FIELDS = [
  'lastName',
  'firstName',
  'penName',
  'email',
  'phone',
  'countryRegion',
  'city',
  'postalCode',
  'prefecture',
  'occupation',
  'school',
  'address',
  'wechatId',
] as const

const WORK_STRING_FIELDS = [
  'characterName',
  'themeAndSetting',
  'exhibitionInfo',
  'payerName',
] as const

const CERTIFICATE_LANGUAGES = ['ja', 'en', 'zh'] as const

export const onRequestGet: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const submissionId = submissionIdFromContext(context)
    const submission = await loadSubmission(context.env.DB, submissionId, user.id)
    if (!submission) {
      throw new ApiRequestError('not_found', 'Submission not found', 404)
    }

    return json({ submission }, {
      headers: NO_STORE_HEADERS,
    })
  })
}

export const onRequestPatch: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const submissionId = submissionIdFromContext(context)
    const body = await readJson<unknown>(context.request)
    const update = parseSubmissionUpdate(body)
    const submission = await loadSubmission(context.env.DB, submissionId, user.id)
    if (!submission) {
      throw new ApiRequestError('not_found', 'Submission not found', 404)
    }
    assertDraft(submission.status)

    const nowIso = new Date().toISOString()
    await context.env.DB.batch([
      context.env.DB.prepare(
        `UPDATE submissions
         SET division = ?,
             fee_amount = ?,
             updated_at = ?
         WHERE id = ? AND user_id = ?`,
      ).bind(
        update.division,
        feeForDivision(update.division),
        nowIso,
        submissionId,
        user.id,
      ),
      context.env.DB.prepare(
        `UPDATE submission_profiles
         SET last_name = ?,
             first_name = ?,
             pen_name = ?,
             email = ?,
             phone = ?,
             country_region = ?,
             city = ?,
             postal_code = ?,
             prefecture = ?,
             occupation = ?,
             school = ?,
             address = ?,
             wechat_id = ?,
             certificate_language = ?
         WHERE submission_id = ?`,
      ).bind(
        update.profile.lastName,
        update.profile.firstName,
        update.profile.penName,
        update.profile.email,
        update.profile.phone,
        update.profile.countryRegion,
        update.profile.city,
        update.profile.postalCode,
        update.profile.prefecture,
        update.profile.occupation,
        update.profile.school,
        update.profile.address,
        update.profile.wechatId,
        update.profile.certificateLanguage,
        submissionId,
      ),
      context.env.DB.prepare(
        `UPDATE submission_works
         SET character_name = ?,
             theme_and_setting = ?,
             exhibition_info = ?,
             payer_name = ?,
             usage_permission = ?,
             terms_accepted = ?
         WHERE submission_id = ?`,
      ).bind(
        update.work.characterName,
        update.work.themeAndSetting,
        update.work.exhibitionInfo,
        update.work.payerName,
        update.work.usagePermission ? 1 : 0,
        update.work.termsAccepted ? 1 : 0,
        submissionId,
      ),
    ])

    const updatedSubmission = await loadSubmission(context.env.DB, submissionId, user.id)
    if (!updatedSubmission) {
      throw new ApiRequestError('server_error', 'Updated submission could not be loaded', 500)
    }

    return json({ submission: updatedSubmission }, {
      headers: NO_STORE_HEADERS,
    })
  })
}

function submissionIdFromContext(context: Parameters<PagesFunction<AppEnv>>[0]) {
  const idParam = context.params.id
  if (typeof idParam === 'string' && idParam.length > 0) {
    return idParam
  }
  if (Array.isArray(idParam) && typeof idParam[0] === 'string' && idParam[0].length > 0) {
    return idParam[0]
  }

  const segments = new URL(context.request.url).pathname.split('/').filter(Boolean)
  const submissionsIndex = segments.indexOf('submissions')
  const fallbackId = submissionsIndex >= 0 ? segments[submissionsIndex + 1] : undefined
  if (fallbackId) {
    return decodeURIComponent(fallbackId)
  }

  throw new ApiRequestError('not_found', 'Submission not found', 404)
}

function parseSubmissionUpdate(value: unknown): SubmissionUpdate {
  assertRecord(value)
  if (!isDivision(value.division)) {
    throw new ApiRequestError('bad_request', 'Invalid division', 400)
  }
  assertRecord(value.profile)
  assertRecord(value.work)

  const profile = value.profile
  const work = value.work
  for (const field of PROFILE_STRING_FIELDS) {
    stringField(profile, field)
  }
  assertCertificateLanguage(profile.certificateLanguage)

  for (const field of WORK_STRING_FIELDS) {
    stringField(work, field)
  }
  const usagePermission = booleanField(work, 'usagePermission')
  const termsAccepted = booleanField(work, 'termsAccepted')

  return {
    division: value.division,
    profile: {
      lastName: stringField(profile, 'lastName'),
      firstName: stringField(profile, 'firstName'),
      penName: stringField(profile, 'penName'),
      email: stringField(profile, 'email'),
      phone: stringField(profile, 'phone'),
      countryRegion: stringField(profile, 'countryRegion'),
      city: stringField(profile, 'city'),
      postalCode: stringField(profile, 'postalCode'),
      prefecture: stringField(profile, 'prefecture'),
      occupation: stringField(profile, 'occupation'),
      school: stringField(profile, 'school'),
      address: stringField(profile, 'address'),
      wechatId: stringField(profile, 'wechatId'),
      certificateLanguage: profile.certificateLanguage,
    },
    work: {
      characterName: stringField(work, 'characterName'),
      themeAndSetting: stringField(work, 'themeAndSetting'),
      exhibitionInfo: stringField(work, 'exhibitionInfo'),
      payerName: stringField(work, 'payerName'),
      usagePermission,
      termsAccepted,
    },
  }
}

function stringField(record: Record<string, unknown>, field: string) {
  const value = record[field]
  if (typeof value !== 'string') {
    throw new ApiRequestError('bad_request', 'Invalid request body', 400)
  }
  return value
}

function booleanField(record: Record<string, unknown>, field: string) {
  const value = record[field]
  if (typeof value !== 'boolean') {
    throw new ApiRequestError('bad_request', 'Invalid request body', 400)
  }
  return value
}

function assertCertificateLanguage(
  value: unknown,
): asserts value is SubmissionUpdate['profile']['certificateLanguage'] {
  if (
    typeof value !== 'string'
    || !(CERTIFICATE_LANGUAGES as readonly string[]).includes(value)
  ) {
    throw new ApiRequestError('bad_request', 'Invalid request body', 400)
  }
}
