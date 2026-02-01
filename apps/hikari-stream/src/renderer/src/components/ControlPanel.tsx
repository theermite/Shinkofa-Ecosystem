import { useEffect, useState, useRef } from 'react'
import { useAppStore, AudioTrack, StreamPreset } from '../stores/appStore'
import StreamSettings from './StreamSettings'
import PresetSelector from './PresetSelector'
import { MarkerPanel } from './MarkerPanel'
import { useAudioLevels } from '../hooks/useAudioLevels'

interface StreamOutput {
  platform: 'twitch' | 'youtube' | 'custom'
  enabled: boolean
  rtmpUrl: string
  streamKey: string
  bandwidthTest?: boolean // Twitch only: stream privately for testing
}

interface AudioTrackConfig {
  id: string
  name: string
  type: 'mic' | 'desktop' | 'phone' | 'music'
  deviceName: string | null
  volume: number
  muted: boolean
}

interface AudioConfig {
  tracks: AudioTrackConfig[]
  sampleRate: 44100 | 48000
  bitrate: 128 | 160 | 192 | 256
}

interface StreamSettingsData {
  resolution: '720p' | '1080p' | '1440p'
  fps: 30 | 60
  bitrate: number
  encoder: 'nvenc' | 'amf' | 'qsv' | 'x264'
  outputs: StreamOutput[]
  testMode: boolean
  audio: AudioConfig
}

const STORAGE_KEY = 'hikari-stream-settings'

interface TwitchStreamInfo {
  isLive: boolean
  viewerCount: number
  startedAt: string | null
  title: string
  gameName: string
  thumbnailUrl: string | null
}

function ControlPanel(): JSX.Element {
  const {
    audioTracks,
    streamStatus,
    setStreamStatus,
    activeSource,
    streamStats,
    updateStreamStats,
    presets,
    activePresetId,
    currentSession,
    startSession,
    endSession,
    updateSessionStats
  } = useAppStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isPresetSelectorOpen, setIsPresetSelectorOpen] = useState(false)
  const [streamSettings, setStreamSettings] = useState<StreamSettingsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [twitchStreamInfo, setTwitchStreamInfo] = useState<TwitchStreamInfo | null>(null)

  // Audio levels hook
  const {
    startMicCapture, stopMicCapture, isMicActive,
    startDesktopCapture, stopDesktopCapture, isDesktopActive
  } = useAudioLevels()

  // Handle session lifecycle based on stream status
  useEffect(() => {
    if (streamStatus === 'live' && !currentSession) {
      // Start a new session when going live
      const enabledPlatforms = streamSettings?.outputs
        .filter(o => o.enabled && o.streamKey)
        .map(o => o.platform) || []

      // Get title and game from Twitch channel info if available
      const fetchChannelInfo = async (): Promise<void> => {
        try {
          const twitchInfo = await window.api.getTwitchChannelInfo()
          const title = twitchInfo?.title || 'Stream sans titre'
          const game = twitchInfo?.gameName || 'Just Chatting'
          startSession(title, game, enabledPlatforms)
          console.log('[ControlPanel] Session started:', { title, game, platforms: enabledPlatforms })
        } catch (error) {
          // Fallback if Twitch API fails
          startSession('Stream', 'Just Chatting', enabledPlatforms)
          console.log('[ControlPanel] Session started with fallback values')
        }
      }

      fetchChannelInfo()
    } else if (streamStatus === 'offline' && currentSession) {
      // End session when going offline
      endSession()
      console.log('[ControlPanel] Session ended')
    }
  }, [streamStatus, currentSession, streamSettings?.outputs, startSession, endSession])

  // Poll Twitch stream info (viewer count) when live
  useEffect(() => {
    if (streamStatus !== 'live') {
      // eslint-disable-next-line -- Reset state on status change is valid
      setTwitchStreamInfo(null)
      return
    }

    // Check if Twitch is enabled
    const twitchEnabled = streamSettings?.outputs.some(o => o.platform === 'twitch' && o.enabled)
    if (!twitchEnabled) return

    const fetchTwitchInfo = async (): Promise<void> => {
      try {
        const info = await window.api.getTwitchStreamInfo()
        if (info) {
          setTwitchStreamInfo(info)
          // Update store with viewer count
          updateStreamStats({ viewers: { twitch: info.viewerCount, youtube: streamStats.viewers.youtube } })

          // Update session peak viewers
          if (currentSession && info.viewerCount > (currentSession.stats.peakViewers || 0)) {
            updateSessionStats({ peakViewers: info.viewerCount })
          }
        }
      } catch (error) {
        console.error('[ControlPanel] Failed to fetch Twitch stream info:', error)
      }
    }

    // Initial fetch
    fetchTwitchInfo()

    // Poll every 30 seconds
    const interval = setInterval(fetchTwitchInfo, 30000)

    return () => clearInterval(interval)
  }, [streamStatus, streamSettings?.outputs, updateStreamStats, streamStats.viewers.youtube, currentSession, updateSessionStats])

  // Load saved stream settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as StreamSettingsData
        // eslint-disable-next-line -- Initial load from localStorage is valid
        setStreamSettings(parsed)
        console.log('[ControlPanel] Loaded saved stream settings')
      }
    } catch (error) {
      console.error('[ControlPanel] Failed to load saved settings:', error)
    }
  }, [])

  // Toggle microphone monitoring
  const handleToggleMicMonitor = async (): Promise<void> => {
    if (isMicActive) {
      stopMicCapture()
    } else {
      await startMicCapture()
    }
  }

  // Toggle desktop audio monitoring
  const handleToggleDesktopMonitor = async (): Promise<void> => {
    if (isDesktopActive) {
      stopDesktopCapture()
    } else {
      await startDesktopCapture()
    }
  }

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

    // Source de capture requise pour FFmpeg
    if (!activeSource) {
      setError('Selectionnez une source de capture avant de streamer')
      return
    }

    if (!streamSettings) {
      setError('Configurez les parametres de stream')
      setIsSettingsOpen(true)
      return
    }

    // En mode test, pas besoin de clés de stream
    if (!streamSettings.testMode) {
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

  const handleApplyPreset = (preset: StreamPreset): void => {
    // Apply preset to stream settings
    const newSettings: StreamSettingsData = {
      resolution: preset.resolution,
      fps: preset.fps,
      bitrate: preset.bitrate,
      encoder: preset.encoder,
      testMode: false,
      outputs: streamSettings?.outputs.map(output => ({
        ...output,
        enabled: output.platform === 'twitch' ? preset.platforms.twitch.enabled :
                 output.platform === 'youtube' ? preset.platforms.youtube.enabled :
                 output.enabled
      })) || [
        { platform: 'twitch', enabled: preset.platforms.twitch.enabled, rtmpUrl: 'rtmp://live.twitch.tv/app', streamKey: '' },
        { platform: 'youtube', enabled: preset.platforms.youtube.enabled, rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2', streamKey: '' }
      ],
      audio: {
        tracks: [],
        sampleRate: 48000,
        bitrate: 160
      }
    }

    setStreamSettings(newSettings)

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
    } catch (error) {
      console.error('[ControlPanel] Failed to save preset settings:', error)
    }

    // Update Twitch channel info if authenticated
    if (preset.platforms.twitch.enabled && preset.platforms.twitch.title) {
      window.api.updateTwitchChannelInfo(
        preset.platforms.twitch.title,
        preset.platforms.twitch.gameId || undefined
      ).catch((err: unknown) => console.error('[ControlPanel] Failed to update Twitch info:', err))
    }

    console.log('[ControlPanel] Preset applied:', preset.name)
  }

  const getEnabledPlatforms = (): { twitch: boolean; youtube: boolean } => {
    if (!streamSettings) return { twitch: false, youtube: false }
    return {
      twitch: streamSettings.outputs.some(o => o.platform === 'twitch' && o.enabled && o.streamKey),
      youtube: streamSettings.outputs.some(o => o.platform === 'youtube' && o.enabled && o.streamKey)
    }
  }

  const togglePlatform = (platform: 'twitch' | 'youtube'): void => {
    if (!streamSettings || streamStatus === 'live') return

    const newOutputs = streamSettings.outputs.map(o =>
      o.platform === platform ? { ...o, enabled: !o.enabled } : o
    )
    const newSettings = { ...streamSettings, outputs: newOutputs }
    setStreamSettings(newSettings)

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
    } catch (error) {
      console.error('[ControlPanel] Failed to save settings:', error)
    }
  }

  const hasPlatformKey = (platform: 'twitch' | 'youtube'): boolean => {
    if (!streamSettings) return false
    return streamSettings.outputs.some(o => o.platform === platform && o.streamKey)
  }

  const platforms = getEnabledPlatforms()

  return (
    <div className="flex h-full bg-hikari-900">
      {/* Audio Mixer Block */}
      <div className="flex items-center gap-3 border-r border-hikari-800 px-4 py-2">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium uppercase text-hikari-500">Monitor</span>
          <div className="flex gap-0.5">
            <button
              onClick={handleToggleMicMonitor}
              className={`rounded px-1.5 py-0.5 text-[8px] font-medium transition-colors ${
                isMicActive
                  ? 'bg-green-600 text-white'
                  : 'bg-hikari-700 text-hikari-400 hover:bg-hikari-600 hover:text-white'
              }`}
              title={isMicActive ? 'Micro ON - Cliquez pour désactiver' : 'Activer monitoring micro'}
            >
              🎤
            </button>
            <button
              onClick={handleToggleDesktopMonitor}
              className={`rounded px-1.5 py-0.5 text-[8px] font-medium transition-colors ${
                isDesktopActive
                  ? 'bg-green-600 text-white'
                  : 'bg-hikari-700 text-hikari-400 hover:bg-hikari-600 hover:text-white'
              }`}
              title={isDesktopActive ? 'Son PC ON - Cliquez pour désactiver' : 'Activer monitoring son PC'}
            >
              🖥️
            </button>
          </div>
        </div>
        {audioTracks.map((track) => (
          <AudioTrackControl key={track.id} track={track} />
        ))}
      </div>

      {/* Stream Controls Block */}
      <div className="flex flex-1 items-center justify-end gap-3 px-4 py-2">
        {/* Error message */}
        {error && (
          <div className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Stats when live */}
        {streamStatus === 'live' && (
          <div className="flex items-center gap-3 text-xs text-hikari-300">
            <span>{streamStats.fps} FPS</span>
            <span>{streamStats.bitrate} kbps</span>
            <span>{formatDuration(streamStats.duration)}</span>
            {/* Twitch viewer count */}
            {twitchStreamInfo?.isLive && (
              <span className="flex items-center gap-1 text-purple-400" title="Viewers Twitch">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                </svg>
                {twitchStreamInfo.viewerCount}
              </span>
            )}
            {/* Quick markers */}
            <div className="border-l border-hikari-700 pl-3">
              <MarkerPanel isCompact />
            </div>
          </div>
        )}

        {/* Test mode indicator */}
        {streamSettings?.testMode && (
          <div className="flex items-center gap-1 rounded bg-yellow-600 px-2 py-1 text-xs font-medium text-white">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            TEST
          </div>
        )}

        {/* Twitch bandwidth test indicator */}
        {!streamSettings?.testMode && streamSettings?.outputs.some(o => o.platform === 'twitch' && o.enabled && o.bandwidthTest) && (
          <div className="flex items-center gap-1 rounded bg-purple-600/80 px-2 py-1 text-xs font-medium text-white" title="Test bande passante Twitch actif - stream invisible aux viewers">
            <svg className="h-3 w-3 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            BW TEST
          </div>
        )}

        {/* Grouped Stream Controls */}
        <div className="flex items-center gap-2 rounded-lg border border-hikari-700 bg-hikari-800/50 p-1.5">
          {/* Platforms group */}
          <div className="flex items-center gap-1 border-r border-hikari-700 pr-2">
            <PlatformBadge
              platform="twitch"
              enabled={platforms.twitch && !streamSettings?.testMode}
              hasKey={hasPlatformKey('twitch')}
              onClick={() => togglePlatform('twitch')}
              disabled={streamStatus === 'live' || streamSettings?.testMode}
            />
            <PlatformBadge
              platform="youtube"
              enabled={platforms.youtube && !streamSettings?.testMode}
              hasKey={hasPlatformKey('youtube')}
              onClick={() => togglePlatform('youtube')}
              disabled={streamStatus === 'live' || streamSettings?.testMode}
            />
          </div>

          {/* Config group */}
          <div className="flex items-center gap-1">
            {/* Presets button */}
            <button
              onClick={() => setIsPresetSelectorOpen(true)}
              className={`flex items-center gap-1.5 rounded px-2 py-1 text-sm transition-colors ${
                activePresetId
                  ? 'bg-hikari-600 text-white'
                  : 'text-hikari-400 hover:bg-hikari-700 hover:text-white'
              }`}
              title="Presets de stream"
              disabled={streamStatus === 'live'}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="hidden lg:inline text-xs">
                {activePresetId ? presets.find(p => p.id === activePresetId)?.name || 'Preset' : 'Presets'}
              </span>
            </button>

            {/* Settings button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="rounded p-1.5 text-hikari-400 transition-colors hover:bg-hikari-700 hover:text-white"
              title="Parametres stream"
              disabled={streamStatus === 'live'}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Start/Stop button */}
        <button
          onClick={handleStartStream}
          className={`flex items-center gap-2 rounded px-4 py-1.5 text-sm font-semibold transition-colors ${
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

      {/* Stream Settings Modal */}
      <StreamSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialSettings={streamSettings || undefined}
      />

      {/* Preset Selector Modal */}
      <PresetSelector
        isOpen={isPresetSelectorOpen}
        onClose={() => setIsPresetSelectorOpen(false)}
        onApplyPreset={handleApplyPreset}
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
  const { setAudioTrackVolume, toggleAudioTrackMute, setAudioTrackDevice } = useAppStore()
  const [showDeviceMenu, setShowDeviceMenu] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const menuRef = useRef<HTMLDivElement>(null)

  // Load available audio devices
  useEffect(() => {
    const loadDevices = async (): Promise<void> => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices()
        const audioDevices = allDevices.filter(
          (d) => d.kind === (track.type === 'mic' ? 'audioinput' : 'audiooutput')
        )
        setDevices(audioDevices)
      } catch (error) {
        console.error('[AudioTrackControl] Failed to enumerate devices:', error)
      }
    }
    loadDevices()
  }, [track.type])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowDeviceMenu(false)
      }
    }
    if (showDeviceMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDeviceMenu])

  const handleDeviceSelect = (device: MediaDeviceInfo): void => {
    setAudioTrackDevice(track.id, device.deviceId, device.label || 'Unknown')
    setShowDeviceMenu(false)
  }

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
    <div className="relative flex flex-col items-center gap-1" ref={menuRef}>
      {/* Track label */}
      <span className="text-[9px] text-hikari-500 truncate max-w-[40px]" title={track.deviceLabel || track.name}>
        {track.name}
      </span>

      <div className="flex items-end gap-1">
        {/* VU Meter */}
        <div className="relative h-16 w-2 overflow-hidden rounded-full bg-hikari-800">
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
          className="h-16 w-2 cursor-pointer appearance-none rounded-full bg-hikari-700 accent-hikari-500"
          style={{
            writingMode: 'vertical-lr',
            direction: 'rtl'
          }}
          disabled={track.muted}
        />
      </div>

      {/* Controls row */}
      <div className="flex gap-0.5">
        {/* Mute button */}
        <button
          onClick={() => toggleAudioTrackMute(track.id)}
          className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
            track.muted
              ? 'bg-red-600 text-white'
              : 'bg-hikari-800 text-hikari-300 hover:bg-hikari-700'
          }`}
          title={`${track.name} - ${track.muted ? 'Réactiver' : 'Couper'}`}
        >
          {track.muted ? (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            getTrackIcon()
          )}
        </button>

        {/* Config button (only for mic and desktop) */}
        {(track.type === 'mic' || track.type === 'desktop') && devices.length > 0 && (
          <button
            onClick={() => setShowDeviceMenu(!showDeviceMenu)}
            className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
              showDeviceMenu
                ? 'bg-hikari-600 text-white'
                : 'bg-hikari-800 text-hikari-400 hover:bg-hikari-700 hover:text-white'
            }`}
            title="Changer de périphérique"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Device selection dropdown */}
      {showDeviceMenu && (
        <div className="absolute bottom-full left-0 mb-1 min-w-[180px] rounded-lg bg-hikari-800 p-1 shadow-xl z-50">
          <div className="px-2 py-1 text-[10px] font-medium uppercase text-hikari-500">
            {track.type === 'mic' ? 'Microphones' : 'Sorties audio'}
          </div>
          {devices.map((device) => (
            <button
              key={device.deviceId}
              onClick={() => handleDeviceSelect(device)}
              className={`w-full rounded px-2 py-1.5 text-left text-xs transition-colors ${
                track.deviceId === device.deviceId
                  ? 'bg-hikari-600 text-white'
                  : 'text-hikari-300 hover:bg-hikari-700 hover:text-white'
              }`}
            >
              <div className="truncate">{device.label || `Device ${device.deviceId.slice(0, 8)}`}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PlatformBadge({
  platform,
  enabled,
  hasKey,
  onClick,
  disabled
}: {
  platform: 'twitch' | 'youtube'
  enabled: boolean
  hasKey: boolean
  onClick: () => void
  disabled?: boolean
}): JSX.Element {
  const baseColors = {
    twitch: enabled ? 'bg-purple-600 hover:bg-purple-500' : hasKey ? 'bg-hikari-700 hover:bg-hikari-600' : 'bg-hikari-800',
    youtube: enabled ? 'bg-red-600 hover:bg-red-500' : hasKey ? 'bg-hikari-700 hover:bg-hikari-600' : 'bg-hikari-800'
  }

  const getTitle = (): string => {
    if (!hasKey) return `${platform} - Cle non configuree (ouvrir parametres)`
    if (disabled) return `${platform} - ${enabled ? 'Active' : 'Desactive'}`
    return `${platform} - Cliquer pour ${enabled ? 'desactiver' : 'activer'}`
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || !hasKey}
      className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${baseColors[platform]} ${enabled ? 'text-white' : hasKey ? 'text-hikari-300' : 'text-hikari-600'} ${!hasKey || disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      title={getTitle()}
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
    </button>
  )
}

export default ControlPanel
