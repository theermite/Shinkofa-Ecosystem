/**
 * Task Manager Store - Zustand state management
 * Extracted from Planner Shinkofa
 *
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, Project } from '../../../shared/types'

const STORAGE_KEY = 'ermite_task_manager'
const MAX_DAILY_TASKS = 3 // KAIDA principle

interface TaskStore {
  // State
  tasks: Task[]
  projects: Project[]
  lastUpdated: string

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  reorderTasks: (taskIds: string[]) => void
  promoteToDailyTask: (id: string) => boolean // Returns false if limit reached
  demoteFromDailyTask: (id: string) => void

  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  assignTaskToProject: (taskId: string, projectId: string | undefined) => void

  // Computed helpers
  getTasksByProject: (projectId: string) => Task[]
  getDailyTasks: () => Task[]
  getUnassignedTasks: () => Task[]
  getProjectProgress: (projectId: string) => { completed: number; total: number; percentage: number }

  // Bulk actions
  clearCompletedTasks: () => void
  resetDailyTasks: () => void
  exportData: () => string
  importData: (json: string) => boolean
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [],
      projects: [],
      lastUpdated: new Date().toISOString(),

      // Task actions
      addTask: (taskData) => {
        const now = new Date().toISOString()
        const newTask: Task = {
          ...taskData,
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          tasks: [...state.tasks, newTask],
          lastUpdated: now,
        }))

        return newTask
      },

      updateTask: (id, updates) => {
        const now = new Date().toISOString()
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: now } : task
          ),
          lastUpdated: now,
        }))
      },

      deleteTask: (id) => {
        const now = new Date().toISOString()
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          lastUpdated: now,
        }))
      },

      toggleTask: (id) => {
        const now = new Date().toISOString()
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed, updatedAt: now } : task
          ),
          lastUpdated: now,
        }))
      },

      reorderTasks: (taskIds) => {
        const now = new Date().toISOString()
        set((state) => ({
          tasks: state.tasks.map((task) => {
            const newOrder = taskIds.indexOf(task.id)
            if (newOrder !== -1) {
              return { ...task, order: newOrder, updatedAt: now }
            }
            return task
          }),
          lastUpdated: now,
        }))
      },

      promoteToDailyTask: (id) => {
        const state = get()
        const dailyTasks = state.tasks.filter((t) => t.isDailyTask && !t.completed)

        if (dailyTasks.length >= MAX_DAILY_TASKS) {
          return false // Limit reached
        }

        const now = new Date().toISOString()
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, isDailyTask: true, order: dailyTasks.length, updatedAt: now }
              : task
          ),
          lastUpdated: now,
        }))

        return true
      },

      demoteFromDailyTask: (id) => {
        const now = new Date().toISOString()
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, isDailyTask: false, updatedAt: now } : task
          ),
          lastUpdated: now,
        }))
      },

      // Project actions
      addProject: (projectData) => {
        const now = new Date().toISOString()
        const newProject: Project = {
          ...projectData,
          id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          projects: [...state.projects, newProject],
          lastUpdated: now,
        }))

        return newProject
      },

      updateProject: (id, updates) => {
        const now = new Date().toISOString()
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates, updatedAt: now } : project
          ),
          lastUpdated: now,
        }))
      },

      deleteProject: (id) => {
        const now = new Date().toISOString()
        set((state) => ({
          // Remove project and unassign its tasks
          projects: state.projects.filter((project) => project.id !== id),
          tasks: state.tasks.map((task) =>
            task.projectId === id ? { ...task, projectId: undefined, updatedAt: now } : task
          ),
          lastUpdated: now,
        }))
      },

      assignTaskToProject: (taskId, projectId) => {
        const now = new Date().toISOString()
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, projectId, updatedAt: now } : task
          ),
          lastUpdated: now,
        }))
      },

      // Computed helpers
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

      // Bulk actions
      clearCompletedTasks: () => {
        const now = new Date().toISOString()
        set((state) => ({
          tasks: state.tasks.filter((task) => !task.completed),
          lastUpdated: now,
        }))
      },

      resetDailyTasks: () => {
        const now = new Date().toISOString()
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.isDailyTask ? { ...task, completed: false, updatedAt: now } : task
          ),
          lastUpdated: now,
        }))
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
            set({
              tasks: data.tasks,
              projects: data.projects,
              lastUpdated: new Date().toISOString(),
            })
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

// Selectors for better performance
export const selectActiveProjects = (state: TaskStore) =>
  state.projects.filter((p) => p.status === 'active')

export const selectCompletedProjects = (state: TaskStore) =>
  state.projects.filter((p) => p.status === 'completed')

export const selectArchivedProjects = (state: TaskStore) =>
  state.projects.filter((p) => p.status === 'archived')

export const selectDailyTasksCount = (state: TaskStore) =>
  state.tasks.filter((t) => t.isDailyTask && !t.completed).length
