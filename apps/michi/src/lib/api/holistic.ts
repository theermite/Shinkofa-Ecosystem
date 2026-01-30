/**
 * Holistic Profile API Functions
 * Shinkofa Platform - Frontend
 */

import apiClient from './client'
import type { HolisticProfile } from '@/types/holistic'

// ==================
// API BASE URL
// ==================

const QUEST_BASE = '/questionnaire'

// ==================
// GET HOLISTIC PROFILE
// ==================

/**
 * Get holistic profile for current user (latest profile)
 * @param userId - User ID
 * @returns Holistic profile data
 */
export async function getHolisticProfileByUser(userId: string): Promise<HolisticProfile> {
  const response = await apiClient.get<HolisticProfile>(`${QUEST_BASE}/profile/user/${userId}`)
  return response.data
}

/**
 * Get holistic profile by session ID
 * @param sessionId - Questionnaire session ID
 * @returns Holistic profile data
 */
export async function getHolisticProfileBySession(sessionId: string): Promise<HolisticProfile> {
  const response = await apiClient.get<HolisticProfile>(`${QUEST_BASE}/profile/${sessionId}`)
  return response.data
}

/**
 * Trigger holistic analysis for a session
 * @param sessionId - Questionnaire session ID
 * @returns Holistic profile data
 */
export async function triggerHolisticAnalysis(sessionId: string): Promise<HolisticProfile> {
  const response = await apiClient.post<HolisticProfile>(`${QUEST_BASE}/analyze/${sessionId}`)
  return response.data
}

// ==================
// DELETE HOLISTIC PROFILE
// ==================

export interface DeleteProfileResponse {
  success: boolean
  message: string
  details: {
    profiles_deleted: number
    sessions_deleted: number
    responses_deleted: number
    questionnaire_data_deleted: boolean
  }
}

/**
 * Delete holistic profile for a user
 * @param userId - User ID
 * @param deleteQuestionnaire - If true, also deletes questionnaire sessions and responses
 * @returns Success message with deletion details
 */
export async function deleteHolisticProfile(
  userId: string,
  deleteQuestionnaire: boolean = false
): Promise<DeleteProfileResponse> {
  const response = await apiClient.delete<DeleteProfileResponse>(
    `${QUEST_BASE}/profile/user/${userId}?delete_questionnaire=${deleteQuestionnaire}`
  )
  return response.data
}
