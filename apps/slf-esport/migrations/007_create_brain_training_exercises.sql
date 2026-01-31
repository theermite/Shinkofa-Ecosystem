-- Migration 007: Create 11 brain training cognitive exercises
-- Date: 2025-12-31
-- Description: Insert all 11 brain training exercises into exercises table

-- First, let's check which exercises already exist to avoid duplicates
-- Then insert only the missing ones

-- Memory Exercises (4)
INSERT INTO exercises (name, description, category, exercise_type, is_active, created_at, updated_at)
VALUES
  ('Memory Cards', 'Retrouve les paires de cartes identiques. Améliore ta mémoire visuelle et ta concentration.', 'MEMOIRE', 'CUSTOM', true, NOW(), NOW()),
  ('Pattern Recall', 'Mémorise et reproduis le motif de couleurs. Entraîne ta mémoire visuelle spatiale.', 'MEMOIRE', 'CUSTOM', true, NOW(), NOW()),
  ('Sequence Memory', 'Mémorise et reproduis la séquence. Développe ta mémoire de travail.', 'MEMOIRE', 'CUSTOM', true, NOW(), NOW()),
  ('Image Pairs', 'Retrouve les paires d''images identiques. Mémoire visuelle avancée.', 'MEMOIRE', 'CUSTOM', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Reflexes & Attention Exercises (3)
INSERT INTO exercises (name, description, category, exercise_type, is_active, created_at, updated_at)
VALUES
  ('Reaction Time', 'Teste et améliore ton temps de réaction. Essentiel pour les jeux compétitifs.', 'REFLEXES', 'CUSTOM', true, NOW(), NOW()),
  ('Peripheral Vision', 'Entraîne ta vision périphérique. Détecte les objets dans ton champ de vision.', 'VISION', 'CUSTOM', true, NOW(), NOW()),
  ('MultiTask Challenge', 'Gère plusieurs tâches simultanément. Améliore ta gestion du multitasking.', 'ATTENTION', 'CUSTOM', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Gaming MOBA Exercises (3)
INSERT INTO exercises (name, description, category, exercise_type, is_active, created_at, updated_at)
VALUES
  ('Last Hit Trainer', 'Perfectionne ton timing de last hit. Entraînement spécifique MOBA.', 'COORDINATION', 'CUSTOM', true, NOW(), NOW()),
  ('Dodge Master', 'Esquive les projectiles. Améliore tes réflexes d''esquive en combat.', 'REFLEXES', 'CUSTOM', true, NOW(), NOW()),
  ('Skillshot Trainer', 'Entraîne ta précision de visée. Maîtrise les skillshots directionnels.', 'COORDINATION', 'CUSTOM', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Wellbeing Exercise (1)
INSERT INTO exercises (name, description, category, exercise_type, is_active, created_at, updated_at)
VALUES
  ('Breathing Exercise', 'Respiration guidée pour la gestion du stress. Améliore ta concentration et ton calme.', 'ATTENTION', 'CUSTOM', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Display created exercises
SELECT id, name, category, exercise_type
FROM exercises
WHERE exercise_type = 'CUSTOM'
ORDER BY id
LIMIT 20;
