/**
 * Assignment service - API calls for exercise assignments
 */

import api from './api'
import type {
  ExerciseAssignment,
  ExerciseAssignmentCreate,
  ExerciseAssignmentUpdate,
  AssignmentStats,
  AssignmentStatus,
} from '@/types/assignment'

class AssignmentService {
  // ========== Create & Delete ==========

  /**
   * Create a new assignment (coaches only)
   */
  async createAssignment(data: ExerciseAssignmentCreate): Promise<ExerciseAssignment> {
    const response = await api.post<ExerciseAssignment>('/assignments', data)
    return response.data
  }

  /**
   * Delete an assignment (coaches only)
   */
  async deleteAssignment(assignmentId: number): Promise<void> {
    await api.delete(`/assignments/${assignmentId}`)
  }

  // ========== Get Assignments ==========

  /**
   * Get current user's assignments
   */
  async getMyAssignments(params?: {
    status?: AssignmentStatus
    include_completed?: boolean
    page?: number
    page_size?: number
  }): Promise<ExerciseAssignment[]> {
    const response = await api.get<ExerciseAssignment[]>('/assignments/my-assignments', {
      params,
    })
    return response.data
  }

  /**
   * Get assignments for a specific player (coaches only)
   */
  async getPlayerAssignments(
    playerId: number,
    params?: {
      status?: AssignmentStatus
      include_completed?: boolean
      page?: number
      page_size?: number
    }
  ): Promise<ExerciseAssignment[]> {
    const response = await api.get<ExerciseAssignment[]>(
      `/assignments/player/${playerId}`,
      { params }
    )
    return response.data
  }

  /**
   * Get assignments created by current coach
   */
  async getMyCreatedAssignments(params?: {
    player_id?: number
    status?: AssignmentStatus
    page?: number
    page_size?: number
  }): Promise<ExerciseAssignment[]> {
    const response = await api.get<ExerciseAssignment[]>('/assignments/my-created', {
      params,
    })
    return response.data
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(assignmentId: number): Promise<ExerciseAssignment> {
    const response = await api.get<ExerciseAssignment>(`/assignments/${assignmentId}`)
    return response.data
  }

  // ========== Update ==========

  /**
   * Update an assignment
   */
  async updateAssignment(
    assignmentId: number,
    data: ExerciseAssignmentUpdate
  ): Promise<ExerciseAssignment> {
    const response = await api.put<ExerciseAssignment>(
      `/assignments/${assignmentId}`,
      data
    )
    return response.data
  }

  /**
   * Record an attempt on an assignment
   */
  async recordAttempt(assignmentId: number): Promise<ExerciseAssignment> {
    const response = await api.post<ExerciseAssignment>(
      `/assignments/${assignmentId}/attempt`
    )
    return response.data
  }

  // ========== Stats ==========

  /**
   * Get current user's assignment statistics
   */
  async getMyStats(): Promise<AssignmentStats> {
    const response = await api.get<AssignmentStats>('/assignments/stats/me')
    return response.data
  }

  /**
   * Get player's assignment statistics (coaches only)
   */
  async getPlayerStats(playerId: number): Promise<AssignmentStats> {
    const response = await api.get<AssignmentStats>(
      `/assignments/stats/player/${playerId}`
    )
    return response.data
  }
}

export default new AssignmentService()
