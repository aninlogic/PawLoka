# Code Patterns

## Architecture

- Keep frontend UI organized by feature: public pages, admin pages, shared components, and API clients.
- Keep Express routes/controllers thin; put validation and data-access logic in focused middleware/services.
- Keep domain and data rules out of presentation components.
- Reuse an existing helper before introducing a second pattern for the same task.

## Data and State

- Use Axios clients in one frontend API module; keep the API base URL in `VITE_API_BASE_URL`.
- Use local component state for transient UI state; no global state library is needed for the MVP.
- Represent loading, empty, offline, success, and error states explicitly.
- Use controlled forms with client-side feedback and repeat every security-relevant validation in Express.
- Do not cache API responses in the service worker.

## Errors and Validation

- Validate public and admin request bodies at the API boundary.
- Return stable, user-safe error codes/messages; do not expose SQL, credentials, or applicant data.
- Do not log request bodies for adoption applications.
- Never convert failed requests into success-shaped defaults.

## Naming

- React components: PascalCase.
- Functions/variables: camelCase.
- Environment variables: UPPER_SNAKE_CASE.
- Follow the existing folder and file naming pattern once established.

