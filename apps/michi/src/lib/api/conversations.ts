/**
 * Conversations API - Shizen Chat CRUD operations
 * Shinkofa Platform - Frontend
 */

import type {
  Conversation,
  Message,
  CreateConversationInput,
  UpdateConversationInput,
  ConversationFilters,
  MessageFilters,
} from '@/types/api'
import apiClient from './client'

const CONVERSATIONS_ENDPOINT = '/shizen/conversations'

/**
 * Get all conversations for current user
 */
export async function getConversations(
  filters?: ConversationFilters
): Promise<Conversation[]> {
  const params = new URLSearchParams()

  if (filters?.status_filter) {
    params.append('status_filter', filters.status_filter)
  }
  if (filters?.limit !== undefined) {
    params.append('limit', String(filters.limit))
  }
  if (filters?.offset !== undefined) {
    params.append('offset', String(filters.offset))
  }

  const url = params.toString()
    ? `${CONVERSATIONS_ENDPOINT}?${params}`
    : CONVERSATIONS_ENDPOINT

  const response = await apiClient.get<Conversation[]>(url)
  return response.data
}

/**
 * Get single conversation by ID
 */
export async function getConversation(
  conversationId: string
): Promise<Conversation> {
  const response = await apiClient.get<Conversation>(
    `${CONVERSATIONS_ENDPOINT}/${conversationId}`
  )
  return response.data
}

/**
 * Create new conversation
 */
export async function createConversation(
  input?: CreateConversationInput
): Promise<Conversation> {
  const response = await apiClient.post<Conversation>(
    CONVERSATIONS_ENDPOINT,
    input || {}
  )
  return response.data
}

/**
 * Update conversation (title, status)
 */
export async function updateConversation(
  conversationId: string,
  input: UpdateConversationInput
): Promise<Conversation> {
  const response = await apiClient.patch<Conversation>(
    `${CONVERSATIONS_ENDPOINT}/${conversationId}`,
    input
  )
  return response.data
}

/**
 * Archive conversation (soft delete)
 */
export async function archiveConversation(
  conversationId: string
): Promise<void> {
  await apiClient.delete(`${CONVERSATIONS_ENDPOINT}/${conversationId}`)
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  filters?: MessageFilters
): Promise<Message[]> {
  const params = new URLSearchParams()

  if (filters?.limit !== undefined) {
    params.append('limit', String(filters.limit))
  }
  if (filters?.offset !== undefined) {
    params.append('offset', String(filters.offset))
  }

  const url = params.toString()
    ? `${CONVERSATIONS_ENDPOINT}/${conversationId}/messages?${params}`
    : `${CONVERSATIONS_ENDPOINT}/${conversationId}/messages`

  const response = await apiClient.get<Message[]>(url)
  return response.data
}
