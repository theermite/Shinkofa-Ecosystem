/**
 * Availability Service - API calls for player availability management
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import api from './api'
import type {
  PlayerAvailability,
  PlayerAvailabilityCreate,
  PlayerAvailabilityUpdate,
  PlayerAvailabilityException,
  PlayerAvailabilityExceptionCreate,
  AvailablePlayer,
  SessionInvitationRequest,
  SessionResponseRequest,
  TeamMemberAvailability,
} from '@/types/availability'
import type { Session } from '@/types/session'

const BASE_URL = '/availabilities'

// ========== Player Availabilities ==========

export const availabilityService = {
  // Get my recurring availabilities
  async getMyAvailabilities(): Promise<PlayerAvailability[]> {
    const { data } = await api.get(`${BASE_URL}/my`)
    return data
  },

  // Get team availabilities (coaches/managers only)
  async getTeamAvailabilities(teamOnly: boolean = true): Promise<TeamMemberAvailability[]> {
    const params = new URLSearchParams({
      team_only: teamOnly.toString(),
    })
    const { data } = await api.get(`${BASE_URL}/team?${params.toString()}`)
    return data
  },

  // Create a new availability
  async createAvailability(availability: PlayerAvailabilityCreate): Promise<PlayerAvailability> {
    const { data } = await api.post(BASE_URL, availability)
    return data
  },

  // Update an availability
  async updateAvailability(id: number, availability: PlayerAvailabilityUpdate): Promise<PlayerAvailability> {
    const { data } = await api.put(`${BASE_URL}/${id}`, availability)
    return data
  },

  // Delete an availability
  async deleteAvailability(id: number): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`)
  },

  // ========== Availability Exceptions ==========

  // Get my exceptions
  async getMyExceptions(startDate?: string, endDate?: string): Promise<PlayerAvailabilityException[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)

    const { data } = await api.get(`${BASE_URL}/exceptions/my?${params.toString()}`)
    return data
  },

  // Create an exception
  async createException(exception: PlayerAvailabilityExceptionCreate): Promise<PlayerAvailabilityException> {
    const { data } = await api.post(`${BASE_URL}/exceptions`, exception)
    return data
  },

  // Delete an exception
  async deleteException(id: number): Promise<void> {
    await api.delete(`${BASE_URL}/exceptions/${id}`)
  },

  // ========== Available Players Query ==========

  // Get available players for a time slot (coaches/managers only)
  async getAvailablePlayers(startTime: string, endTime: string, teamOnly: boolean = true): Promise<AvailablePlayer[]> {
    const params = new URLSearchParams({
      start_time: startTime,
      end_time: endTime,
      team_only: teamOnly.toString(),
    })

    const { data } = await api.get(`${BASE_URL}/available-players?${params.toString()}`)
    return data
  },
}

// ========== Session Invitations ==========

export const invitationService = {
  // Invite players to a session (coaches/managers only)
  async invitePlayersToSession(sessionId: number, userIds: number[]): Promise<void> {
    await api.post(`/sessions/${sessionId}/invite`, userIds)
  },

  // Respond to a session invitation
  async respondToInvitation(sessionId: number, responseStatus: string, declineReason?: string): Promise<void> {
    await api.put(`/sessions/${sessionId}/respond`, null, {
      params: {
        response_status: responseStatus,
        decline_reason: declineReason,
      },
    })
  },

  // Get my pending invitations
  async getMyPendingInvitations(): Promise<Session[]> {
    const { data} = await api.get('/sessions/invitations/pending')
    return data
  },
}

export default availabilityService
