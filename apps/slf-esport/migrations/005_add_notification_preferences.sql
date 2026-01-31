-- Migration 005: Add notification preferences table
-- Description: Add table to store user email notification preferences
-- Author: TAKUMI
-- Date: 2025-12-31

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,

    -- Session notifications
    session_created BOOLEAN NOT NULL DEFAULT TRUE,
    session_invitation BOOLEAN NOT NULL DEFAULT TRUE,
    session_reminder BOOLEAN NOT NULL DEFAULT TRUE,

    -- Exercise notifications
    exercise_assigned BOOLEAN NOT NULL DEFAULT TRUE,
    performance_recorded BOOLEAN NOT NULL DEFAULT TRUE,

    -- Communication notifications
    coach_message BOOLEAN NOT NULL DEFAULT TRUE,

    -- System notifications
    account_updates BOOLEAN NOT NULL DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint
    CONSTRAINT fk_notification_preferences_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notification_preferences_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Create default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM notification_preferences);

-- Add comment to table
COMMENT ON TABLE notification_preferences IS 'User email notification preferences';
COMMENT ON COLUMN notification_preferences.session_created IS 'Notify when new training session is created';
COMMENT ON COLUMN notification_preferences.session_invitation IS 'Notify when invited to a session';
COMMENT ON COLUMN notification_preferences.session_reminder IS 'Send reminder before session starts';
COMMENT ON COLUMN notification_preferences.exercise_assigned IS 'Notify when new exercise is assigned';
COMMENT ON COLUMN notification_preferences.performance_recorded IS 'Notify when performance is recorded';
COMMENT ON COLUMN notification_preferences.coach_message IS 'Notify when coach sends a message';
COMMENT ON COLUMN notification_preferences.account_updates IS 'Notify about account/security updates';
