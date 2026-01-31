/**
 * Avatar URL utility - Construct full avatar URL for display
 */

import env from '@/config/env'

/**
 * Get the full URL for an avatar image
 *
 * @param avatarPath - The avatar path from the database (e.g., "/uploads/avatars/xxx.png")
 * @returns Full URL to display the avatar
 */
export function getAvatarUrl(avatarPath: string | null | undefined): string | null {
  if (!avatarPath) return null

  // If it's already a full URL (starts with http), return as-is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath
  }

  // If it's a data URL (base64), return as-is
  if (avatarPath.startsWith('data:')) {
    return avatarPath
  }

  // In development with Vite proxy, we need to use the API URL
  // In production, nginx proxies /uploads to backend
  if (env.isDevelopment && env.apiUrl) {
    // Development with explicit API URL
    return `${env.apiUrl}${avatarPath}`
  } else if (env.isProduction || !env.apiUrl) {
    // Production or development with proxy
    // The path is already correct for nginx proxy
    return avatarPath
  }

  return avatarPath
}

/**
 * Get initials from a name for avatar fallback
 *
 * @param name - Full name or username
 * @returns Initials (1-2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '?'

  const parts = name.trim().split(/\s+/)

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return name[0].toUpperCase()
}
