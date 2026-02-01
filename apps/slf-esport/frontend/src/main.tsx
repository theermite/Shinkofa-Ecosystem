import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

// PWA Auto-Update: Detect new version and reload automatically
if ('serviceWorker' in navigator) {
  // Register for updates
  navigator.serviceWorker.ready.then((registration) => {
    // Check for updates every 30 seconds (during active development)
    setInterval(() => {
      registration.update()
    }, 30 * 1000)
  })

  // Listen for new SW activation and reload page
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    console.log('[PWA] New version available, reloading...')
    window.location.reload()
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
