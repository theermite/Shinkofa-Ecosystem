/**
 * Dashboard Router - Routes to appropriate dashboard based on effective role
 */

import { useAuthStore } from '@/store/authStore'
import { useEffectiveRole } from '@/hooks/useEffectiveRole'
import { UserRole } from '@/types/user'
import JoueurDashboard from './JoueurDashboard'
import CoachDashboard from './CoachDashboard'
import ManagerDashboard from './ManagerDashboard'
import SuperAdminDashboard from './SuperAdminDashboard'
import MainLayout from '@/components/layout/MainLayout'

export default function DashboardRouter() {
  const { user } = useAuthStore()
  const effectiveRole = useEffectiveRole()

  if (!user || !effectiveRole) {
    return null
  }

  const renderDashboard = () => {
    // Use effective role (supports impersonation)
    switch (effectiveRole) {
      case UserRole.JOUEUR:
        return <JoueurDashboard />
      case UserRole.COACH:
        return <CoachDashboard />
      case UserRole.MANAGER:
        return <ManagerDashboard />
      case UserRole.SUPER_ADMIN:
        return <SuperAdminDashboard />
      default:
        return <JoueurDashboard />
    }
  }

  return <MainLayout>{renderDashboard()}</MainLayout>
}
