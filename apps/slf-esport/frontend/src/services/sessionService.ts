/**
 * Session service - API calls for training sessions
 */

import api from './api'
import type {
  Session,
  SessionCreate,
  SessionUpdate,
  SessionListResponse,
  SessionStats,
  SessionType,
  SessionStatus,
  SessionParticipant,
  SessionParticipantUpdate,
} from '@/types/session'

class SessionService {
  /**
   * Create a new session
   */
  async createSession(sessionData: SessionCreate): Promise<Session> {
    const response = await api.post<Session>('/sessions', sessionData)
    return response.data
  }

  /**
   * Get all sessions with filters
   */
  async getSessions(params?: {
    user_id?: number
    coach_id?: number
    session_type?: SessionType
    status?: SessionStatus
    start_date?: string
    end_date?: string
    page?: number
    page_size?: number
  }): Promise<SessionListResponse> {
    const response = await api.get<SessionListResponse>('/sessions', { params })
    return response.data
  }

  /**
   * Get current user's sessions
   */
  async getMySessions(params?: {
    session_type?: SessionType
    status?: SessionStatus
    start_date?: string
    end_date?: string
    page?: number
    page_size?: number
  }): Promise<SessionListResponse> {
    const response = await api.get<SessionListResponse>('/sessions/me', { params })
    return response.data
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: number): Promise<Session> {
    const response = await api.get<Session>(`/sessions/${sessionId}`)
    return response.data
  }

  /**
   * Update a session
   */
  async updateSession(sessionId: number, updates: SessionUpdate): Promise<Session> {
    const response = await api.put<Session>(`/sessions/${sessionId}`, updates)
    return response.data
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: number): Promise<void> {
    await api.delete(`/sessions/${sessionId}`)
  }

  /**
   * Add participant to session
   */
  async addParticipant(sessionId: number, userId: number): Promise<SessionParticipant> {
    const response = await api.post<SessionParticipant>(
      `/sessions/${sessionId}/participants/${userId}`
    )
    return response.data
  }

  /**
   * Remove participant from session
   */
  async removeParticipant(sessionId: number, userId: number): Promise<void> {
    await api.delete(`/sessions/${sessionId}/participants/${userId}`)
  }

  /**
   * Update participant attendance
   */
  async updateAttendance(
    sessionId: number,
    userId: number,
    updates: SessionParticipantUpdate
  ): Promise<SessionParticipant> {
    const response = await api.put<SessionParticipant>(
      `/sessions/${sessionId}/participants/${userId}/attendance`,
      updates
    )
    return response.data
  }

  /**
   * Get current user's session stats
   */
  async getMyStats(): Promise<SessionStats> {
    const response = await api.get<SessionStats>('/sessions/stats/me')
    return response.data
  }

  /**
   * Get user session stats (coaches/managers only)
   */
  async getUserStats(userId: number): Promise<SessionStats> {
    const response = await api.get<SessionStats>(`/sessions/stats/user/${userId}`)
    return response.data
  }

  /**
   * Respond to a session invitation
   */
  async respondToInvitation(
    sessionId: number,
    responseStatus: 'confirmed' | 'maybe' | 'declined',
    declineReason?: string
  ): Promise<SessionParticipant> {
    const response = await api.put<SessionParticipant>(
      `/sessions/${sessionId}/respond`,
      null,
      {
        params: {
          response_status: responseStatus,
          decline_reason: declineReason,
        },
      }
    )
    return response.data
  }
}

export default new SessionService()
