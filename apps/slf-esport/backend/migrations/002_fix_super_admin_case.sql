-- Migration: Fix SUPER_ADMIN enum case to match existing values
-- Date: 2025-12-12
-- Description: Replaces 'super_admin' with 'SUPER_ADMIN' to match JOUEUR, COACH, MANAGER case

-- Step 1: Add 'SUPER_ADMIN' value in uppercase
ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

-- Step 2: Update Jay's account to use uppercase SUPER_ADMIN
UPDATE users
SET role = 'SUPER_ADMIN'
WHERE email = 'jaygonc@gmail.com';

-- Step 3: Remove the lowercase 'super_admin' value is not straightforward in PostgreSQL
-- We'll leave it for now, it won't cause issues as long as we don't use it
-- The code will use 'SUPER_ADMIN' from now on

-- Verify the update
-- SELECT id, email, username, role FROM users WHERE email = 'jaygonc@gmail.com';
