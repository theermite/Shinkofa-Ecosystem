import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8003/api/v1'

export interface Notification {
  id: number
  user_id: number
  type: string
  title: string
  message: string
  link?: string
  action_text?: string
  read: boolean
  created_at: string
  read_at?: string
}

export interface NotificationListResponse {
  total: number
  unread_count: number
  notifications: Notification[]
}

export const notificationService = {
  async getMyNotifications(unreadOnly = false, skip = 0, limit = 50): Promise<NotificationListResponse> {
    const response = await axios.get(`${API_BASE_URL}/notifications`, {
      params: { unread_only: unreadOnly, skip, limit }
    })
    return response.data
  },

  async getUnreadCount(): Promise<number> {
    const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`)
    return response.data.unread_count
  },

  async markAsRead(notificationId: number): Promise<void> {
    await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await axios.put(`${API_BASE_URL}/notifications/mark-all-read`)
  },

  async deleteNotification(notificationId: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`)
  }
}

export default notificationService