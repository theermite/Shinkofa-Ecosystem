'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    console.error('Page error:', error)
  }, [error])

  const handleClearAndReload = () => {
    try {
      // Clear potentially corrupted data
      localStorage.removeItem('theme')
      sessionStorage.clear()
    } catch {
      // Ignore storage errors
    }
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        <div className="text-6xl mb-6">😵</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Oups ! Une erreur est survenue
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Nous sommes désolés, quelque chose s&apos;est mal passé.
          Essayez de recharger la page ou de réinitialiser les données.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Réessayer
          </button>
          <button
            onClick={handleClearAndReload}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition"
          >
            Réinitialiser et recharger
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">
          Si le problème persiste, essayez de vider le cache de votre navigateur.
        </p>
      </div>
    </div>
  )
}
