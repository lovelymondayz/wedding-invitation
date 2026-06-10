-- Wedding Invitation Database Schema — Multi-Tenant
-- Drops old tables and rebuilds with couple-scoped architecture

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════
-- COUPLES (replaces couple_settings)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS couples (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            VARCHAR(200) UNIQUE NOT NULL,
    groom_name      VARCHAR(100) NOT NULL DEFAULT '',
    bride_name      VARCHAR(100) NOT NULL DEFAULT '',
    groom_photo_url TEXT DEFAULT '',
    bride_photo_url TEXT DEFAULT '',
    couple_photo_url TEXT DEFAULT '',
    story           TEXT DEFAULT '',
    quote           TEXT DEFAULT 'And so the adventure begins...',
    wedding_date    DATE,
    wedding_time    TIME,
    ceremony_time   TIME,
    reception_time  TIME,
    venue_name      VARCHAR(200) DEFAULT '',
    venue_address   TEXT DEFAULT '',
    maps_url        TEXT DEFAULT '',
    maps_embed_url  TEXT DEFAULT '',
    dress_code      VARCHAR(100) DEFAULT '',
    music_url       TEXT DEFAULT '',
    primary_color   VARCHAR(7) DEFAULT '#D4A574',
    secondary_color VARCHAR(7) DEFAULT '#FFF8F0',
    bg_image_url    TEXT DEFAULT '',
    video_url       TEXT DEFAULT '',
    video_type      VARCHAR(20) DEFAULT '',
    is_published    BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER couples_updated_at
    BEFORE UPDATE ON couples
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════
-- ADMINS — couple_id NULL = super admin
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS admins (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    couple_id       UUID REFERENCES couples(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- All tables below scoped by couple_id
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS guests (
    id                  SERIAL PRIMARY KEY,
    couple_id           UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    full_name           VARCHAR(200) NOT NULL,
    slug                VARCHAR(200) NOT NULL,
    phone               VARCHAR(20) DEFAULT '',
    notes               TEXT DEFAULT '',
    attendance_status   VARCHAR(20) DEFAULT 'pending',
    invitation_sent     BOOLEAN DEFAULT false,
    invitation_opened   BOOLEAN DEFAULT false,
    invitation_opened_at TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(couple_id, slug)
);

CREATE TRIGGER guests_updated_at
    BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS rsvps (
    id              SERIAL PRIMARY KEY,
    couple_id       UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    guest_id        INTEGER REFERENCES guests(id) ON DELETE SET NULL,
    name            VARCHAR(200) NOT NULL,
    status          VARCHAR(20) NOT NULL,
    attendee_count  INTEGER DEFAULT 1,
    message         TEXT DEFAULT '',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishes (
    id          SERIAL PRIMARY KEY,
    couple_id   UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    guest_name  VARCHAR(200) NOT NULL,
    message     TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_photos (
    id              SERIAL PRIMARY KEY,
    couple_id       UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    thumbnail_url   TEXT DEFAULT '',
    caption         TEXT DEFAULT '',
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS music_tracks (
    id          SERIAL PRIMARY KEY,
    couple_id   UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    title       VARCHAR(200) DEFAULT '',
    url         TEXT NOT NULL,
    is_active   BOOLEAN DEFAULT false,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gift_info (
    id              SERIAL PRIMARY KEY,
    couple_id       UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    bank_name       VARCHAR(100) DEFAULT '',
    account_number  VARCHAR(50) DEFAULT '',
    account_name    VARCHAR(200) DEFAULT '',
    qris_image_url  TEXT DEFAULT '',
    ewallet_provider VARCHAR(50) DEFAULT '',
    ewallet_number  VARCHAR(50) DEFAULT '',
    sort_order      INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS schedule_events (
    id          SERIAL PRIMARY KEY,
    couple_id   UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    event_time  TIME NOT NULL,
    title       VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    sort_order  INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS love_story_events (
    id          SERIAL PRIMARY KEY,
    couple_id   UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    year        VARCHAR(10) NOT NULL,
    title       VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    icon        VARCHAR(50) DEFAULT '❤️',
    sort_order  INTEGER DEFAULT 0
);

-- ═══════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_couples_slug ON couples(slug);
CREATE INDEX IF NOT EXISTS idx_guests_couple ON guests(couple_id);
CREATE INDEX IF NOT EXISTS idx_guests_slug ON guests(couple_id, slug);
CREATE INDEX IF NOT EXISTS idx_rsvps_couple ON rsvps(couple_id);
CREATE INDEX IF NOT EXISTS idx_wishes_couple ON wishes(couple_id);
CREATE INDEX IF NOT EXISTS idx_gallery_couple ON gallery_photos(couple_id);
CREATE INDEX IF NOT EXISTS idx_music_couple ON music_tracks(couple_id);
CREATE INDEX IF NOT EXISTS idx_gift_couple ON gift_info(couple_id);
CREATE INDEX IF NOT EXISTS idx_schedule_couple ON schedule_events(couple_id);
CREATE INDEX IF NOT EXISTS idx_lovestory_couple ON love_story_events(couple_id);
CREATE INDEX IF NOT EXISTS idx_admins_couple ON admins(couple_id);

-- ═══════════════════════════════════════════
-- SEED DATA — John & Jane as first couple
-- ═══════════════════════════════════════════

-- Insert first couple, capture UUID
INSERT INTO couples (id, slug, groom_name, bride_name, quote, wedding_date, wedding_time, venue_name, venue_address, maps_url, maps_embed_url, dress_code, is_published)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'john-jane-a0eebc99',
    'John', 'Jane',
    'And so the adventure begins...',
    '2026-12-25', '08:00',
    'Grand Ballroom Hotel',
    '123 Wedding Street, City',
    'https://maps.google.com/?q=Grand+Ballroom+Hotel',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0!2d106.8!3d-6.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1',
    'Formal / Black Tie',
    true
)
ON CONFLICT DO NOTHING;

-- Super admin (couple_id = NULL means super admin)
-- password: admin123
INSERT INTO admins (username, password_hash, couple_id)
VALUES ('admin', '$2a$10$PYhuumGMH0aEKssZPOMnSuVOblazn6gQFDvGovQh.3Kcy2Y87JsVu', NULL)
ON CONFLICT DO NOTHING;

-- Sample love story
INSERT INTO love_story_events (couple_id, year, title, description, icon, sort_order) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2018', 'First Met', 'We met at a mutual friend''s party. The moment our eyes locked, we knew something special was beginning.', '❤️', 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2020', 'Started Dating', 'After two years of friendship, we finally decided to take the leap and start our romantic journey together.', '💍', 2),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2025', 'Engagement', 'Under the starlit sky, with tears of joy, he proposed and she said YES!', '🏡', 3),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026', 'Wedding Day', 'The day we''ve been dreaming of — joining our hearts, our lives, and our forever.', '👰', 4)
ON CONFLICT DO NOTHING;

-- Sample schedule
INSERT INTO schedule_events (couple_id, event_time, title, description, sort_order) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '08:00', 'Akad Nikah', 'Sacred marriage ceremony', 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '10:00', 'Reception', 'Wedding reception celebration', 2),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '11:00', 'Lunch', 'Wedding lunch for all guests', 4),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '18:00', 'Dinner', 'Evening dinner celebration', 5)
ON CONFLICT DO NOTHING;

-- Sample gallery
INSERT INTO gallery_photos (couple_id, url, thumbnail_url, caption, sort_order) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '/uploads/gallery1.jpg', '/uploads/gallery1_thumb.jpg', 'Our first date', 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '/uploads/gallery2.jpg', '/uploads/gallery2_thumb.jpg', 'Beach vacation together', 2),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '/uploads/gallery3.jpg', '/uploads/gallery3_thumb.jpg', 'Engagement photoshoot', 3)
ON CONFLICT DO NOTHING;

-- Sample gift
INSERT INTO gift_info (couple_id, bank_name, account_number, account_name, sort_order) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BCA', '1234567890', 'John Doe', 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mandiri', '0987654321', 'Jane Doe', 2)
ON CONFLICT DO NOTHING;

-- Sample music
INSERT INTO music_tracks (couple_id, title, url, is_active, sort_order) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Wedding March', '/uploads/music1.mp3', true, 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Perfect - Ed Sheeran', '/uploads/music2.mp3', false, 2)
ON CONFLICT DO NOTHING;
