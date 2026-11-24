# PawLoka — Agent Instructions

## Project

- **Product:** PWA for prospective pet adopters to find pets and shelters, read adoption guidance, and submit an adoption inquiry.
- **Users:** Public prospective adopters and one authenticated PawLoka admin. Shelters do not have accounts in the MVP.
- **Current phase:** Foundation / first implementation.
- **Source of truth:** `docs/PRD-PawLoka-MVP.md` defines scope; `docs/TechDesign-PawLoka-MVP.md` defines implementation.

## Important Commands

Run frontend and backend in separate terminals, each from its own directory:

- `npm run dev`
- `npm test`
- `npm run lint`
- Frontend only: `npm run build`

Set up the Supabase project and required local environment variables as described in the Tech Design and `README.md`. Do not put actual values in tracked files.

## Read First

For product scope, read `docs/PRD-PawLoka-MVP.md` and `docs/TechDesign-PawLoka-MVP.md`. For concise implementation context, read the relevant files under `agent_docs/`; `agent_docs/testing.md` is required before reporting checks.

## Gotchas

- The backend is an Express app deployed as Vercel Functions. Keep handlers stateless; do not rely on a persistent listener, local filesystem, or in-memory sessions.
- The browser calls the Express API. The Supabase service-role key belongs only in backend environment settings and must never reach frontend code, logs, or Git.
- Supabase service-role requests bypass RLS. The API must authenticate/authorize every admin operation and validate public submissions server-side.
- Public callers may submit an adoption inquiry but must never list or read inquiries or modify catalog data.
- The service worker may cache the app shell/static assets only; never cache API responses, admin data, or adoption inquiries.
- Images are admin-supplied public HTTPS URLs. Check usage rights and provide a fallback; uploads are outside MVP scope.
- Use synthetic seed data only. Do not copy real applicant information into tests, logs, screenshots, or repository fixtures.

## Protected Scope

Ask before expanding the approved MVP to collect additional personal data, add adopter/shelter accounts, change the one-admin authorization boundary, expose new public database operations, broaden production CORS, or add paid services. Never reveal or commit secrets, tokens, private logs, or real applicant data. Deployment and production writes require explicit user approval.

## Done Means

Report changed files, commands actually run, test/build/browser evidence, remaining risks, and recovery status. A successful build alone does not establish that the user journey works.
