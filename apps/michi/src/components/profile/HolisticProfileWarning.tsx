'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

const STORAGE_KEY = 'shinkofa_holistic_profile_warning_seen'

export function HolisticProfileWarning() {
  const t = useTranslations('holisticProfileWarning')
  const [isOpen, setIsOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    // Check if user has already seen this warning
    const hasSeenWarning = localStorage.getItem(STORAGE_KEY)
    if (!hasSeenWarning) {
      // Show warning after short delay for better UX
      setTimeout(() => setIsOpen(true), 1000)
    }
  }, [])

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-full transition flex-shrink-0"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line">
              {t('message')}
            </p>
          </div>

          {/* Checkbox - Don't show again */}
          <div className="mt-6 flex items-center gap-3">
            <input
              type="checkbox"
              id="dont-show-again"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-5 h-5 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            />
            <label
              htmlFor="dont-show-again"
              className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
            >
              {t('dontShowAgain')}
            </label>
          </div>

          {/* CTA Button */}
          <div className="mt-8">
            <button
              onClick={handleClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {t('understood')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
