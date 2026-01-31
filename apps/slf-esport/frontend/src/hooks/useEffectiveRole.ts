/**
 * Hook to get effective role (with impersonation support for super admins)
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import { useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types/user'

/**
 * Get the effective role for the current user
 * If super admin is impersonating, returns the impersonated role
 * Otherwise returns the user's actual role
 */
export function useEffectiveRole(): UserRole | null {
  const { user } = useAuthStore()

  return useMemo(() => {
    if (!user) return null

    // Check if super admin is impersonating a role
    if (user.is_super_admin) {
      const impersonatedRole = sessionStorage.getItem('impersonatedRole') as UserRole | null
      if (impersonatedRole) {
        return impersonatedRole
      }
    }

    // Return actual role
    return user.role
  }, [user])
}

/**
 * Get user with effective role (merged object)
 */
export function useEffectiveUser() {
  const { user } = useAuthStore()
  const effectiveRole = useEffectiveRole()

  return useMemo(() => {
    if (!user) return null

    return {
      ...user,
      role: effectiveRole || user.role,
      _isImpersonating: user.is_super_admin && sessionStorage.getItem('impersonatedRole') !== null,
      _originalRole: user.role,
    }
  }, [user, effectiveRole])
}
