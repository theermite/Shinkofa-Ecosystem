/**
 * Task Manager Store - Zustand state management
 * Standalone store for the widget
 *
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'ermite_task_manager_widget'
const MAX_DAILY_TASKS = 3
const API_BASE = '/api/v1/widget-data'
const WIDGET_SLUG = 'task-manager'

// API Sync configuration
let apiConfig: { enabled: boolean; userId: string; token: string | null } = {
  enabled: false,
  userId: 'anonymous',
  token: null,
}

export const configureApiSync = (config: { enabled: boolean; userId: string; token?: string }) => {
  apiConfig = { ...apiConfig, ...config, token: config.token || null }
}

// API Helper functions
const syncToApi = async (data: { tasks: Task[]; projects: Project[]; lastUpdated: string }) => {
  if (!apiConfig.enabled) {
    console.debug('[TaskManager] API sync disabled')
    return
  }
  if (!apiConfig.token) {
    console.warn('[TaskManager] API sync skipped: token not configured. Call configureApiSync() with a valid token.')
    return
  }

  try {
    const response = await fetch(`${API_BASE}/${WIDGET_SLUG}/${apiConfig.userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiConfig.token}`,
      },
      body: JSON.stringify({ data }),
    })
    if (!response.ok) {
      console.warn('Failed to sync to API:', response.statusText)
    }
  } catch (error) {
    console.warn('API sync failed:', error)
  }
}

export const loadFromApi = async (): Promise<{ tasks: Task[]; projects: Project[]; lastUpdated: string } | null> => {
  if (!apiConfig.enabled || !apiConfig.token) return null

  try {
    const response = await fetch(`${API_BASE}/${WIDGET_SLUG}/${apiConfig.userId}`, {
      headers: {
        Authorization: `Bearer ${apiConfig.token}`,
      },
    })
    if (response.ok) {
      const result = await response.json()
      // API returns null when no data exists, or an object with .data property
      if (result && result.data) {
        return result.data
      }
      return null
    }
  } catch (error) {
    console.warn('Failed to load from API:', error)
  }
  return null
}

// Types
export type TaskDifficultyLevel = 'quick' | 'medium' | 'complex' | 'long'
export type TaskPriority = 'p0' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5'
export type ProjectStatus = 'active' | 'completed' | 'archived'

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: TaskPriority
  dueDate?: string
  projectId?: string
  isDailyTask?: boolean
  difficultyLevel?: TaskDifficultyLevel
  order?: number
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
}

interface TaskStore {
  tasks: Task[]
  projects: Project[]
  lastUpdated: string

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  reorderTasks: (taskIds: string[]) => void
  promoteToDailyTask: (id: string) => boolean
  demoteFromDailyTask: (id: string) => void

  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  assignTaskToProject: (taskId: string, projectId: string | undefined) => void

  getTasksByProject: (projectId: string) => Task[]
  getDailyTasks: () => Task[]
  getUnassignedTasks: () => Task[]
  getProjectProgress: (projectId: string) => { completed: number; total: number; percentage: number }

  clearCompletedTasks: () => void
  resetDailyTasks: () => void
  exportData: () => string
  importData: (json: string) => boolean
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [],
      lastUpdated: new Date().toISOString(),

      addTask: (taskData) => {
        const now = new Date().toISOString()
        const newTask: Task = {
          ...taskData,
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => {
          const newState = {
            tasks: [...state.tasks, newTask],
            projects: state.projects,
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
        return newTask
      },

      updateTask: (id, updates) => {
        const now = new Date().toISOString()
        set((state) => {
          const newState = {
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, ...updates, updatedAt: now } : task
            ),
            projects: state.projects,
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
      },

      deleteTask: (id) => {
        const now = new Date().toISOString()
        set((state) => {
          const newState = {
            tasks: state.tasks.filter((task) => task.id !== id),
            projects: state.projects,
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
      },

      toggleTask: (id) => {
        const now = new Date().toISOString()
        set((state) => {
          const newState = {
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, completed: !task.completed, updatedAt: now } : task
            ),
            projects: state.projects,
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
      },

      reorderTasks: (taskIds) => {
        const now = new Date().toISOString()
        set((state) => {
          const newState = {
            tasks: state.tasks.map((task) => {
              const newOrder = taskIds.indexOf(task.id)
              if (newOrder !== -1) {
                return { ...task, order: newOrder, updatedAt: now }
              }
              return task
            }),
            projects: state.projects,
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
      },

      promoteToDailyTask: (id) => {
        const state = get()
        const dailyTasks = state.tasks.filter((t) => t.isDailyTask && !t.completed)
        if (dailyTasks.length >= MAX_DAILY_TASKS) return false

        const now = new Date().toISOString()
        set((state) => {
          const newState = {
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, isDailyTask: true, order: dailyTasks.length, updatedAt: now }
                : task
            ),
            projects: state.projects,
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
        return true
      },

      demoteFromDailyTask: (id) => {
        const now = new Date().toISOString()
        set((state) => {
          const newState = {
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, isDailyTask: false, updatedAt: now } : task
            ),
            projects: state.projects,
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
      },

      addProject: (projectData) => {
        const now = new Date().toISOString()
        const newProject: Project = {
          ...projectData,
          id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => {
          const newState = {
            tasks: state.tasks,
            projects: [...state.projects, newProject],
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
        return newProject
      },

      updateProject: (id, updates) => {
        const now = new Date().toISOString()
        set((state) => {
          const newState = {
            tasks: state.tasks,
            projects: state.projects.map((project) =>
              project.id === id ? { ...project, ...updates, updatedAt: now } : project
            ),
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
      },

      deleteProject: (id) => {
        const now = new Date().toISOString()
        set((state) => {
          const newState = {
            projects: state.projects.filter((project) => project.id !== id),
            tasks: state.tasks.map((task) =>
              task.projectId === id ? { ...task, projectId: undefined, updatedAt: now } : task
            ),
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
      },

      assignTaskToProject: (taskId, projectId) => {
        const now = new Date().toISOString()
        set((state) => {
          const newState = {
            tasks: state.tasks.map((task) =>
              task.id === taskId ? { ...task, projectId, updatedAt: now } : task
            ),
            projects: state.projects,
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
      },

      getTasksByProject: (projectId) => {
        return get()
          .tasks.filter((task) => task.projectId === projectId)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      },

      getDailyTasks: () => {
        return get()
          .tasks.filter((task) => task.isDailyTask)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      },

      getUnassignedTasks: () => {
        return get().tasks.filter((task) => !task.projectId && !task.isDailyTask)
      },

      getProjectProgress: (projectId) => {
        const tasks = get().tasks.filter((task) => task.projectId === projectId)
        const total = tasks.length
        const completed = tasks.filter((t) => t.completed).length
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
        return { completed, total, percentage }
      },

      clearCompletedTasks: () => {
        const now = new Date().toISOString()
        set((state) => {
          const newState = {
            tasks: state.tasks.filter((task) => !task.completed),
            projects: state.projects,
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
      },

      resetDailyTasks: () => {
        const now = new Date().toISOString()
        set((state) => {
          const newState = {
            tasks: state.tasks.map((task) =>
              task.isDailyTask ? { ...task, completed: false, updatedAt: now } : task
            ),
            projects: state.projects,
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
      },

      exportData: () => {
        const state = get()
        return JSON.stringify(
          {
            tasks: state.tasks,
            projects: state.projects,
            lastUpdated: state.lastUpdated,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        )
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json)
          if (data.tasks && data.projects) {
            const newState = {
              tasks: data.tasks,
              projects: data.projects,
              lastUpdated: new Date().toISOString(),
            }
            set(newState)
            syncToApi(newState)
            return true
          }
          return false
        } catch {
          return false
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        tasks: state.tasks,
        projects: state.projects,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
)

export const selectActiveProjects = (state: TaskStore) =>
  state.projects.filter((p) => p.status === 'active')

export const selectCompletedProjects = (state: TaskStore) =>
  state.projects.filter((p) => p.status === 'completed')

export const selectArchivedProjects = (state: TaskStore) =>
  state.projects.filter((p) => p.status === 'archived')

export const selectDailyTasksCount = (state: TaskStore) =>
  state.tasks.filter((t) => t.isDailyTask && !t.completed).length
