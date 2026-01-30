/**
 * Homepage - Shinkofa Platform
 * Page d'accueil internationalisee
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const router = useRouter()
  const t = useTranslations('home')
  const { isAuthenticated, user, isLoading } = useAuth()

  useEffect(() => {
    // Si l'utilisateur est authentifie, rediriger vers le dashboard
    if (!isLoading && isAuthenticated && user) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, isLoading, router])

  // Afficher loader pendant verification auth (evite flash login page)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-shinkofa-marine dark:border-secondary-400"></div>
      </div>
    )
  }

  // Si authentifie, afficher un loader pendant la redirection
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-shinkofa-marine dark:border-secondary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('redirecting')}</p>
        </div>
      </div>
    )
  }

  // Si non authentifie, afficher les options de connexion/inscription
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
          {t('title')}
        </h1>
        <p className="text-2xl text-gray-700 dark:text-gray-300 mb-2">
          {t('subtitle')}
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
          {t('tagline')}
        </p>

        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="block w-full px-8 py-4 bg-gradient-to-r from-shinkofa-marine to-shinkofa-orange hover:from-primary-900 hover:to-secondary-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {t('login')}
          </Link>

          <Link
            href="/auth/register"
            className="block w-full px-8 py-4 bg-white dark:bg-gray-800 text-shinkofa-marine dark:text-secondary-200 font-semibold rounded-lg shadow-lg hover:shadow-xl border-2 border-shinkofa-marine dark:border-secondary-400 transition-all duration-300 transform hover:scale-105"
          >
            {t('register')}
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          &copy; 2026 La Voie Shinkofa - {t('subtitle')}
        </p>
      </div>
    </div>
  )
}
