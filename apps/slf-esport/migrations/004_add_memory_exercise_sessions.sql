-- Migration: Add memory_exercise_sessions table
-- Description: Create table for tracking visual memory exercise sessions
-- Date: 2025-12-27

-- Create enum types for memory exercises
CREATE TYPE memory_exercise_type_enum AS ENUM (
    'memory_cards',
    'pattern_recall',
    'sequence_memory',
    'image_pairs'
);

CREATE TYPE difficulty_level_enum AS ENUM (
    'easy',
    'medium',
    'hard',
    'expert'
);

-- Create memory_exercise_sessions table
CREATE TABLE memory_exercise_sessions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Foreign keys
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,

    -- Exercise configuration
    exercise_type memory_exercise_type_enum NOT NULL,
    difficulty difficulty_level_enum NOT NULL,
    config JSONB NOT NULL,

    -- Session status
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at INTEGER,

    -- Performance metrics
    total_moves INTEGER DEFAULT 0 NOT NULL,
    correct_moves INTEGER DEFAULT 0 NOT NULL,
    incorrect_moves INTEGER DEFAULT 0 NOT NULL,
    time_elapsed_ms INTEGER DEFAULT 0 NOT NULL,

    -- Sequence-specific
    max_sequence_reached INTEGER,

    -- Final score and breakdown
    final_score FLOAT,
    score_breakdown JSONB
);

-- Create indexes for performance
CREATE INDEX idx_memory_sessions_user_id ON memory_exercise_sessions(user_id);
CREATE INDEX idx_memory_sessions_exercise_id ON memory_exercise_sessions(exercise_id);
CREATE INDEX idx_memory_sessions_exercise_type ON memory_exercise_sessions(exercise_type);
CREATE INDEX idx_memory_sessions_difficulty ON memory_exercise_sessions(difficulty);
CREATE INDEX idx_memory_sessions_is_completed ON memory_exercise_sessions(is_completed);
CREATE INDEX idx_memory_sessions_final_score ON memory_exercise_sessions(final_score);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_memory_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_memory_sessions_updated_at
    BEFORE UPDATE ON memory_exercise_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_memory_sessions_updated_at();

-- Add sample memory exercises
INSERT INTO exercises (name, description, category, exercise_type, external_url, score_unit, lower_is_better, "order", is_active)
VALUES
    (
        'Jeu de Mémoire - Cartes',
        'Trouve toutes les paires de cartes identiques. Entraîne ta mémoire visuelle à court terme et ta concentration.',
        'memoire',
        'custom',
        '/games/memory',
        'points',
        FALSE,
        100,
        TRUE
    ),
    (
        'Mémorisation de Motifs',
        'Mémorise et reproduis des motifs de couleurs. Développe ta mémoire spatiale et visuelle.',
        'memoire',
        'custom',
        '/games/memory',
        'points',
        FALSE,
        101,
        TRUE
    ),
    (
        'Séquence Visuelle (Simon)',
        'Mémorise et reproduis des séquences de plus en plus longues. Challenge ultime pour ta mémoire de travail !',
        'memoire',
        'custom',
        '/games/memory',
        'points',
        FALSE,
        102,
        TRUE
    ),
    (
        'Associations d''Images',
        'Associe des paires d''images liées au gaming (compétences, items, stats). Renforce ta mémoire associative.',
        'memoire',
        'custom',
        '/games/memory',
        'points',
        FALSE,
        103,
        TRUE
    )
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON memory_exercise_sessions TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE memory_exercise_sessions_id_seq TO your_app_user;
