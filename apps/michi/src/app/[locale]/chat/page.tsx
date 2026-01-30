'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import ShizenChat from '@/components/ShizenChat'
import ConversationSidebar from '@/components/ConversationSidebar'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import {
  useConversations,
  useCreateConversation,
} from '@/hooks/api/useConversations'
import type { Conversation } from '@/types/api'

function ChatPageContent() {
  const { user } = useAuth()
  const t = useTranslations('shizenChat')
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const userId = user?.id || ''

  // Fetch conversations
  const { data: conversations, isLoading: isLoadingConversations } =
    useConversations({ status_filter: 'active', limit: 50 })

  // Create conversation mutation
  const createMutation = useCreateConversation()

  // Auto-select most recent conversation or create new one on first load
  useEffect(() => {
    if (!isLoadingConversations && conversations && !selectedConversation) {
      if (conversations.length > 0) {
        // Select most recent conversation
        setSelectedConversation(conversations[0])
      }
      // If no conversations exist, user can create one via sidebar
    }
  }, [conversations, isLoadingConversations, selectedConversation])

  // Handle selecting a conversation
  const handleSelectConversation = useCallback((conv: Conversation) => {
    setSelectedConversation(conv)
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  // Handle new conversation created
  const handleNewConversation = useCallback((conv: Conversation) => {
    setSelectedConversation(conv)
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  // Refetch conversations when a new message is sent/received
  const handleNewMessage = useCallback(() => {
    // The React Query cache will be invalidated via the hook
  }, [])

  // Toggle sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  // Loading state
  if (isLoadingConversations) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t('loadingHistory')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar toggle button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-purple-600 text-white rounded-lg shadow-lg"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <div
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:relative
          z-40
          w-80
          h-full
          transition-transform duration-300 ease-in-out
        `}
      >
        <ConversationSidebar
          selectedId={selectedConversation?.id || null}
          onSelect={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="md:hidden p-1 hover:bg-white/20 rounded"
            >
              ☰
            </button>
            <h1 className="text-xl font-bold">🌟 {t('title')}</h1>
          </div>
          {selectedConversation && (
            <span className="text-sm opacity-80 truncate max-w-[200px]">
              {selectedConversation.title}
            </span>
          )}
        </header>

        {/* Chat component */}
        <div className="flex-1 overflow-hidden">
          <ShizenChat
            conversationId={selectedConversation?.id || null}
            userId={userId}
            onNewMessage={handleNewMessage}
          />
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatPageContent />
    </ProtectedRoute>
  )
}
