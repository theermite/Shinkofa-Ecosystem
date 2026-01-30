/**
 * Ermite Toolbox - API Client
 * Centralized score submission for all widgets
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import type { WidgetScore, LeaderboardEntry, APIConfig, APIResponse } from '../types'

const DEFAULT_API_URL = 'https://api.theermite.com'

let globalConfig: APIConfig = {
  baseUrl: DEFAULT_API_URL,
}

/**
 * Configure the global API client
 */
export function configureAPI(config: Partial<APIConfig>): void {
  globalConfig = { ...globalConfig, ...config }
}

/**
 * Get current API configuration
 */
export function getAPIConfig(): APIConfig {
  return { ...globalConfig }
}

/**
 * Submit a score to the centralized API
 */
export async function submitScore(score: WidgetScore): Promise<APIResponse<WidgetScore>> {
  try {
    const response = await fetch(`${globalConfig.baseUrl}/api/v1/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(globalConfig.authToken && { Authorization: `Bearer ${globalConfig.authToken}` }),
      },
      body: JSON.stringify(score),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('[ErmiteToolbox] Score submission failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get leaderboard for a specific widget
 */
export async function getLeaderboard(
  widgetId: string,
  limit = 10
): Promise<APIResponse<LeaderboardEntry[]>> {
  try {
    const response = await fetch(
      `${globalConfig.baseUrl}/api/v1/leaderboard/${widgetId}?limit=${limit}`,
      {
        headers: {
          ...(globalConfig.authToken && { Authorization: `Bearer ${globalConfig.authToken}` }),
        },
      }
    )

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('[ErmiteToolbox] Leaderboard fetch failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get user stats across all widgets
 */
export async function getUserStats(userId: string): Promise<APIResponse<Record<string, unknown>>> {
  try {
    const response = await fetch(
      `${globalConfig.baseUrl}/api/v1/users/${userId}/stats`,
      {
        headers: {
          ...(globalConfig.authToken && { Authorization: `Bearer ${globalConfig.authToken}` }),
        },
      }
    )

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('[ErmiteToolbox] User stats fetch failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export default {
  configureAPI,
  getAPIConfig,
  submitScore,
  getLeaderboard,
  getUserStats,
}
