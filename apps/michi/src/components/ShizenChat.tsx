'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
  tools_used?: Array<{ tool: string; input: any }>
  model?: string
}

interface ShizenChatProps {
  conversationId: string
  userId: string
}

export default function ShizenChat({ conversationId, userId }: ShizenChatProps) {
  const t = useTranslations('shizenChat')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // WebSocket connection
  useEffect(() => {
    const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001/ws'
    const wsUrl = `${wsBaseUrl}/${conversationId}`

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setIsConnected(true)

      // Add system message
      setMessages(prev => [...prev, {
        role: 'system',
        content: `🌟 ${t('connectionEstablished')}`,
        timestamp: new Date().toISOString()
      }])
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.error) {
          console.error('❌ Error from server:', data.error)
          setMessages(prev => [...prev, {
            role: 'system',
            content: t('error', { message: data.error }),
            timestamp: new Date().toISOString()
          }])
          return
        }

        // Add assistant message
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          timestamp: data.timestamp,
          tools_used: data.tools_used,
          model: data.model
        }])

        setIsLoading(false)
      } catch (error) {
        console.error('❌ Failed to parse message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
      setIsConnected(false)
      setMessages(prev => [...prev, {
        role: 'system',
        content: `❌ ${t('connectionError')}`,
        timestamp: new Date().toISOString()
      }])
    }

    ws.onclose = () => {
      setIsConnected(false)
      setMessages(prev => [...prev, {
        role: 'system',
        content: `🔌 ${t('connectionClosed')}`,
        timestamp: new Date().toISOString()
      }])
    }

    wsRef.current = ws

    // Cleanup
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [conversationId])

  // Send message
  const sendMessage = () => {
    if (!inputMessage.trim() || !isConnected || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    // Add user message to UI
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Send to WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        message: inputMessage,
        user_id: userId
      }))
    }

    setInputMessage('')
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg shadow-lg">
        <h1 className="text-2xl font-bold">🌟 {t('title')}</h1>
        <p className="text-sm mt-2 opacity-90">
          {isConnected ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {t('connected')}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              {t('disconnected')}
            </span>
          )}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-4 shadow-md ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.role === 'assistant'
                  ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-purple-200 dark:border-purple-700'
                  : 'bg-yellow-50 dark:bg-yellow-900/30 text-gray-700 dark:text-gray-300 border border-yellow-300 dark:border-yellow-700'
              }`}
            >
              {/* Message content */}
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Metadata (for assistant messages) */}
              {msg.role === 'assistant' && msg.tools_used && msg.tools_used.length > 0 && (
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
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce delay-200"></div>
                <span className="ml-2">{t('thinking')}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 rounded-b-lg shadow-lg">
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
