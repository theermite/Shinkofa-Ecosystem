'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { OnboardingTour } from './OnboardingTour'

/**
 * OnboardingButton Component
 *
 * Bouton pour relancer manuellement le guide d'onboarding
 * À placer dans le header ou menu de navigation
 */
export function OnboardingButton() {
  const [showTour, setShowTour] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowTour(true)}
        className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
        title="Relancer le guide d'utilisation"
      >
        <HelpCircle size={24} />
      </button>

      {showTour && (
        <OnboardingTour
          forceShow
          onComplete={() => setShowTour(false)}
        />
      )}
    </>
  )
}
