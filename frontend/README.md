# HikKing Frontend

Trips across Bangladesh: browse tours, send reservation requests, share travel stories. Next.js 16, React 19, Tailwind 4, Nunito.

## Run

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to your Laravel API (e.g. `http://127.0.0.1:8000/api`).

## What this version is
- Traveler site: home, destinations, tours, tour detail, stays, stories, saved trips, account area.
- Admin panel (`/admin`): overview, reservations, tours, destinations, stays, categories, support, stories. Full CRUD, no database-operation pages.
- Guides and online payments are removed. Booking is a *reservation request* the admin confirms.
- Business details (email, phone, address) live in `app/lib/site.ts`.
- Legal text lives in `app/legal/[slug]/page.tsx`. Edit it to match your real terms.

## Backend
- The matching Laravel backend (`backend.zip`) now provides `/experiences`, admin-protected catalogue routes, and no guides or payments. Run its migration, `php artisan storage:link`, and seed.
- If the API has no `/experiences` route, stories fall back to this browser's storage (see `app/lib/stories.ts`).
- Sharing a story needs at least one completed reservation (seeded travelers have one).

## Notes
- Wishlist is stored per device (localStorage).
- When the API returns no tours/hotels, clearly labelled sample data is shown so the UI is never empty.
