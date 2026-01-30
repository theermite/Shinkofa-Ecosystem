/**
 * Sidebar Component - Navigation sidebar with theme toggle
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Puzzle,
  BarChart3,
  Settings,
  LogOut,
  X,
  CheckSquare,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/widgets', label: 'Widgets', icon: Puzzle },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    onClose?.()
  }

  return (
    <aside className="h-full w-64 bg-ermite-bg-secondary dark:bg-ermite-bg-secondary light:bg-white border-r border-ermite-border dark:border-ermite-border light:border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-ermite-border dark:border-ermite-border light:border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/Logo The Ermite.png"
              alt="The Ermite"
              className="w-10 h-10 rounded-lg object-contain"
            />
            <div>
              <h1 className="font-semibold text-ermite-text dark:text-ermite-text light:text-gray-900">The Ermite</h1>
              <p className="text-xs text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700">Control Center</p>
            </div>
          </div>
          {/* Close button - mobile only */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-ermite-text-secondary hover:bg-ermite-card lg:hidden touch-manipulation"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-manipulation',
                    isActive
                      ? 'bg-ermite-primary/20 text-ermite-primary font-medium'
                      : 'text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700 hover:bg-ermite-card dark:hover:bg-ermite-card light:hover:bg-gray-100 hover:text-ermite-text dark:hover:text-ermite-text light:hover:text-gray-900'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-ermite-border dark:border-ermite-border light:border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700">Thème</span>
          <ThemeToggle size="sm" />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700 hover:bg-ermite-card dark:hover:bg-ermite-card light:hover:bg-gray-100 hover:text-ermite-error transition-colors touch-manipulation"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
