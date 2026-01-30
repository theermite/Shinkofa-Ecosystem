/**
 * useRituals Hook - TanStack Query hooks for Rituals
 * Shinkofa Platform - Frontend
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRituals,
  getRitual,
  createRitual,
  updateRitual,
  deleteRitual,
  resetRituals,
} from '@/lib/api/rituals'
import type { Ritual, RitualFilters, CreateRitualInput, UpdateRitualInput } from '@/types/api'

// ==================
// QUERY KEYS
// ==================

export const ritualKeys = {
  all: ['rituals'] as const,
  lists: () => [...ritualKeys.all, 'list'] as const,
  list: (filters?: RitualFilters) => [...ritualKeys.lists(), filters] as const,
  details: () => [...ritualKeys.all, 'detail'] as const,
  detail: (id: string) => [...ritualKeys.details(), id] as const,
}

// ==================
// QUERIES
// ==================

/**
 * Get all rituals with optional filters
 */
export function useRituals(filters?: RitualFilters) {
  return useQuery({
    queryKey: ritualKeys.list(filters),
    queryFn: () => getRituals(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get single ritual by ID
 */
export function useRitual(ritualId: string | undefined) {
  return useQuery({
    queryKey: ritualKeys.detail(ritualId || ''),
    queryFn: () => getRitual(ritualId!),
    enabled: !!ritualId,
  })
}

// ==================
// MUTATIONS
// ==================

/**
 * Create new ritual
 */
export function useCreateRitual() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateRitualInput) => createRitual(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ritualKeys.lists() })
    },
  })
}

/**
 * Update existing ritual
 */
export function useUpdateRitual() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ritualId, input }: { ritualId: string; input: UpdateRitualInput }) =>
      updateRitual(ritualId, input),
    onMutate: async ({ ritualId, input }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ritualKeys.detail(ritualId) })

      const previousRitual = queryClient.getQueryData<Ritual>(ritualKeys.detail(ritualId))

      if (previousRitual) {
        queryClient.setQueryData<Ritual>(ritualKeys.detail(ritualId), {
          ...previousRitual,
          ...input,
        })
      }

      return { previousRitual }
    },
    onError: (_err, { ritualId }, context) => {
      // Rollback on error
      if (context?.previousRitual) {
        queryClient.setQueryData(ritualKeys.detail(ritualId), context.previousRitual)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ritualKeys.all })
    },
  })
}

/**
 * Toggle ritual completion (helper for useUpdateRitual)
 */
export function useToggleRitualCompleted() {
  const updateRitual = useUpdateRitual()

  return {
    ...updateRitual,
    mutate: (ritual: Ritual) => {
      updateRitual.mutate({
        ritualId: ritual.id,
        input: { completed_today: !ritual.completed_today },
      })
    },
  }
}

/**
 * Delete ritual
 */
export function useDeleteRitual() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ritualId: string) => deleteRitual(ritualId),
    onSuccess: (_data, ritualId) => {
      queryClient.removeQueries({ queryKey: ritualKeys.detail(ritualId) })
      queryClient.invalidateQueries({ queryKey: ritualKeys.lists() })
    },
  })
}

/**
 * Reset all rituals (set completed_today to false)
 */
export function useResetRituals() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => resetRituals(),
    onSuccess: () => {
      // Invalidate all ritual queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ritualKeys.all })
    },
  })
}
