/**
 * PlannerNav - Navigation bar for Planner sections
 * Shinkofa Platform - Next.js 15
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckSquare, BookOpen, Repeat } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { name: 'Tâches', href: '/planner/tasks', icon: CheckSquare },
  { name: 'Journaux', href: '/planner/journals', icon: BookOpen },
  { name: 'Rituels', href: '/planner/rituals', icon: Repeat },
]

export function PlannerNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
