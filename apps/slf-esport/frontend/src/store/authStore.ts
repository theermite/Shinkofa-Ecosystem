/**
 * Authentication store using Zustand
 */

import { create } from 'zustand'
import type { User } from '@/types/user'
import type { LoginCredentials, UserCreate } from '@/types'
import authService from '@/services/authService'

interface AuthStore {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: UserCreate) => Promise<void>
  logout: () => Promise<void>
  fetchCurrentUser: () => Promise<void>
  initialize: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  // Login action
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null })

    try {
      await authService.login(credentials)
      const user = await authService.getCurrentUser()

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed'

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      })

      throw error
    }
  },

  // Register action
  register: async (userData: UserCreate) => {
    set({ isLoading: true, error: null })

    try {
      await authService.register(userData)

      // Auto-login after registration
      await authService.login({
        username: userData.username,
        password: userData.password,
      })

      const user = await authService.getCurrentUser()

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Registration failed'

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      })

      throw error
    }
  },

  // Logout action
  logout: async () => {
    set({ isLoading: true })

    try {
      await authService.logout()
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },

  // Fetch current user
  fetchCurrentUser: async () => {
    if (!authService.isAuthenticated()) {
      set({ user: null, isAuthenticated: false })
      return
    }

    set({ isLoading: true })

    try {
      const user = await authService.getCurrentUser()

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to fetch user',
      })
    }
  },

  // Initialize auth state on app load
  initialize: () => {
    const isAuthenticated = authService.isAuthenticated()
    const user = authService.getStoredUser()

    set({
      user,
      isAuthenticated,
      isLoading: false,
      error: null,
    })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },
}))
