/**
 * Authentication service
 */

import api from './api'
import type { LoginCredentials, TokenResponse } from '@/types/auth'
import type { User, UserCreate } from '@/types/user'

class AuthService {
  /**
   * Register a new user
   */
  async register(userData: UserCreate): Promise<User> {
    const response = await api.post<User>('/auth/register', userData)
    return response.data
  }

  /**
   * Login user and store token
   */
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/login', credentials)
    const { access_token, token_type, expires_in } = response.data

    // Check if user wants to be remembered
    const rememberMe = localStorage.getItem('rememberMe') === 'true'
    const storage = rememberMe ? localStorage : sessionStorage

    // Store token
    storage.setItem('access_token', access_token)

    // Calculate and store expiration
    const expirationTime = Date.now() + expires_in * 1000
    storage.setItem('token_expiration', expirationTime.toString())

    // Also store in localStorage for remember me check
    if (rememberMe) {
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('token_expiration', expirationTime.toString())
    }

    return response.data
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear both localStorage and sessionStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('token_expiration')
      localStorage.removeItem('user')
      localStorage.removeItem('rememberMe')

      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('token_expiration')
      sessionStorage.removeItem('user')
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')

    // Store user based on remember me preference
    const rememberMe = localStorage.getItem('rememberMe') === 'true'
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('user', JSON.stringify(response.data))

    // Also store in localStorage if remember me
    if (rememberMe) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }

    return response.data
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    // Check both localStorage and sessionStorage
    let token = localStorage.getItem('access_token')
    let expiration = localStorage.getItem('token_expiration')

    // If not in localStorage, check sessionStorage
    if (!token || !expiration) {
      token = sessionStorage.getItem('access_token')
      expiration = sessionStorage.getItem('token_expiration')
    }

    if (!token || !expiration) {
      return false
    }

    // Check if token is expired
    const isExpired = Date.now() >= parseInt(expiration)

    if (isExpired) {
      this.logout()
      return false
    }

    return true
  }

  /**
   * Get stored user from localStorage or sessionStorage
   */
  getStoredUser(): User | null {
    let userStr = localStorage.getItem('user')

    // If not in localStorage, check sessionStorage
    if (!userStr) {
      userStr = sessionStorage.getItem('user')
    }

    if (!userStr) return null

    try {
      return JSON.parse(userStr) as User
    } catch {
      return null
    }
  }
}

export default new AuthService()
