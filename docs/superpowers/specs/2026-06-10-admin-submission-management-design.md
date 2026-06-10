# Admin Submission Management Design

## Goal

Build a lightweight operations backend for contest staff. Committee and super admin users should be able to see submitted entries, inspect entry details and uploaded file metadata, and move entries through the first screening statuses.

This is an MVP operations surface. It should make live submissions manageable without pulling in judging, exports, bulk actions, or final UI polish.

## Scope

In scope:

- Admin landing page links for existing admin routes.
- Admin submissions list with basic filters.
- Admin submission detail page.
- Admin-only API endpoints for listing submissions, reading one submission, and changing status.
- File metadata visibility on the detail page.
- Tests for role authorization, filters, detail loading, and allowed status transitions.

Out of scope:

- Public homepage admin entry.
- Real file download or signed R2 download URLs.
- CSV export.
- User management changes.
- Judge assignment, review forms, scores, or review workflow.
- Batch updates.
- UI redesign or final visual polish.

## Users And Access

Only authenticated users with role `committee` or `super_admin` can use the admin submission management APIs and routes. Applicants and judges must receive `403 forbidden` from admin APIs. Unauthenticated requests receive `401 unauthorized`.

The admin route guard already limits `/admin` pages to `committee` and `super_admin`; the server APIs must enforce the same rule and remain the source of truth.

## API Design

### `GET /api/admin/submissions`

Purpose: return a staff-facing list of submissions.

Query parameters:

- `status`: optional submission status filter.
- `division`: optional division filter.
- `q`: optional search across submission number, applicant email, and character name.
- `limit`: optional numeric limit, clamped to a small maximum such as 100.

Response:

- Submission id and number.
- Applicant user id and email.
- Division.
- Status.
- Fee amount and currency.
- Character name.
- File count.
- Created, updated, paid, and submitted timestamps.

Sorting:

- Default to `updated_at DESC, created_at DESC`.

### `GET /api/admin/submissions/:id`

Purpose: return a full staff-facing submission detail.

Response includes:

- The same summary fields as the list endpoint.
- Applicant user id, email, role, and verification timestamp.
- Profile, work, rights, and contact JSON data from the submission.
- Uploaded files with id, file type, filename, content type, size, R2 key, and uploaded timestamp.

The endpoint returns `404 not_found` when the submission id does not exist.

### `PATCH /api/admin/submissions/:id/status`

Purpose: let staff progress early screening status.

Request body:

```json
{
  "status": "screening"
}
```

Allowed transitions:

- `submitted` -> `screening`
- `submitted` -> `screened_in`
- `submitted` -> `screened_out`
- `submitted` -> `withdrawn`
- `screening` -> `screened_in`
- `screening` -> `screened_out`
- `screening` -> `withdrawn`

Disallowed transitions return `409 invalid_submission`. Unknown statuses or malformed bodies return `400 bad_request`.

On success:

- Update `status`.
- Update `updated_at`.
- Return the full admin detail response so the frontend can refresh from server truth.

## Frontend Design

### Admin Home

Replace the placeholder with a simple admin dashboard:

- Link to submission management.
- Keep users and exports visible as existing admin areas, but they can remain minimal placeholders until their own implementation passes.
- Do not expose any admin link on the public homepage.

### Admin Submissions List

Add a staff table at `/admin/submissions`.

Controls:

- Status filter.
- Division filter.
- Keyword input.
- Refresh action.

Columns:

- Submission number.
- Applicant email.
- Work title.
- Division.
- Status.
- Fee.
- File count.
- Updated/submitted timestamp.
- Detail link.

States:

- Loading.
- Empty result.
- API error.

### Admin Submission Detail

Add a detail view at `/admin/submissions/:id`.

Sections:

- Summary: submission number, applicant, division, status, fee, timestamps.
- Applicant/profile fields.
- Work fields.
- Rights and contact fields.
- File metadata list.
- Status action buttons for the allowed next statuses.

The page should keep styling simple and reuse the existing dashboard/admin classes where possible. It does not need final visual polish.

## Data And Security

- No schema migration is required.
- File metadata can expose the R2 object key to staff in this MVP.
- The APIs must not return R2 object bytes.
- The status update must use a write-time predicate on the current status to prevent stale UI races.
- Applicant-owned APIs remain unchanged; staff operations use separate `/api/admin/*` endpoints.

## Testing

API tests:

- Unauthenticated admin list/detail/status requests return `401`.
- Applicant and judge roles receive `403`.
- Committee or super admin can list submissions.
- List filters by status, division, and keyword.
- Committee or super admin can read one submission detail and file metadata.
- Missing submission detail returns `404`.
- Allowed status transitions succeed and update `updated_at`.
- Disallowed transitions return `409`.
- Malformed status request returns `400`.

Frontend verification:

- `npm run test:typecheck` must pass.
- `npm run build` must pass.

Full verification before completion:

- `npm test`
- `npm run test:typecheck`
- `npm run build`

## Later Work

Future plans can add:

- Protected file download endpoints with expiring access.
- CSV export.
- Batch actions.
- Judge assignment and scoring.
- Audit logs for staff status changes.
