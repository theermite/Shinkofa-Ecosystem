/**
 * Auth Context
 * Shinkofa Platform - Global authentication state
 */

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { User, AuthContextType, LoginCredentials, RegisterData } from '@/types/auth'
import { loginUser, registerUser, refreshAccessToken, getCurrentUser, decodeToken } from '@/lib/api/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'shinkofa_access_token'
const REFRESH_TOKEN_KEY = 'shinkofa_refresh_token'
const REMEMBER_ME_KEY = 'shinkofa_remember_me'

// Helper function to get token from appropriate storage
function getStoredToken(key: string): string | null {
  if (typeof window === 'undefined') return null
  // Check localStorage first (remember me), then sessionStorage
  return localStorage.getItem(key) || sessionStorage.getItem(key)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from token on mount
  useEffect(() => {
    loadUserFromToken()
  }, [])

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!user || typeof window === 'undefined') return

    const token = getStoredToken(TOKEN_KEY)
    if (!token) return

    const decoded = decodeToken(token)
    if (!decoded) return

    // Refresh token 5 minutes before expiry
    const expiresIn = decoded.exp * 1000 - Date.now()
    const refreshTime = Math.max(expiresIn - 5 * 60 * 1000, 0)

    const timeoutId = setTimeout(() => {
      handleRefreshToken()
    }, refreshTime)

    return () => clearTimeout(timeoutId)
  }, [user])

  async function loadUserFromToken() {
    try {
      // Prevent SSR hydration mismatch
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      const token = getStoredToken(TOKEN_KEY)
      if (!token) {
        setIsLoading(false)
        return
      }

      // Check if token expired
      const decoded = decodeToken(token)
      if (!decoded) {
        clearTokens()
        setIsLoading(false)
        return
      }

      if (decoded.exp * 1000 < Date.now()) {
        // Token expired, try refresh
        await handleRefreshToken()
        return
      }

      // Fetch user profile
      const userData = await getCurrentUser(token)
      setUser(userData)
    } catch (error) {
      console.error('Failed to load user:', error)
      clearTokens()
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRefreshToken() {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Cannot refresh token on server')
      }

      const refreshToken = getStoredToken(REFRESH_TOKEN_KEY)
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const tokens = await refreshAccessToken(refreshToken)
      storeTokens(tokens.access_token, tokens.refresh_token)

      // Reload user
      const userData = await getCurrentUser(tokens.access_token)
      setUser(userData)
    } catch (error) {
      console.error('Token refresh failed:', error)
      clearTokens()
      setUser(null)
      router.push('/auth/login')
    }
  }

  async function refreshUser() {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Cannot refresh user on server')
      }

      const token = getStoredToken(TOKEN_KEY)
      if (!token) {
        throw new Error('No access token')
      }

      const userData = await getCurrentUser(token)
      setUser(userData)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      throw error
    }
  }

  async function login(credentials: LoginCredentials, rememberMe: boolean = false) {
    try {
      const tokens = await loginUser(credentials)
      storeTokens(tokens.access_token, tokens.refresh_token, rememberMe)

      const userData = await getCurrentUser(tokens.access_token)
      setUser(userData)

      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async function register(data: RegisterData) {
    try {
      const tokens = await registerUser(data)
      storeTokens(tokens.access_token, tokens.refresh_token)

      const userData = await getCurrentUser(tokens.access_token)
      setUser(userData)

      router.push('/dashboard')
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  function logout() {
    clearTokens()
    setUser(null)
    router.push('/auth/login')
  }

  function storeTokens(accessToken: string, refreshToken: string, rememberMe?: boolean) {
    if (typeof window === 'undefined') return

    // If rememberMe is explicitly set, store the preference
    if (rememberMe !== undefined) {
      localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false')
    }

    // Check stored preference (for refresh scenarios)
    const shouldRemember = rememberMe ?? localStorage.getItem(REMEMBER_ME_KEY) === 'true'
    const storage = shouldRemember ? localStorage : sessionStorage

    // Clear both storages first to avoid conflicts
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)

    // Store in appropriate storage
    storage.setItem(TOKEN_KEY, accessToken)
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  function clearTokens() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(REMEMBER_ME_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken: handleRefreshToken,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return getStoredToken(TOKEN_KEY)
}

/**
 * Get user_id from stored token
 */
export function getUserIdFromToken(): string | null {
  const token = getAccessToken()
  if (!token) return null

  const decoded = decodeToken(token)
  return decoded ? decoded.sub : null
}
