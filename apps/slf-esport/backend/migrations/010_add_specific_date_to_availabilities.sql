-- Migration: Add specific_date to PlayerAvailability (Hybrid recurring/specific dates)
-- Date: 2026-01-06
-- Description: Adds specific_date field to support both recurring and one-time availabilities

-- ========== 1. Add specific_date column ==========

ALTER TABLE player_availabilities
ADD COLUMN IF NOT EXISTS specific_date DATE;

-- ========== 2. Make day_of_week nullable (for specific date availabilities) ==========

ALTER TABLE player_availabilities
ALTER COLUMN day_of_week DROP NOT NULL;

-- ========== 3. Add constraint: EITHER day_of_week OR specific_date must be set ==========

ALTER TABLE player_availabilities
DROP CONSTRAINT IF EXISTS chk_availability_type;

ALTER TABLE player_availabilities
ADD CONSTRAINT chk_availability_type CHECK (
    (day_of_week IS NOT NULL AND specific_date IS NULL) OR
    (day_of_week IS NULL AND specific_date IS NOT NULL)
);

-- ========== 4. Add index on specific_date for performance ==========

CREATE INDEX IF NOT EXISTS idx_player_availabilities_specific_date ON player_availabilities(specific_date);

-- ========== 5. Update existing rows to ensure constraint compliance ==========

-- All existing rows should have day_of_week set and specific_date NULL (already the case)
-- No data migration needed

-- Migration complete
SELECT 'Specific date availability migration completed successfully!' AS status;
