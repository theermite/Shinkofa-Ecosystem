/**
 * useUsageStats Hook - Fetch usage statistics from API
 * Shinkofa Platform - Frontend
 */

'use client'

import { useEffect, useState } from 'react'
import { getAccessToken } from '@/contexts/AuthContext'

interface ShizenUsage {
  current: number
  limit: number | null
  remaining: number | null
  tier: string
}

interface UsageStats {
  shizenMessages: {
    current: number
    limit: number | null
  } | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export function useUsageStats(): UsageStats {
  const [shizenMessages, setShinzenMessages] = useState<{ current: number; limit: number | null } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsageStats = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = getAccessToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      // Fetch Shizen usage
      const shizenRes = await fetch(`${API_URL}/shizen/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (shizenRes.ok) {
        const data: ShizenUsage = await shizenRes.json()
        setShinzenMessages({
          current: data.current,
          limit: data.limit,
        })
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Failed to fetch usage stats:', err)
      setError('Failed to fetch usage stats')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsageStats()
  }, [])

  return {
    shizenMessages,
    isLoading,
    error,
    refetch: fetchUsageStats,
  }
}
