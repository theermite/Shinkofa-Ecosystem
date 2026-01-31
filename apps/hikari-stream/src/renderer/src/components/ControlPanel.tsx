import { useEffect, useState } from 'react'
import { useAppStore, AudioTrack } from '../stores/appStore'
import StreamSettings from './StreamSettings'

interface StreamOutput {
  platform: 'twitch' | 'youtube' | 'custom'
  enabled: boolean
  rtmpUrl: string
  streamKey: string
}

interface StreamSettingsData {
  resolution: '720p' | '1080p' | '1440p'
  fps: 30 | 60
  bitrate: number
  encoder: 'nvenc' | 'amf' | 'qsv' | 'x264'
  outputs: StreamOutput[]
}

function ControlPanel(): JSX.Element {
  const { audioTracks, streamStatus, setStreamStatus, activeSource, streamStats, updateStreamStats } = useAppStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [streamSettings, setStreamSettings] = useState<StreamSettingsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Listen for stream events
  useEffect(() => {
    const cleanupState = window.api.on('stream:state', (state: unknown) => {
      const s = state as { status: string; error: string | null }
      setStreamStatus(s.status as 'offline' | 'connecting' | 'live' | 'error')
      if (s.error) setError(s.error)
    })

    const cleanupStats = window.api.on('stream:stats', (stats: unknown) => {
      const s = stats as { fps: number; bitrate: number }
      updateStreamStats({ fps: s.fps, bitrate: s.bitrate })
    })

    const cleanupDuration = window.api.on('stream:duration', (duration: unknown) => {
      updateStreamStats({ duration: duration as number })
    })

    const cleanupError = window.api.on('stream:error', (message: unknown) => {
      setError(message as string)
    })

    return () => {
      cleanupState()
      cleanupStats()
      cleanupDuration()
      cleanupError()
    }
  }, [setStreamStatus, updateStreamStats])

  const handleStartStream = async (): Promise<void> => {
    if (streamStatus === 'live') {
      window.api.stopStream()
      return
    }

    if (!activeSource) {
      setError('Selectionnez une source de capture avant de streamer')
      return
    }

    if (!streamSettings) {
      setError('Configurez les parametres de stream')
      setIsSettingsOpen(true)
      return
    }

    const enabledOutputs = streamSettings.outputs.filter(o => o.enabled)
    if (enabledOutputs.length === 0) {
      setError('Activez au moins une plateforme de streaming')
      setIsSettingsOpen(true)
      return
    }

    const hasKeys = enabledOutputs.every(o => o.streamKey)
    if (!hasKeys) {
      setError('Entrez les cles de stream pour les plateformes activees')
      setIsSettingsOpen(true)
      return
    }

    setError(null)
    setStreamStatus('connecting')

    try {
      const success = await window.api.startStream({
        ...streamSettings,
        source: activeSource
      })

      if (!success) {
        setStreamStatus('offline')
      }
    } catch (err) {
      console.error('[ControlPanel] Failed to start stream:', err)
      setError('Erreur lors du demarrage du stream')
      setStreamStatus('offline')
    }
  }

  const handleSaveSettings = (settings: StreamSettingsData): void => {
    setStreamSettings(settings)
    setError(null)
  }

  const getEnabledPlatforms = (): { twitch: boolean; youtube: boolean } => {
    if (!streamSettings) return { twitch: false, youtube: false }
    return {
      twitch: streamSettings.outputs.some(o => o.platform === 'twitch' && o.enabled && o.streamKey),
      youtube: streamSettings.outputs.some(o => o.platform === 'youtube' && o.enabled && o.streamKey)
    }
  }

  const platforms = getEnabledPlatforms()

  return (
    <div className="border-t border-hikari-800 bg-hikari-900 p-4">
      <div className="flex items-end gap-6">
        {/* Audio mixer */}
        <div className="flex-1">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-hikari-400">
            Mixer Audio
          </h3>
          <div className="flex gap-4">
            {audioTracks.map((track) => (
              <AudioTrackControl key={track.id} track={track} />
            ))}
          </div>
        </div>

        {/* Stream controls */}
        <div className="flex flex-col items-end gap-3">
          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Stats when live */}
          {streamStatus === 'live' && (
            <div className="flex items-center gap-4 text-sm text-hikari-300">
              <span>{streamStats.fps} FPS</span>
              <span>{streamStats.bitrate} kbps</span>
              <span>{formatDuration(streamStats.duration)}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Platform indicators */}
            <div className="flex items-center gap-2 rounded-lg bg-hikari-800 px-3 py-2">
              <PlatformBadge platform="twitch" enabled={platforms.twitch} />
              <PlatformBadge platform="youtube" enabled={platforms.youtube} />
            </div>

            {/* Settings button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-lg bg-hikari-800 p-2 text-hikari-400 transition-colors hover:bg-hikari-700 hover:text-white"
              title="Parametres du stream"
              disabled={streamStatus === 'live'}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            </button>
          </div>

          {/* Start/Stop button */}
          <button
            onClick={handleStartStream}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-colors ${
              streamStatus === 'live'
                ? 'bg-red-600 text-white hover:bg-red-500'
                : streamStatus === 'connecting'
                  ? 'cursor-wait bg-yellow-600 text-white'
                  : 'bg-hikari-600 text-white hover:bg-hikari-500'
            }`}
            disabled={streamStatus === 'connecting'}
          >
            {streamStatus === 'live' ? (
              <>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
                Arreter le stream
              </>
            ) : streamStatus === 'connecting' ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Connexion...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Demarrer le stream
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stream Settings Modal */}
      <StreamSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialSettings={streamSettings || undefined}
      />
    </div>
  )
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function AudioTrackControl({ track }: { track: AudioTrack }): JSX.Element {
  const { setAudioTrackVolume, toggleAudioTrackMute } = useAppStore()

  const getTrackIcon = (): JSX.Element => {
    switch (track.type) {
      case 'mic':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        )
      case 'desktop':
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
      case 'music':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
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
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 0112.728 0"
            />
          </svg>
        )
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* VU Meter */}
      <div className="relative h-24 w-2 overflow-hidden rounded-full bg-hikari-800">
        <div
          className="absolute bottom-0 w-full rounded-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-all duration-75"
          style={{ height: `${track.muted ? 0 : track.level}%` }}
        />
      </div>

      {/* Volume slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={track.volume}
        onChange={(e) => setAudioTrackVolume(track.id, parseInt(e.target.value))}
        className="h-24 w-2 cursor-pointer appearance-none rounded-full bg-hikari-700 accent-hikari-500"
        style={{
          writingMode: 'vertical-lr',
          direction: 'rtl'
        }}
        disabled={track.muted}
      />

      {/* Mute button */}
      <button
        onClick={() => toggleAudioTrackMute(track.id)}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          track.muted
            ? 'bg-red-600 text-white'
            : 'bg-hikari-800 text-hikari-300 hover:bg-hikari-700'
        }`}
        title={track.muted ? 'Réactiver' : 'Couper'}
      >
        {track.muted ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        ) : (
          getTrackIcon()
        )}
      </button>

      {/* Label */}
      <span className="max-w-[60px] truncate text-center text-xs text-hikari-400">
        {track.name}
      </span>
    </div>
  )
}

function PlatformBadge({
  platform,
  enabled
}: {
  platform: 'twitch' | 'youtube'
  enabled: boolean
}): JSX.Element {
  const colors = {
    twitch: enabled ? 'bg-purple-600' : 'bg-hikari-700',
    youtube: enabled ? 'bg-red-600' : 'bg-hikari-700'
  }

  return (
    <div
      className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${colors[platform]} ${enabled ? 'text-white' : 'text-hikari-500'}`}
      title={`${platform.charAt(0).toUpperCase() + platform.slice(1)} ${enabled ? 'activé' : 'désactivé'}`}
    >
      {platform === 'twitch' ? (
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
        </svg>
      ) : (
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )}
      <span className="hidden sm:inline">{platform === 'twitch' ? 'Twitch' : 'YouTube'}</span>
    </div>
  )
}

export default ControlPanel
