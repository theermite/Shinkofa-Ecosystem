'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from 'next-intl'

interface OnboardingStep {
  id: number
  target?: string // CSS selector for highlighting
  image?: string
}

interface OnboardingTourProps {
  onComplete?: () => void
  forceShow?: boolean
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 },
  { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 },
  { id: 11 }, { id: 12 }, { id: 13 }, { id: 14 }, { id: 15 },
]

export function OnboardingTour({ onComplete, forceShow = false }: OnboardingTourProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const t = useTranslations('onboarding')
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Only show onboarding if user is authenticated
    if (isLoading || !isAuthenticated) {
      setIsOpen(false)
      return
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('shinkofa_onboarding_completed')

    if (!hasCompletedOnboarding || forceShow) {
      setIsOpen(true)
    }
  }, [forceShow, isAuthenticated, isLoading])

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('shinkofa_onboarding_completed', 'true')
    setIsOpen(false)
    onComplete?.()
  }

  const handleComplete = () => {
    localStorage.setItem('shinkofa_onboarding_completed', 'true')
    setIsOpen(false)
    onComplete?.()
  }

  if (!isOpen) return null

  const step = ONBOARDING_STEPS[currentStep]
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full my-auto flex flex-col overflow-hidden max-h-[90vh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{t(`step${step.id}.title`)}</h2>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs mt-2 opacity-90">
            {t('progress', { current: currentStep + 1, total: ONBOARDING_STEPS.length })}
          </p>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line">
            {t(`step${step.id}.description`)}
          </p>

          {/* Image (if provided) */}
          {step.image && (
            <div className="mt-6">
              <img
                src={step.image}
                alt={t(`step${step.id}.title`)}
                className="w-full rounded-lg shadow-md"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-2xl flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Previous button */}
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              <span>{t('previous')}</span>
            </button>

            {/* Skip button */}
            {currentStep < ONBOARDING_STEPS.length - 1 && (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition"
              >
                {t('skip')}
              </button>
            )}

            {/* Next/Finish button */}
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition flex items-center gap-2 shadow-lg"
            >
              <span>
                {currentStep === ONBOARDING_STEPS.length - 1 ? t('finish') : t('next')}
              </span>
              {currentStep < ONBOARDING_STEPS.length - 1 && <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
