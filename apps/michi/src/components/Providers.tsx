/**
 * Providers - App-wide providers wrapper
 * Shinkofa Platform - Frontend
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { PomodoroProvider } from '@/contexts/PomodoroContext'
import { SuperAdminProvider } from '@/contexts/SuperAdminContext'
import { ToastProvider } from '@/contexts/ToastContext'

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance (useState to ensure it's only created once)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: false, // Disable refetch on window focus (can be re-enabled if needed)
            retry: 1, // Retry failed requests once
          },
          mutations: {
            retry: 0, // Don't retry mutations
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SuperAdminProvider>
          <ToastProvider>
            <PomodoroProvider>
              {children}
            </PomodoroProvider>
          </ToastProvider>
        </SuperAdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
