-- Migration: Add AI experience level and past project links storage
-- Purpose: Persists new application form fields for AI experience and project links
-- Date: 2025-02-14
-- Run this in Supabase SQL Editor

-- Add experience level column with a safe default for existing records
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS experience_level TEXT NOT NULL DEFAULT 'just_exploring';

-- Add project links column to store an array of URLs (JSON encoded)
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS project_links TEXT NOT NULL DEFAULT '[]';

-- Ensure any null values are backfilled to avoid JSON parsing issues
UPDATE applications
SET project_links = '[]'
WHERE project_links IS NULL;
