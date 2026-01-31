/**
 * Cognitive Exercise Types
 *
 * Defines the structure and interfaces for brain training cognitive exercises
 * integrated into the SLF E-Sport platform.
 */

import type { ComponentType } from 'react'
import type { Theme, ThemeVariant } from '@theermite/brain-training'

/**
 * Exercise types matching backend enum MemoryExerciseType
 */
export type ExerciseType =
  // Memory exercises
  | 'MEMORY_CARDS'
  | 'PATTERN_RECALL'
  | 'SEQUENCE_MEMORY'
  | 'IMAGE_PAIRS'
  // Reflexes & Attention
  | 'REACTION_TIME'
  | 'PERIPHERAL_VISION'
  | 'MULTITASK'
  // Gaming MOBA
  | 'LAST_HIT_TRAINER'
  | 'DODGE_MASTER'
  | 'SKILLSHOT_TRAINER'
  // Wellbeing
  | 'BREATHING'

/**
 * Exercise category for organization and filtering
 */
export type ExerciseCategory = 'memory' | 'wellbeing' | 'attention' | 'reflexes' | 'gaming'

/**
 * Difficulty levels matching backend enum
 */
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD'

/**
 * Exercise configuration (can vary per exercise type)
 */
export interface ExerciseConfig {
  // Grid-based exercises
  grid_rows?: number
  grid_cols?: number

  // Memory exercises
  time_weight?: number
  accuracy_weight?: number
  colors?: string[]
  preview_duration_ms?: number
  sequence_length?: number
  images?: string[]

  // Reaction time
  trials?: number
  min_delay_ms?: number
  max_delay_ms?: number

  // Peripheral vision
  target_radius?: number
  target_duration_ms?: number
  distractor_count?: number

  // MultiTask
  tasks?: string[]
  task_duration_ms?: number

  // MOBA exercises
  minion_hp?: number
  minion_spawn_interval_ms?: number
  attack_damage?: number
  projectile_speed?: number
  player_speed?: number

  // Breathing
  pattern?: 'cardiac_coherence' | 'box_breathing' | 'relaxing_478'
  duration_minutes?: number
  frequency_hz?: number

  // Common
  difficulty?: DifficultyLevel
  [key: string]: any
}

/**
 * Props passed to exercise components
 */
export interface ExerciseComponentProps {
  config: ExerciseConfig
  theme?: Theme | ThemeVariant
  onComplete: (session: ExerciseSession) => void
  onExit?: () => void
}

/**
 * Exercise session data (matches backend schema)
 */
export interface ExerciseSession {
  exercise_type: ExerciseType
  duration_ms: number
  score: number
  accuracy?: number
  metadata: Record<string, any>
}

/**
 * Cognitive exercise metadata and configuration
 */
export interface CognitiveExercise {
  id: string
  type: ExerciseType
  title: string
  description: string
  category: ExerciseCategory
  difficulty: DifficultyLevel[]
  thumbnail: string
  icon?: string
  component: ComponentType<ExerciseComponentProps>
  defaultConfig: ExerciseConfig
  tags?: string[]
  estimatedDuration?: number // in minutes
}

/**
 * Exercise statistics for a user
 */
export interface ExerciseStats {
  exercise_type: ExerciseType
  total_sessions: number
  best_score: number
  average_score: number
  total_time_ms: number
  last_played?: string // ISO date
  improvement_rate?: number // percentage
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number
  user_id: number
  username: string
  full_name: string
  score: number
  duration_ms: number
  created_at: string
}
