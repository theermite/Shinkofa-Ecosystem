/**
 * Maintenance Banner Component
 * Displays a warning banner when maintenance mode is active
 */

'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface MaintenanceStatus {
  maintenance_mode: boolean
  message: string | null
  started_at: string | null
}

export function MaintenanceBanner() {
  const [status, setStatus] = useState<MaintenanceStatus | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check maintenance status on mount and every 30 seconds
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/system/maintenance')
        if (response.ok) {
          const data = await response.json()
          setStatus(data)
          // Reset dismissed state if maintenance mode changes
          if (data.maintenance_mode) {
            setDismissed(false)
          }
        }
      } catch (error) {
        console.error('Failed to check maintenance status:', error)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Don't show if no status, not in maintenance, or dismissed
  if (!status || !status.maintenance_mode || dismissed) {
    return null
  }

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-3 relative z-[100]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            {status.message || 'Maintenance en cours. Certains services peuvent etre temporairement indisponibles.'}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-amber-600/20 rounded transition-colors shrink-0"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
