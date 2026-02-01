import { useState } from 'react'
import { useAppStore, type StreamSession, type MarkerType } from '../stores/appStore'

// Format seconds to HH:MM:SS
const formatTimestamp = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// Format date to readable string
const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const markerConfig: Record<MarkerType, { icon: string; label: string }> = {
  epic: { icon: '⭐', label: 'Epic' },
  fail: { icon: '💀', label: 'Fail' },
  clip: { icon: '🎬', label: 'Clip' },
  bug: { icon: '🐛', label: 'Bug' },
  info: { icon: 'ℹ️', label: 'Info' },
  custom: { icon: '📌', label: 'Custom' }
}

interface SessionHistoryProps {
  isOpen: boolean
  onClose: () => void
}

export function SessionHistory({ isOpen, onClose }: SessionHistoryProps): JSX.Element | null {
  const [selectedSession, setSelectedSession] = useState<StreamSession | null>(null)
  const [vaultPath, setVaultPath] = useState('D:/Obsidian/Stream-Notes')
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle')

  const pastSessions = useAppStore((state) => state.pastSessions)
  const exportSessionToObsidian = useAppStore((state) => state.exportSessionToObsidian)

  if (!isOpen) return null

  const handleExport = async (session: StreamSession): Promise<void> => {
    setExportStatus('exporting')
    try {
      const success = await exportSessionToObsidian(session.id, vaultPath)
      setExportStatus(success ? 'success' : 'error')
      setTimeout(() => setExportStatus('idle'), 3000)
    } catch (error) {
      console.error('[SessionHistory] Export failed:', error)
      setExportStatus('error')
      setTimeout(() => setExportStatus('idle'), 3000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-xl">📊</span>
            Historique des sessions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sessions list */}
          <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
            {pastSessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>Aucune session enregistree</p>
                <p className="text-sm mt-2">Les sessions apparaitront ici apres vos streams</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {pastSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`w-full p-3 text-left transition-colors ${
                      selectedSession?.id === session.id
                        ? 'bg-sky-600/20 border-l-2 border-sky-500'
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className="text-sm font-medium text-white truncate">{session.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{formatDate(session.startedAt)}</div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>{formatTimestamp(session.stats.duration)}</span>
                      <span>•</span>
                      <span>{session.markers.length} marqueurs</span>
                    </div>
                    {/* Platform badges */}
                    <div className="flex gap-1 mt-2">
                      {session.platforms.map((platform) => (
                        <span
                          key={platform}
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            platform === 'twitch'
                              ? 'bg-purple-600/30 text-purple-300'
                              : 'bg-red-600/30 text-red-300'
                          }`}
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Session details */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedSession ? (
              <div className="space-y-4">
                {/* Session info */}
                <div>
                  <h3 className="text-lg font-medium text-white">{selectedSession.title}</h3>
                  <p className="text-sm text-gray-400">{selectedSession.game}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(selectedSession.startedAt)}</p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Duree" value={formatTimestamp(selectedSession.stats.duration)} icon="⏱️" />
                  <StatCard label="Pic viewers" value={selectedSession.stats.peakViewers.toString()} icon="👥" />
                  <StatCard label="Messages" value={selectedSession.stats.totalMessages.toString()} icon="💬" />
                  <StatCard label="Nouveaux follows" value={selectedSession.stats.newFollowers.toString()} icon="❤️" />
                </div>

                {/* Markers list */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <span>📍</span>
                    Marqueurs ({selectedSession.markers.length})
                  </h4>
                  {selectedSession.markers.length > 0 ? (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {selectedSession.markers.map((marker) => (
                        <div
                          key={marker.id}
                          className="flex items-center gap-2 bg-gray-800/50 rounded px-3 py-2"
                        >
                          <span className="text-sm">{markerConfig[marker.type].icon}</span>
                          <span className="text-xs text-gray-400 font-mono">
                            {formatTimestamp(marker.timestamp)}
                          </span>
                          <span className="text-xs text-gray-300 flex-1">{marker.description}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Aucun marqueur pour cette session</p>
                  )}
                </div>

                {/* Export section */}
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <span>📝</span>
                    Export Obsidian
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={vaultPath}
                      onChange={(e) => setVaultPath(e.target.value)}
                      placeholder="Chemin du vault Obsidian"
                      className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <button
                      onClick={() => handleExport(selectedSession)}
                      disabled={exportStatus === 'exporting'}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                        exportStatus === 'success'
                          ? 'bg-green-600 text-white'
                          : exportStatus === 'error'
                            ? 'bg-red-600 text-white'
                            : 'bg-sky-600 hover:bg-sky-700 text-white'
                      } disabled:opacity-50`}
                    >
                      {exportStatus === 'exporting' ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Export...
                        </span>
                      ) : exportStatus === 'success' ? (
                        'Exporte!'
                      ) : exportStatus === 'error' ? (
                        'Erreur'
                      ) : (
                        'Exporter'
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Le fichier sera cree dans le dossier specifie avec un nom base sur le titre et la date
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Selectionnez une session pour voir les details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }): JSX.Element {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
        <span>{icon}</span>
        {label}
      </div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  )
}

export default SessionHistory
