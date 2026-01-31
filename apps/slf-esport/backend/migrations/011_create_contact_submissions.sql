-- Migration: Create contact_submissions table
-- Date: 2026-01-26
-- Description: Store contact form submissions from website for Manager/Coach review

CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    
    -- Form data
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    sujet VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    
    -- Metadata
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    source VARCHAR(50) DEFAULT 'website',
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    
    -- Timestamps
    submitted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    read_at TIMESTAMP WITHOUT TIME ZONE,
    replied_at TIMESTAMP WITHOUT TIME ZONE,
    
    -- Optional user resolution
    resolved_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Admin notes
    admin_notes TEXT,
    
    -- Indexes for performance
    CONSTRAINT contact_submissions_status_check CHECK (status IN ('new', 'read', 'replied', 'archived'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON contact_submissions(submitted_at DESC);

-- Add comment
COMMENT ON TABLE contact_submissions IS 'Contact form submissions from website, managed by Manager/Coach';
