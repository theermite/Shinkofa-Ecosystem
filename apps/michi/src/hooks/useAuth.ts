/**
 * useAuth Hook - Authentication and User Initialization
 * Shinkofa Platform - Frontend
 * FIXED: Now uses real JWT authentication from AuthContext
 */

'use client'

import { useEffect, useState } from 'react'
import { decodeToken } from '@/lib/api/auth'

const TOKEN_KEY = 'shinkofa_access_token'
const DEFAULT_USER_ID = 'test-user-123' // Fallback for dev

/**
 * Get userId from JWT token or localStorage
 * Priority: JWT token (sessionStorage OR localStorage) > localStorage userId > fallback
 */
function extractUserId(): string | null {
  if (typeof window === 'undefined') return null

  // 1. Try to get userId from JWT token (production auth)
  // Check BOTH sessionStorage and localStorage (AuthContext uses sessionStorage if rememberMe=false)
  const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
  if (token) {
    const decoded = decodeToken(token)
    if (decoded && decoded.sub) {
      return decoded.sub
    }
  }

  // 2. Fallback to localStorage userId (dev mode)
  const storedUserId = localStorage.getItem('userId')
  if (storedUserId) {
    return storedUserId
  }

  // 3. Last resort: default test user
  return DEFAULT_USER_ID
}

/**
 * Initialize userId - supports both JWT auth and dev mode
 * Returns true when userId is ready
 */
export function useAuth() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [userId, setUserIdState] = useState<string | null>(null)

  useEffect(() => {
    const extractedUserId = extractUserId()

    // Store in localStorage for backward compatibility
    if (extractedUserId) {
      localStorage.setItem('userId', extractedUserId)
      setUserIdState(extractedUserId)
    } else {
      localStorage.setItem('userId', DEFAULT_USER_ID)
      setUserIdState(DEFAULT_USER_ID)
    }

    setIsInitialized(true)
  }, [])

  return {
    isInitialized,
    userId,
  }
}

/**
 * Get current userId (synchronous)
 * Tries JWT token first, then localStorage, then fallback
 */
export function getUserId(): string | null {
  return extractUserId()
}

/**
 * Set userId in localStorage
 */
export function setUserId(userId: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('userId', userId)
}

/**
 * Clear userId from localStorage (logout)
 */
export function clearUserId() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('userId')
}

/**
 * Get current JWT token from sessionStorage or localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
}
