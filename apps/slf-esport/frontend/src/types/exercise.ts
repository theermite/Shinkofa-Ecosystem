/**
 * Exercise types
 */

export enum ExerciseCategory {
  REFLEXES = 'REFLEXES',
  VISION = 'VISION',
  MEMOIRE = 'MEMOIRE',
  ATTENTION = 'ATTENTION',
  COORDINATION = 'COORDINATION',
}

export enum ExerciseType {
  EXTERNAL = 'EXTERNAL',
  CUSTOM = 'CUSTOM',
}

export interface Exercise {
  id: number
  name: string
  description?: string
  category: ExerciseCategory
  exercise_type: ExerciseType
  external_url?: string
  instructions?: string
  score_unit?: string
  lower_is_better: boolean
  order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ExerciseScore {
  id: number
  user_id: number
  exercise_id: number
  score_value: number
  score_unit?: string
  screenshot_url?: string
  notes?: string
  created_at: string
  updated_at: string
  exercise?: Exercise
}

export interface ExerciseScoreCreate {
  exercise_id: number
  score_value: number
  score_unit?: string
  screenshot_url?: string
  notes?: string
}

export interface ExerciseStats {
  exercise_id: number
  exercise_name: string
  category: ExerciseCategory
  total_attempts: number
  best_score: number
  average_score: number
  latest_score?: number
  score_unit?: string
  lower_is_better: boolean
  progression?: number
}

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  [ExerciseCategory.REFLEXES]: 'Réflexes',
  [ExerciseCategory.VISION]: 'Vision',
  [ExerciseCategory.MEMOIRE]: 'Mémoire',
  [ExerciseCategory.ATTENTION]: 'Attention',
  [ExerciseCategory.COORDINATION]: 'Coordination',
}

export const CATEGORY_EMOJIS: Record<ExerciseCategory, string> = {
  [ExerciseCategory.REFLEXES]: '⚡',
  [ExerciseCategory.VISION]: '👁️',
  [ExerciseCategory.MEMOIRE]: '🧠',
  [ExerciseCategory.ATTENTION]: '🎯',
  [ExerciseCategory.COORDINATION]: '🤝',
}

export const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  [ExerciseCategory.REFLEXES]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  [ExerciseCategory.VISION]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  [ExerciseCategory.MEMOIRE]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  [ExerciseCategory.ATTENTION]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  [ExerciseCategory.COORDINATION]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
}
