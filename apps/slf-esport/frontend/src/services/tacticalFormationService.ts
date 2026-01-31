/**
 * Tactical Formation Service - API calls for tactical formations
 */

import api from './api'
import type {
  TacticalFormation,
  TacticalFormationCreate,
  TacticalFormationUpdate,
  ShareFormationRequest,
  FormationCategory,
  MapType,
} from '@/types/tacticalFormation'

const BASE_URL = '/tactical-formations'

const tacticalFormationService = {
  /**
   * Get all tactical formations accessible to the user
   */
  async getFormations(params?: {
    category?: FormationCategory
    team_id?: number
    map_type?: MapType
    search?: string
  }): Promise<TacticalFormation[]> {
    const response = await api.get<TacticalFormation[]>(BASE_URL, { params })
    return response.data
  },

  /**
   * Get a specific tactical formation by ID
   */
  async getFormation(id: number): Promise<TacticalFormation> {
    const response = await api.get<TacticalFormation>(`${BASE_URL}/${id}`)
    return response.data
  },

  /**
   * Create a new tactical formation
   */
  async createFormation(data: TacticalFormationCreate): Promise<TacticalFormation> {
    const response = await api.post<TacticalFormation>(BASE_URL, data)
    return response.data
  },

  /**
   * Update an existing tactical formation
   */
  async updateFormation(id: number, data: TacticalFormationUpdate): Promise<TacticalFormation> {
    const response = await api.put<TacticalFormation>(`${BASE_URL}/${id}`, data)
    return response.data
  },

  /**
   * Delete a tactical formation
   */
  async deleteFormation(id: number): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`)
  },

  /**
   * Share a tactical formation with team/users or make public
   */
  async shareFormation(id: number, data: ShareFormationRequest): Promise<TacticalFormation> {
    const response = await api.post<TacticalFormation>(`${BASE_URL}/${id}/share`, data)
    return response.data
  },

  /**
   * Duplicate a tactical formation
   */
  async duplicateFormation(id: number): Promise<TacticalFormation> {
    const response = await api.post<TacticalFormation>(`${BASE_URL}/${id}/duplicate`)
    return response.data
  },
}

export default tacticalFormationService
