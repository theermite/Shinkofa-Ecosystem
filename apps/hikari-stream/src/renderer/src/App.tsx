import { useEffect, useState } from 'react'
import { useAppStore } from './stores/appStore'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Preview from './components/Preview'
import ControlPanel from './components/ControlPanel'
import SetupWizard from './components/SetupWizard'

function App(): JSX.Element {
  const { isInitialized, setInitialized, setAppInfo } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)

  useEffect(() => {
    const init = async (): Promise<void> => {
      try {
        console.log('[App] Starting init...')
        console.log('[App] window.api:', window.api)

        // Get app info
        const version = await window.api.getVersion()
        const name = await window.api.getName()
        const platform = await window.api.getPlatformInfo()
        console.log('[App] App info:', { name, version, platform })
        setAppInfo({ name, version, platform: platform.platform })

        // Check dependencies
        console.log('[App] Checking dependencies...')
        const depsStatus = await window.api.checkDepsStatus()
        console.log('[App] Dependencies status:', depsStatus)

        const allDepsInstalled = depsStatus.ffmpeg.installed && depsStatus.scrcpy.installed
        console.log('[App] All deps installed:', allDepsInstalled)

        if (!allDepsInstalled) {
          console.log('[App] Showing setup wizard')
          setNeedsSetup(true)
        } else {
          console.log('[App] All good, showing main UI')
          setInitialized(true)
        }
      } catch (error) {
        console.error('[App] Failed to initialize:', error)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [setAppInfo, setInitialized])

  const handleSetupComplete = (): void => {
    setNeedsSetup(false)
    setInitialized(true)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-hikari-950">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-hikari-500 border-t-transparent mx-auto" />
          <p className="text-hikari-300">Chargement de Hikari Stream...</p>
        </div>
      </div>
    )
  }

  if (needsSetup) {
    return <SetupWizard onComplete={handleSetupComplete} />
  }

  return (
    <div className="flex h-screen flex-col bg-hikari-950">
      <TitleBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Sources & Scenes */}
        <Sidebar />

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Preview area */}
          <Preview />

          {/* Control panel - Audio mixer, stream controls */}
          <ControlPanel />
        </main>
      </div>
    </div>
  )
}

export default App
