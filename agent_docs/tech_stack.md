# Tech Stack

Last verified against vendor documentation: 2026-11-16.

| Area | Choice | Notes |
|---|---|---|
| Frontend | React + Vite + React Router + Axios + `vite-plugin-pwa` (JavaScript) | Responsive installable PWA; browser calls own API. |
| Backend | Node.js + Express on Vercel Functions | Stateless REST handlers; local development uses Express server entry. |
| Database | Supabase Postgres | Migrations and synthetic seed data in repository. |
| Auth | Supabase Auth, one admin | Disable public sign-up; verify token and admin ID in Express. |
| Styling | Plain CSS and CSS variables | Custom mint/off-white/forest/lavender/yellow/coral visual language. |
| Deployment | Two Vercel Hobby projects + Supabase Free | Frontend and API use separate project roots in one repository. Recheck plan terms/limits. |

## Commands

From `frontend/` and `backend/` separately:

- Setup: `npm install`
- Dev: `npm run dev`
- Tests: `npm test`
- Lint: `npm run lint`
- Frontend build: `npm run build`
- Typecheck: not applicable (JavaScript); ESLint and tests are the project checks.
- Browser check: run both apps locally, then exercise the public and admin flows in a browser.

## Important Patterns

- API base URL: frontend `VITE_API_BASE_URL`.
- Public Auth config: frontend may use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; never put service-role credentials there.
- Backend secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USER_ID`, `CORS_ORIGIN`.
- Verify auth on every `/api/admin/*` request. RLS does not constrain service-role requests.
- Restrict CORS; validate at the API boundary; rate-limit public inquiry submission.
- Cache shell/static assets only. Keep API and applicant data network-only.
- No product AI; use synthetic data for AI-assisted development.

## Deployment

Connect one Git repository to separate Vercel projects rooted at `frontend/` and `backend/`. Set environment variables in the corresponding Vercel project. Keep Supabase migrations and seed fixtures free of real personal data.

