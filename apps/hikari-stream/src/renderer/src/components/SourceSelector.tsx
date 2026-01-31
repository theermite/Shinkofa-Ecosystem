import { useEffect, useState } from 'react'

interface CaptureSource {
  id: string
  name: string
  thumbnail: string
  type: 'screen' | 'window'
}

interface SourceSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (source: CaptureSource) => void
}

function SourceSelector({ isOpen, onClose, onSelect }: SourceSelectorProps): JSX.Element | null {
  const [sources, setSources] = useState<CaptureSource[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'screen' | 'window'>('all')

  useEffect(() => {
    if (isOpen) {
      loadSources()
    }
  }, [isOpen])

  const loadSources = async (): Promise<void> => {
    setLoading(true)
    try {
      const captureSources = await window.api.getCaptureSources()
      setSources(captureSources)
    } catch (error) {
      console.error('[SourceSelector] Failed to load sources:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const filteredSources = sources.filter((s) => {
    if (filter === 'all') return true
    return s.type === filter
  })

  const screens = sources.filter((s) => s.type === 'screen')
  const windows = sources.filter((s) => s.type === 'window')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-xl bg-hikari-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hikari-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Sélectionner une source</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-hikari-400 transition-colors hover:bg-hikari-800 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-hikari-800 px-6 py-3">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              filter === 'all'
                ? 'bg-hikari-600 text-white'
                : 'text-hikari-400 hover:bg-hikari-800 hover:text-white'
            }`}
          >
            Tout ({sources.length})
          </button>
          <button
            onClick={() => setFilter('screen')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
              filter === 'screen'
                ? 'bg-hikari-600 text-white'
                : 'text-hikari-400 hover:bg-hikari-800 hover:text-white'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Ecrans ({screens.length})
          </button>
          <button
            onClick={() => setFilter('window')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
              filter === 'window'
                ? 'bg-hikari-600 text-white'
                : 'text-hikari-400 hover:bg-hikari-800 hover:text-white'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
              />
            </svg>
            Fenetres ({windows.length})
          </button>

          <button
            onClick={loadSources}
            className="ml-auto rounded-lg px-4 py-2 text-sm text-hikari-400 transition-colors hover:bg-hikari-800 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-hikari-500 border-t-transparent" />
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="py-12 text-center text-hikari-400">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-4">Aucune source disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => {
                    onSelect(source)
                    onClose()
                  }}
                  className="group overflow-hidden rounded-lg border border-hikari-700 bg-hikari-800 transition-all hover:border-hikari-500 hover:ring-2 hover:ring-hikari-500/50"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video w-full overflow-hidden bg-hikari-950">
                    <img
                      src={source.thumbnail}
                      alt={source.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  {/* Label */}
                  <div className="flex items-center gap-2 p-3">
                    {source.type === 'screen' ? (
                      <svg
                        className="h-4 w-4 flex-shrink-0 text-hikari-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4 flex-shrink-0 text-hikari-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z"
                        />
                      </svg>
                    )}
                    <span className="truncate text-sm text-hikari-200 group-hover:text-white">
                      {source.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-hikari-800 px-6 py-4">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

export default SourceSelector
