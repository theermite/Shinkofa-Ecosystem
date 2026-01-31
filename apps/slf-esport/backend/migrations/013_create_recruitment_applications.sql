-- Migration 013: Create recruitment_applications table
-- For storing player recruitment applications from the website form

-- Create enum for application status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'applicationstatus') THEN
        CREATE TYPE applicationstatus AS ENUM (
            'NEW',
            'REVIEWED',
            'INTERVIEW_SCHEDULED',
            'ACCEPTED',
            'REJECTED',
            'WITHDRAWN'
        );
    END IF;
END$$;

-- Create recruitment_applications table
CREATE TABLE IF NOT EXISTS recruitment_applications (
    id SERIAL PRIMARY KEY,

    -- Applicant personal info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    pseudo VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    age VARCHAR(10) NOT NULL,
    country VARCHAR(100) NOT NULL,
    languages VARCHAR(255) NOT NULL,

    -- Gaming/availability info
    motivation TEXT NOT NULL,
    availability VARCHAR(255) NOT NULL,
    current_status VARCHAR(100) NOT NULL,
    interview_availability TEXT NOT NULL,

    -- Application metadata
    status applicationstatus NOT NULL DEFAULT 'NEW',
    source VARCHAR(50) DEFAULT 'website',
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),

    -- Timestamps
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,

    -- Admin fields
    reviewed_by_id INTEGER REFERENCES users(id),
    admin_notes TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recruitment_applications_status ON recruitment_applications(status);
CREATE INDEX IF NOT EXISTS idx_recruitment_applications_submitted_at ON recruitment_applications(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_recruitment_applications_email ON recruitment_applications(email);

-- Add comment
COMMENT ON TABLE recruitment_applications IS 'Player recruitment applications from website form';
