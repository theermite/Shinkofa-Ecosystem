-- Migration: Add SUPER_ADMIN role to user_role_enum and promote Jay's account
-- Date: 2025-12-12
-- Description: Adds the super_admin role to the system and promotes jaygonc@gmail.com to SUPER_ADMIN

-- Step 1: Add 'super_admin' value to the user_role_enum type
-- Note: PostgreSQL requires using ALTER TYPE ... ADD VALUE for enum modification
ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'super_admin';

-- Step 2: Update Jay's account to SUPER_ADMIN role
-- This updates the user with email 'jaygonc@gmail.com'
UPDATE users
SET role = 'super_admin'
WHERE email = 'jaygonc@gmail.com';

-- Step 3: Verify the update (optional, for manual verification)
-- SELECT id, email, username, role FROM users WHERE email = 'jaygonc@gmail.com';

-- Rollback instructions (if needed):
-- WARNING: Rolling back an enum value addition in PostgreSQL is complex.
-- To rollback the role change only:
-- UPDATE users SET role = 'coach' WHERE email = 'jaygonc@gmail.com';
--
-- To completely remove the enum value (requires recreating the enum):
-- 1. Create a new enum without super_admin
-- 2. Change the column to use the new enum
-- 3. Drop the old enum
-- This is not recommended unless absolutely necessary.
