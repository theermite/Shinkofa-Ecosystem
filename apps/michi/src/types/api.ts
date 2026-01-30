/**
 * API Types - Shinkofa Platform
 * Synchronized with Backend API (FastAPI Shizen-Planner)
 */

// ==================
// TASKS
// ==================

export type Priority = 'p0' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5'
export type DifficultyLevel = 'quick' | 'medium' | 'complex' | 'long'

export interface Task {
  id: string
  title: string
  description: string | null
  priority: Priority
  completed: boolean
  due_date: string | null // ISO 8601
  project_id: string | null
  is_daily_task: boolean
  difficulty_level: DifficultyLevel | null
  order: number
  user_id: string
  created_at: string // ISO 8601
  updated_at: string // ISO 8601
}

export interface CreateTaskInput {
  title: string
  description?: string | null
  priority?: Priority
  completed?: boolean
  due_date?: string | null
  project_id?: string | null
  is_daily_task?: boolean
  difficulty_level?: DifficultyLevel | null
  order?: number
}

export interface UpdateTaskInput {
  title?: string
  description?: string | null
  priority?: Priority
  completed?: boolean
  due_date?: string | null
  project_id?: string | null
  is_daily_task?: boolean
  difficulty_level?: DifficultyLevel | null
  order?: number
}

export interface TaskFilters {
  completed?: boolean
  project_id?: string
}

// ==================
// PROJECTS
// ==================

export type ProjectStatus = 'active' | 'completed' | 'archived'

export interface Project {
  id: string
  name: string
  description: string | null
  color: string // Hex color (e.g., "#6366f1")
  icon: string | null
  status: ProjectStatus
  user_id: string
  created_at: string // ISO 8601
  updated_at: string // ISO 8601
}

export interface CreateProjectInput {
  name: string
  description?: string | null
  color?: string
  icon?: string | null
  status?: ProjectStatus
}

export interface UpdateProjectInput {
  name?: string
  description?: string | null
  color?: string
  icon?: string | null
  status?: ProjectStatus
}

export interface ProjectFilters {
  status_filter?: ProjectStatus
}

// ==================
// JOURNALS
// ==================

export interface Journal {
  id: string
  date: string // YYYY-MM-DD
  energy_morning: number // 0-10
  energy_evening: number // 0-10
  intentions: string
  gratitudes: string[] // Array of 3 strings
  successes: string[] // Array of 3 strings
  learning: string
  adjustments: string
  user_id: string
  created_at: string // ISO 8601
  updated_at: string // ISO 8601
}

export interface CreateJournalInput {
  date: string // YYYY-MM-DD
  energy_morning?: number
  energy_evening?: number
  intentions?: string
  gratitudes?: string[]
  successes?: string[]
  learning?: string
  adjustments?: string
}

export interface UpdateJournalInput {
  energy_morning?: number
  energy_evening?: number
  intentions?: string
  gratitudes?: string[]
  successes?: string[]
  learning?: string
  adjustments?: string
}

export interface JournalFilters {
  start_date?: string
  end_date?: string
}

// ==================
// RITUALS
// ==================

export type RitualCategory = 'morning' | 'evening' | 'daily' | 'custom'

export interface RitualTask {
  label: string
  completed: boolean
}

export interface Ritual {
  id: string
  label: string
  icon: string
  completed_today: boolean
  category: RitualCategory
  order: number
  user_id: string
  created_at: string // ISO 8601
  updated_at: string // ISO 8601
  tasks?: RitualTask[] // List of subtasks with completion state
}

export interface CreateRitualInput {
  label: string
  icon?: string
  completed_today?: boolean
  category?: RitualCategory
  order?: number
  tasks?: RitualTask[] // List of subtasks with completion state
}

export interface UpdateRitualInput {
  label?: string
  icon?: string
  completed_today?: boolean
  category?: RitualCategory
  order?: number
  tasks?: RitualTask[] // List of subtasks with completion state
}

export interface RitualFilters {
  category?: RitualCategory
  completed_today?: boolean
}

// ==================
// API RESPONSES
// ==================

export interface ApiError {
  detail: string | Array<{
    loc: string[]
    msg: string
    type: string
  }>
}

export interface ApiResponse<T> {
  data: T
  error?: ApiError
}

// ==================
// PAGINATION (for future use)
// ==================

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
