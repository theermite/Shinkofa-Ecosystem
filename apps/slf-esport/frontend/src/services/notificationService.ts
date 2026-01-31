/**
 * Notification service - API calls for notifications
 */

import api from './api'

export interface Notification {
  id: number
  user_id: number
  type: string
  title: string
  message: string
  link: string | null
  action_text: string | null
  read: boolean
  created_at: string
  read_at: string | null
}

export interface NotificationListResponse {
  total: number
  unread_count: number
  notifications: Notification[]
}

// Notification Preferences
export interface NotificationPreferences {
  id: number
  user_id: number
  session_created: boolean
  session_invitation: boolean
  session_reminder: boolean
  exercise_assigned: boolean
  performance_recorded: boolean
  coach_message: boolean
  account_updates: boolean
}

export interface NotificationPreferencesUpdate {
  session_created?: boolean
  session_invitation?: boolean
  session_reminder?: boolean
  exercise_assigned?: boolean
  performance_recorded?: boolean
  coach_message?: boolean
  account_updates?: boolean
}

export const notificationService = {
  /**
   * Get user notifications
   */
  async getNotifications(unreadOnly = false, skip = 0, limit = 10): Promise<NotificationListResponse> {
    const params = new URLSearchParams()
    if (unreadOnly) params.append('unread_only', 'true')
    params.append('skip', skip.toString())
    params.append('limit', limit.toString())

    const response = await api.get<NotificationListResponse>(`/notifications/?${params}`)
    return response.data
  },

  /**
   * Get unread count (for badge)
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ unread_count: number }>('/notifications/unread-count')
    return response.data.unread_count
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: number): Promise<void> {
    await api.put(`/notifications/${notificationId}/read`)
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<number> {
    const response = await api.put<{ marked_count: number }>('/notifications/mark-all-read')
    return response.data.marked_count
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<void> {
    await api.delete(`/notifications/${notificationId}`)
  },

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get<NotificationPreferences>('/notifications/preferences')
    return response.data
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: NotificationPreferencesUpdate): Promise<NotificationPreferences> {
    const response = await api.put<NotificationPreferences>('/notifications/preferences', preferences)
    return response.data
  },

  /**
   * Reset notification preferences to defaults
   */
  async resetPreferences(): Promise<NotificationPreferences> {
    const defaults: NotificationPreferencesUpdate = {
      session_created: true,
      session_invitation: true,
      session_reminder: true,
      exercise_assigned: true,
      performance_recorded: true,
      coach_message: true,
      account_updates: true,
    }
    return this.updatePreferences(defaults)
  }
}

export default notificationService