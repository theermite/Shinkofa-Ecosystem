/**
 * Tier Limit Types
 * Shinkofa Platform - Frontend
 */

/**
 * Error response when tier limit is reached
 */
export interface TierLimitError {
  error: 'project_limit_reached' | 'task_limit_reached' | 'message_limit_reached'
  message: string
  current: number
  limit: number
  tier: string
  upgrade_url: string
}

/**
 * Check if an error response is a tier limit error
 */
export function isTierLimitError(data: unknown): data is TierLimitError {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.error === 'string' &&
    ['project_limit_reached', 'task_limit_reached', 'message_limit_reached'].includes(obj.error as string) &&
    typeof obj.limit === 'number'
  )
}

/**
 * Get user-friendly message for tier limit error
 */
export function getTierLimitMessage(error: TierLimitError): string {
  switch (error.error) {
    case 'project_limit_reached':
      return `Tu as atteint la limite de ${error.limit} projets pour le plan ${error.tier.toUpperCase()}.`
    case 'task_limit_reached':
      return `Tu as atteint la limite de ${error.limit} taches actives pour le plan ${error.tier.toUpperCase()}.`
    case 'message_limit_reached':
      return `Tu as atteint la limite de ${error.limit} messages Shizen pour ce mois.`
    default:
      return error.message
  }
}
