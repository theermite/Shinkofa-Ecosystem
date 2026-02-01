import { useState, useEffect } from 'react'
import { useAppStore } from '../stores/appStore'

interface AppSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function AppSettings({ isOpen, onClose }: AppSettingsProps): JSX.Element | null {
  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'video' | 'shortcuts'>('general')
  const [appVersion, setAppVersion] = useState('')
  const [wsPort, setWsPort] = useState(0)
  const [wsClients, setWsClients] = useState(0)
  const [obsidianVaultPath, setObsidianVaultPath] = useState('D:/Obsidian/Stream-Notes')

  // Dependency status
  const [depsStatus, setDepsStatus] = useState<{
    ffmpeg: { installed: boolean; path: string | null; version: string | null }
    scrcpy: { installed: boolean; path: string | null; version: string | null }
  } | null>(null)

  const savedDevices = useAppStore((state) => state.savedDevices)
  const removeSavedDevice = useAppStore((state) => state.removeSavedDevice)

  useEffect(() => {
    if (!isOpen) return

    const loadInfo = async (): Promise<void> => {
      try {
        const version = await window.api.getVersion()
        setAppVersion(version)

        const port = await window.api.getWsPort()
        setWsPort(port)

        const clients = await window.api.getWsClients()
        setWsClients(clients)

        const deps = await window.api.checkDepsStatus()
        setDepsStatus(deps)
      } catch (error) {
        console.error('[AppSettings] Failed to load info:', error)
      }
    }

    loadInfo()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-hikari-900 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-hikari-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-hikari-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Parametres
          </h2>
          <button
            onClick={onClose}
            className="text-hikari-400 hover:text-white p-1 rounded hover:bg-hikari-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-hikari-700">
          {(['general', 'audio', 'video', 'shortcuts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-hikari-500 text-hikari-300'
                  : 'text-hikari-500 hover:text-hikari-400'
              }`}
            >
              {tab === 'general' ? 'General' : tab === 'audio' ? 'Audio' : tab === 'video' ? 'Video' : 'Raccourcis'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* App Info */}
              <section>
                <h3 className="text-sm font-medium text-hikari-300 mb-3">Application</h3>
                <div className="bg-hikari-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-hikari-400">Version</span>
                    <span className="text-white font-mono">{appVersion || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-hikari-400">WebSocket Port</span>
                    <span className="text-white font-mono">{wsPort || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-hikari-400">Clients connectes</span>
                    <span className="text-white font-mono">{wsClients}</span>
                  </div>
                </div>
              </section>

              {/* Dependencies */}
              <section>
                <h3 className="text-sm font-medium text-hikari-300 mb-3">Dependances</h3>
                <div className="bg-hikari-800/50 rounded-lg p-4 space-y-3">
                  {/* FFmpeg */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${depsStatus?.ffmpeg.installed ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-hikari-300">FFmpeg</span>
                    </div>
                    <span className="text-xs text-hikari-500 font-mono truncate max-w-[200px]">
                      {depsStatus?.ffmpeg.version || (depsStatus?.ffmpeg.installed ? 'Installe' : 'Non installe')}
                    </span>
                  </div>
                  {/* scrcpy */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${depsStatus?.scrcpy.installed ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-hikari-300">scrcpy</span>
                    </div>
                    <span className="text-xs text-hikari-500 font-mono truncate max-w-[200px]">
                      {depsStatus?.scrcpy.version || (depsStatus?.scrcpy.installed ? 'Installe' : 'Non installe')}
                    </span>
                  </div>
                </div>
              </section>

              {/* Obsidian */}
              <section>
                <h3 className="text-sm font-medium text-hikari-300 mb-3">Export Obsidian</h3>
                <div className="bg-hikari-800/50 rounded-lg p-4">
                  <label className="text-xs text-hikari-400 block mb-1">Chemin du vault</label>
                  <input
                    type="text"
                    value={obsidianVaultPath}
                    onChange={(e) => setObsidianVaultPath(e.target.value)}
                    className="w-full bg-hikari-700 border border-hikari-600 rounded px-3 py-2 text-sm text-white placeholder-hikari-500 focus:outline-none focus:ring-1 focus:ring-hikari-500"
                  />
                </div>
              </section>

              {/* Saved Devices */}
              <section>
                <h3 className="text-sm font-medium text-hikari-300 mb-3">Appareils sauvegardes ({savedDevices.length})</h3>
                {savedDevices.length > 0 ? (
                  <div className="bg-hikari-800/50 rounded-lg divide-y divide-hikari-700">
                    {savedDevices.map((device) => (
                      <div key={device.serial} className="flex items-center justify-between p-3">
                        <div>
                          <p className="text-sm text-hikari-200">{device.customLabel || device.model}</p>
                          <p className="text-xs text-hikari-500">
                            {device.wifiIp && <span className="font-mono">{device.wifiIp}</span>}
                            {!device.wifiIp && <span>USB uniquement</span>}
                          </p>
                        </div>
                        <button
                          onClick={() => removeSavedDevice(device.serial)}
                          className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-hikari-500">Aucun appareil sauvegarde</p>
                )}
              </section>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-6">
              <p className="text-sm text-hikari-400">
                La configuration audio se fait dans le mixeur (barre en bas).
              </p>
              <div className="bg-hikari-800/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-hikari-300 mb-2">Pistes audio disponibles</h3>
                <ul className="text-sm text-hikari-400 space-y-1">
                  <li>- Microphone</li>
                  <li>- Son PC (Desktop)</li>
                  <li>- Telephone (via scrcpy)</li>
                  <li>- Musique</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-6">
              <p className="text-sm text-hikari-400">
                La configuration video se fait dans les parametres du stream (bouton engrenage a cote de "Demarrer le stream").
              </p>
              <div className="bg-hikari-800/50 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-medium text-hikari-300 mb-2">Encodeurs detectes</h3>
                <p className="text-xs text-hikari-400">
                  L'encodeur est selectionne automatiquement (NVENC {`>`} AMF {`>`} QSV {`>`} x264)
                </p>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div className="bg-hikari-800/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-hikari-300 mb-3">Raccourcis clavier</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-hikari-400">Marqueur Epic</span>
                    <kbd className="bg-hikari-700 px-2 py-0.5 rounded text-hikari-300 font-mono text-xs">E</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hikari-400">Marqueur Fail</span>
                    <kbd className="bg-hikari-700 px-2 py-0.5 rounded text-hikari-300 font-mono text-xs">F</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hikari-400">Marqueur Clip</span>
                    <kbd className="bg-hikari-700 px-2 py-0.5 rounded text-hikari-300 font-mono text-xs">C</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hikari-400">Scene suivante</span>
                    <kbd className="bg-hikari-700 px-2 py-0.5 rounded text-hikari-300 font-mono text-xs">Tab</kbd>
                  </div>
                </div>
              </div>
              <p className="text-xs text-hikari-500">
                Les raccourcis personnalises seront disponibles dans une prochaine version.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-hikari-700">
          <button
            onClick={onClose}
            className="bg-hikari-700 hover:bg-hikari-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppSettings
