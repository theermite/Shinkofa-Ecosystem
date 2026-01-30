/**
 * Projects API - CRUD operations
 * Shinkofa Platform - Frontend
 */

import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectFilters,
} from '@/types/api'
import apiClient from './client'

const PROJECTS_ENDPOINT = '/projects'

/**
 * Get all projects (with optional filters)
 */
export async function getProjects(filters?: ProjectFilters): Promise<Project[]> {
  const params = new URLSearchParams()

  if (filters?.status_filter) {
    params.append('status_filter', filters.status_filter)
  }

  const url = params.toString()
    ? `${PROJECTS_ENDPOINT}?${params}`
    : PROJECTS_ENDPOINT

  const response = await apiClient.get<Project[]>(url)
  return response.data
}

/**
 * Get single project by ID
 */
export async function getProject(projectId: string): Promise<Project> {
  const response = await apiClient.get<Project>(`${PROJECTS_ENDPOINT}/${projectId}`)
  return response.data
}

/**
 * Create new project
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  const response = await apiClient.post<Project>(PROJECTS_ENDPOINT, input)
  return response.data
}

/**
 * Update existing project
 */
export async function updateProject(
  projectId: string,
  input: UpdateProjectInput
): Promise<Project> {
  const response = await apiClient.put<Project>(
    `${PROJECTS_ENDPOINT}/${projectId}`,
    input
  )
  return response.data
}

/**
 * Delete project (cascades to tasks)
 */
export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`${PROJECTS_ENDPOINT}/${projectId}`)
}
