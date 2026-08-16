-- Migration 002: Add template_id to couples
-- Enables template selection per couple

ALTER TABLE couples ADD COLUMN IF NOT EXISTS template_id SMALLINT DEFAULT 1;

-- Create index for template lookups
CREATE INDEX IF NOT EXISTS idx_couples_template_id ON couples(template_id);

-- Comment on column
COMMENT ON COLUMN couples.template_id IS 'Template ID: 1=Classic Elegance, 2=Gen-Z Minimal, 3=Dark Luxe';
