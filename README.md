# Wedding Invitation App

A full-stack wedding invitation website with admin dashboard. Guests receive personalized invitations via unique URLs (slug-based). Public landing page with countdown, love story timeline, gallery, RSVP form, wishes, and gift info. Admin panel for guest management, content editing, and analytics.

## Quick Start

```bash
# Clone
git clone https://github.com/lovelymondayz/wedding-invitation.git
cd wedding-invitation

# Start all services
docker compose up -d --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# DB: localhost:5432 (user: wedding, pass: wedding123)
```

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

## Features

- **Personalized invitations:** unique slug-based URLs per guest
- **Public landing page:** countdown timer, love story timeline, gallery
- **RSVP management:** guest response tracking with attendee count
- **Wishbook:** guest messages with approval workflow
- **Music player:** background music for the invitation
- **Gift info:** bank accounts, e-wallet, or physical gifts
- **Schedule events:** ceremony, reception, etc.
- **Gallery management:** batch upload, reorder, captions
- **Guest import:** CSV import/export for guest list
- **Admin analytics:** invitation open tracking, RSVP stats
- **Auto-cleanup:** couples deleted 60 days after wedding date

## API Endpoints

### Public
- `GET /api/couples/:slug` — Couple info + settings
- `GET /api/couples/:slug/guest/:guestSlug` — Guest-specific invitation
- `POST /api/couples/:slug/rsvp` — Submit RSVP
- `POST /api/couples/:slug/wishes` — Submit wish
- `GET /api/couples/:slug/wishes` — List wishes
- `GET /api/couples/:slug/gallery` — List gallery photos
- `POST /api/auth/login` — Admin login

### Admin (JWT required)
- `GET /api/admin/auth/me` — Current admin info
- `PUT /api/admin/couples/:slug` — Update couple settings
- `GET /api/admin/couples/:slug/guests` — List guests
- `POST /api/admin/couples/:slug/guests` — Create guest
- `POST /api/admin/couples/:slug/guests/import` — CSV import
- `PUT /api/admin/couples/:slug/gallery/:id` — Update gallery
- `GET /api/admin/couples/:slug/analytics` — Dashboard analytics

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8080 | Backend port |
| DATABASE_URL | postgres://wedding:***@db:5432/wedding | DB connection |
| JWT_SECRET | change-this-to-a-random-64-char-secret | JWT signing key |

## Development

```bash
# Backend only
cd backend
go run .

# Frontend only
cd frontend
npm install
npm run dev
```

## Deployment

1. Push to `main` → GitHub Action auto-deploys
2. Or manually: `ssh vps && cd /root/wedding-invitation && ./update.sh`

## License

MIT