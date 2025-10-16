-- Migration: Add unique constraint to prevent duplicate applications
-- Purpose: Prevents race conditions in application submission
-- Date: 2025-10-16
-- Run this in Supabase SQL Editor

-- Add unique constraint on discord_user_id
ALTER TABLE applications
ADD CONSTRAINT applications_discord_user_id_unique
UNIQUE (discord_user_id);

-- Verify the constraint was created
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'applications'
AND constraint_name = 'applications_discord_user_id_unique';
