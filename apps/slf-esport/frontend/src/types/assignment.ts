/**
 * Exercise assignment types
 */

export enum AssignmentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export interface ExerciseAssignment {
  id: number
  player_id: number
  exercise_id: number
  coach_id: number
  title?: string
  description?: string
  target_score?: string
  assigned_date: string
  due_date?: string
  status: AssignmentStatus
  completed_date?: string
  attempts_count: number
  best_score?: string
  player_notes?: string
  coach_feedback?: string
  priority: number
  is_mandatory: boolean
  created_at: string
  updated_at: string
  // Populated by API
  exercise_name?: string
  player_username?: string
  coach_username?: string
}

export interface ExerciseAssignmentCreate {
  exercise_id: number
  player_id: number
  title?: string
  description?: string
  target_score?: string
  due_date?: string
  priority?: number
  is_mandatory?: boolean
}

export interface ExerciseAssignmentUpdate {
  title?: string
  description?: string
  target_score?: string
  due_date?: string
  status?: AssignmentStatus
  priority?: number
  is_mandatory?: boolean
  player_notes?: string
  coach_feedback?: string
  best_score?: string
}

export interface AssignmentStats {
  total_assignments: number
  pending: number
  in_progress: number
  completed: number
  completion_rate: number
  overdue: number
}

// UI constants

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  [AssignmentStatus.PENDING]: 'À faire',
  [AssignmentStatus.IN_PROGRESS]: 'En cours',
  [AssignmentStatus.COMPLETED]: 'Complété',
  [AssignmentStatus.SKIPPED]: 'Ignoré',
}

export const ASSIGNMENT_STATUS_COLORS: Record<AssignmentStatus, string> = {
  [AssignmentStatus.PENDING]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  [AssignmentStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  [AssignmentStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  [AssignmentStatus.SKIPPED]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
}
