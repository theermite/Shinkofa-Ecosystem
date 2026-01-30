/**
 * ShizenEnrichButton Component
 * Button to enrich holistic profile sections using Shizen AI
 * With tier-based restrictions
 */

'use client'

import { useState } from 'react'
import { Link } from '@/i18n/routing'
import { useAuth } from '@/contexts/AuthContext'
import { getAccessToken } from '@/contexts/AuthContext'
import type { SubscriptionTier } from '@/types/auth'

interface ShizenEnrichButtonProps {
  sectionId: string
  sectionLabel: string
  profileId: string
  onEnrichmentComplete?: () => void
}

// Tiers that can use Shizen enrichment
const ALLOWED_TIERS: SubscriptionTier[] = ['samurai', 'samurai_famille', 'sensei', 'sensei_famille', 'founder']

export function ShizenEnrichButton({
  sectionId,
  sectionLabel,
  profileId,
  onEnrichmentComplete,
}: ShizenEnrichButtonProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userTier = (user?.subscription?.tier || 'musha') as SubscriptionTier
  const canUseEnrichment = ALLOWED_TIERS.includes(userTier)

  const apiUrl = process.env.NEXT_PUBLIC_API_SHIZEN_URL || 'https://app.shinkofa.com/api'

  const handleEnrich = async () => {
    if (!canUseEnrichment || !user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const token = getAccessToken()
      if (!token) {
        setError('Session expirée. Veuillez vous reconnecter.')
        return
      }

      const response = await fetch(`${apiUrl}/shizen/enrich-profile-section`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          profile_id: profileId,
          section: sectionId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Échec de l\'enrichissement')
      }

      onEnrichmentComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enrichissement')
    } finally {
      setIsLoading(false)
    }
  }

  // Not allowed tier - show upgrade prompt
  if (!canUseEnrichment) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="text-gray-400 dark:text-gray-500 text-sm">
          🤖 Enrichissement IA
        </span>
        <Link
          href="/pricing"
          className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-sm hover:shadow-md"
        >
          ⬆️ Passer à Samurai
        </Link>
      </div>
    )
  }

  // Allowed tier - show enrich button
  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        onClick={handleEnrich}
        disabled={isLoading}
        className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm font-semibold rounded-lg hover:from-green-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Enrichissement...
          </>
        ) : (
          <>
            🤖 Enrichir avec Shizen
          </>
        )}
      </button>
      {error && (
        <span className="text-red-500 text-xs">{error}</span>
      )}
    </div>
  )
}
