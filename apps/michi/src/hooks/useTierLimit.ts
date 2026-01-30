/**
 * useTierLimit Hook
 * Shinkofa Platform - Frontend
 *
 * Hook to handle tier limit errors (403) and show upgrade prompts
 */

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AxiosError } from 'axios'
import { isTierLimitError, getTierLimitMessage, TierLimitError } from '@/types/tier'
import { useToast } from '@/contexts/ToastContext'

interface UseTierLimitReturn {
  /**
   * Handle an API error and show upgrade prompt if it's a tier limit error
   * Returns true if it was a tier limit error, false otherwise
   */
  handleTierError: (error: unknown) => boolean

  /**
   * Show upgrade prompt for a specific tier limit error
   */
  showUpgradePrompt: (error: TierLimitError) => void
}

/**
 * Hook for handling tier limit errors
 */
export function useTierLimit(): UseTierLimitReturn {
  const router = useRouter()
  const { error: showError } = useToast()

  const showUpgradePrompt = useCallback((tierError: TierLimitError) => {
    const message = getTierLimitMessage(tierError)

    showError(message, {
      duration: 8000,
      action: {
        label: 'Voir les plans',
        onClick: () => router.push('/pricing'),
      },
    })
  }, [router, showError])

  const handleTierError = useCallback((error: unknown): boolean => {
    // Check if this is an Axios error with a 403 response
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 403) {
        const data = axiosError.response.data
        if (isTierLimitError(data)) {
          showUpgradePrompt(data)
          return true
        }
      }
    }

    return false
  }, [showUpgradePrompt])

  return {
    handleTierError,
    showUpgradePrompt,
  }
}
