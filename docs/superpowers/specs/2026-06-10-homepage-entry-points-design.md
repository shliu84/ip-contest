# Homepage Entry Points Design

## Goal

Make the public homepage provide clear applicant entry points into the existing account and submission flows. The homepage should let visitors log in or begin an entry without exposing admin navigation.

## Current State

- The router already supports `/login`, `/register`, `/dashboard`, `/submissions/new`, `/submissions/:id/payment`, `/payment/success`, and `/payment/cancel`.
- `SiteHeader.vue` only links to public homepage sections and language selection.
- `HeroSection.vue` has a primary "Submit Now" button, but it currently uses `href="#"`.
- The payment page requires a concrete submission id, so payment is not a standalone homepage destination.
- Admin routes exist under `/admin`, but the homepage should not advertise them.

## User-Facing Behavior

### Header

Add applicant-oriented account actions to the homepage header:

- `Login` links to `/login`.
- `Submit` links to `/login?redirect=/dashboard`.

The existing section navigation and language switcher remain. No admin link appears in the header.

### Hero

Update the primary hero CTA to link to `/login?redirect=/dashboard`.

The secondary hero CTA remains an in-page link to `#about`.

### Authenticated Routing

The existing route guards decide where users land:

- Anonymous users who click `Submit` see the login page and then continue to `/dashboard`.
- Authenticated applicant users who visit `/dashboard` can create or continue drafts.
- Committee and super admin users who visit guest-only auth pages are still redirected by existing router logic.

No new session-aware header state is required in this pass. The links stay simple and stable.

### Payment Flow

Do not add a direct payment link to the homepage. Payment requires `submissionId`, and the correct path remains:

`/dashboard` -> `/submissions/:id` -> `/submissions/:id/payment`

### Admin Flow

Do not add admin entry points to the homepage. Admin users can continue to access `/admin` directly.

## Content And Localization

Use existing translation strings where possible:

- `loginLink` for the login action.
- `ctaEntry` for the submit action.

If the implementation needs a shorter navigation label than `ctaEntry`, add a dedicated key such as `navSubmit` for zh/ja/en. Do not reuse admin or payment labels for homepage entry points.

## Visual Design

Keep the current public homepage visual system. This is a small navigation affordance change, not a redesign.

- Header actions should sit alongside the language switcher without crowding the section nav.
- Use existing button/link styles where practical.
- Keep text legible on desktop and mobile.
- Do not add cards, new sections, or decorative copy.

## Files Expected To Change

- `src/components/SiteHeader.vue`
- `src/components/HeroSection.vue`
- `src/i18n/translations.ts` only if a new `navSubmit` key is needed.
- CSS files only if existing header styles cannot fit the new actions cleanly.

## Testing And Verification

- Run `npm run build`.
- Run `npm test` if a route helper or other testable logic is introduced.
- Manually inspect the rendered homepage at desktop and mobile widths.
- Verify:
  - Header includes Login and Submit.
  - Hero primary CTA no longer points to `#`.
  - No homepage admin link exists.
  - Submit routes to login with dashboard redirect.
  - Existing section anchors and language buttons still work.

## Out Of Scope

- Session-aware header text such as switching Login to Dashboard after authentication.
- Direct payment entry from the homepage.
- Admin homepage links.
- Redesigning the public homepage, header, or hero layout.
- Implementing the admin management feature.

## Self-Review

- Scope is limited to homepage entry points.
- Payment is intentionally excluded because it requires a submission id.
- Admin entry is intentionally excluded per user direction.
- Requirements are implementable without changing backend APIs.
