/**
 * Session types
 */

export enum SessionType {
  SOLO = 'solo',
  DUO = 'duo',
  TRIO = 'trio',
  TEAM = 'team',
  GROUP = 'group',
}

export enum SessionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface SessionParticipant {
  id: number
  session_id: number
  user_id: number
  attendance_status: string
  response_status: string  // pending, confirmed, maybe, declined
  invitation_sent_at?: string
  response_at?: string
  decline_reason?: string
  notes?: string
  created_at: string
  updated_at: string
  // User info
  username?: string
  full_name?: string
  game_username?: string
}

export interface Session {
  id: number
  title: string
  description?: string
  session_type: SessionType
  status: SessionStatus
  start_time: string
  end_time: string
  duration_minutes?: number
  coach_id?: number
  created_by_id: number
  meeting_url?: string
  notes?: string
  created_at: string
  updated_at: string
  participants: SessionParticipant[]
}

export interface SessionCreate {
  title: string
  description?: string
  session_type: SessionType
  start_time: string
  end_time: string
  coach_id?: number
  meeting_url?: string
  notes?: string
  participant_ids?: number[]
}

export interface SessionUpdate {
  title?: string
  description?: string
  session_type?: SessionType
  start_time?: string
  end_time?: string
  status?: SessionStatus
  coach_id?: number
  meeting_url?: string
  notes?: string
}

export interface SessionStats {
  total_sessions: number
  completed_sessions: number
  upcoming_sessions: number
  cancelled_sessions: number
  attendance_rate: number
  total_hours: number
}

export interface SessionListResponse {
  total: number
  sessions: Session[]
  page: number
  page_size: number
}

// UI constants
export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  [SessionType.SOLO]: 'Solo',
  [SessionType.DUO]: 'Duo',
  [SessionType.TRIO]: 'Trio',
  [SessionType.TEAM]: 'Team',
  [SessionType.GROUP]: 'Groupe',
}

export const SESSION_TYPE_EMOJIS: Record<SessionType, string> = {
  [SessionType.SOLO]: '🎯',
  [SessionType.DUO]: '👥',
  [SessionType.TRIO]: '🔺',
  [SessionType.TEAM]: '⚔️',
  [SessionType.GROUP]: '👨‍👩‍👧‍👦',
}

export const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  [SessionType.SOLO]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  [SessionType.DUO]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  [SessionType.TRIO]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  [SessionType.TEAM]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  [SessionType.GROUP]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
}

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  [SessionStatus.PENDING]: 'En attente',
  [SessionStatus.CONFIRMED]: 'Confirmé',
  [SessionStatus.CANCELLED]: 'Annulé',
  [SessionStatus.COMPLETED]: 'Complété',
}

export const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
  [SessionStatus.PENDING]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  [SessionStatus.CONFIRMED]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  [SessionStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  [SessionStatus.COMPLETED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
}

// Response status labels (participant invitation response)
export const RESPONSE_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  maybe: 'Peut-être',
  declined: 'Décliné',
}

export const RESPONSE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  maybe: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
}
