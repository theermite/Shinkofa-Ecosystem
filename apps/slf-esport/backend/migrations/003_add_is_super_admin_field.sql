-- Migration: Add is_super_admin field and restore Jay to COACH role
-- Date: 2025-12-12
-- Description: Adds is_super_admin boolean field to users table and sets Jay as COACH with super admin privileges

-- Step 1: Add is_super_admin column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Step 2: Set Jay as COACH with super admin privileges
UPDATE users
SET role = 'COACH',
    is_super_admin = TRUE
WHERE email = 'jaygonc@gmail.com';

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_is_super_admin ON users(is_super_admin) WHERE is_super_admin = TRUE;

-- Verify the update
-- SELECT id, email, username, role, is_super_admin FROM users WHERE email = 'jaygonc@gmail.com';
