/**
 * Journals API Client
 * Shinkofa Platform - Frontend
 */

import apiClient from './client'
import type { Journal, JournalFilters, CreateJournalInput, UpdateJournalInput } from '@/types/api'

/**
 * Get all journals with optional filters
 */
export async function getJournals(filters?: JournalFilters): Promise<Journal[]> {
  const params = new URLSearchParams()
  if (filters?.start_date) params.append('start_date', filters.start_date)
  if (filters?.end_date) params.append('end_date', filters.end_date)

  const url = `/journals${params.toString() ? `?${params.toString()}` : ''}`
  const response = await apiClient.get<Journal[]>(url)
  return response.data
}

/**
 * Get single journal by ID
 */
export async function getJournal(journalId: string): Promise<Journal> {
  const response = await apiClient.get<Journal>(`/journals/${journalId}`)
  return response.data
}

/**
 * Get journal by date (YYYY-MM-DD)
 */
export async function getJournalByDate(date: string): Promise<Journal | null> {
  try {
    const response = await apiClient.get<Journal>(`/journals/date/${date}`)
    return response.data
  } catch (error) {
    const axiosError = error as { response?: { status?: number } }
    if (axiosError.response?.status === 404) {
      return null // No journal for this date
    }
    throw error
  }
}

/**
 * Create new journal
 */
export async function createJournal(input: CreateJournalInput): Promise<Journal> {
  const response = await apiClient.post<Journal>('/journals', input)
  return response.data
}

/**
 * Update existing journal
 */
export async function updateJournal(
  journalId: string,
  input: UpdateJournalInput
): Promise<Journal> {
  const response = await apiClient.put<Journal>(`/journals/${journalId}`, input)
  return response.data
}

/**
 * Delete journal
 */
export async function deleteJournal(journalId: string): Promise<void> {
  await apiClient.delete(`/journals/${journalId}`)
}
