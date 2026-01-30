'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import ShizenChat from '@/components/ShizenChat'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function ChatPageContent() {
  const { user } = useAuth()
  const t = useTranslations('chat')
  const locale = useLocale()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id || ''

  // Create conversation on mount
  useEffect(() => {
    if (userId) {
      createConversation()
    }
  }, [userId])

  const createConversation = async () => {
    setIsCreating(true)
    setError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_SHIZEN_URL || 'https://localhost:8001/api'
      const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US'
      const response = await fetch(`${apiUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({
          title: `${t('conversationTitle')} ${new Date().toLocaleDateString(dateLocale)}`
        })
      })

      if (!response.ok) {
        throw new Error(`${t('errorHttp')}: ${response.status}`)
      }

      const data = await response.json()
      setConversationId(data.id)
    } catch (err) {
      console.error('❌ Erreur création conversation:', err)
      setError(t('errorCreating'))
    } finally {
      setIsCreating(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">❌ {t('errorTitle')}</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={createConversation}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    )
  }

  if (isCreating || !conversationId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">{t('initializing')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <ShizenChat conversationId={conversationId} userId={userId} />
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
