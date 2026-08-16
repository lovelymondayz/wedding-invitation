# Wedding Project — Route Reference

## Frontend Routes (React Router)

### Public Routes

| # | Path | Component | File | Purpose |
|---|------|-----------|------|---------|
| 1 | `/` | `HomePage` | `src/pages/HomePage.tsx` | Homepage + create form modal |
| 2 | `/admin/login` | `LoginPage` | `src/pages/admin/LoginPage.tsx` | Super admin login |
| 3 | `/admin/dashboard` | `SuperAdminDashboard` | `src/pages/admin/SuperAdminDashboard.tsx` | Super admin overview |
| 4 | `/admin/:coupleSlug/*` | `AdminRoutes` | `src/components/admin/AdminLayout.tsx` | Couple admin panel |
| 5 | `/:coupleSlug/invite/:guestSlug` | `InvitePage` | `src/pages/InvitePage.tsx` | Guest RSVP invitation |
| 6 | `/:coupleSlug` | `LandingPage` | `src/pages/LandingPage.tsx` | Public wedding page |
| 7 | `*` | `Navigate → /` | `src/App.tsx` | Catch-all redirect |

### Admin Nested Routes (under `/admin/:coupleSlug/`)

| # | Path | Component | File | Purpose |
|---|------|-----------|------|---------|
| 8 | `/` | `Overview` | `src/components/admin/AdminPages.tsx` | Dashboard overview |
| 9 | `/guests` | `GuestManagement` | `src/components/admin/AdminPages.tsx` | Guest list management |
| 10 | `/rsvps` | `RSVPPage` | `src/components/admin/AdminPages.tsx` | RSVP management |
| 11 | `/wishes` | `WishesManagement` | `src/components/admin/AdminPages.tsx` | Wishes management |
| 12 | `/gallery` | `GalleryManagement` | `src/components/admin/AdminPages.tsx` | Photo gallery |
| 13 | `/music` | `MusicManagement` | `src/components/admin/AdminPages.tsx` | Music tracks |
| 14 | `/schedule` | `SchedulePage` | `src/components/admin/AdminPages.tsx` | Event schedule |
| 15 | `/love-story` | `LoveStoryPage` | `src/components/admin/AdminPages.tsx` | Love story timeline |
| 16 | `/gift` | `GiftPage` | `src/components/admin/AdminPages.tsx` | Gift registry |
| 17 | `/settings` | `SettingsPage` | `src/components/admin/AdminPages.tsx` | Couple settings + template picker |

---

## Backend API Routes (Go/GIN)

### Public Routes

| # | Method | Path | Handler | Purpose |
|---|--------|------|---------|---------|
| 1 | GET | `/api/health` | `HealthHandler` | Health check |
| 2 | POST | `/api/couples` | `CreateCoupleHandler` | Create new couple |
| 3 | GET | `/api/couples/:slug` | `GetCoupleHandler` | Get couple public data |
| 4 | GET | `/api/couples/:slug/gallery` | `GetGalleryHandler` | Get gallery photos |
| 5 | GET | `/api/couples/:slug/love-story` | `GetLoveStoryHandler` | Get love story events |
| 6 | GET | `/api/couples/:slug/schedule` | `GetScheduleHandler` | Get schedule events |
| 7 | GET | `/api/couples/:slug/wishes` | `GetWishesHandler` | Get public wishes |
| 8 | GET | `/api/couples/:slug/gift` | `GetGiftHandler` | Get gift info |
| 9 | GET | `/api/couples/:slug/music/active` | `GetActiveMusicHandler` | Get active music |
| 10 | POST | `/api/couples/:slug/rsvp` | `SubmitRSVPHandler` | Submit RSVP |
| 11 | POST | `/api/couples/:slug/wish` | `SubmitWishHandler` | Submit wish |

### Auth Routes

| # | Method | Path | Handler | Purpose |
|---|--------|------|---------|---------|
| 12 | POST | `/api/auth/login` | `LoginHandler` | Admin login |

### Admin Routes (protected)

| # | Method | Path | Handler | Purpose |
|---|--------|------|---------|---------|
| 13 | GET | `/api/admin/couples` | `ListCouplesHandler` | List all couples (super admin) |
| 14 | DELETE | `/api/admin/couples/:slug` | `DeleteCoupleHandler` | Delete couple (super admin) |
| 15 | GET | `/api/admin/couples/:slug/settings` | `GetAdminSettingsHandler` | Get settings for admin |
| 16 | PUT | `/api/admin/couples/:slug/settings` | `UpdateCoupleHandler` | Update couple settings |
| 17 | POST | `/api/admin/couples/:slug/upload` | `BatchUploadHandler` | Batch image upload |
| 18 | GET | `/api/admin/dashboard/stats` | `DashboardStatsHandler` | Super admin stats |

---

## Summary

| Layer | Route Count |
|-------|-------------|
| Frontend public | 7 |
| Frontend admin (nested) | 10 |
| Backend public | 11 |
| Backend auth | 1 |
| Backend admin | 6 |
| **Total** | **35** |

## Key Route Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| `:coupleSlug` | `malik-niki-20260816` | Unique couple identifier |
| `:guestSlug` | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` | Unique guest UUID |
