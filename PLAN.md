# Wedding Invitation App — Implementation Plan

## Tech Stack
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend:** Go 1.22+ (Gin or stdlib) REST API
- **Database:** PostgreSQL
- **Auth:** JWT (bcrypt passwords), session cookie for admin
- **Monorepo:** `backend/` + `frontend/` + `admin/` subdirectories

## Design System
- **Colors:** Cream (#FFF8F0), Gold (#D4A574), Dark (#2C1810), White (#FFFFFF), Soft Pink (#F5E6E0)
- **Fonts:** Playfair Display (headings), Inter (body)
- **Style:** Glassmorphism cards (`backdrop-blur`), serif headings, smooth Framer Motion transitions
- **Decorations:** Floral SVG elements, animated overlays

## Database Schema (PostgreSQL)

```sql
-- Admin user
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Couple info (single row, editable)
CREATE TABLE couple_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    groom_name VARCHAR(100) NOT NULL DEFAULT '',
    bride_name VARCHAR(100) NOT NULL DEFAULT '',
    groom_photo_url TEXT DEFAULT '',
    bride_photo_url TEXT DEFAULT '',
    couple_photo_url TEXT DEFAULT '',
    story TEXT DEFAULT '',
    quote TEXT DEFAULT '',
    wedding_date DATE,
    wedding_time TIME,
    ceremony_time TIME,
    reception_time TIME,
    venue_name VARCHAR(200) DEFAULT '',
    venue_address TEXT DEFAULT '',
    maps_url TEXT DEFAULT '',
    maps_embed_url TEXT DEFAULT '',
    dress_code VARCHAR(100) DEFAULT '',
    music_url TEXT DEFAULT '',
    primary_color VARCHAR(7) DEFAULT '#D4A574',
    secondary_color VARCHAR(7) DEFAULT '#FFF8F0',
    bg_image_url TEXT DEFAULT '',
    is_published BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guests
CREATE TABLE guests (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    phone VARCHAR(20) DEFAULT '',
    notes TEXT DEFAULT '',
    attendance_status VARCHAR(20) DEFAULT 'pending', -- pending, attending, not_attending
    invitation_sent BOOLEAN DEFAULT false,
    invitation_opened BOOLEAN DEFAULT false,
    invitation_opened_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RSVPs
CREATE TABLE rsvps (
    id SERIAL PRIMARY KEY,
    guest_id INTEGER REFERENCES guests(id),
    name VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL, -- attending, not_attending
    attendee_count INTEGER DEFAULT 1,
    message TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishes / Guestbook
CREATE TABLE wishes (
    id SERIAL PRIMARY KEY,
    guest_name VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery photos
CREATE TABLE gallery_photos (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    thumbnail_url TEXT DEFAULT '',
    caption TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Music tracks
CREATE TABLE music_tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) DEFAULT '',
    url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift info
CREATE TABLE gift_info (
    id SERIAL PRIMARY KEY,
    bank_name VARCHAR(100) DEFAULT '',
    account_number VARCHAR(50) DEFAULT '',
    account_name VARCHAR(200) DEFAULT '',
    qris_image_url TEXT DEFAULT '',
    ewallet_provider VARCHAR(50) DEFAULT '',
    ewallet_number VARCHAR(50) DEFAULT '',
    sort_order INTEGER DEFAULT 0
);

-- Schedule events
CREATE TABLE schedule_events (
    id SERIAL PRIMARY KEY,
    event_time TIME NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0
);

-- Love story timeline
CREATE TABLE love_story_events (
    id SERIAL PRIMARY KEY,
    year VARCHAR(10) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    icon VARCHAR(50) DEFAULT '❤️',
    sort_order INTEGER DEFAULT 0
);

-- Insert default admin (password: admin123, hashed with bcrypt)
-- INSERT INTO admins (username, password_hash) VALUES ('admin', '$2a$10$...');
```

## API Endpoints

### Public
```
GET  /api/couple          → couple settings
GET  /api/countdown       → wedding date/time info
GET  /api/guest/:slug     → guest lookup by slug
POST /api/guest/:slug/open → mark invitation opened
POST /api/rsvp            → submit RSVP {guest_id, name, status, attendee_count, message}
POST /api/wishes          → submit wish {guest_name, message}
GET  /api/wishes          → list approved wishes (newest first)
GET  /api/gallery         → list gallery photos
GET  /api/music/active    → get active music track
GET  /api/schedule        → list schedule events
GET  /api/love-story      → list love story events
GET  /api/gift            → list gift info
```

### Admin (requires JWT auth)
```
POST /api/auth/login      → {username, password} → {token}
GET  /api/auth/me         → current admin info

PUT  /api/admin/couple    → update couple settings
POST /api/admin/couple/photo → upload couple/groom/bride photo

GET  /api/admin/guests     → list guests (paginated, search)
POST /api/admin/guests     → create guest {full_name, phone, notes}
POST /api/admin/guests/import → bulk import CSV
GET  /api/admin/guests/export → export CSV
PUT  /api/admin/guests/:id → update guest
DELETE /api/admin/guests/:id → delete guest

GET  /api/admin/rsvps      → list RSVPs + stats
GET  /api/admin/wishes     → list all wishes (include unapproved)
PUT  /api/admin/wishes/:id → approve/reject
DELETE /api/admin/wishes/:id → delete

POST /api/admin/gallery    → upload photo
PUT  /api/admin/gallery/:id → update caption/sort
DELETE /api/admin/gallery/:id → delete
PUT  /api/admin/gallery/reorder → reorder

POST /api/admin/music      → upload music
PUT  /api/admin/music/:id/activate → set active
DELETE /api/admin/music/:id → delete

GET  /api/admin/analytics  → dashboard stats
```

## Frontend Routes (React Router)
```
/                     → Landing page (with popup gate if ?to=Name or /invite/:slug)
/admin/login          → Admin login
/admin                → Admin dashboard ( Overview | Guests | RSVPs | Wishes | Gallery | Music | Settings )
```

## Task Breakdown

### Task 1: Project Scaffold
Create monorepo structure:
```
wedding-invitation/
├── backend/
│   ├── main.go
│   ├── go.mod
│   ├── .env
│   ├── internal/
│   │   ├── config/
│   │   ├── database/
│   │   ├── models/
│   │   ├── handlers/
│   │   ├── middleware/
│   │   └── utils/
│   └── migrations/
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/
│       ├── components/
│       │   ├── layout/
│       │   ├── sections/
│       │   ├── ui/
│       │   └── admin/
│       ├── pages/
│       ├── hooks/
│       └── styles/
└── README.md
```

Initialize Go module, install deps (pgx, jwt, bcrypt, gin-gonic, cors).
Initialize Vite React+TS, install deps (tailwind, framer-motion, react-router-dom, axios).

### Task 2: Database Layer
- Write `migrations/001_init.sql` with full schema
- Create `internal/database/db.go` — connection pool, migration runner
- Create Go model structs in `internal/models/` for all tables
- Implement CRUD operations in `internal/database/` for: guests, rsvps, wishes, gallery_photos, music_tracks, gift_info, schedule_events, love_story_events, couple_settings, admins

### Task 3: Go REST API — Auth & Settings
- `internal/middleware/auth.go` — JWT middleware
- `internal/utils/jwt.go` — token generation/validation
- Handlers: `POST /api/auth/login`, `GET /api/auth/me`
- Handlers: `GET/PUT /api/couple`, `GET /api/countdown`, `PUT /api/admin/couple`
- Handlers: gift_info CRUD, schedule CRUD, love_story CRUD

### Task 4: Go REST API — Guest & RSVP & Wishes
- Guest CRUD handlers + slug generation + CSV import/export
- RSVP submission + stats endpoint
- Wishes CRUD + approval flow
- Gallery upload/listing
- Music upload/activate
- Analytics aggregation endpoint

### Task 5: React Frontend — Core Shell
- `App.tsx` with React Router setup
- API client (`src/api/client.ts`) with axios
- Custom hooks: `useGuest`, `useSettings`, `useCountdown`
- Layout components: `FloatingNav`, `MusicPlayer`, `PageWrapper`
- InvitePopup component (fullscreen animated modal)
- Landing page skeleton with hero section

### Task 6: React Frontend — Main Sections
- `HeroSection` — couple photo, names, quote, animated bg, scroll indicator
- `CountdownSection` — live countdown timer (days/hours/min/sec)
- `WeddingInfoSection` — date, time, venue, address, dress code — glassmorphism cards
- `MapSection` — Google Maps embed + Open/Copy/Navigate buttons
- `LoveStorySection` — animated timeline with Framer Motion
- `ScheduleSection` — event timeline with accordion

### Task 7: React Frontend — Interactive Sections
- `GallerySection` — masonry grid, lightbox, lazy loading
- `VideoSection` — YouTube/Vimeo embed with aspect ratio
- `RSVPSection` — form with attend/not-attend, attendee count, message
- `WishesSection` — display approved wishes + submit form
- `GiftSection` — bank accounts, QRIS image, copy-to-clipboard

### Task 8: Admin Dashboard
- Login page (JWT → localStorage)
- Dashboard layout with sidebar navigation
- Overview stats (total guests, attending, pending, RSVPs, wishes)
- Guest management table (search, CRUD, CSV import/export, copy link)
- Wishes moderation (approve/delete)
- Gallery manager (upload, reorder via drag-drop)
- Music manager (upload MP3, set active)
- Couple settings form (all fields)
- Theme customization

### Task 9: Polish
- Framer Motion page transitions + scroll animations
- Responsive breakpoints (mobile-first)
- Glassmorphism card styles
- Floral SVG decorative elements
- Dark mode toggle (optional but bonus)
- Loading states + error handling
- SEO meta tags in index.html
- PWA manifest + service worker
- Background music auto-play after invite popup closes

### Task 10: GitHub Deploy
- Create GitHub repo `lovelymondayz/wedding-invitation`
- Push all code
- Include README with setup instructions
