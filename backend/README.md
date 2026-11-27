# HikKing API

Laravel + Sanctum + MySQL backend for the HikKing travel site: tours, reservation requests, reviews, support requests, notifications and traveler stories.

## Set up

```bash
composer install
cp .env.example .env        # then set DB_DATABASE / DB_USERNAME / DB_PASSWORD
php artisan key:generate
php artisan migrate --seed  # or: php artisan migrate:fresh --seed
php artisan storage:link    # needed so uploaded story photos are served
php artisan serve
```

Seeded accounts (password `password123`): `admin@hikking.com` (admin) and `traveler@test.com`, `tanvir@test.com`, `nusrat@test.com`, `farhan@test.com` (travelers).

If you already have a migrated database, `php artisan migrate` is enough: the new migration removes guides, payments and the hand-written SQL objects, and adds stories and wishlists.

## Roles
- **traveler**: sends reservation requests, reviews completed trips, raises support requests, shares stories.
- **admin**: manages the catalogue (destinations, tours, stays, categories), confirms reservations, handles support requests, moderates stories.

## Access rules
- Public: browse destinations, tours (published only), stays, categories, reviews, approved stories.
- Signed in: own reservations, reviews, support requests, notifications, wishlist, stories.
- Admin only (`admin` middleware): every create / update / delete on the catalogue, tour plan sync, reservation delete, support request status, story moderation, user list.
- An admin token also sees draft and archived tours on `GET /api/packages`.

## Endpoints (all under `/api`)
| Area | Endpoints |
| --- | --- |
| Auth | `POST /register`, `POST /login`, `POST /logout`, `GET /me` |
| Catalogue | `GET/POST/PUT/DELETE /destinations`, `/packages`, `/hotels`, `/categories` (writes are admin only) |
| Tour plan | `POST /packages/{id}/categories`, `/hotels`, `/itinerary` (admin) |
| Reservations | `GET /bookings`, `GET /bookings/{id}`, `POST /bookings`, `PUT /bookings/{id}`, `DELETE /bookings/{id}` (admin) |
| Reviews | `GET /reviews?package_id=`, `POST /reviews` (completed trips only) |
| Support | `GET/POST /complaints`, `PUT /complaints/{id}` (admin) |
| Notifications | `GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/read-all`, `POST /notifications/{id}/read`, `DELETE /notifications/{id}` |
| Stories | `GET /experiences` (`?mine=1`, `?all=1` admin), `POST /experiences` (multipart: title, story, place, photos[], captions[]), `PUT /experiences/{id}` (admin: status), `DELETE /experiences/{id}` |
| Saved trips | `GET /wishlist`, `POST /wishlist {package_id}`, `DELETE /wishlist/{package_id}` |

## Reservation flow
`pending` (traveler requests) -> `confirmed` (admin) -> `completed` (admin) or `cancelled`. A traveler can cancel only while it is still pending. Admins are notified of new requests, travelers of status changes. No payment is taken.
