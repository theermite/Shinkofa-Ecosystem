import { useState } from 'react'
import { useAppStore, StreamPreset } from '../stores/appStore'

interface PresetSelectorProps {
  isOpen: boolean
  onClose: () => void
  onApplyPreset: (preset: StreamPreset) => void
}

function PresetSelector({ isOpen, onClose, onApplyPreset }: PresetSelectorProps): JSX.Element | null {
  const { presets, activePresetId, removePreset, applyPreset } = useAppStore()
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  if (!isOpen) return null

  const handleApply = (preset: StreamPreset): void => {
    applyPreset(preset.id)
    onApplyPreset(preset)
    onClose()
  }

  const handleCreate = (): void => {
    setIsCreating(true)
    setIsEditing(null)
  }

  const handleEdit = (presetId: string): void => {
    setIsEditing(presetId)
    setIsCreating(false)
  }

  const handleDelete = (presetId: string): void => {
    if (confirm('Supprimer ce preset ?')) {
      removePreset(presetId)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl bg-hikari-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hikari-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6 text-hikari-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <h2 className="text-xl font-semibold text-white">Presets de Stream</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-hikari-400 transition-colors hover:bg-hikari-800 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {isCreating || isEditing ? (
            <PresetEditor
              presetId={isEditing}
              onSave={() => {
                setIsCreating(false)
                setIsEditing(null)
              }}
              onCancel={() => {
                setIsCreating(false)
                setIsEditing(null)
              }}
            />
          ) : (
            <>
              {/* Quick launch info */}
              <div className="mb-6 rounded-lg bg-hikari-800/50 p-4">
                <p className="text-sm text-hikari-300">
                  Les presets vous permettent de lancer un stream en <span className="font-semibold text-hikari-400">moins d'1 minute</span>.
                  Selectionnez un preset et cliquez sur "Appliquer" pour configurer automatiquement le titre, la categorie et les parametres audio.
                </p>
              </div>

              {/* Presets grid */}
              {presets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-hikari-500">
                  <svg className="mb-4 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-lg font-medium">Aucun preset</p>
                  <p className="mt-1 text-sm">Creez votre premier preset pour demarrer rapidement</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {presets.map((preset) => (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      isActive={activePresetId === preset.id}
                      onApply={() => handleApply(preset)}
                      onEdit={() => handleEdit(preset.id)}
                      onDelete={() => handleDelete(preset.id)}
                    />
                  ))}
                </div>
              )}

              {/* Add button */}
              <button
                onClick={handleCreate}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-hikari-700 py-4 text-hikari-400 transition-colors hover:border-hikari-500 hover:text-hikari-300"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Nouveau preset</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PresetCard({
  preset,
  isActive,
  onApply,
  onEdit,
  onDelete
}: {
  preset: StreamPreset
  isActive: boolean
  onApply: () => void
  onEdit: () => void
  onDelete: () => void
}): JSX.Element {
  const platforms = []
  if (preset.platforms.twitch.enabled) platforms.push('Twitch')
  if (preset.platforms.youtube.enabled) platforms.push('YouTube')

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all ${
        isActive
          ? 'border-hikari-500 bg-hikari-800/80 ring-2 ring-hikari-500/30'
          : 'border-hikari-700 bg-hikari-800/50 hover:border-hikari-600'
      }`}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute right-2 top-2">
          <span className="rounded-full bg-hikari-500 px-2 py-0.5 text-[10px] font-medium text-white">
            Actif
          </span>
        </div>
      )}

      <div className="p-4">
        {/* Icon + Name */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">{preset.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="truncate font-semibold text-white">{preset.name}</h3>
            <p className="text-xs text-hikari-400">
              {platforms.join(' + ') || 'Aucune plateforme'}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1 text-xs text-hikari-400">
          {preset.platforms.twitch.enabled && preset.platforms.twitch.title && (
            <p className="truncate">
              <span className="text-purple-400">Twitch:</span> {preset.platforms.twitch.title}
            </p>
          )}
          {preset.platforms.youtube.enabled && preset.platforms.youtube.title && (
            <p className="truncate">
              <span className="text-red-400">YouTube:</span> {preset.platforms.youtube.title}
            </p>
          )}
          <p>
            {preset.resolution} @ {preset.fps}fps - {preset.bitrate} kbps
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={onApply}
            className="flex-1 rounded-lg bg-hikari-600 py-2 text-sm font-medium text-white transition-colors hover:bg-hikari-500"
          >
            Appliquer
          </button>
          <button
            onClick={onEdit}
            className="rounded-lg bg-hikari-700 px-3 py-2 text-hikari-300 transition-colors hover:bg-hikari-600 hover:text-white"
            title="Modifier"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg bg-hikari-700 px-3 py-2 text-red-400 transition-colors hover:bg-red-600/20"
            title="Supprimer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function PresetEditor({
  presetId,
  onSave,
  onCancel
}: {
  presetId: string | null
  onSave: () => void
  onCancel: () => void
}): JSX.Element {
  const { presets, addPreset, updatePreset, scenes, audioTracks } = useAppStore()

  const existingPreset = presetId ? presets.find((p) => p.id === presetId) : null

  const [name, setName] = useState(existingPreset?.name || '')
  const [icon, setIcon] = useState(existingPreset?.icon || '🎮')
  const [resolution, setResolution] = useState<'720p' | '1080p' | '1440p'>(existingPreset?.resolution || '1080p')
  const [fps, setFps] = useState<30 | 60>(existingPreset?.fps || 60)
  const [bitrate, setBitrate] = useState(existingPreset?.bitrate || 6000)
  const [encoder] = useState<'nvenc' | 'amf' | 'qsv' | 'x264'>(existingPreset?.encoder || 'nvenc')
  const [startSceneId, setStartSceneId] = useState(existingPreset?.startSceneId || 'live')

  // Twitch config
  const [twitchEnabled, setTwitchEnabled] = useState(existingPreset?.platforms.twitch.enabled ?? true)
  const [twitchTitle, setTwitchTitle] = useState(existingPreset?.platforms.twitch.title || '')
  const [twitchGameName, setTwitchGameName] = useState(existingPreset?.platforms.twitch.gameName || '')
  const [twitchGameId] = useState(existingPreset?.platforms.twitch.gameId || '')

  // YouTube config
  const [youtubeEnabled, setYoutubeEnabled] = useState(existingPreset?.platforms.youtube.enabled ?? false)
  const [youtubeTitle, setYoutubeTitle] = useState(existingPreset?.platforms.youtube.title || '')
  const [youtubeDescription, setYoutubeDescription] = useState(existingPreset?.platforms.youtube.description || '')

  // Audio config
  const [audioConfig, setAudioConfig] = useState(
    existingPreset?.audioConfig || {
      mic: { volume: 100, muted: false },
      desktop: { volume: 80, muted: false },
      phone: { volume: 100, muted: false },
      music: { volume: 50, muted: false }
    }
  )

  const icons = ['🎮', '🎯', '🎲', '🎬', '🎤', '💬', '🏆', '🎵', '📱', '💻', '🌟', '🔥']

  const handleSave = (): void => {
    if (!name.trim()) return

    const presetData = {
      name: name.trim(),
      icon,
      platforms: {
        twitch: {
          enabled: twitchEnabled,
          title: twitchTitle,
          gameId: twitchGameId,
          gameName: twitchGameName,
          tags: []
        },
        youtube: {
          enabled: youtubeEnabled,
          title: youtubeTitle,
          description: youtubeDescription,
          categoryId: '20', // Gaming
          privacy: 'public' as const
        }
      },
      resolution,
      fps,
      bitrate,
      encoder,
      startSceneId,
      audioConfig
    }

    if (presetId) {
      updatePreset(presetId, presetData)
    } else {
      addPreset(presetData)
    }
    onSave()
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">
        {presetId ? 'Modifier le preset' : 'Nouveau preset'}
      </h3>

      {/* Basic info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-hikari-300">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Office HoK"
            className="w-full rounded-lg bg-hikari-800 px-4 py-2 text-white placeholder-hikari-500 focus:outline-none focus:ring-2 focus:ring-hikari-500"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-hikari-300">Icone</label>
          <div className="flex flex-wrap gap-2">
            {icons.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setIcon(emoji)}
                className={`rounded-lg p-2 text-xl transition-colors ${
                  icon === emoji ? 'bg-hikari-600' : 'bg-hikari-800 hover:bg-hikari-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Twitch config */}
      <div className="rounded-lg border border-hikari-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
            </svg>
            <span className="font-medium text-white">Twitch</span>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={twitchEnabled}
              onChange={(e) => setTwitchEnabled(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-hikari-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-purple-600 peer-checked:after:translate-x-full"></div>
          </label>
        </div>
        {twitchEnabled && (
          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={twitchTitle}
              onChange={(e) => setTwitchTitle(e.target.value)}
              placeholder="Titre du stream"
              className="w-full rounded-lg bg-hikari-800 px-4 py-2 text-sm text-white placeholder-hikari-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              value={twitchGameName}
              onChange={(e) => setTwitchGameName(e.target.value)}
              placeholder="Jeu/Categorie (ex: Honor of Kings)"
              className="w-full rounded-lg bg-hikari-800 px-4 py-2 text-sm text-white placeholder-hikari-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}
      </div>

      {/* YouTube config */}
      <div className="rounded-lg border border-hikari-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span className="font-medium text-white">YouTube</span>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={youtubeEnabled}
              onChange={(e) => setYoutubeEnabled(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-hikari-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-red-600 peer-checked:after:translate-x-full"></div>
          </label>
        </div>
        {youtubeEnabled && (
          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={youtubeTitle}
              onChange={(e) => setYoutubeTitle(e.target.value)}
              placeholder="Titre du stream"
              className="w-full rounded-lg bg-hikari-800 px-4 py-2 text-sm text-white placeholder-hikari-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <textarea
              value={youtubeDescription}
              onChange={(e) => setYoutubeDescription(e.target.value)}
              placeholder="Description"
              rows={2}
              className="w-full rounded-lg bg-hikari-800 px-4 py-2 text-sm text-white placeholder-hikari-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        )}
      </div>

      {/* Stream settings */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-hikari-400">Resolution</label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as '720p' | '1080p' | '1440p')}
            className="w-full rounded-lg bg-hikari-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-hikari-500"
          >
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
            <option value="1440p">1440p</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-hikari-400">FPS</label>
          <select
            value={fps}
            onChange={(e) => setFps(parseInt(e.target.value) as 30 | 60)}
            className="w-full rounded-lg bg-hikari-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-hikari-500"
          >
            <option value={30}>30 fps</option>
            <option value={60}>60 fps</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-hikari-400">Bitrate</label>
          <input
            type="number"
            value={bitrate}
            onChange={(e) => setBitrate(parseInt(e.target.value) || 6000)}
            className="w-full rounded-lg bg-hikari-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-hikari-500"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-hikari-400">Scene depart</label>
          <select
            value={startSceneId}
            onChange={(e) => setStartSceneId(e.target.value)}
            className="w-full rounded-lg bg-hikari-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-hikari-500"
          >
            {scenes.map((scene) => (
              <option key={scene.id} value={scene.id}>{scene.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audio config */}
      <div>
        <label className="mb-3 block text-sm font-medium text-hikari-300">Configuration Audio</label>
        <div className="grid gap-3 sm:grid-cols-4">
          {(['mic', 'desktop', 'phone', 'music'] as const).map((trackId) => {
            const track = audioTracks.find((t) => t.id === trackId)
            const config = audioConfig[trackId]
            return (
              <div key={trackId} className="rounded-lg bg-hikari-800 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-hikari-300">{track?.name || trackId}</span>
                  <button
                    onClick={() => setAudioConfig({
                      ...audioConfig,
                      [trackId]: { ...config, muted: !config.muted }
                    })}
                    className={`rounded p-1 ${config.muted ? 'bg-red-600 text-white' : 'bg-hikari-700 text-hikari-400'}`}
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {config.muted ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      )}
                    </svg>
                  </button>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={config.volume}
                  onChange={(e) => setAudioConfig({
                    ...audioConfig,
                    [trackId]: { ...config, volume: parseInt(e.target.value) }
                  })}
                  className="mt-2 w-full h-1.5 rounded-lg appearance-none bg-hikari-700 accent-hikari-500"
                  disabled={config.muted}
                />
                <div className="mt-1 text-center text-[10px] text-hikari-500">{config.volume}%</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-hikari-800 pt-4">
        <button
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-hikari-400 transition-colors hover:bg-hikari-800 hover:text-white"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="rounded-lg bg-hikari-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-hikari-500 disabled:opacity-50"
        >
          {presetId ? 'Sauvegarder' : 'Creer le preset'}
        </button>
      </div>
    </div>
  )
}

export default PresetSelector
