# ASIA IP Contest 2026 Submission Platform MVP Design

Date: 2026-06-10
Status: Approved for specification review

## Goal

Build the first production-shaped MVP for the fourth ASIA IP CONTEST in TOKYO 2026 website and submission platform. The system should preserve the current public homepage, add the backend required for paid submissions, and provide a practical admin workflow for reviewing and downloading entries.

The MVP focuses on:

- Public homepage framework for the fourth contest.
- User registration, login, and email verification.
- Draft-first submission flow.
- Stripe sandbox payment for entry fees.
- R2-backed file uploads.
- Admin submission list, detail view, file download, and full ZIP export.
- Role foundation for applicants, committee members, judges, and super admins.

## Non-Goals

The MVP will not implement final judging rules, scoring forms, prize configuration, a full CMS, multi-year contest management, WeChat Pay, bank transfer reconciliation, or a complex async export queue. Those areas should be added after the core submission loop is working.

## Platform Architecture

The project will use Cloudflare Pages, Pages Functions, D1, and R2.

- `src/`: Vue/Vite frontend for the public site, applicant area, and admin area.
- `functions/api/`: Cloudflare Pages Functions API.
- `schema.sql` or `migrations/`: D1 database schema.
- `public/`: static assets and metadata.
- D1: structured application data.
- R2: uploaded submission files and generated export ZIPs.
- Stripe: Checkout Session creation and webhook payment confirmation.
- Resend: email verification, password reset, and optional notification emails.

The current Vue/Vite frontend stays in place. The app should add routing rather than migrate frameworks. Adding `vue-router` is acceptable because applicant and admin flows need stable URLs and guarded navigation.

## Roles

The system should create the full role foundation in the MVP:

- `applicant`: can register, verify email, create drafts, upload files, pay, and view their own submissions.
- `committee`: can view all submissions, inspect details, download files, update screening status, and generate exports.
- `judge`: can log in, but judging features remain unavailable in the MVP and should show a clear "not yet open" message.
- `super_admin`: can access all admin features and manage roles in future phases.

All admin API routes must enforce role checks server-side.

## Applicant Flow

1. Applicant visits the public homepage.
2. Applicant registers with email and password.
3. Resend sends an email verification link.
4. Applicant verifies email.
5. Applicant logs in and opens the submission dashboard.
6. Applicant creates a draft submission.
7. Applicant fills in profile, work, division, file uploads, and consent fields.
8. Applicant can save the draft and return later.
9. Applicant submits the draft for payment.
10. Server creates a Stripe Checkout Session using server-side price rules.
11. Stripe webhook confirms successful payment.
12. Submission becomes officially submitted.
13. Applicant can view the submitted entry and payment status.

Officially submitted entries are read-only for applicants in the MVP. Corrections should be handled manually by committee/admin users.

## Entry Fees

Fees are calculated by the backend from the selected division:

- `2d`: 10,000 JPY
- `3d`: 10,000 JPY
- `ai`: 10,000 JPY
- `corporate`: 100,000 JPY

The frontend must never be trusted for amount or currency.

## Submission Fields

The form should be based on prior contest fields, with practical grouping.

Profile fields:

- Last name
- First name
- Pen name
- Email
- Phone number
- Country or region
- City
- Postal code
- Prefecture
- Occupation
- School, required only when occupation is student
- Address
- WeChat ID, optional for Chinese applicants
- Certificate or award language

Work fields:

- Division: 2D, 3D, AI, corporate
- Character name
- Work theme and setting
- Online exhibition display information, such as SNS links
- Entry fee payer name, retained as a compatibility field
- Usage rights permission
- Terms and conditions consent

File fields:

- Online exhibition A4 image
- Physical exhibition A2 image
- Production process image, prompt screenshot, or similar supporting material
- Unedited original image, required for AI division

## Data Model

`users`

- `id`
- `email`
- `password_hash`
- `role`
- `email_verified_at`
- `created_at`
- `updated_at`

`email_verification_tokens`

- `id`
- `user_id`
- `token_hash`
- `expires_at`
- `used_at`
- `created_at`

`password_reset_tokens`

- `id`
- `user_id`
- `token_hash`
- `expires_at`
- `used_at`
- `created_at`

`submissions`

- `id`
- `user_id`
- `submission_no`
- `status`
- `division`
- `fee_amount`
- `currency`
- `stripe_checkout_session_id`
- `stripe_payment_intent_id`
- `paid_at`
- `submitted_at`
- `created_at`
- `updated_at`

`submission_profiles`

- `submission_id`
- profile/contact/address fields
- certificate language field

`submission_works`

- `submission_id`
- work fields
- consent fields

`submission_files`

- `id`
- `submission_id`
- `file_type`
- `r2_key`
- `original_filename`
- `content_type`
- `size_bytes`
- `uploaded_at`

`export_jobs`

- `id`
- `requested_by`
- `status`
- `r2_key`
- `error_message`
- `created_at`
- `completed_at`

Future judging tables may be created early as empty foundations:

- `judge_assignments`
- `reviews`
- `review_scores`

The scoring schema should remain minimal until judging rules are decided.

## Submission Statuses

- `draft`: editable applicant draft.
- `payment_pending`: Checkout Session created, waiting for payment.
- `submitted`: paid and officially submitted.
- `screening`: committee screening in progress.
- `screened_in`: passed initial screening.
- `screened_out`: did not pass initial screening.
- `assigned`: assigned to judges, reserved for later.
- `reviewed`: judging complete, reserved for later.
- `withdrawn`: withdrawn or invalidated.

## API Design

Authentication:

- `POST /api/auth/register`
- `GET /api/auth/verify-email?token=...`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/me`

Submissions:

- `GET /api/submissions`
- `POST /api/submissions`
- `GET /api/submissions/:id`
- `PATCH /api/submissions/:id`
- `POST /api/submissions/:id/submit`
- `POST /api/submissions/:id/upload-url`
- `DELETE /api/submissions/:id/files/:fileId`

Payments:

- `POST /api/payments/checkout`
- `POST /api/stripe/webhook`

Admin:

- `GET /api/admin/submissions`
- `GET /api/admin/submissions/:id`
- `PATCH /api/admin/submissions/:id/status`
- `GET /api/admin/files/:fileId/download`
- `POST /api/admin/exports`
- `GET /api/admin/exports/:id`
- `GET /api/admin/exports/:id/download`

All write APIs should validate input server-side. Applicant routes must enforce ownership. Admin routes must enforce role.

## File Storage

Files are stored in R2. D1 stores metadata and R2 object keys.

Recommended key format:

`submissions/{submission_no}/{file_type}/{timestamp}-{safe_filename}`

Downloads should use signed URLs or controlled API responses. R2 buckets should not be public for submitted materials.

## ZIP Export

The admin export feature creates a ZIP containing:

- `submissions.csv`
- One folder per submission
- Submission attachments inside each folder
- Optional `metadata.json` per submission

Because prior contests have never exceeded 100 submissions, the first implementation may generate the ZIP directly from an authenticated admin request and upload the result to R2. The `export_jobs` table remains useful for status tracking, retry, and download history. If submission volume grows later, this can move to Queues or a dedicated Worker without changing the admin UI contract.

## Frontend Design

Public site:

- Keep the existing section structure: Hero, About, News, Timeline, Tracks, Judges, Prizes, Footer.
- Update copy to reflect that this is the fourth contest and that prior contest materials inform the current framework.
- Show confirmed facts clearly and avoid inventing undecided theme, judges, prizes, or detailed rules.
- Tracks should show 2D, 3D, AI, and corporate divisions.
- Entry buttons should route to the login or submission flow.
- News should become structured data rather than duplicated markup.

Applicant pages:

- `/register`
- `/login`
- `/verify-email`
- `/forgot-password`
- `/reset-password`
- `/dashboard`
- `/submissions/new`
- `/submissions/:id`
- `/submissions/:id/payment`
- `/payment/success`
- `/payment/cancel`

Admin pages:

- `/admin`
- `/admin/submissions`
- `/admin/submissions/:id`
- `/admin/exports`
- `/admin/users`

The admin interface should be practical and dense rather than promotional. It should prioritize filtering, scanning, status updates, file access, and export actions.

## Security

- Passwords must be hashed with a strong password hashing algorithm.
- Sessions should use HttpOnly secure cookies.
- Session secrets must come from environment variables.
- Email verification and password reset tokens should be hashed in D1, expire, and be single-use.
- Stripe webhook signature verification is required.
- Payment amounts must be calculated server-side.
- R2 downloads must not expose private buckets publicly.
- File uploads must validate size, type, and allowed `file_type`.
- Admin routes must enforce role checks in Functions.
- Applicant routes must enforce ownership checks.
- SameSite cookies and restricted write methods should be used as the baseline CSRF protection.

## Environment Configuration

Required bindings and secrets:

- D1 database binding
- R2 bucket binding
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `SESSION_SECRET`
- Public frontend config for Stripe publishable key if needed

README should document local development, preview, production configuration, and D1 migration commands.

## Validation Plan

Minimum verification before shipping:

- `npm run build`
- Register a user.
- Verify email through Resend test flow.
- Log in and log out.
- Create and update a draft.
- Upload all required file types.
- Submit draft for Stripe sandbox payment.
- Complete payment with a Stripe test card.
- Confirm webhook changes status to `submitted`.
- Confirm applicants can only access their own submissions.
- Confirm committee and super admin can list all submissions.
- Download individual files from admin.
- Generate a full ZIP export and verify that CSV and files are included.

## MVP Completion Criteria

The MVP is complete when:

- Homepage presents the fourth contest framework and has working entry CTAs.
- Applicants can register, verify email, log in, create drafts, upload files, and pay through Stripe sandbox.
- Paid submissions become official records.
- Applicants can view their own submissions.
- Admin users can list, inspect, download, and export submissions.
- D1, R2, Stripe, Resend, and Cloudflare Pages Functions setup is documented.
