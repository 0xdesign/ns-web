-- Add optional metadata fields for application review experience
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS experience_level TEXT NOT NULL DEFAULT 'unknown';

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS project_links TEXT NOT NULL DEFAULT '[]';

-- Backfill nulls in case the columns already existed but contained null values
UPDATE applications
SET experience_level = COALESCE(experience_level, 'unknown');

UPDATE applications
SET project_links = COALESCE(project_links, '[]');
