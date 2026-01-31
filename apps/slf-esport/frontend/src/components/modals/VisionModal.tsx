/**
 * VisionModal - Modal component for detailed vision sections
 * Used in Landing Page to display expanded vision details
 */

import { useEffect } from 'react'
import { Button } from '@/components/ui'

interface VisionModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon: string
  description: string
  methods: string[]
  details?: string[]
}

export default function VisionModal({
  isOpen,
  onClose,
  title,
  icon,
  description,
  methods,
  details,
}: VisionModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
          <div
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-strong max-w-3xl w-full animate-slide-up"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Content */}
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="text-7xl mb-4">{icon}</div>
                <h2
                  id="modal-title"
                  className="text-3xl sm:text-4xl font-bold text-primary-900 dark:text-white mb-4"
                >
                  {title}
                </h2>
              </div>

              {/* Description */}
              <div className="mb-8">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>

              {/* Details (if provided) */}
              {details && details.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-4">
                    En détail
                  </h3>
                  <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                    {details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-600 dark:text-primary-400 mr-3 mt-1">
                          •
                        </span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Methods */}
              <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-4">
                  Méthodes & Outils
                </h3>
                <ul className="space-y-3">
                  {methods.map((method, index) => (
                    <li
                      key={index}
                      className="flex items-start text-gray-700 dark:text-gray-300"
                    >
                      <span className="text-primary-600 dark:text-primary-400 mr-3">✓</span>
                      <span>{method}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Close button */}
              <div className="mt-8 text-center">
                <Button variant="primary" onClick={onClose} size="lg">
                  Compris !
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
