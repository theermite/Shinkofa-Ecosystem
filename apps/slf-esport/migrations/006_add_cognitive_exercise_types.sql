-- Migration 006: Add new cognitive exercise types to enum
-- Date: 2025-12-31
-- Description: Add 7 new exercise types (Reflexes, Attention, Gaming MOBA, Wellbeing)

-- Add new values to memory_exercise_type_enum
-- Note: PostgreSQL doesn't support "IF NOT EXISTS" for enum values directly in older versions
-- We'll use a DO block to handle this safely

DO $$
BEGIN
    -- Add REACTION_TIME
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'reaction_time'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'memory_exercise_type_enum')
    ) THEN
        ALTER TYPE memory_exercise_type_enum ADD VALUE 'reaction_time';
    END IF;

    -- Add PERIPHERAL_VISION
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'peripheral_vision'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'memory_exercise_type_enum')
    ) THEN
        ALTER TYPE memory_exercise_type_enum ADD VALUE 'peripheral_vision';
    END IF;

    -- Add MULTITASK
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'multitask'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'memory_exercise_type_enum')
    ) THEN
        ALTER TYPE memory_exercise_type_enum ADD VALUE 'multitask';
    END IF;

    -- Add LAST_HIT_TRAINER
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'last_hit_trainer'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'memory_exercise_type_enum')
    ) THEN
        ALTER TYPE memory_exercise_type_enum ADD VALUE 'last_hit_trainer';
    END IF;

    -- Add DODGE_MASTER
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'dodge_master'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'memory_exercise_type_enum')
    ) THEN
        ALTER TYPE memory_exercise_type_enum ADD VALUE 'dodge_master';
    END IF;

    -- Add SKILLSHOT_TRAINER
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'skillshot_trainer'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'memory_exercise_type_enum')
    ) THEN
        ALTER TYPE memory_exercise_type_enum ADD VALUE 'skillshot_trainer';
    END IF;

    -- Add BREATHING
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'breathing'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'memory_exercise_type_enum')
    ) THEN
        ALTER TYPE memory_exercise_type_enum ADD VALUE 'breathing';
    END IF;
END
$$;

-- Verify new values were added
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'memory_exercise_type_enum')
ORDER BY enumlabel;
