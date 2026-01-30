'use client'

import { useAuth } from '@/contexts/AuthContext'
import { EditProfileForm } from '@/components/profile/EditProfileForm'
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm'
import { SubscriptionCard } from '@/components/profile/SubscriptionCard'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const t = useTranslations('profile.page')

  if (!user) {
    return null // ProtectedRoute will handle redirect
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900 dark:to-blue-900 py-4 xs:py-6 sm:py-8 px-3 xs:px-4">
        <div className="max-w-4xl mx-auto space-y-4 xs:space-y-6">

          {/* 1. PROFIL HOLISTIQUE - PRIORITÉ #1 (le plus consulté) */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-4 xs:p-5 sm:p-6 text-white">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl xs:text-3xl">🌟</span>
              {t('holisticTitle')}
            </h2>
            <p className="text-xs xs:text-sm opacity-90 mb-4">
              {t('holisticDescription')}
            </p>
            <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
              <Link
                href="/profile/holistic"
                className="flex-1 px-4 xs:px-6 py-2.5 xs:py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition text-center touch-target text-sm xs:text-base"
              >
                👁️ {t('viewHolisticProfile')}
              </Link>
              <Link
                href="/questionnaire"
                className="flex-1 px-4 xs:px-6 py-2.5 xs:py-3 bg-white/20 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/30 transition text-center touch-target text-sm xs:text-base"
              >
                📝 {t('retakeQuestionnaire')}
              </Link>
            </div>
          </div>

          {/* 2. ACTIONS RAPIDES */}
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
            <button
              onClick={refreshUser}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow touch-target text-sm xs:text-base"
            >
              🔄 {t('refresh')}
            </button>
            <Link
              href="/planner"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition shadow touch-target text-sm xs:text-base"
            >
              📋 {t('myPlanner')}
            </Link>
          </div>

          {/* 3. PLAN & LIMITES (Subscription & Badges) */}
          <SubscriptionCard user={user} />

          {/* 4. INFORMATIONS PERSONNELLES + PRÉFÉRENCES COMPACTES */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 xs:p-5 sm:p-6">

            {/* Infos compactes + Préférences en grille */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 xs:gap-3 mb-4 xs:mb-6">
              <div className="col-span-2 sm:col-span-1 flex items-center justify-between p-2 xs:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">👤 Membre</span>
                <span className="text-xs text-gray-900 dark:text-gray-100">
                  {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              {user.preferences?.theme && (
                <div className="flex items-center justify-between p-2 xs:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">{t('theme')}</span>
                  <span className="text-xs text-gray-900 dark:text-gray-100">
                    {user.preferences.theme === 'dark' ? '🌙' : '☀️'}
                  </span>
                </div>
              )}

              {user.preferences?.language && (
                <div className="flex items-center justify-between p-2 xs:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">{t('language')}</span>
                  <span className="text-xs text-gray-900 dark:text-gray-100">
                    {user.preferences.language === 'fr' ? '🇫🇷' : '🇬🇧'}
                  </span>
                </div>
              )}

              {user.preferences?.pomodoro_settings?.focus_duration && (
                <div className="flex items-center justify-between p-2 xs:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">⏱️ Focus</span>
                  <span className="text-xs text-gray-900 dark:text-gray-100">
                    {user.preferences.pomodoro_settings.focus_duration}min
                  </span>
                </div>
              )}

              {user.preferences?.pomodoro_settings?.short_break_duration && (
                <div className="flex items-center justify-between p-2 xs:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">☕ Pause</span>
                  <span className="text-xs text-gray-900 dark:text-gray-100">
                    {user.preferences.pomodoro_settings.short_break_duration}min
                  </span>
                </div>
              )}
            </div>

            {/* Éditer profil */}
            <EditProfileForm user={user} onUpdate={refreshUser} />
          </div>

          {/* 5. SÉCURITÉ (Changement mot de passe) */}
          <ChangePasswordForm onUpdate={refreshUser} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
