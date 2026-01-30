/**
 * Rituals Page - Daily rituals and habits
 * Shinkofa Platform - Frontend
 */

'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { RitualList } from '@/components/planner/rituals/RitualList'
import { CreateRitualModal } from '@/components/planner/rituals/CreateRitualModal'
import { EditRitualModal } from '@/components/planner/rituals/EditRitualModal'
import { PlannerNav } from '@/components/planner/PlannerNav'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useRituals, useResetRituals } from '@/hooks/api/useRituals'
import { useAuth } from '@/hooks/useAuth'
import type { Ritual } from '@/types/api'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

export default function RitualsPage() {
  const { isInitialized } = useAuth()
  const t = useTranslations('planner.rituals')
  const locale = useLocale()
  const dateLocale = locale === 'fr' ? fr : enUS
  const { data: rituals = [], isLoading, error } = useRituals()
  const resetRituals = useResetRituals()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRitual, setEditingRitual] = useState<Ritual | null>(null)

  const handleResetRituals = () => {
    if (confirm(t('resetConfirm'))) {
      resetRituals.mutate()
    }
  }

  const handleCreateRitual = () => {
    setShowCreateModal(true)
  }

  // Show loading while initializing authentication
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('initializing')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              🌸 {t('title')}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </header>

      {/* Planner Navigation */}
      <PlannerNav />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date & Actions Section */}
        <Card variant="elevated" className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  📅 {format(new Date(), 'EEEE dd MMMM yyyy', { locale: dateLocale })}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {t('checkRituals')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCreateRitual}
                >
                  ➕ {t('createButton')}
                </Button>
                {rituals.length > 0 && (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleResetRituals}
                    disabled={resetRituals.isPending}
                  >
                    {resetRituals.isPending ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        {t('resetting')}
                      </>
                    ) : (
                      <>🔄 {t('resetButton')}</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
                <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card variant="elevated">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t('errorTitle')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {error instanceof Error ? error.message : t('errorMessage')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rituals List */}
        {!isLoading && !error && (
          <RitualList rituals={rituals} onEdit={(ritual) => setEditingRitual(ritual)} />
        )}

        {/* Create Ritual Modal */}
        <CreateRitualModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

        {/* Edit Ritual Modal */}
        <EditRitualModal
          ritual={editingRitual}
          isOpen={!!editingRitual}
          onClose={() => setEditingRitual(null)}
        />

        {/* Info Card */}
        {!isLoading && !error && rituals.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">
                  💡
                </span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {t('infoTitle')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('infoDescription')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
