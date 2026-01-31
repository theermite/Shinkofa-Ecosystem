/**
 * Page Layout - Wrapper with Navbar for all pages
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import { ReactNode } from 'react'
import Navbar from './Navbar'

interface PageLayoutProps {
  children: ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  )
}
