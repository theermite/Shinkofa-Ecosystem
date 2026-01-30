/**
 * Tasks Page - Ermite Task Manager Widget
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
const TaskManagerWidget = dynamic(
  () => import('@ermite-widgets/task-manager/src/TaskManagerWidget'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }
)

const TOKEN_KEY = 'shinkofa_access_token'

export default function TasksPage() {
  const { isInitialized, userId } = useAuth()
  const t = useTranslations('planner.tasks')

  // Configure API sync when auth is ready
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return

    const token = localStorage.getItem(TOKEN_KEY)
    const currentUserId = userId || getUserId()

    if (!currentUserId) {
      console.warn('[TaskManager] No user ID available, API sync disabled')
      return
    }

    if (!token) {
      console.warn('[TaskManager] No token in localStorage, API sync will be disabled')
    }

    // Dynamic import to ensure module is loaded before configuring
    import('@ermite-widgets/task-manager/src/store').then(({ configureApiSync, loadFromApi, useTaskStore }) => {
      // Enable API sync
      configureApiSync({
        enabled: true,
        userId: currentUserId,
        token: token || undefined,
      })

      console.log(`✅ Task Manager API sync configured for user: ${currentUserId}, token: ${token ? 'present' : 'MISSING'}`)

      // Load initial data from API and merge with localStorage
      if (loadFromApi && token) {
        loadFromApi().then((apiData) => {
          const store = useTaskStore.getState()

          // CRITICAL: Check if local store is actually empty
          // An empty store with a fresh timestamp should NOT overwrite server data
          const localTaskCount = store.tasks?.length || 0
          const localProjectCount = store.projects?.length || 0
          const localIsEmpty = localTaskCount === 0 && localProjectCount === 0

          if (apiData && apiData.lastUpdated) {
            console.log('✅ Task Manager data loaded from API:', apiData.lastUpdated)
            const localTimestamp = new Date(store.lastUpdated).getTime()
            const apiTimestamp = new Date(apiData.lastUpdated).getTime()
            const apiTaskCount = apiData.tasks?.length || 0
            const apiProjectCount = apiData.projects?.length || 0
            const apiHasData = apiTaskCount > 0 || apiProjectCount > 0

            console.log(`📊 Comparing: API=${apiTimestamp} (${apiTaskCount} tasks, ${apiProjectCount} projects) vs Local=${localTimestamp} (${localTaskCount} tasks, ${localProjectCount} projects)`)
            console.log(`📊 Local empty: ${localIsEmpty}, API has data: ${apiHasData}`)

            // RULE 1: If local is empty but API has data, ALWAYS load from API
            if (localIsEmpty && apiHasData) {
              console.log('📥 Local is empty but API has data - loading from API (preventing data loss)')
              store.importData(JSON.stringify(apiData))
            }
            // RULE 2: If both have data, use timestamp comparison
            else if (apiTimestamp > localTimestamp) {
              console.log('📥 API data is newer, updating local store')
              store.importData(JSON.stringify(apiData))
            } else if (apiTimestamp === localTimestamp) {
              console.log('⚖️ Timestamps equal, no sync needed')
            } else if (!localIsEmpty) {
              // RULE 3: Only push to API if local actually has data
              console.log('📤 Local data is newer and has content, syncing to API...')
              const currentData = { tasks: store.tasks, projects: store.projects, lastUpdated: store.lastUpdated }
              fetch(`/api/v1/widget-data/task-manager/${currentUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ data: currentData })
              }).then(() => console.log('✅ Local data synced to API'))
                .catch(err => console.error('❌ Failed to sync to API:', err))
            } else {
              console.log('⏭️ Local is empty and API is older - no action needed')
            }
          } else {
            console.log('ℹ️ No Task Manager data on server')
            // Only sync local to API if we actually have data
            if (!localIsEmpty) {
              console.log('📤 Syncing local data to API...')
              const currentData = { tasks: store.tasks, projects: store.projects, lastUpdated: store.lastUpdated }
              fetch(`/api/v1/widget-data/task-manager/${currentUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ data: currentData })
              }).then(() => console.log('✅ Initial local data synced to API'))
                .catch(err => console.error('❌ Failed to sync to API:', err))
            } else {
              console.log('⏭️ Both local and API are empty - nothing to sync')
            }
          }
        }).catch((err) => {
          console.error('❌ Failed to load Task Manager data from API:', err)
        })
      }
    }).catch((err) => {
      console.error('❌ Failed to import Task Manager store:', err)
    })
  }, [isInitialized, userId])

  // Show loading while initializing authentication
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
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
        <TaskManagerWidget />
      </div>
    </div>
  )
}
