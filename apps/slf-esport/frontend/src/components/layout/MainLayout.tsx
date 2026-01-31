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
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <BackToTop />
      <RoleSwitcher />
    </div>
  )
}
