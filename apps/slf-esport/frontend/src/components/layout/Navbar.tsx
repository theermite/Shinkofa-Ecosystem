/**
 * Navigation Bar component - LSLF E-Sport
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button, Badge, ThemeToggle } from '@/components/ui'
import { UserRole } from '@/types/user'
import { useEffectiveRole } from "@/hooks/useEffectiveRole"

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const effectiveRole = useEffectiveRole()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.MANAGER:
        return 'danger'
      case UserRole.COACH:
        return 'warning'
      case UserRole.JOUEUR:
        return 'primary'
      default:
        return 'primary'
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.MANAGER:
        return 'Manager'
      case UserRole.COACH:
        return 'Coach'
      case UserRole.JOUEUR:
        return 'Joueur'
      default:
        return role
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 flex-shrink-0">
            <img
              src="/logo-lslf-sigle.png"
              alt="La Salade de Fruits E-Sport"
              className="h-12 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-primary-900 dark:text-white font-display">
                La Salade de Fruits
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                E-Sport Team
              </p>
            </div>
          </Link>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            <Link
              to="/dashboard"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
            >
              Dashboard
            </Link>

            <Link
              to="/exercises"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
            >
              Exercices
            </Link>

            <Link
              to="/calendar"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
            >
              Calendrier
            </Link>

            <Link
              to="/coaching"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
            >
              Coaching
            </Link>

            <Link
              to="/media"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
            >
              Médiathèque
            </Link>

            {(user?.role === UserRole.COACH || user?.role === UserRole.MANAGER) && (
              <Link
                to="/team"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Équipe
              </Link>
            )}

            {user?.role === UserRole.MANAGER && (
              <Link
                to="/analytics"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Analytics
              </Link>
            )}

            {(user?.role === UserRole.COACH || user?.role === UserRole.MANAGER || user?.is_super_admin) && (
              <Link
                to="/recruitment"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Recrutement
              </Link>
            )}
          </div>

          {/* Right: Theme Toggle + User Menu (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />

            {user && (
              <>
                <Link to="/profile" className="hidden xl:flex flex-col items-end hover:opacity-80 transition-opacity">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.full_name || user.username}
                  </span>
                  <Badge variant={getRoleBadgeVariant(effectiveRole || user.role)} size="sm">
                    {getRoleLabel(effectiveRole || user.role)}
                  </Badge>
                </Link>

                <Link to="/profile" className="flex-shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-10 h-10 rounded-full border-2 border-primary-600 hover:border-primary-700 transition-colors cursor-pointer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center transition-colors cursor-pointer">
                      <span className="text-white font-semibold text-lg">
                        {(user.full_name || user.username).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </Link>

                <Button variant="ghost" onClick={handleLogout} size="sm">
                  Déconnexion
                </Button>
              </>
            )}
          </div>

          {/* Mobile: Theme Toggle + Burger Menu */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                // X icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Burger icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="flex flex-col space-y-3">
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Dashboard
              </Link>

              <Link
                to="/exercises"
                onClick={closeMobileMenu}
                className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Exercices
              </Link>

              <Link
                to="/calendar"
                onClick={closeMobileMenu}
                className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Calendrier
              </Link>

              <Link
                to="/coaching"
                onClick={closeMobileMenu}
                className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Coaching
              </Link>

              <Link
                to="/media"
                onClick={closeMobileMenu}
                className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Médiathèque
              </Link>

              {(user?.role === UserRole.COACH || user?.role === UserRole.MANAGER) && (
                <Link
                  to="/team"
                  onClick={closeMobileMenu}
                  className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Équipe
                </Link>
              )}

              {user?.role === UserRole.MANAGER && (
                <Link
                  to="/analytics"
                  onClick={closeMobileMenu}
                  className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Analytics
                </Link>
              )}

              {(user?.role === UserRole.COACH || user?.role === UserRole.MANAGER || user?.is_super_admin) && (
                <Link
                  to="/recruitment"
                  onClick={closeMobileMenu}
                  className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Recrutement
                </Link>
              )}

              {user && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-10 h-10 rounded-full border-2 border-primary-600"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {(user.full_name || user.username).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.full_name || user.username}
                        </p>
                        <Badge variant={getRoleBadgeVariant(effectiveRole || user.role)} size="sm">
                          {getRoleLabel(effectiveRole || user.role)}
                        </Badge>
                      </div>
                    </Link>
                  </div>

                  <Button variant="ghost" onClick={handleLogout} fullWidth>
                    Déconnexion
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
