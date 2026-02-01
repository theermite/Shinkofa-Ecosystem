import { useEffect, useState, useRef, useCallback } from 'react'
import { useAppStore } from './stores/appStore'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Preview from './components/Preview'
import ControlPanel from './components/ControlPanel'
import SetupWizard from './components/SetupWizard'
import StreamInfoPanel from './components/StreamInfoPanel'

function App(): JSX.Element {
  const { setInitialized, setAppInfo } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [controlPanelHeight, setControlPanelHeight] = useState(140)
  const [isResizing, setIsResizing] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  // Handle resize
  const handleMouseDown = useCallback(() => {
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !mainRef.current) return

    const mainRect = mainRef.current.getBoundingClientRect()
    const newHeight = mainRect.bottom - e.clientY

    // Clamp height between 100 and 300 pixels
    setControlPanelHeight(Math.min(300, Math.max(100, newHeight)))
  }, [isResizing])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

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
        <main ref={mainRef} className="flex flex-1 flex-col overflow-hidden">
          {/* Preview area with info panel */}
          <div className="flex flex-1 overflow-hidden">
            <Preview />
            <StreamInfoPanel />
          </div>

          {/* Resize handle */}
          <div
            className={`h-1 cursor-ns-resize bg-hikari-800 hover:bg-hikari-600 transition-colors ${isResizing ? 'bg-hikari-500' : ''}`}
            onMouseDown={handleMouseDown}
          />

          {/* Control panel - Audio mixer, stream controls */}
          <div style={{ height: controlPanelHeight, minHeight: controlPanelHeight }}>
            <ControlPanel />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
