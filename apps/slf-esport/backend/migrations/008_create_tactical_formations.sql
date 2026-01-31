-- Migration: Create tactical_formations table for Tactic Board
-- Date: 2025-12-31
-- Description: Creates table for storing tactical formations (coach strategies, team positions)

-- Step 1: Create map_type enum
DO $$ BEGIN
    CREATE TYPE map_type_enum AS ENUM ('summoners_rift', 'dota2', 'generic');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create formation_category enum
DO $$ BEGIN
    CREATE TYPE formation_category_enum AS ENUM ('engage', 'poke', 'siege', 'teamfight', 'rotation', 'defense', 'split_push');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 3: Create tactical_formations table
CREATE TABLE IF NOT EXISTS tactical_formations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    map_type map_type_enum DEFAULT 'generic',

    -- Ownership
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id INTEGER, -- TODO: Add FK when teams table exists

    -- Formation data (JSON)
    -- Structure:
    -- {
    --   "players": [
    --     {"id": 1, "role": "top", "x": 100, "y": 200, "color": "blue"},
    --     ...
    --   ],
    --   "enemies": [
    --     {"id": 1, "role": "enemy", "x": 500, "y": 600, "color": "red"},
    --     ...
    --   ],
    --   "drawings": [],
    --   "timeline": []
    -- }
    formation_data JSONB NOT NULL DEFAULT '{
        "players": [],
        "enemies": [],
        "drawings": [],
        "timeline": []
    }'::jsonb,

    -- Tags & categorization
    tags VARCHAR(50)[] DEFAULT ARRAY[]::VARCHAR[],
    category formation_category_enum,

    -- Sharing
    is_public BOOLEAN DEFAULT FALSE,
    shared_with INTEGER[] DEFAULT ARRAY[]::INTEGER[],

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Stats
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_formations_created_by ON tactical_formations(created_by);
CREATE INDEX IF NOT EXISTS idx_formations_team_id ON tactical_formations(team_id);
CREATE INDEX IF NOT EXISTS idx_formations_category ON tactical_formations(category);
CREATE INDEX IF NOT EXISTS idx_formations_is_public ON tactical_formations(is_public);
CREATE INDEX IF NOT EXISTS idx_formations_created_at ON tactical_formations(created_at DESC);

-- Step 5: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_tactical_formations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tactical_formations_updated_at
    BEFORE UPDATE ON tactical_formations
    FOR EACH ROW
    EXECUTE FUNCTION update_tactical_formations_updated_at();

-- Rollback instructions:
-- DROP TRIGGER IF EXISTS trigger_tactical_formations_updated_at ON tactical_formations;
-- DROP FUNCTION IF EXISTS update_tactical_formations_updated_at();
-- DROP TABLE IF EXISTS tactical_formations;
-- DROP TYPE IF EXISTS formation_category_enum;
-- DROP TYPE IF EXISTS map_type_enum;
