'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useMessages } from '@/hooks/api/useConversations'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
  tools_used?: Array<{ tool: string; input: unknown }>
  model?: string
}

interface ShizenChatProps {
  conversationId: string | null
  userId: string
  onNewMessage?: () => void // Callback when a new message is sent/received
}

export default function ShizenChat({
  conversationId,
  userId,
  onNewMessage,
}: ShizenChatProps) {
  const t = useTranslations('shizenChat')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load message history from API
  const { data: historyMessages, isLoading: isLoadingHistory } = useMessages(
    conversationId,
    { limit: 50 }
  )

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Load history when available
  useEffect(() => {
    if (historyMessages && historyMessages.length > 0) {
      const formattedMessages: ChatMessage[] = historyMessages.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: msg.created_at,
        tools_used: msg.meta?.tools_used?.map((tool) => ({
          tool,
          input: {},
        })),
        model: msg.meta?.model,
      }))
      setMessages(formattedMessages)
    } else {
      setMessages([])
    }
  }, [historyMessages])

  // WebSocket connection
  useEffect(() => {
    if (!conversationId) {
      setIsConnected(false)
      return
    }

    const wsBaseUrl =
      process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001/ws'
    const wsUrl = `${wsBaseUrl}/${conversationId}`

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setIsConnected(true)
      // Only add system message if no history loaded
      if (!historyMessages || historyMessages.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'system',
            content: `🌟 ${t('connectionEstablished')}`,
            timestamp: new Date().toISOString(),
          },
        ])
      }
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.error) {
          console.error('Error from server:', data.error)
          setMessages((prev) => [
            ...prev,
            {
              role: 'system',
              content: t('error', { message: data.error }),
              timestamp: new Date().toISOString(),
            },
          ])
          setIsLoading(false)
          return
        }

        // Add assistant message
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.message,
            timestamp: data.timestamp,
            tools_used: data.tools_used,
            model: data.model,
          },
        ])

        setIsLoading(false)
        onNewMessage?.()
      } catch (error) {
        console.error('Failed to parse message:', error)
        setIsLoading(false)
      }
    }

    ws.onerror = () => {
      setIsConnected(false)
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          content: `❌ ${t('connectionError')}`,
          timestamp: new Date().toISOString(),
        },
      ])
    }

    ws.onclose = () => {
      setIsConnected(false)
    }

    wsRef.current = ws

    // Cleanup
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [conversationId, t, historyMessages, onNewMessage])

  // Send message
  const sendMessage = () => {
    if (!inputMessage.trim() || !isConnected || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    }

    // Add user message to UI
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Send to WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          message: inputMessage,
          user_id: userId,
        })
      )
    }

    setInputMessage('')
    onNewMessage?.()
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // No conversation selected state
  if (!conversationId) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-6xl mb-4">🌟</div>
        <p className="text-lg">{t('selectOrCreate')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Connection status bar */}
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {isConnected ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-green-600 dark:text-green-400">
                {t('connected')}
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-red-600 dark:text-red-400">
                {t('disconnected')}
              </span>
            </>
          )}
        </div>
        {isLoadingHistory && (
          <span className="text-xs text-gray-500">{t('loadingHistory')}</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 shadow-md ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.role === 'assistant'
                  ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-purple-200 dark:border-purple-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/30 text-gray-700 dark:text-gray-300 border border-yellow-300 dark:border-yellow-700'
              }`}
            >
              {/* Message content */}
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Metadata (for assistant messages) */}
              {msg.role === 'assistant' &&
                msg.tools_used &&
                msg.tools_used.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-purple-100 dark:border-purple-800 text-xs text-gray-500 dark:text-gray-400">
                    <p className="font-semibold mb-1">🔧 {t('toolsUsed')}</p>
                    <ul className="list-disc list-inside space-y-1">
                      {msg.tools_used.map((tool, i) => (
                        <li key={i}>{tool.tool}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Timestamp */}
              {msg.timestamp && (
                <div className="text-xs mt-2 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <span className="ml-2">{t('thinking')}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('placeholder')}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            rows={2}
            disabled={!isConnected || isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !isConnected || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {t('send')}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          💡 {t('enterToSend', { key: 'Enter' })}
        </p>
      </div>
    </div>
  )
}
