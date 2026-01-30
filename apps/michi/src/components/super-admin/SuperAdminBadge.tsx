/**
 * Super Admin Badge
 * Floating badge shown when user is super admin
 */

'use client'

import { useSuperAdmin } from '@/contexts/SuperAdminContext'

export function SuperAdminBadge() {
  const { isSuperAdmin, isActive, isPanelOpen, setPanelOpen } = useSuperAdmin()

  if (!isSuperAdmin) return null

  return (
    <button
      onClick={() => setPanelOpen(!isPanelOpen)}
      className={`
        fixed bottom-4 right-4 z-50
        flex items-center gap-2 px-4 py-2 rounded-full
        font-semibold text-sm shadow-lg
        transition-all duration-200
        hover:scale-105 hover:shadow-xl
        ${isActive
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }
      `}
      title={isActive ? 'Mode Super Admin ACTIF' : 'Mode Super Admin disponible'}
    >
      <span className="text-lg">🔧</span>
      <span>Super Admin</span>
      {isActive && (
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      )}
    </button>
  )
}
