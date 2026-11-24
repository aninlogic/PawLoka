# Product Requirements

Full acceptance criteria: `docs/PRD-PawLoka-MVP.md`.

## Users and Problem

- Primary user: prospective pet adopter looking for an available animal and shelter.
- Admin user: one PawLoka admin who manages listings and adoption inquiries.
- Problem: pet and shelter information is fragmented; provide a searchable catalog, shelter details, adoption guidance, and a simple inquiry journey.

## Must-Have

- Bottom Navigation Bar and at least five public pages.
- Pet catalog and shelter directory; each list item opens its matching detail page.
- Pet search/filter by species, age, and adoption status; About/Profile page.
- Adoption guidance and an inquiry form with data-use notice and consent.
- Admin login and protected CRUD for pets/shelters; admin can review, update, and manually delete inquiries.
- React/Vite PWA calls the Express API, which uses Supabase; deploy on free Vercel and publish source to GitHub.

## Data and Safety

- Application fields: name, domicile, adoption reason, pet-keeping experience, selected pet, optional message, consent timestamp; do not collect applicant phone.
- Do not collect address, government ID, documents, or applicant photos.
- No public inquiry listing/read or unauthenticated catalog writes.
- One Supabase Auth admin; no adopter/shelter accounts; no product AI.
- Public images use admin-entered HTTPS URLs; no upload in MVP.

## Success Signals

- Required PPB pages/navigation, two list-to-detail flows, profile, own API, GitHub source, and deployed PWA are demonstrable.
- Public inquiry submission and authenticated admin processing work end-to-end.
- Unauthenticated requests cannot access admin operations or inquiry data.

