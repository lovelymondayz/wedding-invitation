# Wedding Invitation App — Architecture

## Overview
A full-stack wedding invitation website with admin dashboard. Guests receive personalized invitations via unique URLs (slug-based). Public landing page with countdown, love story timeline, gallery, RSVP form, wishes, and gift info. Admin panel for guest management, content editing, and analytics.

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend:** Go 1.22 + Gin + pgx (PostgreSQL driver)
- **Database:** PostgreSQL 16
- **Deployment:** Docker Compose (3 services: db, backend, frontend)
- **Auth:** JWT (15-min access tokens, HMAC-SHA256)

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    NGINX (port 3000)                  │
│  Serves React SPA + proxies /api/* to backend:8080   │
└──────────────┬───────────────────────────────────────┘
               │
    ┌──────────▼──────────┐
    │   Go API (port 8080) │
    │   ┌────────────────┐ │
    │   │  Public Routes  │ │  GET /api/couple, /guest/:slug
    │   │  (no auth)     │ │  POST /api/rsvp, /wishes
    │   ├────────────────┤ │  GET /api/gallery, /schedule
    │   │  Auth Routes    │ │  POST /api/auth/login
    │   ├────────────────┤ │
    │   │  Admin Routes   │ │  CRUD guests, gallery, wishes
    │   │  (JWT required) │ │  Analytics, file upload
    │   └────────────────┘ │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │  PostgreSQL (5432)   │
    │  ┌────────────────┐ │
    │  │  admins         │ │
    │  │  couple_settings│ │
    │  │  guests         │ │
    │  │  rsvps          │ │
    │  │  wishes         │ │
    │  │  gallery_photos │ │
    │  │  music_tracks   │ │
    │  │  gift_info      │ │
    │  │  schedule_events│ │
    │  │  love_story     │ │
    │  └────────────────┘ │
    └─────────────────────┘
```

## Directory Structure
```
wedding-invitation/
├── docker-compose.yml
├── Makefile
├── backend/
│   ├── main.go                    # Entry point, route setup
│   ├── go.mod / go.sum
│   ├── Dockerfile
│   ├── migrations/
│   │   └── 001_init.sql           # Full schema + seed data
│   └── internal/
│       ├── config/config.go       # Env-based configuration
│       ├── database/db.go         # pgxpool connection
│       ├── models/models.go       # Domain structs
│       ├── handlers/
│       │   ├── public.go          # Public endpoints
│       │   ├── auth.go            # Login, Me, Couple update
│       │   ├── admin.go           # RSVP listing
│       │   ├── admin_guests.go    # Guest CRUD
│       │   ├── admin_gallery.go   # Gallery CRUD
│       │   ├── admin_wishes.go    # Wishes moderation
│       │   ├── admin_music.go     # Music management
│       │   └── admin_analytics.go # Dashboard stats
│       ├── middleware/auth.go     # JWT + CORS
│       └── utils/
│           ├── jwt.go             # Token generation/validation
│           └── response.go        # JSON helpers, slugify
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── main.tsx / App.tsx
│       ├── index.css
│       ├── api/
│       │   ├── client.ts          # Axios instance + interceptors
│       │   ├── services.ts        # Typed API functions
│       │   └── types.ts           # Shared TypeScript interfaces
│       ├── pages/
│       │   └── LandingPage.tsx    # Public landing + invite page
│       ├── components/
│       │   ├── sections/index.tsx # All page sections
│       │   ├── ui/                # PageSection, GlassCard, etc.
│       │   └── admin/             # Admin dashboard components
│       └── hooks/                 # useCountdown, useMusic, useGuest
└── PLAN.md                        # Original implementation plan
```

## Data Flow
1. User visits `/invite/:slug` → frontend fetches guest info → shows personalized popup
2. RSVP submission → `POST /api/rsvp` → inserts into `rsvps` + updates guest status
3. Wish submission → `POST /api/wishes` → inserts with `is_approved=true`
4. Admin login → `POST /api/auth/login` → returns JWT → stored in localStorage
5. All admin requests include `Authorization: Bearer <token>` header
6. File uploads → `POST /api/admin/upload` → saved to `./uploads/`

## Design Decisions
- **Gin framework** — Simple, fast, widely-used. Chosen over stdlib for middleware ergonomics.
- **Axios over Fetch** — Interceptors for auth header injection and 401 handling.
- **Migrations via Docker initdb** — Mounted at `/docker-entrypoint-initdb.d` for clean first-run setup.
- **Single couple_settings row** — `CHECK (id = 1)` constraint ensures exactly one settings row.
- **Slug-based guest URLs** — Generated from guest name, stored as unique slug for personalized invites.
