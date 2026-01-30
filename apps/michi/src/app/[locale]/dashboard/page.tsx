'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useHolisticProfileByUser } from '@/hooks/api/useHolisticProfile'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function DashboardContent() {
  const { user } = useAuth()
  const t = useTranslations('dashboard')

  // Load holistic profile for current user
  const { data: holisticProfile, isLoading: profileLoading } = useHolisticProfileByUser(
    user?.id || '',
    !!user?.id
  )

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-lg p-8 mb-8 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('welcome', { username: user.username })} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {t('welcomeBack')}
          </p>
        </div>

        {/* Holistic Profile Section - KILLER FEATURE */}
        {!profileLoading && holisticProfile ? (
          // Profile exists - Show highlights
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-5 left-5 text-6xl">✨</div>
                <div className="absolute bottom-5 right-5 text-6xl">🌟</div>
                <div className="absolute top-1/2 right-1/4 text-4xl">💫</div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-5xl">🌟</span>
                  <div>
                    <h2 className="text-3xl font-bold">{t('holisticProfile.title')}</h2>
                    <p className="text-white/90 text-sm">
                      {t('holisticProfile.subtitle')}
                    </p>
                  </div>
                </div>

                {/* Key Insights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {holisticProfile.design_human && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                      <p className="text-white/80 text-xs font-semibold mb-1">{t('holisticProfile.humanDesign')}</p>
                      <p className="text-2xl font-bold">{holisticProfile.design_human.type}</p>
                      <p className="text-sm text-white/80 mt-1">{holisticProfile.design_human.profile}</p>
                    </div>
                  )}

                  {holisticProfile.astrology_western && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                      <p className="text-white/80 text-xs font-semibold mb-1">{t('holisticProfile.sunSign')}</p>
                      <p className="text-2xl font-bold">{holisticProfile.astrology_western.sun_sign.toUpperCase()}</p>
                      <p className="text-sm text-white/80 mt-1">
                        Asc: {holisticProfile.astrology_western.ascendant.toUpperCase()}
                      </p>
                    </div>
                  )}

                  {holisticProfile.shinkofa_analysis && holisticProfile.shinkofa_analysis.archetypes && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                      <p className="text-white/80 text-xs font-semibold mb-1">{t('holisticProfile.archetype')}</p>
                      <p className="text-2xl font-bold">{holisticProfile.shinkofa_analysis.archetypes.primary}</p>
                      <p className="text-sm text-white/80 mt-1">{t('holisticProfile.primary')}</p>
                    </div>
                  )}

                  {holisticProfile.numerology && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                      <p className="text-white/80 text-xs font-semibold mb-1">{t('holisticProfile.lifePath')}</p>
                      <p className="text-2xl font-bold">{holisticProfile.numerology.life_path}</p>
                      <p className="text-sm text-white/80 mt-1">{t('holisticProfile.numerology')}</p>
                    </div>
                  )}
                </div>

                {/* Dominant Neurodivergence */}
                {holisticProfile.neurodivergence_analysis && (
                  <div className="mb-6">
                    <p className="text-white/80 text-sm font-semibold mb-2">{t('holisticProfile.neurodivergent')}</p>
                    <div className="flex flex-wrap gap-2">
                      {holisticProfile.neurodivergence_analysis.adhd.score >= 50 && (
                        <span className="px-3 py-1 bg-white/30 rounded-full text-sm font-medium">
                          TDAH ({holisticProfile.neurodivergence_analysis.adhd.score})
                        </span>
                      )}
                      {holisticProfile.neurodivergence_analysis.hpi.score >= 50 && (
                        <span className="px-3 py-1 bg-white/30 rounded-full text-sm font-medium">
                          HPI ({holisticProfile.neurodivergence_analysis.hpi.score})
                        </span>
                      )}
                      {holisticProfile.neurodivergence_analysis.hypersensitivity.score >= 50 && (
                        <span className="px-3 py-1 bg-white/30 rounded-full text-sm font-medium">
                          Hypersensible ({holisticProfile.neurodivergence_analysis.hypersensitivity.score})
                        </span>
                      )}
                      {holisticProfile.neurodivergence_analysis.multipotentiality.score >= 50 && (
                        <span className="px-3 py-1 bg-white/30 rounded-full text-sm font-medium">
                          Multipotentiel ({holisticProfile.neurodivergence_analysis.multipotentiality.score})
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <div className="flex gap-4">
                  <Link
                    href="/profile/holistic"
                    className="flex-1 px-6 py-4 bg-white text-purple-600 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center"
                  >
                    🔍 {t('holisticProfile.exploreButton')}
                  </Link>
                </div>

                {/* Generation Date */}
                <p className="text-white/60 text-xs mt-4 text-center">
                  {t('holisticProfile.generatedOn')} {new Date(holisticProfile.generated_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        ) : !profileLoading ? (
          // No profile yet - Invitation
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-5 left-5 text-6xl">✨</div>
                <div className="absolute bottom-5 right-5 text-6xl">🌟</div>
                <div className="absolute top-1/2 right-1/4 text-4xl">💫</div>
              </div>

              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className="text-7xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold mb-3">
                    {t('noProfile.title')}
                  </h2>
                  <p className="text-xl text-white/90 mb-4 max-w-3xl mx-auto">
                    {t('noProfile.subtitle')}
                  </p>
                  <p className="text-white/80 text-lg mb-6">
                    📊 {t('noProfile.unique')}
                  </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <div className="text-3xl mb-2">🧠</div>
                    <h3 className="font-bold mb-1">{t('noProfile.psychology')}</h3>
                    <p className="text-sm text-white/80">{t('noProfile.psychologyDesc')}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <div className="text-3xl mb-2">⚡</div>
                    <h3 className="font-bold mb-1">{t('noProfile.humanDesignAstro')}</h3>
                    <p className="text-sm text-white/80">{t('noProfile.humanDesignAstroDesc')}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <div className="text-3xl mb-2">🌟</div>
                    <h3 className="font-bold mb-1">{t('noProfile.shinkofa')}</h3>
                    <p className="text-sm text-white/80">{t('noProfile.shinkofaDesc')}</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                  <Link
                    href="/questionnaire"
                    className="inline-block px-8 py-4 bg-white text-purple-600 font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    📝 {t('noProfile.startButton')}
                  </Link>
                  <p className="text-white/70 text-sm mt-3">
                    ⏱️ {t('noProfile.duration')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('stats.email')}</p>
                <p className="text-gray-900 dark:text-white font-medium">{user.email || t('stats.emailNotProvided')}</p>
              </div>
              {user.email_verified ? (
                <span className="text-green-500 dark:text-green-400 text-2xl">✓</span>
              ) : (
                <span className="text-yellow-500 dark:text-yellow-400 text-2xl">⚠</span>
              )}
            </div>
            {!user.email_verified && user.email && (
              <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-2">
                {t('stats.emailNotVerified')}
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('stats.accountCreated')}</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {new Date(user.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('stats.status')}</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {user.is_active ? (
                <span className="text-green-500 dark:text-green-400">✓ {t('stats.statusActive')}</span>
              ) : (
                <span className="text-red-500 dark:text-red-400">✗ {t('stats.statusInactive')}</span>
              )}
            </p>
          </div>
        </div>

        {/* Quick Links - Platform Sections */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('quickAccess.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Questionnaire Holistique */}
            <Link
              href="/questionnaire"
              className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 hover:shadow-xl transition-shadow border border-purple-400/20 group"
            >
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                {t('quickAccess.questionnaire')}
              </h3>
              <p className="text-purple-200 text-sm">
                {t('quickAccess.questionnaireDesc')}
              </p>
            </Link>

            {/* Shizen AI Coach */}
            <Link
              href="/shizen"
              className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-6 hover:shadow-xl transition-shadow border border-green-400/20 group"
            >
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                {t('quickAccess.shizen')}
              </h3>
              <p className="text-green-200 text-sm">
                {t('quickAccess.shizenDesc')}
              </p>
            </Link>

            {/* Planner Intelligent */}
            <Link
              href="/planner"
              className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 hover:shadow-xl transition-shadow border border-blue-400/20 group"
            >
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                {t('quickAccess.planner')}
              </h3>
              <p className="text-blue-200 text-sm">
                {t('quickAccess.plannerDesc')}
              </p>
            </Link>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('userProfile.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('userProfile.username')}</p>
              <p className="text-gray-900 dark:text-white font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('userProfile.userId')}</p>
              <p className="text-gray-900 dark:text-white font-mono text-sm">{user.id}</p>
            </div>
          </div>

          {/* Preferences Preview */}
          {user.preferences && Object.keys(user.preferences).length > 0 && (
            <div className="mt-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{t('userProfile.preferences')}</p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {user.preferences.theme && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t('userProfile.theme')} : </span>
                      <span className="text-gray-900 dark:text-white">{user.preferences.theme}</span>
                    </div>
                  )}
                  {user.preferences.language && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t('userProfile.language')} : </span>
                      <span className="text-gray-900 dark:text-white">{user.preferences.language}</span>
                    </div>
                  )}
                  {user.preferences.notifications_enabled !== undefined && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t('userProfile.notifications')} : </span>
                      <span className="text-gray-900 dark:text-white">
                        {user.preferences.notifications_enabled ? t('userProfile.enabled') : t('userProfile.disabled')}
                      </span>
                    </div>
                  )}
                  {user.preferences.adaptive_recommendations !== undefined && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t('userProfile.adaptiveReco')} : </span>
                      <span className="text-gray-900 dark:text-white">
                        {user.preferences.adaptive_recommendations ? t('userProfile.enabled') : t('userProfile.disabled')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Future: Link to full profile settings */}
          <div className="mt-6">
            <Link
              href="/profile"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {t('userProfile.editProfile')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
