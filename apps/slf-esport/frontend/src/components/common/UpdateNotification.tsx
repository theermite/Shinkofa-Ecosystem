/**
 * Update Notification - Prompts user to reload when new version is available
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import { useEffect, useState } from 'react'
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate'

export default function UpdateNotification() {
  // ONLY enable auto-update on production domain (lslf.shinkofa.com)
  // Disabled on dev subdomain (devslf.shinkofa.com) to avoid constant notifications during development
  const isProduction = window.location.hostname === 'lslf.shinkofa.com'

  if (!isProduction) {
    return null
  }

  const { needRefresh, offlineReady, updateApp } = useServiceWorkerUpdate()
  const [showUpdateNotification, setShowUpdateNotification] = useState(false)
  const [showOfflineNotification, setShowOfflineNotification] = useState(false)

  useEffect(() => {
    if (needRefresh) {
      setShowUpdateNotification(true)
    }
  }, [needRefresh])

  useEffect(() => {
    if (offlineReady) {
      setShowOfflineNotification(true)
      // Auto-hide offline notification after 5 seconds
      setTimeout(() => setShowOfflineNotification(false), 5000)
    }
  }, [offlineReady])

  const handleUpdate = async () => {
    setShowUpdateNotification(false)
    // Update service worker and reload page
    await updateApp()
    // Force reload if update doesn't trigger automatically
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleDismiss = () => {
    setShowUpdateNotification(false)
  }

  if (!showUpdateNotification && !showOfflineNotification) {
    return null
  }

  return (
    <>
      {/* Update Notification */}
      {showUpdateNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideInUp">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-primary-500 max-w-md p-6">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Nouvelle version disponible !
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Une mise à jour est prête. Rechargez pour profiter des dernières améliorations.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Mettre à jour
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors"
                  >
                    Plus tard
                  </button>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Ready Notification */}
      {showOfflineNotification && (
        <div className="fixed bottom-6 left-6 z-50 animate-slideInUp">
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg shadow-lg border-2 border-green-500 p-4 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                  Application prête hors-ligne
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Vous pouvez utiliser l'app sans connexion
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideInUp {
          animation: slideInUp 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
