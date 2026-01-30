/**
 * Super Admin Context
 * Shinkofa Platform - Super admin debugging and testing features
 */

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth, getAccessToken } from './AuthContext'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface SuperAdminSession {
  id: string
  user_id: string
  is_active: boolean
  simulated_plan: 'free' | 'samourai' | 'sensei' | null
  impersonated_user_id: string | null
  simulated_date: string | null
  feature_flags: Record<string, boolean>
  questionnaire_all_optional: boolean
  last_activated_at: string | null
  created_at: string
  updated_at: string
}

interface SuperAdminContextType {
  session: SuperAdminSession | null
  isLoading: boolean
  isActive: boolean
  isSuperAdmin: boolean

  // Actions
  toggleMode: (active: boolean) => Promise<void>
  simulatePlan: (plan: 'free' | 'samourai' | 'sensei' | null) => Promise<void>
  setQuestionnaireOptional: (optional: boolean) => Promise<void>
  updateFeatureFlags: (flags: Record<string, boolean>) => Promise<void>

  // UI State
  isPanelOpen: boolean
  setPanelOpen: (open: boolean) => void
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined)

const API_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://app.shinkofa.com/api'
const SUPER_ADMIN_PREFIX = '/auth/super-admin'

export function SuperAdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [session, setSession] = useState<SuperAdminSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPanelOpen, setPanelOpen] = useState(false)

  const isSuperAdmin = user?.is_super_admin === true
  const isActive = session?.is_active === true

  // Load super admin session on mount
  useEffect(() => {
    if (isSuperAdmin) {
      loadSession()
    } else {
      setIsLoading(false)
    }
  }, [isSuperAdmin])

  async function loadSession() {
    if (!isSuperAdmin || typeof window === 'undefined') return

    try {
      const token = getAccessToken()
      if (!token) return

      const response = await fetch(`${API_BASE}${SUPER_ADMIN_PREFIX}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data)
      }
    } catch (error) {
      console.error('Failed to load super admin session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleMode(active: boolean) {
    if (!isSuperAdmin) return

    try {
      const token = getAccessToken()
      if (!token) return

      const response = await fetch(`${API_BASE}${SUPER_ADMIN_PREFIX}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: active }),
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data)
      }
    } catch (error) {
      console.error('Failed to toggle super admin mode:', error)
    }
  }

  async function simulatePlan(plan: 'free' | 'samourai' | 'sensei' | null) {
    if (!isSuperAdmin || !isActive) return

    try {
      const token = getAccessToken()
      if (!token) return

      const response = await fetch(`${API_BASE}${SUPER_ADMIN_PREFIX}/simulate-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data)
      }
    } catch (error) {
      console.error('Failed to simulate plan:', error)
    }
  }

  async function setQuestionnaireOptional(optional: boolean) {
    if (!isSuperAdmin || !isActive) return

    try {
      const token = getAccessToken()
      if (!token) return

      const response = await fetch(`${API_BASE}${SUPER_ADMIN_PREFIX}/questionnaire-overrides`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ all_optional: optional }),
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data)
      }
    } catch (error) {
      console.error('Failed to set questionnaire optional:', error)
    }
  }

  async function updateFeatureFlags(flags: Record<string, boolean>) {
    if (!isSuperAdmin || !isActive) return

    try {
      const token = getAccessToken()
      if (!token) return

      const response = await fetch(`${API_BASE}${SUPER_ADMIN_PREFIX}/feature-flags`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feature_flags: flags }),
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data)
      }
    } catch (error) {
      console.error('Failed to update feature flags:', error)
    }
  }

  return (
    <SuperAdminContext.Provider
      value={{
        session,
        isLoading,
        isActive,
        isSuperAdmin,
        toggleMode,
        simulatePlan,
        setQuestionnaireOptional,
        updateFeatureFlags,
        isPanelOpen,
        setPanelOpen,
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  )
}

export function useSuperAdmin() {
  const context = useContext(SuperAdminContext)
  if (context === undefined) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider')
  }
  return context
}
