# Memory

## Current State

- Current task: Restore local PawLoka access at the expected frontend/backend ports.
- Current phase: Vite is pinned to 127.0.0.1:5174 with strictPort; Vite and Express listeners are active at 5174 and 3001.
- Root cause: `vite.config.js` had no explicit port, so Vite used its default 5173 while the user opened 5174; the backend listener had also stopped.
- Public catalog, pet/shelter details, adoption guidance, About, inquiry form, protected admin UI/API, Supabase schema/seed, and Vercel configuration have been implemented.
- Demo mode intentionally rejects inquiry persistence and admin API operations; it must not imply successful data storage.
- Next: apply the existing contactless-application migration only with explicit database authorization before testing a valid application write. No manual restart is needed while the two local listeners remain available.
- Blocked: live application persistence and an actual WhatsApp launch were not tested because the existing migration is not applied and no production/test record was authorized. No deployment was performed.
- Current verification note: browser returned HTTP 200 for the homepage, `/pets`, direct `/api/health`, and proxied `/api/pets?status=available` with 9 pets. Detail and Favorite routes loaded; favorite add/remove and refresh persistence were verified. Browser console, page errors, and request failures were empty. No database or `.env` changes were made.

## 2026-11-24 Adoption-to-WhatsApp Debug

- Hypothesis/evidence: `applications` in the initial schema has `applications_contact_required`; the API correctly writes both `email` and `phone` as `null`. The additive migration `202611170004_allow_applications_without_applicant_contact.sql` drops that specific constraint, but prior project state records that the Supabase migrations were not applied. This is the concrete schema cause evidenced locally; the detached backend's private console output and live DB migration state were not inspected.
- Experiment/result: focused API tests pass with a synthetic repository. The frontend application route tests pass (28/28), and a browser test with a mocked HTTP 500 shows the unsaved warning and prefilled fallback URL without success. Attempting the wa.me URL redirected to `whatsapp://send`, which the test browser could not launch because no native WhatsApp handler is available. Full frontend tests have two existing About-page failures; full backend tests have two stale CORS-origin assertions (expecting port 5173 rather than the configured 4173). Build passes. No live Supabase submission was attempted because local backend is configured for Supabase and test writes were not explicitly authorized.
- Recovery: no database, environment, or deployment changes; only frontend behavior, test setup, and related technical-design documentation changed.

## Decisions

- 2026-11-16: Focus on prospective adopters; one admin manages curated listings and inquiries.
- 2026-11-16: Store only name, email or phone, selected pet, and optional message; require a data-use notice/consent; admin deletes manually after processing or on request.
- 2026-11-16: Protect the admin portal with one Supabase Auth account; no public sign-up, adopter/shelter accounts, or unauthenticated CRUD.
- 2026-11-16: Deploy frontend and stateless Express Functions as separate Vercel projects; Supabase Free provides Postgres/Auth.
- 2026-11-16: Admin enters public HTTPS image URLs; no uploads in MVP. Use plain CSS and no product AI.
- 2026-11-16: Product title uniqueness must be confirmed by the student with the course/platform list.
- 2026-11-17: Added `turtle`, `fish`, and `hedgehog` identifiers with Indonesian labels; the catalog/admin options share the frontend species list.
- 2026-11-17: About page documents device-local favorites without database storage or account synchronization; API data is not cached offline, and the background motion preference respects reduced motion.
- 2026-11-17: PawLoka uses one fixed, centered Bottom Navigation Bar at all viewport sizes; the header retains only the brand.
- 2026-11-17: Favorite IDs are stored locally and Favorite cards/details are loaded by ID from the public pet API; user-selected removals persist across routes.
- 2026-11-17: User approved domicile, adoption reason, and pet experience with updated consent; one-time per-application tokens authorize only that application's minimal history response, with the token on-device and its hash in Supabase.
- 2026-11-17: The earlier decision to use `shelters.phone` for WhatsApp was superseded. The pet-detail CTA routes to the selected pet's form; after a successful save, that form opens a prefilled draft to the single PawLoka global number from `frontend/src/config/whatsapp.js`. Messages include adopter, pet, species, shelter, and reason, and are sent only manually by the user.
- 2026-11-17: Removed collection of applicant WhatsApp numbers. User approved an additive migration that drops the `applications_contact_required` check so new applications can persist without applicant email/phone; old columns and data remain unchanged.

## AI / Tooling Decisions

- No product AI. Copilot is a development tutor; use synthetic data only. No agent team is needed.
- Local credentials are configured in ignored `.env` files; never print or expose them. No deployment or production writes were performed.

## Known Issues

- Workspace is not a Git repository and has no remote/commit; a session recovery checkpoint and source snapshot are recorded.
- The additive application migrations have not been applied; current Supabase projects require them before the expanded application insert can persist without applicant contact.
- 2026-11-17 API recovery: the previous port-3001 process was started at 20:55, before the current `backend/.env` modification time of 22:53, and continued serving stale runtime configuration. After restarting the main backend on port 3001, the production `repository.listPets({status:'available'})` query returned 9 rows with 9 shelter relations; HTTP GET `/api/pets`, `/api/pets?status=available`, and `/api/shelters` returned 200. No `.env`, database, permission, schema, or seed changes were made.
- 2026-11-17 server lifecycle check: `server.js` contains only `app.listen()` after `createApp()`; repository search found no `server.close()`, `process.exit()`, `unref()`, or shutdown hooks. In the initial check, PID 29668 (`node src/server.js`, created 20:55) remained the port-3001 listener and `/api/health` returned HTTP 200 twice. That stale process was later stopped and restarted during the current recovery; the new listener was verified active on port 3001.
- 2026-11-17 frontend recovery: Vite was not listening on 5174 (`ERR_CONNECTION_REFUSED`); started Vite on that exact port. Frontend `.env` uses `/api` and `vite.config.js` proxies to `127.0.0.1:3001`; no API base change was needed.
- 2026-11-17 CORS fix: POST from browser origin `http://127.0.0.1:5174` initially returned 403 because `.env` allows `http://localhost:5173`. `backend/src/app.js` now allows only this exact local origin outside production and outside Vercel. Browser invalid POST now returns 400 validation; regression test confirms the same origin remains rejected in production. `.env` was not changed.
- Vercel Hobby and Supabase Free limits/terms must be rechecked at deployment.
- The backend in-memory rate limiter is per Vercel Function instance, not a global production-grade limiter.
- Frontend full audit reported four moderate development-tool transitive advisories in the Vite PWA/Workbox dependency tree; production-only audit passed. Do not force a downgrade of PWA tooling.
- Frontend production build passes but emits a non-blocking warning for a 602.9 kB minified JavaScript chunk.

## Completed

- [x] Research document created and vendor hosting facts checked.
- [x] PRD and Technical Design created and reconciled with Vercel choice.
- [x] Agent instructions/docs scaffolded and populated.
- [x] React/Vite PWA and Express API with demo and Supabase repository paths.
- [x] Public pet catalog/detail and shelter directory/detail, adoption guide, About, and inquiry form.
- [x] Supabase schema, RLS/grants, and synthetic seed data.
- [x] Added turtle, fish, and hedgehog support across API validation, catalog/admin choices, detail labels, demo/seed data, tests, and a new database constraint migration.
- [x] Expanded the About page with product, developer, features, verified stack, data/offline/photo notes, and a local reduced-motion-aware background animation preference.
- [x] Fixed the navbar brand active-state styling and added route-by-route desktop/mobile navigation regression tests.
- [x] Removed the header "Temukan teman" CTA and its unused styles while preserving the navigation menu and shared button styling.
- [x] Made the existing Bottom Navigation Bar the sole persistent navigation on mobile and desktop; reserved safe-area space for all six routes.
- [x] Expanded API-backed pet details with conditional available facts, long-description controls, device-local favorite toggling, and status-aware adoption actions.
- [x] Removed the shared footer copy and added the sixth Favorite navigation item/page with ID-based local storage.
- [x] Added the expanded adopter form and consent, summary, WhatsApp draft handoff, local token history, status mapping, and admin visibility for new fields.
- [x] Added a backward-compatible application migration, token-hash persistence, token-scoped minimal history API, and local CORS coverage; left production database untouched.
- [x] Removed the applicant phone field, added the approved additive contact-constraint migration, and routed pet-detail/form WhatsApp handoffs through one global configured number with prefilled selected-pet details.
- [x] Routed the single pet-detail adoption CTA to the selected pet form, guarded duplicate submissions, completed history status labels/badges and empty states, and added persistent, non-navigating pet-card favorites.
- [x] Added development-only, credential-redacted API error message/details/stack logging and regression coverage for credential redaction and upstream error codes.
- [x] Protected admin login/dashboard UI and server-guarded admin CRUD/API.
- [x] Pinned the Vite dev server to `127.0.0.1:5174` with `strictPort`, restarted the backend on `3001`, and verified the API proxy returns all nine available pets.
- [x] Final tests/lint/build and local browser smoke checks passed for the new adoption flow and mobile/desktop navigation.
- [ ] Apply the application migration and configure/verify real shelter WhatsApp contacts only with explicit production authorization.
- [ ] Configure Auth, deploy to Vercel, and publish the GitHub repository after user setup/authorization.
