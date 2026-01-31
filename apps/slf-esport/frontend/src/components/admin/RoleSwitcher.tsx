/**
 * Role Switcher - Allow super admin to view interface as different roles
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardBody, Button, Badge } from '@/components/ui'
import type { UserRole } from '@/types/user'

const ROLE_INFO = {
  JOUEUR: {
    label: 'Joueur',
    emoji: '🎮',
    color: 'bg-blue-500',
    description: 'Vue joueur - Exercices, sessions, profil',
  },
  COACH: {
    label: 'Coach',
    emoji: '🎯',
    color: 'bg-green-500',
    description: 'Vue coach - Gestion joueurs, assignment exercices',
  },
  MANAGER: {
    label: 'Manager',
    emoji: '📊',
    color: 'bg-red-500',
    description: 'Vue manager - Analytics complètes, rapports',
  },
  SUPER_ADMIN: {
    label: 'Super Admin',
    emoji: '👑',
    color: 'bg-purple-500',
    description: 'Vue super admin - Tous les droits',
  },
}

export default function RoleSwitcher() {
  const { user } = useAuthStore()
  const [activeRole, setActiveRole] = useState<UserRole | null>(null)
  const [showPanel, setShowPanel] = useState(false)

  // DEBUG: Log user state
  console.log('[RoleSwitcher] user:', user)
  console.log('[RoleSwitcher] is_super_admin:', user?.is_super_admin)

  // Only super admins can use this
  if (!user?.is_super_admin) {
    console.log('[RoleSwitcher] Not rendering - user is not super admin')
    return null
  }

  console.log('[RoleSwitcher] Rendering button for super admin')

  const currentRole = activeRole || user.role
  const isImpersonating = activeRole !== null

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role)
    // Store in sessionStorage to persist across page reloads
    sessionStorage.setItem('impersonatedRole', role)
    // Trigger page reload to apply role change
    window.location.reload()
  }

  const handleResetRole = () => {
    setActiveRole(null)
    sessionStorage.removeItem('impersonatedRole')
    window.location.reload()
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 ${
          isImpersonating ? 'bg-orange-500 animate-pulse' : 'bg-purple-600'
        }`}
        title="Role Switcher (Super Admin)"
      >
        <span className="text-2xl">👑</span>
      </button>

      {/* Panel */}
      {showPanel && (
        <div className="fixed bottom-24 left-6 z-50 w-80 animate-slideInUp">
          <Card>
            <CardBody>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>👑</span>
                      <span>Role Switcher</span>
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Super Admin uniquement
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Current Role */}
                {isImpersonating && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded">
                    <p className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-1">
                      ⚠️ Mode Impersonation Actif
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      Vous voyez l'interface comme : <strong>{ROLE_INFO[currentRole].label}</strong>
                    </p>
                  </div>
                )}

                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Voir l'interface comme :
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(ROLE_INFO).map(([role, info]) => (
                      <button
                        key={role}
                        onClick={() => handleRoleChange(role as UserRole)}
                        disabled={currentRole === role}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          currentRole === role
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                        } ${currentRole === role ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{info.emoji}</span>
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">
                            {info.label}
                          </span>
                        </div>
                        {currentRole === role && (
                          <Badge variant="success" size="sm">Actif</Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                {isImpersonating && (
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleResetRole}
                    className="border-2 border-orange-500 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    🔄 Revenir au rôle d'origine
                  </Button>
                )}

                {/* Info */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>💡 Info :</strong> Le changement de rôle est temporaire et n'affecte pas la base de données.
                    Il sera réinitialisé à la déconnexion.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideInUp {
          animation: slideInUp 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
