/**
 * Authentication Types
 * Shinkofa Platform - JWT Auth
 */

export type SubscriptionTier = 'musha' | 'samurai' | 'samurai_famille' | 'sensei' | 'sensei_famille' | 'founder'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired'

export interface Subscription {
  id: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  amount: number
  currency: string
  current_period_end?: string
  cancel_at_period_end: boolean
  custom_badge?: string  // Titre spécial (ex: "Maître Shinkofa")
}

export interface User {
  id: string
  email: string
  username: string
  full_name?: string
  is_active: boolean
  email_verified?: boolean
  is_super_admin?: boolean
  is_pioneer?: boolean
  pioneer_number?: number
  pioneer_claimed_at?: string
  created_at: string
  updated_at?: string
  profile?: {
    first_name?: string
    last_name?: string
    birth_date?: string
    avatar_url?: string
    [key: string]: any
  }
  preferences?: {
    theme?: string
    language?: string
    notifications_enabled?: boolean
    adaptive_recommendations?: boolean
    pomodoro_settings?: {
      focus_duration?: number
      short_break_duration?: number
      long_break_duration?: number
      cycles_before_long_break?: number
    }
    [key: string]: any
  }
  subscription?: Subscription
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface LoginCredentials {
  email?: string
  username?: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  full_name?: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials, rememberMe?: boolean) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  refreshUser: () => Promise<void>
}
