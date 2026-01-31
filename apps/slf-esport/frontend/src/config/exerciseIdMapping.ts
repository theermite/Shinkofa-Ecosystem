/**
 * Exercise ID Mapping
 *
 * Maps frontend exerciseId (string) to backend exercise_id (number)
 * Updated: 2025-12-31 after migration 007
 */

export const EXERCISE_ID_MAP: Record<string, number> = {
  // Memory exercises (IDs 23-26)
  'memory-cards': 23,
  'pattern-recall': 24,
  'sequence-memory': 25,
  'image-pairs': 26,

  // Reflexes & Attention exercises (IDs 27-29)
  'reaction-time': 27,
  'peripheral-vision': 28,
  'multitask': 29,

  // Gaming MOBA exercises (IDs 30-32)
  'last-hit-trainer': 30,
  'dodge-master': 31,
  'skillshot-trainer': 32,

  // Wellbeing exercise (ID 33)
  'breathing': 33,
}

/**
 * Get database exercise_id from frontend exerciseId
 */
export function getExerciseDbId(exerciseId: string): number {
  const dbId = EXERCISE_ID_MAP[exerciseId]
  if (!dbId) {
    throw new Error(`Exercise ID '${exerciseId}' not found in mapping`)
  }
  return dbId
}

/**
 * Get frontend exerciseId from database exercise_id
 */
export function getExerciseFrontendId(dbId: number): string | undefined {
  return Object.keys(EXERCISE_ID_MAP).find((key) => EXERCISE_ID_MAP[key] === dbId)
}
