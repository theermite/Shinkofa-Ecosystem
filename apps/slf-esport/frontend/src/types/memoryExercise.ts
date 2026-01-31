/**
 * TypeScript types for Visual Memory Exercises
 */

export enum MemoryExerciseType {
  // Memory exercises
  MEMORY_CARDS = 'memory_cards',
  PATTERN_RECALL = 'pattern_recall',
  SEQUENCE_MEMORY = 'sequence_memory',
  IMAGE_PAIRS = 'image_pairs',

  // Reflexes & Attention
  REACTION_TIME = 'reaction_time',
  PERIPHERAL_VISION = 'peripheral_vision',
  MULTITASK = 'multitask',

  // Gaming MOBA
  LAST_HIT_TRAINER = 'last_hit_trainer',
  DODGE_MASTER = 'dodge_master',
  SKILLSHOT_TRAINER = 'skillshot_trainer',

  // Wellbeing
  BREATHING = 'breathing',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

export interface MemoryExerciseConfig {
  exercise_type: MemoryExerciseType
  difficulty: DifficultyLevel
  grid_rows?: number
  grid_cols?: number
  initial_sequence_length?: number
  max_sequence_length?: number
  preview_duration_ms?: number
  time_limit_ms?: number
  colors?: string[]
  images?: string[]
  time_weight: number
  accuracy_weight: number
}

export interface MemoryExerciseSession {
  id: number
  exercise_id: number
  exercise_type: MemoryExerciseType
  difficulty: DifficultyLevel
  config: MemoryExerciseConfig
  is_completed: boolean
  total_moves: number
  correct_moves: number
  incorrect_moves: number
  time_elapsed_ms: number
  max_sequence_reached?: number
  final_score?: number
  score_breakdown?: ScoreBreakdown
  accuracy: number
  created_at: string
  updated_at?: string
}

export interface ScoreBreakdown {
  accuracy: number
  accuracy_score: number
  time_score: number
  time_elapsed_ms: number
  total_moves: number
  correct_moves: number
  incorrect_moves: number
  max_sequence?: number
  difficulty_multiplier: number
  final_score: number
}

export interface MemoryExerciseSessionCreate {
  exercise_id: number
  config: MemoryExerciseConfig
}

export interface MemoryExerciseSessionUpdate {
  completed_at?: string
  total_moves?: number
  correct_moves?: number
  incorrect_moves?: number
  time_elapsed_ms?: number
  max_sequence_reached?: number
  final_score?: number
  score_breakdown?: ScoreBreakdown
}

export interface MemoryExerciseStats {
  exercise_id: number
  exercise_name: string
  exercise_type: MemoryExerciseType
  total_attempts: number
  completed_attempts: number
  best_score?: number
  best_accuracy?: number
  fastest_time_ms?: number
  longest_sequence?: number
  avg_score?: number
  avg_accuracy?: number
  avg_time_ms?: number
  improvement_rate?: number
  streak_days: number
  recent_scores: number[]
  recent_accuracies: number[]
}

export interface MemoryExerciseLeaderboard {
  rank: number
  user_id: number
  username: string
  final_score: number
  accuracy: number
  time_elapsed_ms: number
  difficulty: DifficultyLevel
  completed_at: string
  is_current_user: boolean
}

export interface ConfigPreset {
  name: string
  difficulty: DifficultyLevel
  config: MemoryExerciseConfig
}

// Card data for memory card game
export interface Card {
  id: number
  value: string // emoji, image URL, or color
  isFlipped: boolean
  isMatched: boolean
  position: { row: number; col: number }
}

// Cell data for pattern recall
export interface PatternCell {
  row: number
  col: number
  color: string
  isActive: boolean
  isRevealed: boolean
}

// Sequence step for sequence memory
export interface SequenceStep {
  position: { row: number; col: number }
  order: number
}
