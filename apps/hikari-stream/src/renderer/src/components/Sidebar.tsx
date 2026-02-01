import { useState, useEffect } from 'react'
import { useAppStore, CaptureSource, PipPosition, PipSize, Scene, Overlay, TransitionType } from '../stores/appStore'
import SourceSelector from './SourceSelector'
import MobileSelector from './MobileSelector'
import WebcamSelector from './WebcamSelector'
import OverlaySelector from './OverlaySelector'
import { SessionHistory } from './SessionHistory'
import { MarkerPanel } from './MarkerPanel'
import { AppSettings } from './AppSettings'

interface MobileDevice {
  serial: string
  status: string
  model?: string
}

function Sidebar(): JSX.Element {
  const {
    scenes, activeSceneId, addScene, removeScene, renameScene, saveCurrentToScene,
    activeSource, setActiveSource,
    webcam, phone, setPhone, setWebcam,
    updateWebcamPosition, updateWebcamSize, toggleWebcam, bringWebcamToFront,
    updatePhonePosition, updatePhoneSize, togglePhone, bringPhoneToFront,
    overlays, toggleOverlay, removeOverlay, bringOverlayToFront,
    transitionConfig, setTransitionConfig, switchSceneWithTransition
  } = useAppStore()
  const [isSourceSelectorOpen, setIsSourceSelectorOpen] = useState(false)
  const [isMobileSelectorOpen, setIsMobileSelectorOpen] = useState(false)
  const [isWebcamSelectorOpen, setIsWebcamSelectorOpen] = useState(false)
  const [isOverlaySelectorOpen, setIsOverlaySelectorOpen] = useState(false)
  const [isMobileCasting, setIsMobileCasting] = useState(false)
  const [mobileDevice, setMobileDevice] = useState<MobileDevice | null>(null)
  const [isAddingScene, setIsAddingScene] = useState(false)
  const [newSceneName, setNewSceneName] = useState('')
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null)
  const [editingSceneName, setEditingSceneName] = useState('')
  const [showTransitionSettings, setShowTransitionSettings] = useState(false)
  const [isSessionHistoryOpen, setIsSessionHistoryOpen] = useState(false)
  const [isAppSettingsOpen, setIsAppSettingsOpen] = useState(false)

  // Listen for scrcpy events
  useEffect(() => {
    const cleanupStarted = window.api.on('scrcpy:started', async (device: unknown) => {
      setIsMobileCasting(true)
      setMobileDevice(device as MobileDevice)

      // Wait for scrcpy window to appear, then capture it
      const findWindow = async (attempts = 0): Promise<void> => {
        if (attempts > 20) {
          console.log('[Sidebar] Could not find scrcpy window after 20 attempts')
          return
        }

        console.log(`[Sidebar] Looking for scrcpy window (attempt ${attempts + 1})...`)
        const scrcpyWindow = await window.api.findScrcpyWindow()
        if (scrcpyWindow) {
          console.log('[Sidebar] Found scrcpy window:', scrcpyWindow.name, 'ID:', scrcpyWindow.id)
          const mobileDevice = device as MobileDevice | null
          setPhone({
            id: `phone-${crypto.randomUUID()}`,
            sourceId: scrcpyWindow.id,
            serial: mobileDevice?.serial || 'unknown',
            name: mobileDevice?.model?.replace(/_/g, ' ') || 'Telephone',
            enabled: true,
            position: 'bottom-left', // Default to bottom-left to avoid overlap with webcam
            size: 'medium',
            zIndex: 10 // Default layer (webcam defaults to 20, so webcam is on top)
          })
        } else {
          // Retry after 500ms
          setTimeout(() => findWindow(attempts + 1), 500)
        }
      }

      // Start looking for the window after scrcpy has time to open
      setTimeout(() => findWindow(), 2000)
    })

    const cleanupStopped = window.api.on('scrcpy:stopped', () => {
      setIsMobileCasting(false)
      setMobileDevice(null)
      setPhone(null) // Remove phone from preview
    })

    return () => {
      cleanupStarted()
      cleanupStopped()
    }
  }, [setPhone])

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
            <SceneItem
              key={scene.id}
              scene={scene}
              isActive={scene.id === activeSceneId}
              isEditing={editingSceneId === scene.id}
              editingName={editingSceneName}
              onSelect={() => switchSceneWithTransition(scene.id)}
              onStartEdit={() => {
                setEditingSceneId(scene.id)
                setEditingSceneName(scene.name)
              }}
              onCancelEdit={() => {
                setEditingSceneId(null)
                setEditingSceneName('')
              }}
              onSaveEdit={() => {
                if (editingSceneName.trim()) {
                  renameScene(scene.id, editingSceneName.trim())
                }
                setEditingSceneId(null)
                setEditingSceneName('')
              }}
              onEditNameChange={setEditingSceneName}
              onSaveCurrent={() => saveCurrentToScene(scene.id)}
              onDelete={() => removeScene(scene.id)}
            />
          ))}
        </div>

        {/* Add scene form */}
        {isAddingScene ? (
          <div className="mt-2 rounded-lg border border-hikari-600 bg-hikari-800 p-2">
            <input
              type="text"
              value={newSceneName}
              onChange={(e) => setNewSceneName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newSceneName.trim()) {
                  addScene(newSceneName.trim())
                  setNewSceneName('')
                  setIsAddingScene(false)
                } else if (e.key === 'Escape') {
                  setNewSceneName('')
                  setIsAddingScene(false)
                }
              }}
              placeholder="Nom de la scène..."
              className="w-full rounded bg-hikari-700 px-2 py-1 text-sm text-white placeholder-hikari-500 focus:outline-none focus:ring-1 focus:ring-hikari-500"
              autoFocus
            />
            <div className="mt-2 flex justify-end gap-1">
              <button
                onClick={() => {
                  setNewSceneName('')
                  setIsAddingScene(false)
                }}
                className="rounded px-2 py-1 text-xs text-hikari-400 hover:bg-hikari-700 hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (newSceneName.trim()) {
                    addScene(newSceneName.trim())
                    setNewSceneName('')
                    setIsAddingScene(false)
                  }
                }}
                disabled={!newSceneName.trim()}
                className="rounded bg-hikari-600 px-2 py-1 text-xs text-white hover:bg-hikari-500 disabled:opacity-50"
              >
                Ajouter
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingScene(true)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-hikari-700 px-3 py-2 text-sm text-hikari-400 transition-colors hover:border-hikari-500 hover:text-hikari-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nouvelle scène</span>
          </button>
        )}

        {/* Transition settings */}
        <div className="mt-3 rounded-lg bg-hikari-800/50 p-2">
          <button
            onClick={() => setShowTransitionSettings(!showTransitionSettings)}
            className="flex w-full items-center justify-between text-xs text-hikari-400 hover:text-hikari-300"
          >
            <span className="flex items-center gap-2">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Transition: {transitionConfig.type}
            </span>
            <svg className={`h-3 w-3 transition-transform ${showTransitionSettings ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showTransitionSettings && (
            <div className="mt-2 space-y-2 border-t border-hikari-700 pt-2">
              {/* Transition type */}
              <div>
                <label className="mb-1 block text-[10px] text-hikari-500">Type</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['cut', 'fade', 'slide-left', 'slide-right', 'slide-up', 'slide-down', 'zoom', 'wipe', 'move'] as TransitionType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTransitionConfig({ type })}
                      className={`rounded px-1.5 py-1 text-[10px] transition-colors ${
                        transitionConfig.type === type
                          ? 'bg-hikari-600 text-white'
                          : 'bg-hikari-700 text-hikari-400 hover:bg-hikari-600 hover:text-white'
                      }`}
                      title={type}
                    >
                      {type.split('-')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration slider */}
              {transitionConfig.type !== 'cut' && (
                <div>
                  <label className="mb-1 flex justify-between text-[10px] text-hikari-500">
                    <span>Durée</span>
                    <span>{transitionConfig.duration}ms</span>
                  </label>
                  <input
                    type="range"
                    min={100}
                    max={2000}
                    step={50}
                    value={transitionConfig.duration}
                    onChange={(e) => setTransitionConfig({ duration: parseInt(e.target.value) })}
                    className="w-full h-1.5 rounded-lg appearance-none bg-hikari-700 accent-hikari-500"
                  />
                </div>
              )}

              {/* Easing */}
              {transitionConfig.type !== 'cut' && (
                <div>
                  <label className="mb-1 block text-[10px] text-hikari-500">Easing</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['linear', 'ease-in', 'ease-out', 'ease-in-out'] as const).map((easing) => (
                      <button
                        key={easing}
                        onClick={() => setTransitionConfig({ easing })}
                        className={`rounded px-1 py-0.5 text-[9px] transition-colors ${
                          transitionConfig.easing === easing
                            ? 'bg-hikari-600 text-white'
                            : 'bg-hikari-700 text-hikari-400 hover:bg-hikari-600 hover:text-white'
                        }`}
                      >
                        {easing.replace('ease-', '')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Sources section */}
      <section className="border-t border-hikari-800 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-hikari-400">
          Sources
        </h2>
        <div className="space-y-2">
          {/* Screen capture */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSourceSelectorOpen(true)}
              className="flex flex-1 items-center justify-between rounded-lg px-3 py-2 text-sm text-hikari-300 hover:bg-hikari-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <SourceIcon type="screen" />
                <span className="truncate">{activeSource?.name || 'Capture écran'}</span>
              </div>
              <span
                className={`h-2 w-2 flex-shrink-0 rounded-full ${activeSource ? 'bg-green-500' : 'bg-hikari-600'}`}
                title={activeSource ? 'Connecté' : 'Déconnecté'}
              />
            </button>
            {activeSource && (
              <button
                onClick={() => setActiveSource(null)}
                className="rounded p-1.5 text-hikari-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Retirer la source"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Webcam with controls */}
          <SourceItemWithControls
            name={webcam?.label || 'Webcam'}
            type="webcam"
            connected={!!webcam?.enabled}
            position={webcam?.position}
            size={webcam?.size}
            isOnTop={(webcam?.zIndex || 20) >= (phone?.zIndex || 10)}
            onSelect={() => setIsWebcamSelectorOpen(true)}
            onPositionChange={updateWebcamPosition}
            onSizeChange={updateWebcamSize}
            onToggleVisibility={toggleWebcam}
            onBringToFront={bringWebcamToFront}
            onRemove={() => setWebcam(null)}
          />

          {/* Phone with controls */}
          <SourceItemWithControls
            name={phone?.name || (isMobileCasting ? getMobileDeviceName() : 'Telephone')}
            type="phone"
            connected={!!phone?.enabled}
            position={phone?.position}
            size={phone?.size}
            isOnTop={(phone?.zIndex || 10) > (webcam?.zIndex || 20)}
            onSelect={() => {
              if (phone && !phone.enabled) {
                setPhone({ ...phone, enabled: true })
              } else {
                setIsMobileSelectorOpen(true)
              }
            }}
            onPositionChange={updatePhonePosition}
            onSizeChange={updatePhoneSize}
            onToggleVisibility={togglePhone}
            onBringToFront={bringPhoneToFront}
            onRemove={() => setPhone(null)}
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

      {/* Webcam Selector Modal */}
      <WebcamSelector
        isOpen={isWebcamSelectorOpen}
        onClose={() => setIsWebcamSelectorOpen(false)}
      />

      {/* Overlay Selector Modal */}
      <OverlaySelector
        isOpen={isOverlaySelectorOpen}
        onClose={() => setIsOverlaySelectorOpen(false)}
      />

      {/* Overlays section */}
      <section className="border-t border-hikari-800 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-hikari-400">
          Overlays
        </h2>
        <div className="space-y-1">
          {overlays.map((overlay) => (
            <OverlayItem
              key={overlay.id}
              overlay={overlay}
              onToggle={() => toggleOverlay(overlay.id)}
              onBringToFront={() => bringOverlayToFront(overlay.id)}
              onRemove={() => removeOverlay(overlay.id)}
            />
          ))}
        </div>
        <button
          onClick={() => setIsOverlaySelectorOpen(true)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-hikari-700 px-3 py-2 text-sm text-hikari-400 transition-colors hover:border-hikari-500 hover:text-hikari-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Ajouter un overlay</span>
        </button>
      </section>

      {/* Markers section (visible when streaming) */}
      <section className="border-t border-hikari-800 p-4">
        <MarkerPanel />
      </section>

      {/* Quick settings */}
      <section className="border-t border-hikari-800 p-4 space-y-2">
        <button
          onClick={() => setIsSessionHistoryOpen(true)}
          className="btn-ghost w-full justify-start gap-2 text-sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Historique sessions</span>
        </button>
        <button
          onClick={() => setIsAppSettingsOpen(true)}
          className="btn-ghost w-full justify-start gap-2 text-sm"
        >
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

      {/* Session History Modal */}
      <SessionHistory
        isOpen={isSessionHistoryOpen}
        onClose={() => setIsSessionHistoryOpen(false)}
      />

      {/* App Settings Modal */}
      <AppSettings
        isOpen={isAppSettingsOpen}
        onClose={() => setIsAppSettingsOpen(false)}
      />
    </aside>
  )
}

function SceneItem({
  scene,
  isActive,
  isEditing,
  editingName,
  onSelect,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditNameChange,
  onSaveCurrent,
  onDelete
}: {
  scene: Scene
  isActive: boolean
  isEditing: boolean
  editingName: string
  onSelect: () => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onEditNameChange: (name: string) => void
  onSaveCurrent: () => void
  onDelete: () => void
}): JSX.Element {
  const [showMenu, setShowMenu] = useState(false)

  if (isEditing) {
    return (
      <div className="rounded-lg bg-hikari-700 px-3 py-2">
        <input
          type="text"
          value={editingName}
          onChange={(e) => onEditNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveEdit()
            else if (e.key === 'Escape') onCancelEdit()
          }}
          className="w-full rounded bg-hikari-600 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-hikari-500"
          autoFocus
        />
        <div className="mt-1 flex justify-end gap-1">
          <button onClick={onCancelEdit} className="rounded px-2 py-0.5 text-[10px] text-hikari-400 hover:bg-hikari-600">
            Annuler
          </button>
          <button onClick={onSaveEdit} className="rounded bg-hikari-500 px-2 py-0.5 text-[10px] text-white hover:bg-hikari-400">
            OK
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`group relative rounded-lg transition-colors ${
        isActive ? 'bg-hikari-600' : 'hover:bg-hikari-800'
      }`}
    >
      <button
        onClick={onSelect}
        className="w-full px-3 py-2 text-left text-sm"
      >
        <div className="flex items-center gap-2">
          <SceneIcon type={scene.id} />
          <span className={isActive ? 'text-white' : 'text-hikari-300'}>{scene.name}</span>
        </div>
      </button>

      {/* Menu button - visible on hover */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 transition-opacity ${
          showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        } ${isActive ? 'text-white/70 hover:bg-hikari-500' : 'text-hikari-400 hover:bg-hikari-700'}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-hikari-700 bg-hikari-800 py-1 shadow-lg">
            <button
              onClick={() => {
                onSaveCurrent()
                setShowMenu(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-hikari-300 hover:bg-hikari-700 hover:text-white"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Sauvegarder ici
            </button>
            <button
              onClick={() => {
                onStartEdit()
                setShowMenu(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-hikari-300 hover:bg-hikari-700 hover:text-white"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Renommer
            </button>
            <hr className="my-1 border-hikari-700" />
            <button
              onClick={() => {
                onDelete()
                setShowMenu(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-600/20"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer
            </button>
          </div>
        </>
      )}
    </div>
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

function SourceItemWithControls({
  name,
  type,
  connected,
  position,
  size,
  isOnTop,
  onSelect,
  onPositionChange,
  onSizeChange,
  onToggleVisibility,
  onBringToFront,
  onRemove
}: {
  name: string
  type: 'webcam' | 'phone'
  connected: boolean
  position?: PipPosition
  size?: PipSize
  isOnTop?: boolean
  onSelect: () => void
  onPositionChange: (pos: PipPosition) => void
  onSizeChange: (size: PipSize) => void
  onToggleVisibility: () => void
  onBringToFront: () => void
  onRemove: () => void
}): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false)
  const colorClass = type === 'webcam' ? 'hikari' : 'green'

  const positions: { value: PipPosition; label: string; icon: JSX.Element }[] = [
    { value: 'top-left', label: 'Haut gauche', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17V7h10" /> },
    { value: 'top-right', label: 'Haut droite', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17V7H7" /> },
    { value: 'center', label: 'Centre', icon: <circle cx="12" cy="12" r="3" strokeWidth={2} /> },
    { value: 'bottom-left', label: 'Bas gauche', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7v10h10" /> },
    { value: 'bottom-right', label: 'Bas droite', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7v10H7" /> }
  ]

  const sizes: { value: PipSize; label: string }[] = [
    { value: 'small', label: 'S' },
    { value: 'medium', label: 'M' },
    { value: 'large', label: 'L' },
    { value: 'full', label: 'F' }
  ]

  return (
    <div className="rounded-lg bg-hikari-800/50">
      {/* Main row */}
      <div className="flex items-center justify-between px-3 py-2">
        <button
          onClick={onSelect}
          className="flex flex-1 items-center gap-2 text-sm text-hikari-300 hover:text-white transition-colors"
        >
          <SourceIcon type={type} />
          <span className="truncate">{name}</span>
        </button>
        <div className="flex items-center gap-1">
          <span
            className={`h-2 w-2 flex-shrink-0 rounded-full ${connected ? 'bg-green-500' : 'bg-hikari-600'}`}
            title={connected ? 'Connecté' : 'Déconnecté'}
          />
          {connected && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-1 rounded p-1 text-hikari-400 hover:bg-hikari-700 hover:text-white transition-colors"
              title={isExpanded ? 'Masquer les options' : 'Afficher les options'}
            >
              <svg className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expanded controls */}
      {connected && isExpanded && (
        <div className="border-t border-hikari-700 px-3 py-2 space-y-2">
          {/* Position controls */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-hikari-500 w-10">Position</span>
            <div className="flex gap-0.5">
              {positions.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => onPositionChange(pos.value)}
                  className={`rounded p-1 transition-colors ${
                    position === pos.value && size !== 'full'
                      ? `bg-${colorClass}-500 text-white`
                      : 'bg-hikari-700 text-hikari-300 hover:bg-hikari-600'
                  }`}
                  title={pos.label}
                  disabled={size === 'full'}
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {pos.icon}
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Size controls */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-hikari-500 w-10">Taille</span>
            <div className="flex gap-0.5">
              {sizes.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onSizeChange(s.value)}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                    size === s.value
                      ? `bg-${colorClass}-500 text-white`
                      : 'bg-hikari-700 text-hikari-300 hover:bg-hikari-600'
                  }`}
                  title={s.value === 'full' ? 'Plein écran' : s.label}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={onBringToFront}
              disabled={isOnTop}
              className={`rounded px-2 py-1 text-[10px] transition-colors ${
                isOnTop
                  ? 'bg-hikari-700/50 text-hikari-500 cursor-not-allowed'
                  : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 hover:text-blue-300'
              }`}
              title={isOnTop ? 'Déjà au premier plan' : 'Mettre au premier plan'}
            >
              {isOnTop ? '1er' : '↑ 1er'}
            </button>
            <button
              onClick={onToggleVisibility}
              className="flex-1 rounded bg-hikari-700 px-2 py-1 text-[10px] text-hikari-300 hover:bg-hikari-600 hover:text-white transition-colors"
              title="Masquer temporairement"
            >
              Masquer
            </button>
            <button
              onClick={onRemove}
              className="rounded bg-red-600/20 px-2 py-1 text-[10px] text-red-400 hover:bg-red-600/40 hover:text-red-300 transition-colors"
              title="Supprimer la source"
            >
              Suppr
            </button>
          </div>
        </div>
      )}
    </div>
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

function OverlayItem({
  overlay,
  onToggle,
  onBringToFront,
  onRemove
}: {
  overlay: Overlay
  onToggle: () => void
  onBringToFront: () => void
  onRemove: () => void
}): JSX.Element {
  const getIcon = (): JSX.Element => {
    switch (overlay.type) {
      case 'image':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'text':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        )
      case 'video':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      case 'browser':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        )
    }
  }

  const getTypeLabel = (): string => {
    switch (overlay.type) {
      case 'image': return 'Image'
      case 'text': return 'Texte'
      case 'video': return 'Video'
      case 'browser': return 'Widget'
    }
  }

  return (
    <div className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
      overlay.enabled ? 'bg-hikari-800/50' : 'bg-hikari-800/20 opacity-60'
    }`}>
      <div className="flex-shrink-0 text-hikari-400">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm text-hikari-300">{overlay.name}</p>
        <p className="text-[10px] text-hikari-500">{getTypeLabel()}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onToggle}
          className={`rounded p-1 transition-colors ${
            overlay.enabled
              ? 'text-green-400 hover:bg-green-600/20'
              : 'text-hikari-500 hover:bg-hikari-700'
          }`}
          title={overlay.enabled ? 'Masquer' : 'Afficher'}
        >
          {overlay.enabled ? (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          )}
        </button>
        <button
          onClick={onBringToFront}
          className="rounded p-1 text-hikari-400 hover:bg-hikari-700 hover:text-white transition-colors"
          title="Premier plan"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={onRemove}
          className="rounded p-1 text-red-400 hover:bg-red-600/20 transition-colors"
          title="Supprimer"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
