import { useState } from 'react'
import { useAppStore, type MarkerType, type StreamMarker } from '../stores/appStore'

// Marker type configuration
const markerConfig: Record<MarkerType, { icon: string; label: string; color: string; shortcut: string }> = {
  epic: { icon: '⭐', label: 'Epic', color: 'bg-yellow-500 hover:bg-yellow-600', shortcut: 'E' },
  fail: { icon: '💀', label: 'Fail', color: 'bg-red-500 hover:bg-red-600', shortcut: 'F' },
  clip: { icon: '🎬', label: 'Clip', color: 'bg-purple-500 hover:bg-purple-600', shortcut: 'C' },
  bug: { icon: '🐛', label: 'Bug', color: 'bg-orange-500 hover:bg-orange-600', shortcut: 'B' },
  info: { icon: 'ℹ️', label: 'Info', color: 'bg-blue-500 hover:bg-blue-600', shortcut: 'I' },
  custom: { icon: '📌', label: 'Custom', color: 'bg-gray-500 hover:bg-gray-600', shortcut: 'M' }
}

// Format seconds to HH:MM:SS
const formatTimestamp = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

interface MarkerPanelProps {
  isCompact?: boolean
}

export function MarkerPanel({ isCompact = false }: MarkerPanelProps): JSX.Element {
  const [customDescription, setCustomDescription] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [showMarkersList, setShowMarkersList] = useState(false)

  const currentSession = useAppStore((state) => state.currentSession)
  const addMarker = useAppStore((state) => state.addMarker)
  const removeMarker = useAppStore((state) => state.removeMarker)
  const streamStatus = useAppStore((state) => state.streamStatus)

  const isLive = streamStatus === 'live'
  const markers = currentSession?.markers || []

  const handleAddMarker = (type: MarkerType, description?: string): void => {
    if (!isLive || !currentSession) return
    addMarker(type, description)

    // Visual feedback
    const button = document.activeElement as HTMLElement
    if (button) {
      button.classList.add('scale-95')
      setTimeout(() => button.classList.remove('scale-95'), 100)
    }
  }

  const handleCustomMarker = (): void => {
    if (customDescription.trim()) {
      handleAddMarker('custom', customDescription.trim())
      setCustomDescription('')
      setShowCustomInput(false)
    }
  }

  // Compact mode - just quick marker buttons
  if (isCompact) {
    return (
      <div className="flex items-center gap-1">
        {(['epic', 'fail', 'clip'] as MarkerType[]).map((type) => (
          <button
            key={type}
            onClick={() => handleAddMarker(type)}
            disabled={!isLive}
            className={`w-8 h-8 rounded text-sm transition-all ${markerConfig[type].color} disabled:opacity-40 disabled:cursor-not-allowed`}
            title={`${markerConfig[type].label} (${markerConfig[type].shortcut})`}
          >
            {markerConfig[type].icon}
          </button>
        ))}
        <span className="text-xs text-gray-500 ml-1">
          {markers.length > 0 && `${markers.length}`}
        </span>
      </div>
    )
  }

  // Full panel mode
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <span className="text-lg">📍</span>
          Marqueurs
          {markers.length > 0 && (
            <span className="bg-sky-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {markers.length}
            </span>
          )}
        </h3>
        {markers.length > 0 && (
          <button
            onClick={() => setShowMarkersList(!showMarkersList)}
            className="text-xs text-gray-400 hover:text-white"
          >
            {showMarkersList ? 'Masquer' : 'Voir tout'}
          </button>
        )}
      </div>

      {/* Quick marker buttons */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {(['epic', 'fail', 'clip', 'bug', 'info'] as MarkerType[]).map((type) => (
          <button
            key={type}
            onClick={() => handleAddMarker(type)}
            disabled={!isLive}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded text-sm font-medium transition-all ${markerConfig[type].color} text-white disabled:opacity-40 disabled:cursor-not-allowed`}
            title={`Raccourci: ${markerConfig[type].shortcut}`}
          >
            <span>{markerConfig[type].icon}</span>
            <span className="text-xs">{markerConfig[type].label}</span>
          </button>
        ))}

        {/* Custom marker button */}
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          disabled={!isLive}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded text-sm font-medium transition-all ${
            showCustomInput ? 'bg-sky-600' : markerConfig.custom.color
          } text-white disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <span>{markerConfig.custom.icon}</span>
          <span className="text-xs">{markerConfig.custom.label}</span>
        </button>
      </div>

      {/* Custom marker input */}
      {showCustomInput && isLive && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomMarker()}
            placeholder="Description du marqueur..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
            autoFocus
          />
          <button
            onClick={handleCustomMarker}
            disabled={!customDescription.trim()}
            className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Ajouter
          </button>
        </div>
      )}

      {/* Not live message */}
      {!isLive && (
        <p className="text-xs text-gray-500 text-center py-2">
          Lancez le stream pour ajouter des marqueurs
        </p>
      )}

      {/* Markers list */}
      {showMarkersList && markers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {markers.map((marker: StreamMarker) => (
              <MarkerItem
                key={marker.id}
                marker={marker}
                onRemove={() => removeMarker(marker.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface MarkerItemProps {
  marker: StreamMarker
  onRemove: () => void
}

function MarkerItem({ marker, onRemove }: MarkerItemProps): JSX.Element {
  const config = markerConfig[marker.type]

  return (
    <div className="flex items-center gap-2 bg-gray-700/50 rounded px-2 py-1.5 group">
      <span className="text-sm">{config.icon}</span>
      <span className="text-xs text-gray-400 font-mono">
        {formatTimestamp(marker.timestamp)}
      </span>
      <span className="text-xs text-gray-300 flex-1 truncate">{marker.description}</span>
      <button
        onClick={onRemove}
        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
        title="Supprimer"
      >
        ✕
      </button>
    </div>
  )
}

export default MarkerPanel
