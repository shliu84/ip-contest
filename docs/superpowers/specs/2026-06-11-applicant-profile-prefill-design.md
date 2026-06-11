# Applicant Profile Prefill Design

Date: 2026-06-11
Status: Pending user review

## Goal

Add account-level applicant profile data so applicants can enter personal information once, maintain it from the dashboard, and have new draft submissions prefilled automatically.

This improves the applicant workflow before real payment, admin downloads, judging, and final visual polish. It also makes the registration and submission forms closer to a Japanese contest application site by using normalized select fields where practical.

## Current State

Registration currently collects only email and password. The dashboard shows the signed-in email, role, logout action, and submission list. Submission profile data exists only inside each `submission_profiles` row, so new submissions are mostly blank except for the account email.

File uploads already happen during the draft phase. When an applicant selects a file, the frontend posts it to `/api/submissions/:id/upload-url`; the backend stores the object in R2 and inserts `submission_files` metadata. The later submit action only validates the draft and changes submission state to `payment_pending`.

## Scope

In scope:

- Add a `user_profiles` table for account-level applicant profile fields.
- Extend registration with a small required profile subset.
- Add dashboard profile viewing and editing for applicants.
- Prefill newly created draft submissions from the current account profile.
- Keep each submission profile as an immutable-by-default snapshot once the draft is created.
- Normalize country or region, phone country code, prefecture, occupation, and certificate language fields with select controls.
- Align submission file requirements with the current guideline structure by division.
- Keep draft file upload behavior: files upload immediately to R2 when selected.
- Treat payment completion as a submission status transition, without moving R2 objects.

Out of scope:

- Real Stripe payment.
- Admin file downloads.
- Judging workflows.
- Final visual redesign.
- Final participation terms text. The UI should provide a stable placeholder structure that can receive official text later.
- Automatic address lookup from postal code. The form can be structured to support this later, but this phase should not depend on an external address API.

## Data Model

Create a new `user_profiles` table:

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  last_name TEXT NOT NULL DEFAULT '',
  first_name TEXT NOT NULL DEFAULT '',
  last_name_kana TEXT NOT NULL DEFAULT '',
  first_name_kana TEXT NOT NULL DEFAULT '',
  pen_name TEXT NOT NULL DEFAULT '',
  country_region TEXT NOT NULL DEFAULT '',
  phone_country_code TEXT NOT NULL DEFAULT '',
  phone_number TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  prefecture TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  address_line1 TEXT NOT NULL DEFAULT '',
  address_line2 TEXT NOT NULL DEFAULT '',
  occupation TEXT NOT NULL DEFAULT '',
  school TEXT NOT NULL DEFAULT '',
  wechat_id TEXT NOT NULL DEFAULT '',
  certificate_language TEXT NOT NULL DEFAULT 'ja',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Keep `submission_profiles` as the per-submission snapshot used by admin review and exports. Do not replace it with live joins to `user_profiles`.

Recommended mapping when creating a draft:

- `last_name` -> `submission_profiles.last_name`
- `first_name` -> `submission_profiles.first_name`
- `pen_name` -> `submission_profiles.pen_name`
- `users.email` -> `submission_profiles.email`
- `phone_country_code + phone_number` -> `submission_profiles.phone`
- `country_region` -> `submission_profiles.country_region`
- `city` -> `submission_profiles.city`
- `postal_code` -> `submission_profiles.postal_code`
- `prefecture` -> `submission_profiles.prefecture`
- `address_line1 + address_line2` -> `submission_profiles.address`
- `occupation` -> `submission_profiles.occupation`
- `school` -> `submission_profiles.school`
- `wechat_id` -> `submission_profiles.wechat_id`
- `certificate_language` -> `submission_profiles.certificate_language`

Kana fields remain account-level only for now unless a later official submission/export format requires them.

## Registration Flow

Registration should remain lightweight. Add only the profile fields needed to make the account usable:

- Email.
- Password.
- Confirm password.
- Last name.
- First name.
- Country or region select.
- Phone country code select.
- Phone number.

On successful registration:

- Insert the `users` row.
- Insert a matching `user_profiles` row in the same request flow.
- Send the verification email as before.

The account email remains the login identity. The profile email for a submission is still copied from `users.email` when a draft is created, but the applicant may edit that per-submission email while the submission is still a draft.

## Dashboard Profile Editing

For applicant users, the dashboard should add a profile section above or beside the submissions list.

Fields:

- Last name.
- First name.
- Last name kana.
- First name kana.
- Pen name.
- Country or region.
- Phone country code.
- Phone number.
- Postal code.
- Prefecture.
- City, ward, town, or village.
- Address line 1.
- Building or room.
- Occupation.
- School name, visible when occupation is `student`.
- WeChat ID.
- Certificate language.

Use Japanese-site-style controls where practical:

- Country or region: select with common contest regions first, then broader options.
- Phone country code: select, with labels such as `Japan (+81)`, `China (+86)`, `Taiwan (+886)`, `Hong Kong (+852)`, `Korea (+82)`, and `Other`.
- Prefecture: select with all Japanese prefectures plus `Outside Japan`.
- Occupation: select, with `student`, `company_employee`, `self_employed`, `creator`, `company_representative`, `other`.
- Certificate language: select with Japanese, English, Chinese.

Validation:

- Last name, first name, country or region, phone country code, and phone number are required.
- Postal code is optional but should accept common Japanese hyphenated format.
- School is required only when occupation is `student`.
- All profile writes require an authenticated applicant session.

## API Design

Add applicant profile endpoints:

- `GET /api/profile`
- `PATCH /api/profile`

`GET /api/profile` returns the current applicant's account profile. If a legacy account lacks a `user_profiles` row, the endpoint should create or return an empty default profile for that user.

`PATCH /api/profile` validates and updates the current applicant's account profile, returning the saved profile. It must not update existing `submission_profiles`.

Update `POST /api/auth/register`:

- Accept the required registration profile fields.
- Create `user_profiles` together with `users`.
- Preserve existing email verification behavior and security responses.

Update `POST /api/submissions`:

- Load the current applicant's profile.
- Insert `submission_profiles` from that account profile instead of only inserting email.
- Continue enforcing the draft count limit and server-derived fee.

## Frontend Design

### Register Page

Keep the page simple, but group fields clearly:

- Account: email, password, confirm password.
- Applicant: last name, first name, country or region, phone country code, phone number.

Use select controls for country or region and phone country code.

### Dashboard Page

Add an applicant profile form that can be saved independently from submissions.

States:

- Loading profile.
- Save pending.
- Save success.
- API error.

The submissions table should remain available. Profile editing should not block viewing existing submissions unless the profile request itself fails.

### Submission Editor

New draft submissions open with copied profile values already filled. Applicants can still edit the per-submission profile while the submission is `draft`.

The editor should adjust file groups by division:

- `2d`, `3d`, `corporate`: online A4 image, physical A2 image, production process image.
- `ai`: online A4 image, physical A2 image, prompt or process screenshot.

The existing `unedited_original_ai` field can remain supported in the data model, but the default UI should follow the current guideline wording unless official rules later require an additional AI original file.

### Participation Terms Placeholder

Keep a terms acceptance checkbox in the submission editor. Add a stable link or expandable panel labeled from translations so official participation terms can be inserted later without changing the submit flow.

The final terms copy is intentionally deferred until the user provides official content.

## File Upload And Submission State

Keep the existing draft upload model:

1. Applicant creates or opens a draft.
2. Applicant selects a file.
3. The frontend uploads the file immediately.
4. The backend stores the object in R2 and records metadata in `submission_files`.
5. Applicant clicks submit or proceed to payment.
6. The backend validates required profile, work, consent, and file requirements.
7. The submission changes to `payment_pending`.
8. Payment completion later changes the submission to `submitted`.

Do not move, copy, or rename R2 objects when a payment succeeds. The submission status in D1 is the source of truth for whether uploaded files are draft materials or official submitted materials.

## Submission Validation

Update ready-for-payment validation:

- Required profile fields: last name, first name, email, country or region, phone.
- Required address fields can remain optional until official rules require otherwise.
- Required work fields: character name, theme and setting, payer name.
- Usage permission and terms acceptance must be true.
- Required files by division:
  - `2d`: online A4 image, physical A2 image, process image.
  - `3d`: online A4 image, physical A2 image, process image.
  - `corporate`: online A4 image, physical A2 image, process image.
  - `ai`: online A4 image, physical A2 image, prompt or process screenshot.

The frontend should surface the same requirement groups, but server validation remains the source of truth.

## Options Considered

### Recommended: Account Profile Plus Submission Snapshot

Applicants maintain one account profile. Creating a draft copies it into `submission_profiles`.

Pros:

- Preserves official submitted records.
- Lets applicants reuse information across multiple entries.
- Keeps admin views and exports based on the submitted snapshot.
- Avoids surprising changes to existing drafts or submitted entries when the account profile is edited.

Cons:

- Requires a migration and profile API.
- Some fields exist in both account profile and submission profile.

### Live Account Profile Join

Submissions would read profile fields directly from `user_profiles`.

Pros:

- Less duplication.
- Profile edits appear everywhere immediately.

Cons:

- Submitted records can change after the fact.
- Admin/export data is less stable.
- Harder to support one-off contact or display information per submission.

### Full Profile Required At Registration

Registration would collect all applicant profile fields.

Pros:

- The first draft is highly complete.

Cons:

- Registration becomes too heavy.
- Address and occupation details may discourage account creation.
- Some fields are better completed when the applicant is ready to submit.

## Testing

Backend tests:

- Registration creates both `users` and `user_profiles`.
- Invalid registration profile fields return `400`.
- `GET /api/profile` requires applicant auth and returns the saved profile.
- `PATCH /api/profile` requires applicant auth, validates required fields, updates `updated_at`, and does not mutate existing submission profiles.
- Creating a draft copies the latest account profile into `submission_profiles`.
- Updating account profile after draft creation does not change that draft.
- Ready-for-payment validation enforces required files by division.
- Existing upload behavior still stores R2 objects during the draft phase.

Frontend and type tests:

- API types cover profile request and response shapes.
- Register page submits the expanded registration body.
- Dashboard profile form typechecks.
- Submission editor file groups react to division changes.
- `npm test`, `npm run test:typecheck`, and `npm run build` pass.

## Rollout Notes

Existing accounts may not have `user_profiles` rows. The profile endpoint should tolerate this by returning a default profile and saving one on first update. A migration adds the table without changing existing submission data.

Because official participation terms are pending, this feature should not claim final terms text. It should only prepare the UI and validation path so the final copy can be inserted later.
