/**
 * Ermite Toolbox - Shared Types
 * Common types for all widgets
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

// ============================================================================
// SCORE SYSTEM TYPES (Unified across all widgets)
// ============================================================================

export interface WidgetScore {
  widgetId: string
  widgetName: string
  userId?: string
  score: number
  metrics: Record<string, number | string>
  difficulty: DifficultyLevel
  completedAt: string
  duration: number // ms
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  score: number
  widgetId: string
  difficulty: DifficultyLevel
  completedAt: string
}

// ============================================================================
// WIDGET BASE TYPES
// ============================================================================

export interface WidgetConfig {
  userId?: string
  apiEndpoint?: string
  autoSaveScore?: boolean
  locale?: 'fr' | 'en'
}

export interface WidgetCallbacks {
  onComplete?: (score: WidgetScore) => void
  onProgress?: (progress: WidgetProgress) => void
  onError?: (error: Error) => void
}

export interface WidgetProgress {
  currentStep: number
  totalSteps: number
  partialScore?: number
  metrics?: Record<string, number | string>
}

// ============================================================================
// API TYPES
// ============================================================================

export interface APIConfig {
  baseUrl: string
  authToken?: string
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// ============================================================================
// REACTION TIME SPECIFIC
// ============================================================================

export interface ReactionTimeResult {
  reactionTime: number
  timestamp: number
}

export interface ReactionTimeStats {
  attempts: ReactionTimeResult[]
  averageTime: number
  fastestTime: number
  slowestTime: number
  consistency: number // standard deviation
}

// ============================================================================
// MEMORY GAMES TYPES
// ============================================================================

export interface MemoryGameConfig {
  gridRows: number
  gridCols: number
  timeLimitMs?: number
  previewDurationMs?: number
}

export interface MemoryGameSession {
  totalMoves: number
  correctMoves: number
  incorrectMoves: number
  timeElapsedMs: number
  accuracy: number
}

// ============================================================================
// TASK MANAGER TYPES (Extracted from Planner Shinkofa)
// ============================================================================

/**
 * Task difficulty levels for workload estimation
 */
export type TaskDifficultyLevel = 'quick' | 'medium' | 'complex' | 'long'

/**
 * Task priority levels (p0 = highest, p5 = lowest)
 */
export type TaskPriority = 'p0' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5'

/**
 * Reminder for a task
 */
export interface TaskReminder {
  id: string
  taskId: string
  time: string // ISO 8601 datetime
  message: string
  triggered: boolean
}

/**
 * Task - Main task entity
 * Supports KAIDA principle (max 2-3 daily priority tasks)
 */
export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: TaskPriority
  dueDate?: string
  reminders?: TaskReminder[]
  projectId?: string // Reference to parent project
  isDailyTask?: boolean // Daily priority task (max 2-3 KAIDA)
  difficultyLevel?: TaskDifficultyLevel
  order?: number // Display order for drag & drop
  createdAt: string
  updatedAt: string
}

/**
 * Project status
 */
export type ProjectStatus = 'active' | 'completed' | 'archived'

/**
 * Project - Container for tasks
 */
export interface Project {
  id: string
  name: string
  description?: string
  color: string // Hex color for visual identification
  icon?: string // Optional emoji
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

/**
 * Task Manager state for storage/sync
 */
export interface TaskManagerState {
  tasks: Task[]
  projects: Project[]
  lastUpdated: string
}
