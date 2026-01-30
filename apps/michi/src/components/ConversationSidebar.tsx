'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  useConversations,
  useCreateConversation,
  useArchiveConversation,
  useUpdateConversation,
} from '@/hooks/api/useConversations'
import type { Conversation } from '@/types/api'

interface ConversationSidebarProps {
  selectedId: string | null
  onSelect: (conversation: Conversation) => void
  onNewConversation: (conversation: Conversation) => void
}

export default function ConversationSidebar({
  selectedId,
  onSelect,
  onNewConversation,
}: ConversationSidebarProps) {
  const t = useTranslations('shizenChat')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  // Fetch conversations
  const {
    data: conversations,
    isLoading,
    error,
  } = useConversations({ status_filter: 'active', limit: 50 })

  // Mutations
  const createMutation = useCreateConversation()
  const archiveMutation = useArchiveConversation()
  const updateMutation = useUpdateConversation()

  // Create new conversation
  const handleNewConversation = async () => {
    try {
      const newConversation = await createMutation.mutateAsync({
        title: `${t('newConversation')} ${new Date().toLocaleDateString('fr-FR')}`,
      })
      onNewConversation(newConversation)
    } catch (err) {
      console.error('Failed to create conversation:', err)
    }
  }

  // Delete (archive) conversation
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(t('confirmDelete'))) return

    try {
      await archiveMutation.mutateAsync(id)
    } catch (err) {
      console.error('Failed to archive conversation:', err)
    }
  }

  // Start editing title
  const handleStartEdit = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(conv.id)
    setEditTitle(conv.title)
  }

  // Save edited title
  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      setEditingId(null)
      return
    }

    try {
      await updateMutation.mutateAsync({
        conversationId: id,
        input: { title: editTitle.trim() },
      })
      setEditingId(null)
    } catch (err) {
      console.error('Failed to update conversation:', err)
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else if (diffDays === 1) {
      return t('yesterday')
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
      })
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            🌟 Shizen
          </h2>
        </div>
        <button
          onClick={handleNewConversation}
          disabled={createMutation.isPending}
          className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {createMutation.isPending ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <span>+</span>
          )}
          {t('newConversation')}
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500 dark:text-red-400">
            {t('loadError')}
          </div>
        ) : conversations && conversations.length > 0 ? (
          <ul className="py-2">
            {conversations.map((conv) => (
              <li key={conv.id}>
                {editingId === conv.id ? (
                  // Edit mode
                  <div className="px-3 py-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(conv.id)
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                      className="w-full px-2 py-1 text-sm border border-purple-400 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-gray-100"
                      autoFocus
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => handleSaveEdit(conv.id)}
                        className="flex-1 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        {t('save')}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <button
                    onClick={() => onSelect(conv)}
                    className={`w-full px-3 py-3 text-left transition-colors group ${
                      selectedId === conv.id
                        ? 'bg-purple-100 dark:bg-purple-900/40 border-l-4 border-purple-600'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            selectedId === conv.id
                              ? 'text-purple-700 dark:text-purple-300'
                              : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {conv.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(conv.last_message_at)}
                          {conv.meta?.total_messages !== undefined && (
                            <span className="ml-2">
                              · {conv.meta.total_messages} msg
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Action buttons (visible on hover) */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleStartEdit(conv, e)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title={t('rename')}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => handleDelete(conv.id, e)}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title={t('delete')}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <p className="text-4xl mb-2">💬</p>
            <p>{t('noConversations')}</p>
          </div>
        )}
      </div>

      {/* Footer with message count hint */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
        {conversations && conversations.length > 0 && (
          <p>{conversations.length} {t('conversationsCount')}</p>
        )}
      </div>
    </div>
  )
}
