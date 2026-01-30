/**
 * API Client - Axios instance with interceptors
 * Shinkofa Platform - Frontend
 *
 * Features:
 * - Auto-refresh JWT token on 401 errors
 * - Retry failed requests after token refresh
 * - Request/response logging (dev mode)
 */

import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL, API_TIMEOUT } from '../constants'
import { refreshAccessToken } from '../api/auth'

// Token storage keys - MUST match AuthContext.tsx
const TOKEN_KEY = 'shinkofa_access_token'
const REFRESH_TOKEN_KEY = 'shinkofa_refresh_token'

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

/**
 * Subscribe to token refresh completion
 */
function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

/**
 * Notify all subscribers when token is refreshed
 */
function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

// ==================
// CREATE AXIOS INSTANCE
// ==================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ==================
// REQUEST INTERCEPTOR
// ==================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // DEPRECATED: Legacy dev mode user ID header
    // TODO: Remove after full JWT migration
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
    if (userId && config.headers) {
      config.headers['X-User-ID'] = userId
    }

    // Log request (dev only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data)
    }

    return config
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// ==================
// RESPONSE INTERCEPTOR
// ==================

apiClient.interceptors.response.use(
  (response) => {
    // Log response (dev only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    }

    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle errors
    if (error.response) {
      // Server responded with error status
      console.error('❌ API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      })

      // Handle 401 Unauthorized - Try to refresh token
      if (error.response.status === 401 && !originalRequest._retry) {
        // Don't retry if this is already a refresh request
        if (originalRequest.url?.includes('/auth/refresh')) {
          console.error('🔄 Token refresh failed - logging out')
          clearTokens()
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
          return Promise.reject(error)
        }

        // Mark request as retried to prevent infinite loops
        originalRequest._retry = true

        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              resolve(apiClient(originalRequest))
            })
          })
        }

        // Start refresh process
        isRefreshing = true

        try {
          const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null

          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          const tokens = await refreshAccessToken(refreshToken)

          // Store new tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, tokens.access_token)
            localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
          }

          // Update authorization header for original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`
          }

          // Notify all waiting requests
          onRefreshed(tokens.access_token)
          isRefreshing = false

          // Retry original request with new token
          return apiClient(originalRequest)
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError)
          isRefreshing = false
          refreshSubscribers = []
          clearTokens()

          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }

          return Promise.reject(refreshError)
        }
      }

      // Handle other status codes
      switch (error.response.status) {
        case 403:
          console.error('🚫 Forbidden: You do not have permission to access this resource')
          break

        case 404:
          console.error('🔍 Not Found: Resource not found')
          break

        case 422:
          console.error('⚠️ Validation Error:', error.response.data)
          break

        case 500:
          console.error('💥 Server Error: Internal server error')
          break

        default:
          console.error('❌ Unexpected Error:', error.response.status)
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('🌐 Network Error: No response from server', error.request)
    } else {
      // Something else happened
      console.error('❌ Error:', error.message)
    }

    return Promise.reject(error)
  }
)

// ==================
// HELPER FUNCTIONS
// ==================

/**
 * Store authentication tokens in localStorage
 */
export function storeTokens(accessToken: string, refreshToken: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

/**
 * Clear authentication tokens from localStorage
 */
export function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    // Also clear legacy userId for compatibility
    localStorage.removeItem('userId')
  }
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }
  return null
}

/**
 * Check if user has valid tokens
 */
export function hasTokens(): boolean {
  return getAccessToken() !== null && getRefreshToken() !== null
}

// ==================
// LEGACY FUNCTIONS (Deprecated - kept for backward compatibility)
// ==================

/**
 * @deprecated Use storeTokens() instead
 */
export function setUserId(userId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userId', userId)
  }
}

/**
 * @deprecated Use getAccessToken() instead
 */
export function getUserId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId')
  }
  return null
}

/**
 * @deprecated Use clearTokens() instead
 */
export function clearUserId() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userId')
  }
}

/**
 * @deprecated Use hasTokens() instead
 */
export function isAuthenticated(): boolean {
  return getUserId() !== null || hasTokens()
}

export default apiClient
