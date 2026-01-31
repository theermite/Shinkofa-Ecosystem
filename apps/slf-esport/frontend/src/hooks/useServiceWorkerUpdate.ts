/**
 * Hook to detect service worker updates and prompt user to reload
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 *
 * DISABLED - Service worker functionality temporarily disabled
 * Returns dummy values to prevent build errors
 */

// import { useEffect, useState } from 'react'
// import { useRegisterSW } from 'virtual:pwa-register/react' // DISABLED

export function useServiceWorkerUpdate() {
  // Service worker disabled - return dummy values
  return {
    needRefresh: false,
    offlineReady: false,
    updateApp: () => {
      console.log('[SW] Service worker disabled')
    },
  }

  /* ORIGINAL CODE - COMMENTED OUT WHILE SW IS DISABLED
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)

  const {
    offlineReady: pwaOfflineReady,
    needRefresh: pwaNeedRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('[SW] Service Worker registered', registration)

      // Check for updates every 60 seconds
      if (registration) {
        setInterval(() => {
          console.log('[SW] Checking for updates...')
          registration.update()
        }, 60000)
      }
    },
    onRegisterError(error) {
      console.error('[SW] Service Worker registration error', error)
    },
    onNeedRefresh() {
      console.log('[SW] New content available, please refresh.')
      setNeedRefresh(true)
    },
    onOfflineReady() {
      console.log('[SW] App ready to work offline')
      setOfflineReady(true)
    },
  })

  useEffect(() => {
    setNeedRefresh(pwaNeedRefresh)
  }, [pwaNeedRefresh])

  useEffect(() => {
    setOfflineReady(pwaOfflineReady)
  }, [pwaOfflineReady])

  const updateApp = () => {
    updateServiceWorker(true)
  }

  return {
    needRefresh,
    offlineReady,
    updateApp,
  }
  */
}
