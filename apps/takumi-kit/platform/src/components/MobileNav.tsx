/**
 * Mobile Navigation - Bottom navigation bar for mobile devices
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Puzzle,
  BarChart3,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/widgets', label: 'Widgets', icon: Puzzle },
  { path: '/analytics', label: 'Stats', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ermite-bg-secondary dark:bg-ermite-bg-secondary light:bg-white border-t border-ermite-border dark:border-ermite-border light:border-gray-200 lg:hidden safe-area-bottom">
      <ul className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <li key={item.path} className="flex-1">
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center h-full gap-1 transition-colors touch-manipulation',
                  isActive
                    ? 'text-ermite-primary'
                    : 'text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn('w-6 h-6', isActive && 'scale-110')} />
                  <span className="text-xs font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
