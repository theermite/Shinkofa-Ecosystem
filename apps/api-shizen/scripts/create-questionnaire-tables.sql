-- ═══════════════════════════════════════════════════════════════════════════
-- SHINKOFA SHIZEN-PLANNER - QUESTIONNAIRE TABLES CREATION (MANUAL)
-- Created: 2026-01-05 (manual alternative to Alembic migration)
-- Database: shinkofa_shizen_planner_dev
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Create ENUM types
CREATE TYPE sessionstatus AS ENUM ('STARTED', 'IN_PROGRESS', 'COMPLETED', 'ANALYZED', 'ABANDONED');
CREATE TYPE charttype AS ENUM ('DESIGN_HUMAN', 'BIRTH_CHART');
CREATE TYPE chartstatus AS ENUM ('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED');

-- 2. Create questionnaire_sessions table (parent table)
CREATE TABLE questionnaire_sessions (
    id VARCHAR NOT NULL,
    user_id VARCHAR NOT NULL,
    status sessionstatus NOT NULL,
    current_bloc VARCHAR,
    completion_percentage VARCHAR NOT NULL DEFAULT '0',
    birth_data JSON,
    full_name VARCHAR,
    started_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    analyzed_at TIMESTAMP,
    PRIMARY KEY (id)
);

-- Indexes for questionnaire_sessions
CREATE INDEX ix_questionnaire_sessions_id ON questionnaire_sessions (id);
CREATE INDEX ix_questionnaire_sessions_user_id ON questionnaire_sessions (user_id);
CREATE INDEX ix_questionnaire_sessions_status ON questionnaire_sessions (status);

-- 3. Create questionnaire_responses table
CREATE TABLE questionnaire_responses (
    id VARCHAR NOT NULL,
    session_id VARCHAR NOT NULL,
    bloc VARCHAR NOT NULL,
    question_id VARCHAR NOT NULL,
    question_text VARCHAR,
    answer JSON NOT NULL,
    question_type VARCHAR NOT NULL,
    is_required VARCHAR NOT NULL DEFAULT 'false',
    answered_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (session_id) REFERENCES questionnaire_sessions(id) ON DELETE CASCADE
);

-- Indexes for questionnaire_responses
CREATE INDEX ix_questionnaire_responses_id ON questionnaire_responses (id);
CREATE INDEX ix_questionnaire_responses_session_id ON questionnaire_responses (session_id);
CREATE INDEX ix_questionnaire_responses_bloc ON questionnaire_responses (bloc);
CREATE INDEX ix_questionnaire_responses_question_id ON questionnaire_responses (question_id);

-- 4. Create holistic_profiles table
CREATE TABLE holistic_profiles (
    id VARCHAR NOT NULL,
    session_id VARCHAR NOT NULL,
    user_id VARCHAR NOT NULL,
    psychological_analysis JSON,
    neurodivergence_analysis JSON,
    shinkofa_analysis JSON,
    design_human JSON,
    astrology_western JSON,
    astrology_chinese JSON,
    numerology JSON,
    synthesis TEXT,
    recommendations JSON,
    pdf_export_path VARCHAR,
    markdown_export_path VARCHAR,
    generated_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (session_id) REFERENCES questionnaire_sessions(id) ON DELETE CASCADE,
    UNIQUE (session_id)
);

-- Indexes for holistic_profiles
CREATE INDEX ix_holistic_profiles_id ON holistic_profiles (id);
CREATE INDEX ix_holistic_profiles_session_id ON holistic_profiles (session_id);
CREATE INDEX ix_holistic_profiles_user_id ON holistic_profiles (user_id);

-- 5. Create uploaded_charts table
CREATE TABLE uploaded_charts (
    id VARCHAR NOT NULL,
    session_id VARCHAR NOT NULL,
    chart_type charttype NOT NULL,
    status chartstatus NOT NULL,
    file_name VARCHAR NOT NULL,
    file_path VARCHAR NOT NULL,
    file_size VARCHAR NOT NULL,
    file_type VARCHAR NOT NULL,
    extracted_data JSON,
    shizen_analysis JSON,
    error_message VARCHAR,
    uploaded_at TIMESTAMP NOT NULL,
    processed_at TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (session_id) REFERENCES questionnaire_sessions(id) ON DELETE CASCADE
);

-- Indexes for uploaded_charts
CREATE INDEX ix_uploaded_charts_id ON uploaded_charts (id);
CREATE INDEX ix_uploaded_charts_session_id ON uploaded_charts (session_id);
CREATE INDEX ix_uploaded_charts_chart_type ON uploaded_charts (chart_type);
CREATE INDEX ix_uploaded_charts_status ON uploaded_charts (status);

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════════
-- List all tables:       \dt
-- Describe table:        \d questionnaire_sessions
-- List all enums:        \dT+
-- ═══════════════════════════════════════════════════════════════════════════
