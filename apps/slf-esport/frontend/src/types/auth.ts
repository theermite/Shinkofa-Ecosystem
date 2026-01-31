/**
 * Authentication types
 */

export interface LoginCredentials {
  username: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
}

import type { User } from './user'
