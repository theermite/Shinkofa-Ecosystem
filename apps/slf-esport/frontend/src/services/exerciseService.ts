/**
 * Exercise service - API calls for exercises and scores
 */

import api from './api'
import type {
  Exercise,
  ExerciseScore,
  ExerciseScoreCreate,
  ExerciseStats,
  ExerciseCategory,
} from '@/types/exercise'

class ExerciseService {
  /**
   * Get all exercises
   */
  async getExercises(category?: ExerciseCategory): Promise<Exercise[]> {
    const params = category ? { category } : {}
    const response = await api.get<Exercise[]>('/exercises', { params })
    return response.data
  }

  /**
   * Get exercise by ID
   */
  async getExercise(id: number): Promise<Exercise> {
    const response = await api.get<Exercise>(`/exercises/${id}`)
    return response.data
  }

  /**
   * Submit a new score
   */
  async submitScore(scoreData: ExerciseScoreCreate): Promise<ExerciseScore> {
    const response = await api.post<ExerciseScore>('/exercises/scores', scoreData)
    return response.data
  }

  /**
   * Get current user's scores
   */
  async getMyScores(exerciseId?: number): Promise<ExerciseScore[]> {
    const params = exerciseId ? { exercise_id: exerciseId } : {}
    const response = await api.get<ExerciseScore[]>('/exercises/scores/me', { params })
    return response.data
  }

  /**
   * Update a score
   */
  async updateScore(
    scoreId: number,
    updates: Partial<ExerciseScoreCreate>
  ): Promise<ExerciseScore> {
    const response = await api.put<ExerciseScore>(`/exercises/scores/${scoreId}`, updates)
    return response.data
  }

  /**
   * Delete a score
   */
  async deleteScore(scoreId: number): Promise<void> {
    await api.delete(`/exercises/scores/${scoreId}`)
  }

  /**
   * Get current user's statistics
   */
  async getMyStats(category?: ExerciseCategory): Promise<ExerciseStats[]> {
    const params = category ? { category } : {}
    const response = await api.get<ExerciseStats[]>('/exercises/stats/me', { params })
    return response.data
  }

  /**
   * Get user statistics (coach/manager only)
   */
  async getUserStats(userId: number, category?: ExerciseCategory): Promise<ExerciseStats[]> {
    const params = category ? { category } : {}
    const response = await api.get<ExerciseStats[]>(`/exercises/stats/user/${userId}`, {
      params,
    })
    return response.data
  }
}

export default new ExerciseService()
