-- Migration: Fix custom exercises URLs
-- Date: 2025-12-04
-- Description: Add internal game URLs to custom exercises

-- Update Peripheral Vision Trainer
UPDATE exercises
SET external_url = '/games/peripheral-vision',
    updated_at = NOW()
WHERE id = 6 AND name = 'Peripheral Vision Trainer';

-- Update Multi-Task Test
UPDATE exercises
SET external_url = '/games/multi-task',
    updated_at = NOW()
WHERE id = 11 AND name = 'Multi-Task Test';

-- Disable Synchronization Test (no corresponding game yet)
UPDATE exercises
SET is_active = false,
    updated_at = NOW()
WHERE id = 13 AND name = 'Synchronization Test';

-- Verify changes
SELECT id, name, exercise_type, external_url, is_active
FROM exercises
WHERE exercise_type = 'CUSTOM'
ORDER BY id;
