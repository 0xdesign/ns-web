-- Migration: Add unique constraint to prevent duplicate applications
-- Purpose: Prevents race conditions in application submission
-- Date: 2025-10-16
-- Run this in Supabase SQL Editor

-- Optional: review duplicates before cleanup
-- SELECT discord_user_id, COUNT(*) FROM applications GROUP BY 1 HAVING COUNT(*) > 1;

-- Remove duplicate applications, keeping the most recent per discord_user_id
WITH ranked AS (
  SELECT
    id,
    discord_user_id,
    ROW_NUMBER() OVER (PARTITION BY discord_user_id ORDER BY created_at DESC, id DESC) AS rn
  FROM applications
)
DELETE FROM applications AS a
USING ranked AS r
WHERE a.id = r.id
  AND r.rn > 1;

-- Create unique index idempotently
CREATE UNIQUE INDEX IF NOT EXISTS applications_discord_user_id_unique_idx
  ON applications(discord_user_id);

-- Attach constraint using the index, ignore if it already exists
DO $$
BEGIN
  ALTER TABLE applications
    ADD CONSTRAINT applications_discord_user_id_unique
    UNIQUE USING INDEX applications_discord_user_id_unique_idx;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END
$$;
