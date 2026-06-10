# Mock Payment Flow Design

## Goal

Build a lightweight sandbox payment flow that completes the applicant submission loop without calling Stripe yet. Applicants should be able to move a valid draft into `payment_pending`, review the amount on a payment page, and simulate a successful payment that makes the submission official with status `submitted`.

This is an interim implementation. It keeps the state machine, validation, and UI paths production-shaped so the later Stripe Checkout implementation can replace only the payment provider boundary.

## Scope

In scope:

- Applicant submit action for draft submissions.
- Server-side validation before a draft can enter payment.
- Mock payment confirmation endpoint for `payment_pending` submissions.
- Applicant-facing payment, success, and cancel pages backed by real submission state.
- Frontend API client methods and localized UI copy.
- Tests for ownership, valid state transitions, validation failures, and mutation lockout after submission.

Out of scope:

- Stripe SDK calls, Checkout Session creation, webhook signature verification, and Stripe event persistence.
- Admin payment reconciliation.
- Refunds, manual correction workflows, or alternate payment methods.
- Public deployment of a real payment provider.

## State Flow

The flow uses the existing `submissions.status` values:

1. `draft`: applicant can edit form data and upload/delete files.
2. `payment_pending`: applicant can no longer edit or upload. Payment page can confirm payment.
3. `submitted`: applicant can view only. The entry is official for later admin review.

The server remains the source of truth for status and fee. The frontend never sends a price or target status.

## API Design

### `POST /api/submissions/:id/submit`

Purpose: validate a draft and move it to `payment_pending`.

Rules:

- Requires an authenticated `applicant`.
- Submission must belong to the current user.
- Submission must currently be `draft`.
- Required profile fields:
  - `lastName`
  - `firstName`
  - `email`
  - `countryRegion`
- Required work fields:
  - `characterName`
  - `themeAndSetting`
  - `payerName`
- `usagePermission` and `termsAccepted` must be true.
- At least one uploaded file is required.
- Fee is not accepted from the client; it remains derived from `division`.

On success:

- Set `status = 'payment_pending'`.
- Set `updated_at`.
- Return the full submission response.

Errors:

- `401 unauthorized` for missing session.
- `403 forbidden` for non-applicant roles.
- `404 not_found` for another applicant's submission.
- `409 invalid_submission` for non-draft status or write-time status races.
- `400 bad_request` for validation failures.

### `POST /api/payments/mock-confirm`

Purpose: simulate a successful payment in sandbox mode.

Request body:

```json
{
  "submissionId": "..."
}
```

Rules:

- Requires an authenticated `applicant`.
- Submission must belong to the current user.
- Submission must currently be `payment_pending`.
- The write must condition on `status = 'payment_pending'` to avoid stale confirmation races.

On success:

- Set `status = 'submitted'`.
- Set `paid_at`, `submitted_at`, and `updated_at` to the current timestamp.
- Return the full submission response.

Errors:

- `401 unauthorized` for missing session.
- `403 forbidden` for non-applicant roles.
- `404 not_found` for another applicant's submission.
- `409 invalid_submission` for any status other than `payment_pending`.
- `400 bad_request` for malformed body.

## Frontend Design

### Submission Editor

For `draft` submissions, add a secondary action: `Proceed to Payment`.

Behavior:

- Save remains separate.
- Proceed calls `submitSubmission(id)`.
- On success, route to `/submissions/:id/payment`.
- If validation fails, show the server error in the existing alert area.
- Once status is no longer `draft`, existing read-only behavior remains active.

### Payment Page

Replace the placeholder page with a state-backed payment view.

Content:

- Submission number.
- Work title or untitled fallback.
- Division.
- Fee amount formatted from `feeAmount` and `currency`.
- Current status.

Behavior:

- Load the submission by route id.
- If status is `draft`, provide a link back to the editor.
- If status is `payment_pending`, show a `Simulate Payment Success` button.
- The button calls `mockConfirmPayment({ submissionId })`.
- On success, route to `/payment/success?submissionId=<id>`.
- If status is `submitted`, show a link to success or dashboard.
- For other statuses, show a clear unavailable message.

### Success Page

Load the submission from `submissionId` query.

- If submitted, show official submission number and paid/submitted timestamps.
- If the query is missing or loading fails, show an error and a dashboard link.
- If status is not `submitted`, show the current status and a dashboard/payment link as appropriate.

### Cancel Page

This remains a simple recovery page.

- If `submissionId` is present, link back to `/submissions/:id/payment`.
- Always provide dashboard navigation.
- No server mutation happens on cancel.

### Dashboard

Existing status labels remain valid. Submitted rows continue to link to the editor route, where the page is read-only.

## Data And Security

- No schema migration is required; existing `paid_at`, `submitted_at`, and Stripe columns remain available.
- Mock payment does not populate Stripe IDs.
- All state-changing endpoints use ownership checks and write-time status predicates.
- Submitted and payment-pending submissions remain locked by existing draft-only mutation guards.
- The mock confirm endpoint is intentionally named as mock behavior to avoid confusion with real Stripe confirmation.

## Testing

API tests:

- Applicant can submit a complete draft with at least one file.
- Missing required profile/work fields fail with `400`.
- Missing file fails with `400`.
- Non-owner receives `404`.
- Non-applicant receives `403`.
- Non-draft submit receives `409`.
- Submit write-time status race receives `409`.
- Applicant can mock-confirm a `payment_pending` submission.
- Non-owner mock confirm receives `404`.
- Confirming a `draft` or `submitted` submission receives `409`.
- Mock confirm write-time status race receives `409`.
- After mock confirm, PATCH/upload/delete remain rejected.

Frontend/build tests:

- Type coverage for new API client request/response shapes.
- Existing `npm test`, `npm run test:typecheck`, and `npm run build` must pass.

## Later Stripe Replacement

The later Stripe implementation should replace `POST /api/payments/mock-confirm` with:

- `POST /api/payments/checkout` to create a Checkout Session.
- `POST /api/stripe/webhook` to verify Stripe events and mark submissions as submitted.

The `submit` endpoint, applicant read-only behavior, dashboard statuses, payment success/cancel pages, and validation rules should remain mostly intact.
