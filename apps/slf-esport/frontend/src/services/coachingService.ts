/**
 * Coaching service - API calls for coaching module
 */

import api from './api'
import type {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseCreate,
  QuestionnaireType,
  JournalEntry,
  JournalEntryCreate,
  JournalStats,
  JournalMood,
  Goal,
  GoalCreate,
  GoalStats,
} from '@/types/coaching'

class CoachingService {
  // ========== Questionnaires ==========

  /**
   * Get all questionnaires
   */
  async getQuestionnaires(params?: {
    questionnaire_type?: QuestionnaireType
    is_active?: boolean
  }): Promise<Questionnaire[]> {
    const response = await api.get<Questionnaire[]>('/coaching/questionnaires', { params })
    return response.data
  }

  /**
   * Submit questionnaire response
   */
  async submitQuestionnaireResponse(
    data: QuestionnaireResponseCreate
  ): Promise<QuestionnaireResponse> {
    const response = await api.post<QuestionnaireResponse>(
      '/coaching/questionnaire-responses',
      data
    )
    return response.data
  }

  /**
   * Get current user's questionnaire responses
   */
  async getMyQuestionnaireResponses(
    questionnaire_id?: number
  ): Promise<QuestionnaireResponse[]> {
    const params = questionnaire_id ? { questionnaire_id } : {}
    const response = await api.get<QuestionnaireResponse[]>(
      '/coaching/questionnaire-responses/me',
      { params }
    )
    return response.data
  }

  // ========== Journal ==========

  /**
   * Create a journal entry
   */
  async createJournalEntry(data: JournalEntryCreate): Promise<JournalEntry> {
    const response = await api.post<JournalEntry>('/coaching/journal', data)
    return response.data
  }

  /**
   * Get current user's journal entries
   */
  async getMyJournalEntries(params?: {
    start_date?: string
    end_date?: string
    mood?: JournalMood
    page?: number
    page_size?: number
  }): Promise<JournalEntry[]> {
    const response = await api.get<JournalEntry[]>('/coaching/journal/me', { params })
    return response.data
  }

  /**
   * Update a journal entry
   */
  async updateJournalEntry(
    entryId: number,
    data: Partial<JournalEntryCreate>
  ): Promise<JournalEntry> {
    const response = await api.put<JournalEntry>(`/coaching/journal/${entryId}`, data)
    return response.data
  }

  /**
   * Delete a journal entry
   */
  async deleteJournalEntry(entryId: number): Promise<void> {
    await api.delete(`/coaching/journal/${entryId}`)
  }

  /**
   * Get current user's journal statistics
   */
  async getMyJournalStats(days: number = 30): Promise<JournalStats> {
    const response = await api.get<JournalStats>('/coaching/journal/stats/me', {
      params: { days },
    })
    return response.data
  }

  // ========== Goals ==========

  /**
   * Create a goal
   */
  async createGoal(data: GoalCreate, userId?: number): Promise<Goal> {
    const params = userId ? { user_id: userId } : {}
    const response = await api.post<Goal>('/coaching/goals', data, { params })
    return response.data
  }

  /**
   * Get current user's goals
   */
  async getMyGoals(params?: {
    is_completed?: boolean
    category?: string
  }): Promise<Goal[]> {
    const response = await api.get<Goal[]>('/coaching/goals/me', { params })
    return response.data
  }

  /**
   * Update a goal
   */
  async updateGoal(goalId: number, data: Partial<GoalCreate>): Promise<Goal> {
    const response = await api.put<Goal>(`/coaching/goals/${goalId}`, data)
    return response.data
  }

  /**
   * Delete a goal
   */
  async deleteGoal(goalId: number): Promise<void> {
    await api.delete(`/coaching/goals/${goalId}`)
  }

  /**
   * Get current user's goal statistics
   */
  async getMyGoalStats(): Promise<GoalStats> {
    const response = await api.get<GoalStats>('/coaching/goals/stats/me')
    return response.data
  }
}

export default new CoachingService()
