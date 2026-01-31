/**
 * StaffModal - Modal component for Manager & Coach detailed profiles
 * Used in Landing Page to display expanded staff member information
 */

import { useEffect } from 'react'
import { Button } from '@/components/ui'

interface StaffModalProps {
  isOpen: boolean
  onClose: () => void
  name: string
  role: string
  nickname: string
  photo: string
  fruit: string
  animal: string
  quote: string
  vision?: string
  expertise?: string
  roleInTeam: string
  funFact: string
}

export default function StaffModal({
  isOpen,
  onClose,
  name,
  role,
  nickname,
  photo,
  fruit,
  animal,
  quote,
  vision,
  expertise,
  roleInTeam,
  funFact,
}: StaffModalProps) {
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
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-strong max-w-4xl w-full animate-slide-up"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
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
              {/* Header with Photo */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Photo */}
                <div className="flex-shrink-0">
                  <img
                    src={photo}
                    alt={name}
                    className="w-48 h-48 rounded-xl object-cover shadow-medium mx-auto md:mx-0"
                  />
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <h2
                    id="modal-title"
                    className="text-3xl sm:text-4xl font-bold text-primary-900 dark:text-white mb-2"
                  >
                    {name}
                  </h2>
                  <p className="text-xl text-secondary-600 dark:text-secondary-400 font-semibold mb-2">
                    {role}
                  </p>
                  <p className="text-lg text-gray-600 dark:text-gray-400 italic mb-4">
                    "{nickname}"
                  </p>

                  {/* Totems */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-lg">
                      <span className="text-sm font-medium text-primary-800 dark:text-primary-300">
                        Fruit : {fruit}
                      </span>
                    </div>
                    <div className="bg-secondary-50 dark:bg-secondary-900/20 px-4 py-2 rounded-lg">
                      <span className="text-sm font-medium text-secondary-800 dark:text-secondary-300">
                        Animal : {animal}
                      </span>
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="border-l-4 border-primary-600 pl-4 italic text-gray-700 dark:text-gray-300">
                    "{quote}"
                  </blockquote>
                </div>
              </div>

              {/* Detailed Sections */}
              <div className="space-y-6">
                {/* Vision (Manager only) */}
                {vision && (
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-3 flex items-center">
                      <span className="mr-2">🎯</span> Vision
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{vision}</p>
                  </div>
                )}

                {/* Expertise (Coach only) */}
                {expertise && (
                  <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                      <span className="mr-2">🧠</span> Expertise
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{expertise}</p>
                  </div>
                )}

                {/* Role in Team */}
                <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="mr-2">🎮</span> Rôle dans l'équipe
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">{roleInTeam}</p>
                </div>

                {/* Fun Fact */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-purple-900 dark:text-purple-200 mb-3 flex items-center">
                    <span className="mr-2">✨</span> Fun Fact
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">{funFact}</p>
                </div>
              </div>

              {/* Close button */}
              <div className="mt-8 text-center">
                <Button variant="primary" onClick={onClose} size="lg">
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
