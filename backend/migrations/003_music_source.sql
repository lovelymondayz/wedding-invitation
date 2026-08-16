-- Add source column to music_tracks for multi-platform support
ALTER TABLE music_tracks ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'direct';

-- Update existing rows based on URL content
UPDATE music_tracks SET source = 'spotify' WHERE url LIKE '%spotify%' AND source = 'direct';
UPDATE music_tracks SET source = 'youtube' WHERE (url LIKE '%youtube%' OR url LIKE '%youtu.be%') AND source = 'direct';
UPDATE music_tracks SET source = 'soundcloud' WHERE url LIKE '%soundcloud%' AND source = 'direct';
UPDATE music_tracks SET source = 'vimeo' WHERE url LIKE '%vimeo%' AND source = 'direct';
