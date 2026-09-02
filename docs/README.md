# HikKing

**Explore the World with HikKing** — a full-stack travel management platform that connects travelers with verified local guides, curated destinations, and multi-modal trip planning, all from a single dashboard.

HikKing is a web-based platform that connects travelers with verified local guides and travel packages across Bangladesh's most sought-after destinations — Cox's Bazar, Sreemangal, Sajek Valley, Saint Martin, Bandarban, and more. Travelers can discover destinations, browse guided packages with full itineraries, book trips, and manage everything from a single dashboard. Guides can register, get verified through a document-review workflow, publish packages, and manage incoming bookings.

The project demonstrates a normalized relational database design supporting real-world booking and itinerary workflows, delivered as a usable full-stack application.

### Problem it solves

- Finding a reliable, verified local guide is often informal and hard to trust.
- Travelers have no single place to compare destinations, packages, and guide credentials before committing to a trip.
- There's no centralized system to track a trip's full lifecycle — from browsing to booking to completion to review.

---

## Features

- **Role-based authentication** — separate traveler and guide accounts via Laravel Sanctum
- **Destination discovery** — browse active destinations with nested package listings
- **Package management** — guides create, edit, and publish multi-day packages with full itineraries
- **Guide verification** — guides submit documents for admin review (pending → verified/rejected)
- **Booking system** — travelers book packages, track status (pending/confirmed/cancelled/completed)
- **Trip lifecycle tracking** — confirmed bookings automatically become trips with status updates (upcoming/ongoing/completed/cancelled)
- **Reviews & ratings** *(in progress)* — travelers rate guides and packages after trip completion, feeding into a guide's average rating
- **Separate dashboards** for travelers and guides

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (React) + Tailwind CSS |
| Backend | Laravel (PHP) REST API |
| Database | MySQL |
| Auth | Laravel Sanctum (token-based) |
| Tooling | VS Code, Git & GitHub, Postman |
| Deployment | Vercel (frontend), cloud/PHP server (backend) |

---

## Architecture

```
┌─────────────────────┐
│   Next.js Frontend   │
│  (React + Tailwind)  │
└──────────┬───────────┘
           │ REST API (JSON over HTTPS)
           ▼
┌─────────────────────┐
│   Laravel Backend    │
│  Controllers / Auth  │
│   Eloquent Models     │
└──────────┬───────────┘
           ▼
┌─────────────────────┐
│    MySQL Database     │
└─────────────────────┘
```

The frontend never talks to the database directly — all data flows through the Laravel REST API.

---

## Database Schema

Core entity relationships:

```
User
 ├── hasOne  GuideProfile
 │              ├── hasMany VerificationDocuments
 │              └── hasMany Packages
 ├── hasMany Bookings
 ├── hasMany Complaints
 └── hasMany Notifications

Destination
 └── hasMany Packages

Package
 ├── belongsTo Destination
 ├── belongsTo GuideProfile
 ├── hasMany   PackageItineraries
 ├── belongsToMany Categories (via package_categories)
 ├── belongsToMany Hotels     (via package_hotels)
 └── hasMany   Bookings

Booking
 ├── belongsTo User (traveler)
 ├── belongsTo Package
 ├── hasOne    Payment
 ├── hasOne    Trip
 └── hasMany   Reviews (via trip completion)
```

**Core tables:** `users`, `guide_profiles`, `verification_documents`, `destinations`, `packages`, `package_itineraries`, `categories`, `package_categories`, `hotels`, `package_hotels`, `bookings`, `payments`, `trips`, `reviews`, `complaints`, `notifications`

A full Entity Relationship Diagram is available in [`/docs/ERD.pdf`](./docs/ERD.pdf).

---

## API Reference

### Public endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/destinations` | List all active destinations |
| GET | `/api/destinations/{id}` | Get a destination with nested packages, itineraries, and guides |
| GET | `/api/packages` | List published packages |
| GET | `/api/packages/{id}` | Get full package details |
| GET | `/api/guides` | List verified guides |
| GET | `/api/guides/{id}` | Get a guide profile with their packages |
| POST | `/api/register` | Register a new user (traveler or guide) |
| POST | `/api/login` | Authenticate and receive a token |

### Protected endpoints (require Sanctum token)

| Method | Endpoint | Description | Role |
|---|---|---|---|
| POST | `/api/logout` | Log out the current user | All |
| GET | `/api/user` | Get the authenticated user | All |
| PUT | `/api/guide/profile` | Update guide profile | Guide |
| POST | `/api/guide/verification-documents` | Upload a verification document | Guide |
| GET | `/api/guide/verification-status` | Check verification status | Guide |
| PUT | `/api/admin/guides/{id}/verify` | Approve/reject a guide | Admin |
| GET | `/api/my-packages` | List the authenticated guide's packages | Guide |
| POST | `/api/packages` | Create a package | Guide |
| PUT | `/api/packages/{id}` | Update a package | Guide |
| DELETE | `/api/packages/{id}` | Delete a package | Guide |
| POST | `/api/packages/{id}/itineraries` | Add an itinerary day | Guide |
| DELETE | `/api/packages/{id}/itineraries/{itineraryId}` | Remove an itinerary day | Guide |
| GET | `/api/bookings` | List the traveler's bookings | Traveler |
| POST | `/api/bookings` | Create a booking | Traveler |
| GET | `/api/bookings/{id}` | Get booking details | Traveler |
| POST | `/api/bookings/{id}/cancel` | Cancel a booking | Traveler |
| GET | `/api/guide/bookings` | List booking requests for a guide | Guide |
| PUT | `/api/guide/bookings/{id}/status` | Confirm/reject a booking | Guide |
| GET | `/api/trips` | List the traveler's trips | Traveler |
| GET | `/api/trips/{id}` | Get trip details | Traveler |
| POST | `/api/trips/{id}/cancel` | Cancel a trip | Traveler |
| PUT | `/api/trips/{id}/status` | Update trip status | Guide |

A Postman collection covering all endpoints is available in [`/docs/HikKing.postman_collection.json`](./docs).

---

## Getting Started

### Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL >= 8.0

### Backend setup (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Update `.env` with your database credentials:

```env
DB_DATABASE=hikking
DB_USERNAME=root
DB_PASSWORD=
```

Run migrations:

```bash
php artisan migrate
```

Start the server:

```bash
php artisan serve
```

The API will be available at `http://127.0.0.1:8000`.

### Frontend setup (Next.js)

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Set the API base URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Project Structure

```
HikKing/
├── backend/                          # Laravel REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/     # AuthController, DestinationController,
│   │   │                             # PackageController, GuideController,
│   │   │                             # BookingController, TripController
│   │   └── Models/                   # User, GuideProfile, Destination, Package,
│   │                                 # PackageItinerary, Booking, Trip, Review
│   ├── database/migrations/
│   └── routes/api.php
│
├── frontend/                         # Next.js + Tailwind CSS
│   ├── pages/
│   │   ├── destinations/
│   │   ├── packages/
│   │   ├── guides/
│   │   ├── auth/
│   │   └── dashboard/{traveler,guide}/
│   ├── components/
│   └── services/api.js
│
└── docs/
    ├── ERD.pdf
    └── HikKing.postman_collection.json
```

---

## Roadmap

| Phase | Component | Status |
|---|---|---|
| 1 | Foundation & DB setup | ✅ Complete |
| 2 | Core travel data (destinations, packages, itineraries) | ✅ Complete |
| 3 | REST API | ✅ Complete |
| 4 | Authentication (Sanctum, roles) | ✅ Complete |
| 5 | Guide verification | ✅ Complete |
| 6 | Package management | ✅ Complete |
| 7 | Booking system | ✅ Complete |
| 8 | Trip management | ✅ Complete |
| 9 | Reviews & ratings | ⏳ In progress |
| 10 | Frontend integration | 🔄 In progress |
| 11 | Categories & hotels (M:N) | ⬜ Planned |
| 12 | Multi-modal route planning & cost comparison | ⬜ Planned |

---

## Team

Department of Computer Science & Engineering, AUST — CSE 3104

| Name | Role |
|---|---|
| **Abdur Rahman Aiman** | Lead Backend Developer / Database Architect |
| **Munawar Mahtab Moon** | Frontend Developer (Next.js + Tailwind CSS) |
| **Raisul Islam Sifat** | QA / Documentation |

---

## License

Licensed under the [MIT License](./LICENSE).
