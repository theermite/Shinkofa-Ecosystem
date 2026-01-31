/**
 * Notifications hook with polling
 */

import { useEffect, useRef, useCallback } from 'react'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'

const POLLING_INTERVAL = 30000 // 30 seconds

export function useNotifications() {
  const { isAuthenticated } = useAuthStore()
  const {
    notifications,
    unreadCount,
    total,
    isLoading,
    error,
    isDropdownOpen,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setDropdownOpen,
    toggleDropdown,
    clearError,
  } = useNotificationStore()

  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingRef.current) return

    pollingRef.current = setInterval(() => {
      if (isAuthenticated) {
        fetchUnreadCount()
      }
    }, POLLING_INTERVAL)
  }, [isAuthenticated, fetchUnreadCount])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  // Initialize on mount, cleanup on unmount
  useEffect(() => {
    if (isAuthenticated) {
      // Initial fetch
      fetchNotifications(10)
      startPolling()
    }

    return () => {
      stopPolling()
    }
  }, [isAuthenticated, fetchNotifications, startPolling, stopPolling])

  // Refresh notifications (for manual refresh or after action)
  const refresh = useCallback(() => {
    if (isAuthenticated) {
      fetchNotifications(10)
    }
  }, [isAuthenticated, fetchNotifications])

  return {
    notifications,
    unreadCount,
    total,
    isLoading,
    error,
    isDropdownOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setDropdownOpen,
    toggleDropdown,
    clearError,
    refresh,
  }
}
