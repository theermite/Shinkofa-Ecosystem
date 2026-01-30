'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

export default function PlannerPage() {
  const t = useTranslations('planner')

  const plannerSections = [
    {
      href: '/planner/tasks',
      icon: '📋',
      title: t('sections.tasks.title'),
      description: t('sections.tasks.description'),
      gradient: 'from-blue-500 to-blue-700',
    },
    {
      href: '/planner/journals',
      icon: '📖',
      title: t('sections.journals.title'),
      description: t('sections.journals.description'),
      gradient: 'from-green-500 to-green-700',
    },
    {
      href: '/planner/rituals',
      icon: '🕉️',
      title: t('sections.rituals.title'),
      description: t('sections.rituals.description'),
      gradient: 'from-orange-500 to-orange-700',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900 dark:to-blue-900 py-6 xs:py-8 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 xs:mb-10 sm:mb-12">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 xs:mb-4">
            📅 {t('title')}
          </h1>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 px-2">
            {t('subtitle')}
          </p>
        </div>

        {/* Info Notice - Cloud Sync Enabled */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 xs:p-4 mb-6 xs:mb-8 max-w-4xl mx-auto">
          <div className="flex items-start gap-2 xs:gap-3">
            <span className="text-xl xs:text-2xl">☁️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1 text-sm xs:text-base">
                {t('cloudSync.title')}
              </h3>
              <p className="text-xs xs:text-sm text-green-800 dark:text-green-200">
                {t('cloudSync.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Planner Sections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 mb-8 xs:mb-12">
          {plannerSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden touch-target"
            >
              <div className={`bg-gradient-to-r ${section.gradient} p-4 xs:p-6 text-white`}>
                <div className="text-3xl xs:text-4xl sm:text-5xl mb-2">{section.icon}</div>
                <h2 className="text-lg xs:text-xl sm:text-2xl font-bold">{section.title}</h2>
              </div>
              <div className="p-4 xs:p-6">
                <p className="text-sm xs:text-base text-gray-600 dark:text-gray-400 mb-3 xs:mb-4">
                  {section.description}
                </p>
                <div className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform text-sm xs:text-base">
                  {t('accessButton')} →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 xs:p-6 sm:p-8">
          <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 xs:mb-4">
            🤖 {t('features.title')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <strong>{t('features.humanDesign.title')}</strong>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('features.humanDesign.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <strong>{t('features.energyTracking.title')}</strong>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('features.energyTracking.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <strong>{t('features.smartPriorities.title')}</strong>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('features.smartPriorities.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <strong>{t('features.holisticSync.title')}</strong>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('features.holisticSync.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
