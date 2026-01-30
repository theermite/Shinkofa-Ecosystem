/**
 * Layout Component - Main app layout with responsive sidebar
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import BackToTop from './BackToTop'
import { cn } from '@/lib/utils'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  return (
    <div className="flex h-screen overflow-hidden bg-ermite-bg dark:bg-ermite-bg light:bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, visible on lg+ */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:transform-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main
        ref={mainRef}
        className="flex-1 overflow-auto bg-ermite-bg dark:bg-ermite-bg light:bg-gray-50"
      >
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between p-4 bg-ermite-bg-secondary dark:bg-ermite-bg-secondary light:bg-white border-b border-ermite-border dark:border-ermite-border light:border-gray-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-ermite-text dark:text-ermite-text light:text-gray-900 hover:bg-ermite-card dark:hover:bg-ermite-card light:hover:bg-gray-100 touch-manipulation"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/Logo The Ermite.png" alt="The Ermite" className="w-8 h-8 object-contain" />
            <span className="font-semibold text-ermite-text dark:text-ermite-text light:text-gray-900">
              The Ermite
            </span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav />

      {/* Back to top button */}
      <BackToTop scrollContainer={mainRef.current} />
    </div>
  )
}
