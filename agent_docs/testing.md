# Testing

## Required Before Completion

- [ ] Relevant frontend and backend tests pass.
- [ ] Frontend production build passes.
- [ ] Public and admin user journeys are exercised in a browser.
- [ ] Admin APIs reject unauthenticated and non-admin requests.
- [ ] No secrets or real applicant data appear in Git, logs, fixtures, or screenshots.

## Commands

Run from each project folder:

- Tests: `npm test`
- Lint: `npm run lint`
- Frontend build only: `npm run build`
- Typecheck: not applicable; project uses JavaScript.

## Focused Behaviors

- Pet filters/search return only matching records; clicking an item opens its matching detail.
- Shelter list item opens the matching detail and related pet list.
- Invalid pet ID, excessive text, unexpected applicant phone input, or missing privacy consent is rejected by the API; a valid application does not require applicant contact details.
- Successful application submission stores the additional adopter fields and returns a one-time token only after database success; only its hash is persisted.
- Application status reads require the matching ID/token pair, return only status/date/pet/shelter summary, and never permit public listing.
- The pet-detail adoption button opens the selected pet's application form. After the application is saved, the form opens a prefilled WhatsApp draft to the configured global number; it includes the adopter, pet, species, shelter, and reason, never uses `shelters.phone`, and is never sent automatically.
- Pet-card favorite controls toggle device-local saved pet IDs without navigating; the Favorite page loads matching pets from the API and permits removal.
- Application history reads each saved ID/token pair from the API and displays the server's current status using distinct labels for all supported statuses.
- Application history uses device-local tokens; removing a history item does not delete the database application.
- Public endpoints cannot list applications or modify pets/shelters; the only public application read is the token-scoped single-record route.
- Admin operations require a valid Supabase token for the configured admin; logged-out and other-user requests are denied.
- Admin deletion requires confirmation and preserves pet/shelter references for existing applications.
- API failure/offline states are visible; service worker never serves stale application/admin data.
- PWA loads its static shell over HTTPS and remains responsive on mobile and desktop.

