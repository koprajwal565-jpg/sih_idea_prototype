-- ========================================================
-- FixNear Platform: PostgreSQL Schema Migration 005
-- Password Hash Column & Hashed Credentials
-- ========================================================

-- Add password_hash column to profiles table if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Set default hashed password ('Password@123') for seeded demo accounts
UPDATE profiles
SET password_hash = '$2b$10$ar41Yug49rqdCD0DtZ6vm..AroaQC8naE1qXUdYvSXBkA38YzynbG'
WHERE password_hash IS NULL;
