/**
 * Main Layout component with navigation
 */

import { ReactNode } from 'react'
import Navbar from './Navbar'
import { BackToTop } from '@/components/ui'
import RoleSwitcher from '@/components/admin/RoleSwitcher'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        Aller au contenu principal
      </a>
      <Navbar />
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <BackToTop />
      <RoleSwitcher />
    </div>
  )
}
