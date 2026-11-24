# PawLoka — Technical Design (MVP)

**Status:** Decisions confirmed 16 November 2026  
**Primary goal:** Build a responsive, secure-enough-for-a-course PWA within the PPB deadline using the student's selected stack and free hosting.

## 1. Recommended Approach

Use one Git repository with two deployable app folders:

- `frontend/`: React + Vite PWA, deployed as a Vercel static site.
- `backend/`: Node.js + Express REST API, deployed as a separate Vercel project using Vercel Functions.
- Supabase Free: Postgres database and Auth for one administrator.

The browser sends catalog and application requests to the Express API. Express validates requests and reads/writes Supabase. Supabase Auth in the browser is used only for the admin login; the admin access token accompanies admin API requests. The backend verifies the token and checks the configured admin user ID before allowing any admin operation.

Vercel's current Express documentation supports deploying Express applications. The serverless function model is suitable for the app's short CRUD requests, but is not a permanently running Node server. Persist data in Supabase, not process memory or local disk. The student selected Vercel; Render's always-running alternatives are therefore not part of this design.

### Options considered

| Option | Benefits | Trade-offs | Decision |
|---|---|---|---|
| Vercel frontend + Vercel Express Functions + Supabase | Matches selected host; one provider for web/API deploys; free entry plans | Two Vercel projects; API must be stateless and fit function limits; Hobby terms/quotas need checking | **Chosen** |
| Vercel frontend + Render Express + Supabase | Express can run as a conventional web service | Additional provider/configuration; Render Free may sleep | Not chosen |
| Supabase direct from browser, no Express | Fewer backend components | Does not satisfy the required self-built API and makes the browser a direct data-access layer | Rejected |

## 2. Project Setup and Repository Layout

```text
PawLoka/
  docs/
    research-PawLoka.md
    PRD-PawLoka-MVP.md
    TechDesign-PawLoka-MVP.md
  frontend/
    public/
    src/
    package.json
    vite.config.js
  backend/
    src/
      app.js
      server.js
      routes/
      middleware/
      services/
    supabase/
      migrations/
      seed.sql
    package.json
  README.md
  .gitignore
```

Create a Vite React JavaScript frontend and a separate Express JavaScript backend. Keep package manifests in each folder so Vercel can use `frontend/` and `backend/` as the root directory for separate projects. `backend/src/app.js` exports the Express app for Vercel; `backend/src/server.js` starts it locally for development. Do not start a persistent listener when the app is imported by a Vercel Function.

Use React Router for public and admin routes. Use plain CSS with CSS custom properties for the visual system; no component framework is needed. Use Vitest and React Testing Library for frontend tests, and Node's built-in test runner with Supertest for the API.

### Local commands

Run each app in its own terminal:

```powershell
Set-Location frontend
npm install
npm run dev
npm test
npm run lint
npm run build
```

```powershell
Set-Location backend
npm install
npm run dev
npm test
npm run lint
```

The JavaScript project has no separate TypeScript typecheck. Use ESLint and tests as static/behavioral checks.

## 3. Feature Implementation

### Public routes and pages

- `/` — Home and prominent catalog CTA.
- `/pets` — searchable/filterable pet list.
- `/pets/:id` — API-backed pet details, device-local favorite toggle, and shelter/adoption CTA; show optional fields only when present in the API response.
- `/favorites` — pets saved by ID in device-local storage and loaded through the public pet API.
- `/shelters` — shelter directory.
- `/shelters/:id` — shelter details and associated pets.
- `/applications` — applicant's status history using per-application tokens stored on the current device.
- `/adoption` — requirements and procedure.
- `/about` — Profile/About.

Use one persistent Bottom Navigation Bar for Home, Pets, Shelters, Favorites, Application History (labelled Adopsi), and Profile on both mobile and desktop. Keep the adoption guide at `/adoption`. Cap and center the navigation width on larger screens, and reserve enough safe-area spacing so it does not cover page content. Detail routes count as pages and must be reachable by clicking their corresponding list cards.

### Public API

Suggested endpoints:

```text
GET  /api/health
GET  /api/pets?species=&age=&status=&q=
GET  /api/pets/:id
GET  /api/shelters
GET  /api/shelters/:id
POST /api/applications
GET  /api/applications/:id   (requires X-Application-Access-Token)
```

Return consistent JSON and HTTP status codes. Pet and shelter endpoints expose only public catalog fields. The application history route must check an ID plus its bearer-like token, return only that application's status/date/pet/shelter summary, set `Cache-Control: no-store`, and use rate limiting. Never add a public application list endpoint.

### Application flow

The form submits applicant name, domicile, adoption reason, pet-keeping experience, pet ID, optional message, and affirmative privacy acknowledgement; it does not collect the applicant's phone number. The backend validates types, lengths, referenced pet, and acknowledgement before inserting. Each successful submission returns a random one-time access token; persist only its SHA-256 hash in `applications`, and store the bearer token in the applicant's localStorage. The token grants access only to a minimal summary for that ID, not to applicant fields or other applications. No account or general public read/list is added.

Open a blank tab synchronously from the submit interaction to avoid popup blocking. After a successful save, navigate it to a prefilled `wa.me` link to the single global number in the frontend WhatsApp configuration, then show a summary and a fallback link if the browser blocks the automatic tab. If saving fails, do not show success: clearly warn that the application was not stored, navigate the already-open tab to the same prefilled WhatsApp draft, and show a fallback link. The selected pet's name, species, and shelter are included in the message; `shelters.phone` is not used as a WhatsApp destination. PawLoka cannot claim the message was sent until WhatsApp is manually submitted, and the initial status remains `pending`. The privacy notice must explain Supabase storage, admin access, the additional data, device-local history token, global WhatsApp handoff and manual sending, and deletion requests. Do not put applicant data or tokens in logs or analytics. Admins manually delete completed applications or those requested for deletion.

### Admin portal and API

Suggested routes:

```text
/admin/login
/admin
/admin/pets
/admin/shelters
/admin/applications
```

Suggested endpoints:

```text
GET/POST       /api/admin/pets
GET/PATCH/DELETE /api/admin/pets/:id
GET/POST       /api/admin/shelters
GET/PATCH/DELETE /api/admin/shelters/:id
GET/PATCH/DELETE /api/admin/applications/:id
GET            /api/admin/applications
```

All `/api/admin/*` routes run server-side authentication and admin identity checks before database access. A React route guard improves UX but is not an authorization control. Disable public Supabase sign-up and create the single admin through the Supabase dashboard. Deletion in the UI requires explicit confirmation. Preserve referential integrity: do not hard-delete a pet/shelter with linked applications; archive it or return a clear conflict response instead.

Use a consistent error format such as `{ "error": { "code": "...", "message": "..." } }`. Messages must not expose SQL, tokens, secrets, or applicant data.

### PWA and offline behavior

Configure `vite-plugin-pwa` with a manifest, installable icons, and a registered service worker. Precache the application shell and static assets only. Use `NetworkOnly` for API calls, including catalog, admin, and application requests; never cache application submissions or admin responses. Show an offline state and offer retry for public reads. Service worker updates must not silently leave a stale admin interface after a deployment.

## 4. Design Implementation

Build a mobile-first style system from CSS variables:

- `--color-mint`, `--color-off-white`, `--color-forest`, `--color-lavender`, `--color-yellow`, `--color-coral`.
- Use forest green for primary text/actions, off-white backgrounds, and mint/lavender/coral/yellow as purposeful card and decorative accents.
- Rounded cards, soft shadows, generous spacing, large friendly headings, and organic shapes. Keep decorative elements away from labels and controls.
- Home hero: headline, short description, one primary CTA, and large licensed dog/cat photo with a cutout-style composition.
- Pet cards: image first, white information label with name/species/age/sex, and a visible adoption status.
- Shelter directory and adoption guide use the same typography, color, and spacing system.
- Use semantic headings/forms, visible focus states, keyboard navigation, descriptive image alt text, and adequate contrast. Respect reduced-motion preferences.
- Images are public URLs entered by the admin. Check permission to use each image and provide a local fallback. Do not allow arbitrary data URLs; accept only valid HTTPS image URLs. An external image host will receive the browser's ordinary image request metadata.

## 5. Database and Storage

Use Supabase Postgres with SQL migrations and development seed data committed to the repository. Never commit actual applicant data or secrets.

### Initial tables

**`shelters`**

- `id` UUID primary key
- `name`, `location`, `description`
- nullable `phone` for shelter telephone contact and optional `email`; these fields do not determine the global WhatsApp destination
- `image_url` optional HTTPS URL
- `is_published` boolean
- `created_at`, `updated_at`

**`pets`**

- `id` UUID primary key
- `shelter_id` foreign key to `shelters`
- `name`, `species`, `breed`
- `age_months` non-negative integer
- `sex`, `description`
- `status`: `available`, `reserved`, or `adopted`
- `image_url` optional HTTPS URL
- `is_published` boolean
- `created_at`, `updated_at`

**`applications`**

- `id` UUID primary key
- `pet_id` and `shelter_id` foreign keys
- `applicant_name`
- nullable `email` and `phone` columns retained for existing records; new public submissions do not collect or require applicant contact details
- nullable `domicile`, `adoption_reason`, and `pet_experience` for compatibility with existing rows; new API submissions require valid values
- nullable unique `access_token_hash` for owner-scoped status access; never return it
- optional `message`
- `consent_at` timestamp
- `status`: `pending`, `reviewing`, `approved`, `declined`, or `closed`
- `created_at`, `updated_at`

Use database constraints as a second validation layer. Keep a submission's pet/shelter reference valid even if the listing is no longer public. Public queries filter `is_published = true`; admin archive/unpublish is preferred where a listing is referenced by an application.

### Credentials and authorization boundary

- Browser environment may contain only the Supabase URL and publishable/anon key needed for Supabase Auth. These values are public; database policies must not treat them as secrets.
- Store the Supabase service-role key only in the backend deployment environment. It bypasses RLS and must never be embedded in the frontend or logged.
- Enable RLS on exposed tables and revoke direct `anon`/`authenticated` table grants that are not required. The API is the only intended data-access path for PawLoka.
- For each admin API request, require a valid Supabase access token, verify it with Supabase Auth, and match the verified user ID with `ADMIN_USER_ID` stored on the backend. Do not trust a role or user ID supplied in the request body.
- Validate all public input in Express. Keep application list/update/delete admin-only; public reads require the matching ID and one-time token, return only a minimal summary, and never list applications. Add rate limiting and size limits to public submit/history routes; the in-memory limiter is per Vercel Function instance, not a global quota.
- Restrict CORS to the production frontend origin and local development origin. Avoid wildcard origins with credentials.
- Keep secrets in local untracked environment files and Vercel environment settings. Commit only `.env.example` with placeholder names.
- Do not log request bodies for the application endpoint. Document a manual data deletion process for the admin.

The service-role design makes the Express API a security boundary: server-side admin checks and validation are mandatory even with RLS enabled. RLS does not constrain a service-role request.

## 6. AI Assistance and Product AI

No product AI, model provider, or automated agent is included. Use Copilot as a coding tutor: ask for explanations of React routing, API handlers, auth verification, SQL constraints, and PWA caching; review each generated change and run tests before moving on. Keep an individual commit/checkpoint history when the student creates the Git repository; no team of agents is needed.

No AI tool should receive real application submissions. Use synthetic seed data for development and demos.

## 7. Deployment Plan

### Vercel projects

Create two Vercel projects connected to the same GitHub repository:

1. **PawLoka frontend:** root directory `frontend/`, build command `npm run build`, output directory `dist`.
2. **PawLoka API:** root directory `backend/`; export the Express app in the entrypoint Vercel detects, following the current Express-on-Vercel guide. Do not depend on a long-running listener or local files.

Set environment variables:

**Frontend**

- `VITE_API_BASE_URL` — deployed API base URL.
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Backend**

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USER_ID`
- `CORS_ORIGIN`

Create an admin user in Supabase and disable public sign-up before deployment. Configure any preview deployment origins deliberately; do not broaden production CORS to `*`. Use HTTPS for both deployments and update the frontend API URL/CORS after the first deploy. Verify the Vercel Hobby terms, limits, and Supabase Free pause behavior again before publishing.

### Release checklist

1. Run migrations and load only synthetic pet/shelter seed data.
2. Test the public API locally and confirm no unauthenticated admin endpoint works.
3. Configure local environment variables; verify no secrets are present in Git output.
4. Deploy the API project, then deploy the frontend with its API URL.
5. Test browser routes, PWA installability, HTTPS, CORS, submit, admin CRUD, and data deletion on the public deployment.
6. Add the source to GitHub and include setup/deployment instructions in `README.md`. The project is currently not a Git repository; initialize/publish it only with the student's GitHub authorization.

## 8. Cost Breakdown

| Service | MVP cost target | Caveat |
|---|---:|---|
| Vercel Hobby frontend and API | $0 | Hobby is listed as free; verify current limits and non-commercial/usage terms. |
| Supabase Free | $0 | Free projects may pause after inactivity; database/storage quotas apply. |
| Domain | $0 | Use the provider's default HTTPS domains. |
| Image hosting | $0 | Admin supplies public HTTPS URLs; use permitted images and stable sources. |
| Development tools | $0 | Existing local Node.js/npm and editor. |

Do not add billing or a paid service without reviewing the current plan limits first.

## 9. Scaling Path (not MVP targets)

- **Around 100 users:** keep the same architecture; add indexes for pet species/status/shelter and application status/date; watch free-tier quotas and errors.
- **Around 1,000 users:** review function/API usage, rate limits, database query plans, backups, and support needs; adopt paid service only with approval and a budget.
- **Around 10,000 users:** reassess whether Vercel Functions and Supabase plan/architecture meet latency, reliability, and privacy needs; add formal monitoring, backups, and operational procedures before representing the system as production-ready.

## 10. Limitations and Risks

- One admin and manually curated listings; no shelter self-service or admin role management.
- Public form submissions can be spammed; server validation and per-instance rate limits are only basic abuse barriers and do not provide global production-grade rate limiting.
- Vercel Functions have plan/runtime limits and are not an always-on server; no long-running jobs or in-memory durable sessions.
- Free hosting/database limits, terms, and availability can change; Supabase Free may pause when inactive.
- Image URLs may break, reveal ordinary request metadata to their host, or be used without permission; admin must use licensed HTTPS images and fallback behavior.
- No email or other automatic notification: admin must check the portal and contact parties manually.
- This student MVP is not a production adoption case-management system and has no formal security/compliance audit.

## 11. Sources and Verification Date

Vendor documentation checked 16 November 2026. Pricing/limits must be rechecked at deployment.

- Vercel Express — deployment support and Express app export: https://vercel.com/docs/frameworks/backend/express
- Vercel Node.js Runtime — function entry points and shared API function guidance: https://vercel.com/docs/functions/runtimes/node-js
- Vercel Functions Limits — runtime limits: https://vercel.com/docs/functions/limitations
- Vercel Pricing — Hobby plan: https://vercel.com/pricing
- Supabase Pricing — Free quotas and inactivity pause: https://supabase.com/pricing
- Supabase Row Level Security — grants, policies, and service-role boundary: https://supabase.com/docs/guides/database/postgres/row-level-security
- Vite PWA — manifest and service worker setup: https://vite-pwa-org.netlify.app/guide/

---
```json
{
  "schemaVersion": 1,
  "documentType": "techdesign",
  "appName": "PawLoka",
  "stack": {
    "frontend": "React + Vite + React Router + vite-plugin-pwa + Axios (JavaScript)",
    "backend": "Node.js + Express on Vercel Functions",
    "database": "Supabase Postgres",
    "auth": "Supabase Auth (one admin)",
    "styling": "Plain CSS with CSS custom properties",
    "deployment": "Vercel Hobby (frontend and API projects) + Supabase Free"
  },
  "commands": {
    "setup": "npm create vite@latest frontend -- --template react",
    "dev": "npm run dev (run separately in frontend/ and backend/)",
    "test": "npm test (run separately in frontend/ and backend/)",
    "typecheck": "Not applicable (JavaScript); use npm run lint",
    "lint": "npm run lint (run separately in frontend/ and backend/)",
    "build": "npm run build (frontend/); Vercel Functions build (backend/)"
  },
  "aiScope": "none"
}
```

## Handoff Context
<!-- Machine-readable summary for the next workflow step. Preserve unknowns explicitly. -->
- Stage: techdesign
- App name: PawLoka
- User level: C
- Target platform: web (PWA)
- Budget: gratis saja; domain bawaan
- Timeline: pengerjaan 13–24 November 2026; responsi 25–28 November 2026
- Mode: Deep
- AI in product scope: no
- Constraints: Tugas Akhir Praktikum PPB Ganjil 2026; individu; React/Vite/PWA + Express/Node.js + Axios + Supabase; wajib API buatan sendiri, Bottom Navigation Bar, minimal lima halaman, dua halaman list dengan detail, Profile/About, GitHub, hosting PWA gratis; judul PWA harus unik; target selesai 24 November 2026; pengalaman level C, ingin belajar melalui proyek.
- Decisions: Frontend React/Vite/JavaScript dan API Express/Node.js di dua project Vercel dari repository yang sama; Vercel Functions stateless untuk API; Supabase Postgres/Auth; satu admin dengan verifikasi token dan ID di backend; backend-only service-role secret; RLS dan grants dibatasi; public application API divalidasi/rate-limited; file images via public HTTPS URL (no uploads); cache hanya shell/static assets; styling plain CSS; no AI; tidak ada login adopter/shelter.
- Open questions: Praktikan perlu memastikan keunikan judul PawLoka pada platform PWA; host dan foto telah diputuskan.
- Source files: docs/research-PawLoka.md, docs/PRD-PawLoka-MVP.md, docs/TechDesign-PawLoka-MVP.md
