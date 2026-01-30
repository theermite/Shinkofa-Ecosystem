/**
 * Rituals API Client
 * Shinkofa Platform - Frontend
 */

import apiClient from './client'
import type { Ritual, RitualFilters, CreateRitualInput, UpdateRitualInput } from '@/types/api'

/**
 * Get all rituals with optional filters
 */
export async function getRituals(filters?: RitualFilters): Promise<Ritual[]> {
  const params = new URLSearchParams()
  if (filters?.category) params.append('category', filters.category)
  if (filters?.completed_today !== undefined)
    params.append('completed_today', filters.completed_today.toString())

  const url = `/rituals${params.toString() ? `?${params.toString()}` : ''}`
  const response = await apiClient.get<Ritual[]>(url)
  return response.data
}

/**
 * Get single ritual by ID
 */
export async function getRitual(ritualId: string): Promise<Ritual> {
  const response = await apiClient.get<Ritual>(`/rituals/${ritualId}`)
  return response.data
}

/**
 * Create new ritual
 */
export async function createRitual(input: CreateRitualInput): Promise<Ritual> {
  const response = await apiClient.post<Ritual>('/rituals', input)
  return response.data
}

/**
 * Update existing ritual
 */
export async function updateRitual(
  ritualId: string,
  input: UpdateRitualInput
): Promise<Ritual> {
  const response = await apiClient.put<Ritual>(`/rituals/${ritualId}`, input)
  return response.data
}

/**
 * Delete ritual
 */
export async function deleteRitual(ritualId: string): Promise<void> {
  await apiClient.delete(`/rituals/${ritualId}`)
}

/**
 * Reset all rituals (set completed_today to false)
 */
export async function resetRituals(): Promise<{ message: string; reset_count: number }> {
  const response = await apiClient.post<{ message: string; reset_count: number }>('/rituals/reset')
  return response.data
}
