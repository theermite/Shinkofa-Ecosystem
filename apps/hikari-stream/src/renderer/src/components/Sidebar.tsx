import { useState, useEffect } from 'react'
import { useAppStore, CaptureSource } from '../stores/appStore'
import SourceSelector from './SourceSelector'
import MobileSelector from './MobileSelector'

interface MobileDevice {
  serial: string
  status: string
  model?: string
}

function Sidebar(): JSX.Element {
  const { scenes, activeSceneId, setActiveScene, activeSource, setActiveSource } = useAppStore()
  const [isSourceSelectorOpen, setIsSourceSelectorOpen] = useState(false)
  const [isMobileSelectorOpen, setIsMobileSelectorOpen] = useState(false)
  const [isMobileCasting, setIsMobileCasting] = useState(false)
  const [mobileDevice, setMobileDevice] = useState<MobileDevice | null>(null)

  // Listen for scrcpy events
  useEffect(() => {
    const cleanupStarted = window.api.on('scrcpy:started', (device: unknown) => {
      setIsMobileCasting(true)
      setMobileDevice(device as MobileDevice)
    })

    const cleanupStopped = window.api.on('scrcpy:stopped', () => {
      setIsMobileCasting(false)
      setMobileDevice(null)
    })

    return () => {
      cleanupStarted()
      cleanupStopped()
    }
  }, [])

  const handleSourceSelect = (source: CaptureSource): void => {
    setActiveSource(source)
    console.log('[Sidebar] Source selected:', source.name)
  }

  const handleMobileCastStart = (device: MobileDevice): void => {
    setIsMobileCasting(true)
    setMobileDevice(device)
    console.log('[Sidebar] Mobile cast started:', device.model || device.serial)
  }

  const getMobileDeviceName = (): string => {
    if (mobileDevice?.model) {
      return mobileDevice.model.replace(/_/g, ' ')
    }
    return 'Telephone'
  }

  return (
    <aside className="flex w-64 flex-col border-r border-hikari-800 bg-hikari-900">
      {/* Scenes section */}
      <section className="flex-1 overflow-y-auto p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-hikari-400">
          Scènes
        </h2>
        <div className="space-y-1">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => setActiveScene(scene.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                scene.id === activeSceneId
                  ? 'bg-hikari-600 text-white'
                  : 'text-hikari-300 hover:bg-hikari-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <SceneIcon type={scene.id} />
                <span>{scene.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Add scene button */}
        <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-hikari-700 px-3 py-2 text-sm text-hikari-400 transition-colors hover:border-hikari-500 hover:text-hikari-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nouvelle scène</span>
        </button>
      </section>

      {/* Sources section */}
      <section className="border-t border-hikari-800 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-hikari-400">
          Sources
        </h2>
        <div className="space-y-1">
          <SourceItem
            name={activeSource?.name || 'Capture écran'}
            type="screen"
            connected={!!activeSource}
            onClick={() => setIsSourceSelectorOpen(true)}
          />
          <SourceItem name="Webcam" type="webcam" connected={false} />
          <SourceItem
            name={isMobileCasting ? getMobileDeviceName() : 'Telephone'}
            type="phone"
            connected={isMobileCasting}
            onClick={() => setIsMobileSelectorOpen(true)}
          />
        </div>
      </section>

      {/* Source Selector Modal */}
      <SourceSelector
        isOpen={isSourceSelectorOpen}
        onClose={() => setIsSourceSelectorOpen(false)}
        onSelect={handleSourceSelect}
      />

      {/* Mobile Selector Modal */}
      <MobileSelector
        isOpen={isMobileSelectorOpen}
        onClose={() => setIsMobileSelectorOpen(false)}
        onStartCast={handleMobileCastStart}
      />

      {/* Quick settings */}
      <section className="border-t border-hikari-800 p-4">
        <button className="btn-ghost w-full justify-start gap-2 text-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Paramètres</span>
        </button>
      </section>
    </aside>
  )
}

function SceneIcon({ type }: { type: string }): JSX.Element {
  switch (type) {
    case 'starting':
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    case 'live':
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )
    case 'pause':
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    case 'ending':
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
          />
        </svg>
      )
    default:
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )
  }
}

function SourceItem({
  name,
  type,
  connected,
  onClick
}: {
  name: string
  type: 'screen' | 'webcam' | 'phone'
  connected: boolean
  onClick?: () => void
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-hikari-300 hover:bg-hikari-800 transition-colors"
    >
      <div className="flex items-center gap-2">
        <SourceIcon type={type} />
        <span className="truncate">{name}</span>
      </div>
      <span
        className={`h-2 w-2 flex-shrink-0 rounded-full ${connected ? 'bg-green-500' : 'bg-hikari-600'}`}
        title={connected ? 'Connecté' : 'Déconnecté'}
      />
    </button>
  )
}

function SourceIcon({ type }: { type: 'screen' | 'webcam' | 'phone' }): JSX.Element {
  switch (type) {
    case 'screen':
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      )
    case 'webcam':
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )
    case 'phone':
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      )
  }
}

export default Sidebar
