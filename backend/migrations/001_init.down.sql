-- Wedding Invitation Database Schema — Multi-Tenant
-- Drops old tables and rebuilds with couple-scoped architecture

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Down migration: drop all tables in reverse order
DROP TABLE IF EXISTS gallery;
DROP TABLE IF EXISTS wishes;
DROP TABLE IF EXISTS rsvps;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS music;
DROP TABLE IF EXISTS gift_info;
DROP TABLE IF EXISTS schedule_events;
DROP TABLE IF EXISTS love_story_events;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS couples;
