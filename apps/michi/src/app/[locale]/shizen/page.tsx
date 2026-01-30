'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ShizenPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to chat page (Shizen AI Chat)
    router.push('/chat')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-shinkofa-marine dark:border-secondary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Redirection vers Shizen AI...</p>
      </div>
    </div>
  )
}
