/**
 * Coaching types
 */

export enum QuestionnaireType {
  ONBOARDING = 'onboarding',
  ENERGY = 'energy',
  GOAL = 'goal',
  PROGRESS = 'progress',
  WELLBEING = 'wellbeing',
  CUSTOM = 'custom',
}

export enum JournalMood {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  NEUTRAL = 'neutral',
  LOW = 'low',
  BAD = 'bad',
}

// ========== Questionnaires ==========

export interface Question {
  question: string
  type: string // "text", "number", "choice", "scale"
  choices?: string[]
  required: boolean
}

export interface Questionnaire {
  id: number
  title: string
  description?: string
  questionnaire_type: QuestionnaireType
  is_active: boolean
  is_required: boolean
  questions: Question[]
  order: number
  created_by_id?: number
  created_at: string
  updated_at: string
}

export interface QuestionnaireResponse {
  id: number
  questionnaire_id: number
  user_id: number
  answers: Array<{ question_index: number; answer: any }>
  notes?: string
  completed_at: string
  created_at: string
  updated_at: string
}

export interface QuestionnaireResponseCreate {
  questionnaire_id: number
  answers: Array<{ question_index: number; answer: any }>
  notes?: string
}

// ========== Journal ==========

export interface JournalEntry {
  id: number
  user_id: number
  title?: string
  content: string
  mood?: JournalMood
  energy_level?: number
  training_quality?: number
  sleep_hours?: number
  tags?: string[]
  entry_date: string
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface JournalEntryCreate {
  title?: string
  content: string
  mood?: JournalMood
  energy_level?: number
  training_quality?: number
  sleep_hours?: number
  tags?: string[]
  entry_date?: string
  is_private?: boolean
}

export interface JournalStats {
  total_entries: number
  avg_energy_level?: number
  avg_training_quality?: number
  avg_sleep_hours?: number
  mood_distribution: Record<string, number>
}

// ========== Goals ==========

export interface Milestone {
  title: string
  completed: boolean
  date?: string
}

export interface Goal {
  id: number
  user_id: number
  title: string
  description?: string
  category?: string
  target_date?: string
  progress_percentage: number
  is_completed: boolean
  completed_at?: string
  milestones?: Milestone[]
  is_public: boolean
  created_by_id?: number
  created_at: string
  updated_at: string
}

export interface GoalCreate {
  title: string
  description?: string
  category?: string
  target_date?: string
  progress_percentage?: number
  is_completed?: boolean
  milestones?: Milestone[]
  is_public?: boolean
}

export interface GoalStats {
  total_goals: number
  completed_goals: number
  in_progress_goals: number
  completion_rate: number
}

// UI constants

export const MOOD_LABELS: Record<JournalMood, string> = {
  [JournalMood.EXCELLENT]: 'Excellent',
  [JournalMood.GOOD]: 'Bien',
  [JournalMood.NEUTRAL]: 'Neutre',
  [JournalMood.LOW]: 'Bas',
  [JournalMood.BAD]: 'Mauvais',
}

export const MOOD_EMOJIS: Record<JournalMood, string> = {
  [JournalMood.EXCELLENT]: '🤩',
  [JournalMood.GOOD]: '😊',
  [JournalMood.NEUTRAL]: '😐',
  [JournalMood.LOW]: '😔',
  [JournalMood.BAD]: '😢',
}

export const MOOD_COLORS: Record<JournalMood, string> = {
  [JournalMood.EXCELLENT]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  [JournalMood.GOOD]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  [JournalMood.NEUTRAL]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  [JournalMood.LOW]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  [JournalMood.BAD]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
}

export const GOAL_CATEGORIES = [
  { value: 'gameplay', label: 'Gameplay', emoji: '🎮' },
  { value: 'mental', label: 'Mental', emoji: '🧠' },
  { value: 'physical', label: 'Physique', emoji: '💪' },
  { value: 'teamwork', label: 'Travail d\'équipe', emoji: '🤝' },
  { value: 'communication', label: 'Communication', emoji: '💬' },
  { value: 'other', label: 'Autre', emoji: '📌' },
]
