/**
 * API client configuration with Axios
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import env from '@/config/env'

// Debug log
console.log('[API] env.apiUrl:', env.apiUrl)
console.log('[API] env.isDevelopment:', env.isDevelopment)

// Determine base URL based on environment
// - Empty apiUrl in dev mode = use relative URL for Vite proxy
// - Otherwise use the provided apiUrl
const baseURL = env.apiUrl === ''
  ? '/api/v1'
  : `${env.apiUrl}/api/v1`
console.log('[API] Final baseURL:', baseURL)

// Create axios instance
const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check both localStorage and sessionStorage for token
    let token = localStorage.getItem('access_token')
    if (!token) {
      token = sessionStorage.getItem('access_token')
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log('[API] Request:', config.method?.toUpperCase(), config.baseURL + config.url)

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && originalRequest) {
      // Clear invalid token from both storages
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      localStorage.removeItem('token_expiration')
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('token_expiration')

      // Redirect to login
      window.location.href = '/login'
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default api
