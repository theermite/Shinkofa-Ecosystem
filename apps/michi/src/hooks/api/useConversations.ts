/**
 * useConversations Hook - TanStack Query hooks for Shizen Conversations
 * Shinkofa Platform - Frontend
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Conversation,
  Message,
  CreateConversationInput,
  UpdateConversationInput,
  ConversationFilters,
  MessageFilters,
} from '@/types/api'
import {
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  archiveConversation,
  getMessages,
} from '@/lib/api/conversations'

// ==================
// QUERY KEYS
// ==================

export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters?: ConversationFilters) =>
    [...conversationKeys.lists(), filters] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  messages: (id: string) => [...conversationKeys.all, 'messages', id] as const,
  messageList: (id: string, filters?: MessageFilters) =>
    [...conversationKeys.messages(id), filters] as const,
}

// ==================
// QUERIES
// ==================

/**
 * Get all conversations (with optional filters)
 */
export function useConversations(filters?: ConversationFilters) {
  return useQuery({
    queryKey: conversationKeys.list(filters),
    queryFn: () => getConversations(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes (conversations change more frequently)
  })
}

/**
 * Get single conversation by ID
 */
export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: conversationKeys.detail(conversationId || ''),
    queryFn: () => getConversation(conversationId!),
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get messages for a conversation
 */
export function useMessages(
  conversationId: string | null,
  filters?: MessageFilters
) {
  return useQuery({
    queryKey: conversationKeys.messageList(conversationId || '', filters),
    queryFn: () => getMessages(conversationId!, filters),
    enabled: !!conversationId,
    staleTime: 30 * 1000, // 30 seconds (messages change frequently during chat)
  })
}

// ==================
// MUTATIONS
// ==================

/**
 * Create new conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input?: CreateConversationInput) => createConversation(input),
    onSuccess: (newConversation) => {
      // Invalidate conversation list to refetch
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() })

      // Optionally pre-populate the cache with the new conversation
      queryClient.setQueryData(
        conversationKeys.detail(newConversation.id),
        newConversation
      )
    },
  })
}

/**
 * Update existing conversation
 */
export function useUpdateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conversationId,
      input,
    }: {
      conversationId: string
      input: UpdateConversationInput
    }) => updateConversation(conversationId, input),
    onMutate: async ({ conversationId, input }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: conversationKeys.detail(conversationId),
      })

      // Snapshot previous value
      const previousConversation = queryClient.getQueryData<Conversation>(
        conversationKeys.detail(conversationId)
      )

      // Optimistically update
      if (previousConversation) {
        queryClient.setQueryData<Conversation>(
          conversationKeys.detail(conversationId),
          {
            ...previousConversation,
            ...input,
          }
        )
      }

      return { previousConversation }
    },
    onError: (_err, { conversationId }, context) => {
      // Rollback on error
      if (context?.previousConversation) {
        queryClient.setQueryData(
          conversationKeys.detail(conversationId),
          context.previousConversation
        )
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: conversationKeys.all })
    },
  })
}

/**
 * Archive (soft delete) conversation
 */
export function useArchiveConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: archiveConversation,
    onSuccess: () => {
      // Invalidate all conversation queries
      queryClient.invalidateQueries({ queryKey: conversationKeys.all })
    },
  })
}

/**
 * Invalidate messages for a conversation (call after sending a message via WebSocket)
 */
export function useInvalidateMessages() {
  const queryClient = useQueryClient()

  return (conversationId: string) => {
    queryClient.invalidateQueries({
      queryKey: conversationKeys.messages(conversationId),
    })
  }
}
