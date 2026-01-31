-- Migration: Add Honor of Kings map types to map_type_enum
-- Date: 2026-01-02
-- Description: Adds 8 new HOK map types to the existing map_type_enum

-- Add new enum values for Honor of Kings maps
ALTER TYPE map_type_enum ADD VALUE IF NOT EXISTS 'hok_full';
ALTER TYPE map_type_enum ADD VALUE IF NOT EXISTS 'hok_top_lane';
ALTER TYPE map_type_enum ADD VALUE IF NOT EXISTS 'hok_mid_lane';
ALTER TYPE map_type_enum ADD VALUE IF NOT EXISTS 'hok_bot_lane';
ALTER TYPE map_type_enum ADD VALUE IF NOT EXISTS 'hok_blue_buff';
ALTER TYPE map_type_enum ADD VALUE IF NOT EXISTS 'hok_red_buff';
ALTER TYPE map_type_enum ADD VALUE IF NOT EXISTS 'hok_drake';
ALTER TYPE map_type_enum ADD VALUE IF NOT EXISTS 'hok_lord';

-- Verify enum values
DO $$
BEGIN
    RAISE NOTICE 'HOK map types added successfully';
END $$;
