/**
 * LocalStorageNotice - Notification pour les widgets en mode localStorage
 * Shinkofa Platform
 */

'use client'

import { useState, useEffect } from 'react'
import { HardDrive, X } from 'lucide-react'

const DISMISSED_KEY = 'shinkofa_localStorage_notice_dismissed'

export function LocalStorageNotice() {
  const [dismissed, setDismissed] = useState(true) // Start hidden to prevent flash

  useEffect(() => {
    // Check if already dismissed
    const wasDismissed = localStorage.getItem(DISMISSED_KEY)
    if (!wasDismissed) {
      setDismissed(false)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mx-4 mt-4">
      <div className="flex items-start gap-3">
        <HardDrive size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-amber-200">
            <strong>Mode local</strong> : Vos données sont sauvegardées dans votre navigateur.
            La synchronisation cloud arrive bientôt.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-amber-500/70 hover:text-amber-500 transition-colors flex-shrink-0"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
