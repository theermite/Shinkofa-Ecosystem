/**
 * Notification store using Zustand
 */

import { create } from 'zustand'
import { notificationService, type Notification } from '@/services/notificationService'

interface NotificationStore {
  // State
  notifications: Notification[]
  unreadCount: number
  total: number
  isLoading: boolean
  error: string | null
  isDropdownOpen: boolean

  // Actions
  fetchNotifications: (limit?: number) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (notificationId: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: number) => Promise<void>
  setDropdownOpen: (open: boolean) => void
  toggleDropdown: () => void
  clearError: () => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  total: 0,
  isLoading: false,
  error: null,
  isDropdownOpen: false,

  // Fetch notifications
  fetchNotifications: async (limit = 10) => {
    set({ isLoading: true, error: null })
    try {
      const response = await notificationService.getNotifications(false, 0, limit)
      set({
        notifications: response.notifications,
        unreadCount: response.unread_count,
        total: response.total,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch notifications',
      })
    }
  },

  // Fetch unread count only (lightweight)
  fetchUnreadCount: async () => {
    try {
      const count = await notificationService.getUnreadCount()
      set({ unreadCount: count })
    } catch {
      // Silent fail - badge will just not update
    }
  },

  // Mark single notification as read
  markAsRead: async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark as read' })
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead()
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          read: true,
          read_at: n.read_at || new Date().toISOString(),
        })),
        unreadCount: 0,
      }))
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark all as read' })
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: number) => {
    const notification = get().notifications.find((n) => n.id === notificationId)
    try {
      await notificationService.deleteNotification(notificationId)
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== notificationId),
        total: state.total - 1,
        unreadCount: notification && !notification.read ? state.unreadCount - 1 : state.unreadCount,
      }))
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete notification' })
    }
  },

  // Dropdown controls
  setDropdownOpen: (open: boolean) => set({ isDropdownOpen: open }),
  toggleDropdown: () => set((state) => ({ isDropdownOpen: !state.isDropdownOpen })),

  // Clear error
  clearError: () => set({ error: null }),
}))
