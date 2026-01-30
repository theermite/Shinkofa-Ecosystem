/**
 * useJournals Hook - TanStack Query hooks for Journals
 * Shinkofa Platform - Frontend
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getJournals,
  getJournal,
  getJournalByDate,
  createJournal,
  updateJournal,
  deleteJournal,
} from '@/lib/api/journals'
import type { Journal, JournalFilters, CreateJournalInput, UpdateJournalInput } from '@/types/api'

// ==================
// QUERY KEYS
// ==================

export const journalKeys = {
  all: ['journals'] as const,
  lists: () => [...journalKeys.all, 'list'] as const,
  list: (filters?: JournalFilters) => [...journalKeys.lists(), filters] as const,
  details: () => [...journalKeys.all, 'detail'] as const,
  detail: (id: string) => [...journalKeys.details(), id] as const,
  byDate: (date: string) => [...journalKeys.all, 'date', date] as const,
}

// ==================
// QUERIES
// ==================

/**
 * Get all journals with optional filters
 */
export function useJournals(filters?: JournalFilters) {
  return useQuery({
    queryKey: journalKeys.list(filters),
    queryFn: () => getJournals(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get single journal by ID
 */
export function useJournal(journalId: string | undefined) {
  return useQuery({
    queryKey: journalKeys.detail(journalId || ''),
    queryFn: () => getJournal(journalId!),
    enabled: !!journalId,
  })
}

/**
 * Get journal by date (YYYY-MM-DD)
 */
export function useJournalByDate(date: string) {
  return useQuery({
    queryKey: journalKeys.byDate(date),
    queryFn: () => getJournalByDate(date),
    staleTime: 1 * 60 * 1000, // 1 minute (daily data changes more frequently)
  })
}

// ==================
// MUTATIONS
// ==================

/**
 * Create new journal
 */
export function useCreateJournal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateJournalInput) => createJournal(input),
    onSuccess: (newJournal) => {
      // Invalidate journal lists
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() })
      // Invalidate date-specific query
      if (newJournal.date) {
        queryClient.invalidateQueries({ queryKey: journalKeys.byDate(newJournal.date) })
      }
    },
  })
}

/**
 * Update existing journal
 */
export function useUpdateJournal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ journalId, input }: { journalId: string; input: UpdateJournalInput }) =>
      updateJournal(journalId, input),
    onMutate: async ({ journalId, input }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: journalKeys.detail(journalId) })

      const previousJournal = queryClient.getQueryData<Journal>(journalKeys.detail(journalId))

      if (previousJournal) {
        queryClient.setQueryData<Journal>(journalKeys.detail(journalId), {
          ...previousJournal,
          ...input,
        })
      }

      return { previousJournal }
    },
    onError: (_err, { journalId }, context) => {
      // Rollback on error
      if (context?.previousJournal) {
        queryClient.setQueryData(journalKeys.detail(journalId), context.previousJournal)
      }
    },
    onSettled: (_data, _error, { journalId }) => {
      const journal = queryClient.getQueryData<Journal>(journalKeys.detail(journalId))
      queryClient.invalidateQueries({ queryKey: journalKeys.all })
      if (journal?.date) {
        queryClient.invalidateQueries({ queryKey: journalKeys.byDate(journal.date) })
      }
    },
  })
}

/**
 * Delete journal
 */
export function useDeleteJournal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (journalId: string) => deleteJournal(journalId),
    onSuccess: (_data, journalId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: journalKeys.detail(journalId) })
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() })
    },
  })
}
