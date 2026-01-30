/**
 * Journals Page - Ermite Daily Journal Widget
 * Shinkofa Platform - Frontend
 *
 * Utilise le widget standalone de toolbox-theermite
 * API Sync activé pour synchronisation multi-device
 */

'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { PlannerNav } from '@/components/planner/PlannerNav'
import { useAuth, getUserId } from '@/hooks/useAuth'

// Import dynamique pour éviter les problèmes SSR avec localStorage
const DailyJournalWidget = dynamic(
  () => import('@ermite-widgets/daily-journal/src/DailyJournalWidget'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ermite-primary" />
      </div>
    )
  }
)

const TOKEN_KEY = 'shinkofa_access_token'

export default function JournalsPage() {
  const { isInitialized, userId } = useAuth()
  const t = useTranslations('planner.journals')

  // Configure API sync when auth is ready
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return

    const token = localStorage.getItem(TOKEN_KEY)
    const currentUserId = userId || getUserId()

    if (!currentUserId) {
      console.warn('[DailyJournal] No user ID available, API sync disabled')
      return
    }

    if (!token) {
      console.warn('[DailyJournal] No token in localStorage, API sync will be disabled')
    }

    // Dynamic import to ensure module is loaded before configuring
    import('@ermite-widgets/daily-journal/src/store').then(({ configureApiSync, loadFromApi, useJournalStore }) => {
      // Enable API sync
      configureApiSync({
        enabled: true,
        userId: currentUserId,
        token: token || undefined,
      })

      // Load initial data from API and merge with localStorage
      if (loadFromApi && token) {
        loadFromApi().then((apiData) => {
          const store = useJournalStore.getState()

          // CRITICAL: Check if local store is actually empty
          // An empty store with a fresh timestamp should NOT overwrite server data
          const localJournalCount = Object.keys(store.journals || {}).length
          const localIsEmpty = localJournalCount === 0

          if (apiData && apiData.lastUpdated) {
            const localTimestamp = new Date(store.lastUpdated).getTime()
            const apiTimestamp = new Date(apiData.lastUpdated).getTime()
            const apiJournalCount = Object.keys(apiData.journals || {}).length
            const apiHasData = apiJournalCount > 0

            // RULE 1: If local is empty but API has data, ALWAYS load from API
            if (localIsEmpty && apiHasData) {
              store.importData(JSON.stringify(apiData))
            }
            // RULE 2: If both have data, use timestamp comparison
            else if (apiTimestamp > localTimestamp) {
              store.importData(JSON.stringify(apiData))
            } else if (apiTimestamp === localTimestamp) {
              // Timestamps equal, no sync needed
            } else if (!localIsEmpty) {
              // RULE 3: Only push to API if local actually has data
              const currentData = { journals: store.journals, lastUpdated: store.lastUpdated }
              fetch(`/api/v1/widget-data/daily-journal/${currentUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ data: currentData })
              }).catch(err => console.error('Failed to sync to API:', err))
            }
            // else: Local is empty and API is older - no action needed
          } else {
            // No Daily Journal data on server - sync local to API if we have data
            if (!localIsEmpty) {
              const currentData = { journals: store.journals, lastUpdated: store.lastUpdated }
              fetch(`/api/v1/widget-data/daily-journal/${currentUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ data: currentData })
              }).catch(err => console.error('Failed to sync to API:', err))
            }
            // else: Both local and API are empty - nothing to sync
          }
        }).catch((err) => {
          console.error('Failed to load Daily Journal data from API:', err)
        })
      }
    }).catch((err) => {
      console.error('Failed to import Daily Journal store:', err)
    })
  }, [isInitialized, userId])

  // Show loading while initializing authentication
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ermite-primary mx-auto mb-4" />
          <p className="text-slate-400">{t('initializing')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header Shinkofa */}
      <header className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {t('title')}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </header>

      {/* Planner Navigation */}
      <PlannerNav />

      {/* Widget Container */}
      <div className="max-w-4xl mx-auto">
        <DailyJournalWidget />
      </div>
    </div>
  )
}
