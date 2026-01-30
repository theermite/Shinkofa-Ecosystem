/**
 * Auth API Client
 * Shinkofa Platform - Authentication endpoints
 */

import type { User, AuthTokens, LoginCredentials, RegisterData } from "@/types/auth"

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "https://localhost:8000"

/**
 * Register new user
 */
export async function registerUser(data: RegisterData): Promise<AuthTokens> {
  const response = await fetch(`${AUTH_API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Registration failed")
  }

  return response.json()
}

/**
 * Login user - accepts email OR username
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthTokens> {
  // Build the payload - send both username and email if provided
  // Backend will use whichever is available
  const payload: Record<string, string> = {
    password: credentials.password,
  }

  // If email is provided, use it
  if (credentials.email) {
    payload.email = credentials.email
  }

  // If username is provided, use it
  if (credentials.username) {
    payload.username = credentials.username
  }

  const response = await fetch(`${AUTH_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Login failed")
  }

  return response.json()
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  const response = await fetch(`${AUTH_API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!response.ok) {
    throw new Error("Token refresh failed")
  }

  return response.json()
}

/**
 * Get current user profile
 */
export async function getCurrentUser(accessToken: string): Promise<User> {
  const response = await fetch(`${AUTH_API_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch user profile")
  }

  return response.json()
}

/**
 * Decode JWT token to extract user_id (without verification - client-side only)
 */
export function decodeToken(token: string): { sub: string; email: string; exp: number } | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Failed to decode token:", error)
    return null
  }
}

/**
 * Request password reset
 * Sends reset email if email exists
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await fetch(`${AUTH_API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Failed to send reset email")
  }

  return response.json()
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await fetch(`${AUTH_API_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, new_password: newPassword }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Failed to reset password")
  }

  return response.json()
}
