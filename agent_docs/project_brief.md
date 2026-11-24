# Project Brief

## Product

- Vision: PawLoka helps prospective adopters find pets and shelters, understand adoption requirements, and send an adoption inquiry.
- Primary user outcome: move from a searchable pet listing to a relevant shelter and a successfully submitted inquiry.
- Admin outcome: maintain pet/shelter listings and process inquiries through an authenticated portal.

## Scope

- Must ship: mobile-first PWA, bottom navigation, pet and shelter lists/details, search/filters, adoption guide, Profile/About, consent-based inquiry form, one-admin portal, Express API, Supabase, HTTPS deployment, GitHub source.
- Not in MVP: adopter/shelter accounts, image/file uploads, chat, auto-forwarding/email, maps, notifications, paid services, AI.

## Sensitive Areas

- Applicant contact details and messages are stored in Supabase; do not log them or cache them.
- Admin write and inquiry-read APIs require server-side token verification and one configured admin ID.
- The service-role key is backend-only.

## Principles

- Solve required PPB user flows before adding polish.
- Keep API, database, and UI boundaries understandable for a student learning the stack.
- Use synthetic data in development.
- Verify actual browser behavior, not only build output.

