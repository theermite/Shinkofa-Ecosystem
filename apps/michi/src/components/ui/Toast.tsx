/**
 * Toast Component - Discrete notifications
 * Shinkofa Platform - Frontend
 */

'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor =
    type === 'success'
      ? 'bg-green-600 dark:bg-green-500'
      : type === 'error'
        ? 'bg-red-600 dark:bg-red-500'
        : 'bg-blue-600 dark:bg-blue-500'

  const icon =
    type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'

  return (
    <div
      className={`${bgColor} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right-full duration-300`}
      role="alert"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-80 transition-opacity"
        aria-label="Fermer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}
