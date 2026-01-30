/**
 * useHolisticProfile Hook - TanStack Query hooks for Holistic Profile
 * Shinkofa Platform - Frontend
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { HolisticProfile } from '@/types/holistic'
import {
  getHolisticProfileByUser,
  getHolisticProfileBySession,
  triggerHolisticAnalysis,
  deleteHolisticProfile,
} from '@/lib/api/holistic'

// ==================
// QUERY KEYS
// ==================

export const holisticProfileKeys = {
  all: ['holistic-profiles'] as const,
  byUser: (userId: string) => [...holisticProfileKeys.all, 'user', userId] as const,
  bySession: (sessionId: string) => [...holisticProfileKeys.all, 'session', sessionId] as const,
}

// ==================
// QUERIES
// ==================

/**
 * Get holistic profile for a user (latest profile)
 * @param userId - User ID
 * @param enabled - Enable/disable query (default: true)
 */
export function useHolisticProfileByUser(userId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: holisticProfileKeys.byUser(userId),
    queryFn: () => getHolisticProfileByUser(userId),
    enabled: !!userId && enabled, // Only fetch if userId exists and enabled
    staleTime: 30 * 60 * 1000, // 30 minutes (profile changes rarely)
    retry: 1, // Only retry once (404 is expected if no profile exists)
  })
}

/**
 * Get holistic profile for a session
 * @param sessionId - Questionnaire session ID
 * @param enabled - Enable/disable query (default: true)
 */
export function useHolisticProfileBySession(sessionId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: holisticProfileKeys.bySession(sessionId),
    queryFn: () => getHolisticProfileBySession(sessionId),
    enabled: !!sessionId && enabled,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  })
}

// ==================
// MUTATIONS
// ==================

/**
 * Trigger holistic analysis for a session
 */
export function useTriggerHolisticAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: triggerHolisticAnalysis,
    onSuccess: (data) => {
      // Invalidate and refetch all holistic profile queries
      queryClient.invalidateQueries({ queryKey: holisticProfileKeys.all })

      // Optionally set the new profile data directly
      if (data.user_id) {
        queryClient.setQueryData(holisticProfileKeys.byUser(data.user_id), data)
      }
      if (data.session_id) {
        queryClient.setQueryData(holisticProfileKeys.bySession(data.session_id), data)
      }
    },
  })
}

/**
 * Delete holistic profile for a user
 */
export function useDeleteHolisticProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, deleteQuestionnaire = false }: { userId: string; deleteQuestionnaire?: boolean }) =>
      deleteHolisticProfile(userId, deleteQuestionnaire),
    onSuccess: (_, variables) => {
      // Clear profile data from cache
      queryClient.removeQueries({ queryKey: holisticProfileKeys.byUser(variables.userId) })
      // Invalidate all holistic profile queries
      queryClient.invalidateQueries({ queryKey: holisticProfileKeys.all })
    },
  })
}
