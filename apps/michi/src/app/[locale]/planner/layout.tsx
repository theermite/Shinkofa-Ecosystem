/**
 * Planner Layout - Protected pages
 * Shinkofa Platform - Frontend
 */

'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
