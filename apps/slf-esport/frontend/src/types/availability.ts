/**
 * Availability types - Player availability and session invitations
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

// ========== Day of Week ==========

export const DAYS_OF_WEEK = {
  0: 'Lundi',
  1: 'Mardi',
  2: 'Mercredi',
  3: 'Jeudi',
  4: 'Vendredi',
  5: 'Samedi',
  6: 'Dimanche',
} as const

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

// ========== Player Availability ==========

export interface PlayerAvailability {
  id: number
  user_id: number
  day_of_week: DayOfWeek | null // Null if specific_date is set
  specific_date: string | null // "YYYY-MM-DD" - null if recurring
  start_time: string // "HH:MM:SS"
  end_time: string // "HH:MM:SS"
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface PlayerAvailabilityCreate {
  day_of_week?: DayOfWeek | null // For recurring availability
  specific_date?: string | null // "YYYY-MM-DD" - For one-time availability
  start_time: string // "HH:MM"
  end_time: string // "HH:MM"
  is_active?: boolean
  notes?: string
}

export interface PlayerAvailabilityUpdate {
  day_of_week?: DayOfWeek | null
  specific_date?: string | null
  start_time?: string
  end_time?: string
  is_active?: boolean
  notes?: string
}

// Team member availability (coaches only - includes user info)
export interface TeamMemberAvailability {
  id: number
  user_id: number
  username: string
  email: string
  day_of_week: DayOfWeek | null
  specific_date: string | null
  start_time: string
  end_time: string
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
}

// ========== Availability Exceptions ==========

export interface PlayerAvailabilityException {
  id: number
  user_id: number
  exception_date: string // "YYYY-MM-DD"
  start_time?: string // "HH:MM:SS"
  end_time?: string // "HH:MM:SS"
  is_unavailable: boolean // true=unavailable, false=extra availability
  reason?: string
  created_at: string
  updated_at: string
}

export interface PlayerAvailabilityExceptionCreate {
  exception_date: string // "YYYY-MM-DD"
  start_time?: string // "HH:MM"
  end_time?: string // "HH:MM"
  is_unavailable: boolean
  reason?: string
}

// ========== Session Invitations ==========

export type InvitationResponseStatus = 'pending' | 'confirmed' | 'maybe' | 'declined'

export const INVITATION_STATUS_LABELS: Record<InvitationResponseStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  maybe: 'Peut-être',
  declined: 'Refusé',
}

export const INVITATION_STATUS_COLORS: Record<InvitationResponseStatus, string> = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  maybe: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export interface SessionInvitationRequest {
  user_ids: number[]
}

export interface SessionResponseRequest {
  response_status: InvitationResponseStatus
  decline_reason?: string
}

// ========== Available Players ==========

export type AvailabilityType = 'specific_date' | 'recurring' | 'exception_available' | 'exception_unavailable' | 'no_availability'

export interface AvailablePlayer {
  user_id: number
  username: string
  email: string
  is_available: boolean
  availability_type: AvailabilityType
  reason?: string
}
