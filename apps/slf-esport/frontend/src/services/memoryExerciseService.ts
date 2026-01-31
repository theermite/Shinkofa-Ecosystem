/**
 * Memory Exercise Service - API client for visual memory exercises
 */

import api from './api'
import type {
  MemoryExerciseSession,
  MemoryExerciseSessionCreate,
  MemoryExerciseSessionUpdate,
  MemoryExerciseStats,
  MemoryExerciseLeaderboard,
  ConfigPreset,
  MemoryExerciseType,
  DifficultyLevel,
} from '@/types/memoryExercise'

const BASE_PATH = '/memory-exercises'

const memoryExerciseService = {
  /**
   * Create a new memory exercise session
   */
  async createSession(
    data: MemoryExerciseSessionCreate
  ): Promise<MemoryExerciseSession> {
    const response = await api.post(`${BASE_PATH}/sessions`, data)
    return response.data
  },

  /**
   * Update a memory exercise session with performance data
   */
  async updateSession(
    sessionId: number,
    data: MemoryExerciseSessionUpdate
  ): Promise<MemoryExerciseSession> {
    const response = await api.put(`${BASE_PATH}/sessions/${sessionId}`, data)
    return response.data
  },

  /**
   * Get a specific session
   */
  async getSession(sessionId: number): Promise<MemoryExerciseSession> {
    const response = await api.get(`${BASE_PATH}/sessions/${sessionId}`)
    return response.data
  },

  /**
   * Get current user's session history
   */
  async getMyHistory(params?: {
    exercise_id?: number
    exercise_type?: MemoryExerciseType
    completed_only?: boolean
    skip?: number
    limit?: number
  }): Promise<MemoryExerciseSession[]> {
    const response = await api.get(`${BASE_PATH}/sessions/me/history`, {
      params,
    })
    return response.data
  },

  /**
   * Get leaderboard for an exercise
   */
  async getLeaderboard(
    exerciseId: number,
    params?: {
      difficulty?: DifficultyLevel
      exercise_type?: MemoryExerciseType
      limit?: number
    }
  ): Promise<MemoryExerciseLeaderboard[]> {
    const response = await api.get(`${BASE_PATH}/leaderboard/${exerciseId}`, {
      params,
    })
    return response.data
  },

  /**
   * Get current user's statistics
   */
  async getMyStats(params?: {
    exercise_id?: number
    exercise_type?: MemoryExerciseType
  }): Promise<MemoryExerciseStats[]> {
    const response = await api.get(`${BASE_PATH}/stats/me`, { params })
    return response.data
  },

  /**
   * Get user statistics (coach/manager only)
   */
  async getUserStats(
    userId: number,
    params?: {
      exercise_id?: number
      exercise_type?: MemoryExerciseType
    }
  ): Promise<MemoryExerciseStats[]> {
    const response = await api.get(`${BASE_PATH}/stats/user/${userId}`, {
      params,
    })
    return response.data
  },

  /**
   * Get preset configurations for a memory exercise type
   */
  async getPresets(
    exerciseType: MemoryExerciseType
  ): Promise<ConfigPreset[]> {
    const response = await api.get(`${BASE_PATH}/presets/${exerciseType}`)
    return response.data
  },
}

export default memoryExerciseService
