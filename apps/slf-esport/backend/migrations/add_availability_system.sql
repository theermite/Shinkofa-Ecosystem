-- Migration: Add Player Availability and Invitation System
-- Date: 2026-01-04
-- Description: Adds tables for recurring availability, exceptions, and session invitation tracking

-- ========== 1. Modify existing session_participants table ==========

-- Add new columns for invitation tracking
ALTER TABLE session_participants
ADD COLUMN IF NOT EXISTS response_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS response_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS decline_reason TEXT;

-- Update existing rows to have response_status = 'pending'
UPDATE session_participants
SET response_status = 'pending'
WHERE response_status IS NULL;

-- ========== 2. Create player_availabilities table ==========

CREATE TABLE IF NOT EXISTS player_availabilities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_time_range CHECK (end_time > start_time)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_availabilities_user_id ON player_availabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_player_availabilities_day ON player_availabilities(day_of_week);

-- ========== 3. Create player_availability_exceptions table ==========

CREATE TABLE IF NOT EXISTS player_availability_exceptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_unavailable BOOLEAN NOT NULL DEFAULT TRUE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_availability_exceptions_user_id ON player_availability_exceptions(user_id);
CREATE INDEX IF NOT EXISTS idx_player_availability_exceptions_date ON player_availability_exceptions(exception_date);

-- ========== 4. Create trigger for updated_at columns ==========

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for player_availabilities
DROP TRIGGER IF EXISTS update_player_availabilities_updated_at ON player_availabilities;
CREATE TRIGGER update_player_availabilities_updated_at
BEFORE UPDATE ON player_availabilities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Triggers for player_availability_exceptions
DROP TRIGGER IF EXISTS update_player_availability_exceptions_updated_at ON player_availability_exceptions;
CREATE TRIGGER update_player_availability_exceptions_updated_at
BEFORE UPDATE ON player_availability_exceptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========== 5. Insert sample data for team members (optional, for testing) ==========

-- Uncomment to add sample recurring availabilities for team members
-- Team IDs: 4, 5, 6, 7, 9

/*
-- Example: Monday 18:00-21:00 for all team members
INSERT INTO player_availabilities (user_id, day_of_week, start_time, end_time, is_active, notes)
VALUES
    (4, 0, '18:00:00', '21:00:00', TRUE, 'Available for team practice'),
    (5, 0, '18:00:00', '21:00:00', TRUE, 'Available for team practice'),
    (6, 0, '18:00:00', '21:00:00', TRUE, 'Available for team practice'),
    (7, 0, '18:00:00', '21:00:00', TRUE, 'Available for team practice'),
    (9, 0, '18:00:00', '21:00:00', TRUE, 'Available for team practice')
ON CONFLICT DO NOTHING;

-- Example: Wednesday 19:00-22:00 for all team members
INSERT INTO player_availabilities (user_id, day_of_week, start_time, end_time, is_active, notes)
VALUES
    (4, 2, '19:00:00', '22:00:00', TRUE, 'Available for team practice'),
    (5, 2, '19:00:00', '22:00:00', TRUE, 'Available for team practice'),
    (6, 2, '19:00:00', '22:00:00', TRUE, 'Available for team practice'),
    (7, 2, '19:00:00', '22:00:00', TRUE, 'Available for team practice'),
    (9, 2, '19:00:00', '22:00:00', TRUE, 'Available for team practice')
ON CONFLICT DO NOTHING;
*/

-- Migration complete
SELECT 'Availability system migration completed successfully!' AS status;
