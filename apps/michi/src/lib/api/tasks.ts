/**
 * Tasks API - CRUD operations
 * Shinkofa Platform - Frontend
 */

import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from '@/types/api'
import apiClient from './client'

const TASKS_ENDPOINT = '/tasks'

/**
 * Get all tasks (with optional filters)
 */
export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
  const params = new URLSearchParams()

  if (filters?.completed !== undefined) {
    params.append('completed', String(filters.completed))
  }

  if (filters?.project_id) {
    params.append('project_id', filters.project_id)
  }

  const url = params.toString() ? `${TASKS_ENDPOINT}?${params}` : TASKS_ENDPOINT

  const response = await apiClient.get<Task[]>(url)
  return response.data
}

/**
 * Get single task by ID
 */
export async function getTask(taskId: string): Promise<Task> {
  const response = await apiClient.get<Task>(`${TASKS_ENDPOINT}/${taskId}`)
  return response.data
}

/**
 * Create new task
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await apiClient.post<Task>(TASKS_ENDPOINT, input)
  return response.data
}

/**
 * Update existing task
 */
export async function updateTask(
  taskId: string,
  input: UpdateTaskInput
): Promise<Task> {
  const response = await apiClient.put<Task>(`${TASKS_ENDPOINT}/${taskId}`, input)
  return response.data
}

/**
 * Delete task
 */
export async function deleteTask(taskId: string): Promise<void> {
  await apiClient.delete(`${TASKS_ENDPOINT}/${taskId}`)
}
