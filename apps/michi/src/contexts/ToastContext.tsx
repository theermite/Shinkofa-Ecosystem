/**
 * Toast Context - Global notifications
 * Shinkofa Platform - Frontend
 */

'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Toast } from '@/components/ui/Toast'

type ToastType = 'success' | 'error' | 'info'

interface ToastData {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType,
    options?: { duration?: number; action?: { label: string; onClick: () => void } }
  ) => void
  success: (message: string, options?: { duration?: number }) => void
  error: (message: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) => void
  info: (message: string, options?: { duration?: number }) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      options?: { duration?: number; action?: { label: string; onClick: () => void } }
    ) => {
      const id = `toast-${Date.now()}`
      setToasts((prev) => [
        ...prev,
        { id, message, type, duration: options?.duration, action: options?.action },
      ])
    },
    []
  )

  const success = useCallback(
    (message: string, options?: { duration?: number }) => {
      showToast(message, 'success', options)
    },
    [showToast]
  )

  const error = useCallback(
    (message: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) => {
      showToast(message, 'error', options)
    },
    [showToast]
  )

  const info = useCallback(
    (message: string, options?: { duration?: number }) => {
      showToast(message, 'info', options)
    },
    [showToast]
  )

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      {/* Toast container - stacked from bottom */}
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ bottom: `${1.5 + index * 5}rem` }}
          className="fixed right-6 z-50"
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick()
                removeToast(toast.id)
              }}
              className="mt-1 w-full py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      ))}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
