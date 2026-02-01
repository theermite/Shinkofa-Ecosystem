import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'hikari-stream-settings'

interface TwitchMetadata {
  title: string
  category: string // Game/Category name
  tags: string[] // Max 10 tags
  notifyFollowers: boolean
}

interface YouTubeMetadata {
  title: string
  description: string
  privacy: 'public' | 'unlisted' | 'private'
  category: string
  tags: string[]
  madeForKids: boolean
}

interface StreamOutput {
  platform: 'twitch' | 'youtube' | 'custom'
  enabled: boolean
  rtmpUrl: string
  streamKey: string
  bandwidthTest?: boolean // Twitch only: stream privately for testing
  // Platform-specific metadata
  twitchMeta?: TwitchMetadata
  youtubeMeta?: YouTubeMetadata
}

interface EncoderInfo {
  name: string
  type: 'nvenc' | 'amf' | 'qsv' | 'x264'
  available: boolean
}

interface AudioDevice {
  id: string
  name: string
  type: 'input' | 'output'
  isDefault: boolean
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

interface StreamSettingsProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: StreamSettingsData) => void
  initialSettings?: Partial<StreamSettingsData>
}

function StreamSettings({
  isOpen,
  onClose,
  onSave,
  initialSettings
}: StreamSettingsProps): JSX.Element | null {
  const [resolution, setResolution] = useState<'720p' | '1080p' | '1440p'>('1080p')
  const [fps, setFps] = useState<30 | 60>(60)
  const [bitrate, setBitrate] = useState(6000)
  const [encoder, setEncoder] = useState<'nvenc' | 'amf' | 'qsv' | 'x264'>('x264')
  const [encoders, setEncoders] = useState<EncoderInfo[]>([])
  const [outputs, setOutputs] = useState<StreamOutput[]>([
    {
      platform: 'twitch',
      enabled: true,
      rtmpUrl: '',
      streamKey: '',
      twitchMeta: {
        title: '',
        category: '',
        tags: [],
        notifyFollowers: true
      }
    },
    {
      platform: 'youtube',
      enabled: false,
      rtmpUrl: '',
      streamKey: '',
      youtubeMeta: {
        title: '',
        description: '',
        privacy: 'public',
        category: 'Gaming',
        tags: [],
        madeForKids: false
      }
    }
  ])
  const [loading, setLoading] = useState(true)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  // Mode test
  const [testMode, setTestMode] = useState(false)

  // Audio
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([])
  const [audioConfig, setAudioConfig] = useState<AudioConfig>({
    tracks: [
      { id: 'mic', name: 'Microphone', type: 'mic', deviceName: null, volume: 100, muted: false },
      { id: 'desktop', name: 'Son PC', type: 'desktop', deviceName: null, volume: 80, muted: false }
    ],
    sampleRate: 48000,
    bitrate: 160
  })

  // Load saved settings from localStorage
  const loadSavedSettings = useCallback((): Partial<StreamSettingsData> | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('[StreamSettings] Failed to load saved settings:', error)
    }
    return null
  }, [])

  // Save settings to localStorage
  const saveSettingsToStorage = useCallback((settings: StreamSettingsData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      console.log('[StreamSettings] Settings saved to localStorage')
    } catch (error) {
      console.error('[StreamSettings] Failed to save settings:', error)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const loadSettings = async (): Promise<void> => {
    setLoading(true)
    try {
      // Load available encoders
      const availableEncoders = await window.api.detectEncoders()
      setEncoders(availableEncoders)

      // Set best encoder as default
      const best = availableEncoders.find((e) => e.available)
      if (best) {
        setEncoder(best.type)
      }

      // Load audio devices
      const devices = await window.api.detectAudioDevices()
      setAudioDevices(devices)

      // Load default audio config
      const defaultAudioConfig = await window.api.getDefaultAudioConfig()
      setAudioConfig(defaultAudioConfig)

      // Try to load saved settings first
      const savedSettings = loadSavedSettings()

      // Load default config if no initial settings
      if (!initialSettings) {
        const defaults = await window.api.getStreamDefaultConfig()

        // Load platform URLs
        const twitchUrl = await window.api.getPlatformUrl('twitch')
        const youtubeUrl = await window.api.getPlatformUrl('youtube')

        // Apply saved settings if available, otherwise use defaults
        if (savedSettings) {
          console.log('[StreamSettings] Loaded saved settings')
          setResolution(savedSettings.resolution || defaults.resolution)
          setFps(savedSettings.fps || defaults.fps)
          setBitrate(savedSettings.bitrate || defaults.bitrate)
          if (savedSettings.encoder) setEncoder(savedSettings.encoder)
          if (savedSettings.testMode !== undefined) setTestMode(savedSettings.testMode)
          if (savedSettings.audio) setAudioConfig(savedSettings.audio)

          // Merge saved outputs with platform URLs and ensure metadata exists
          if (savedSettings.outputs) {
            setOutputs(savedSettings.outputs.map(output => ({
              ...output,
              rtmpUrl: output.platform === 'twitch' ? twitchUrl :
                       output.platform === 'youtube' ? youtubeUrl : output.rtmpUrl,
              // Ensure twitchMeta exists for twitch platform
              twitchMeta: output.platform === 'twitch' ? (output.twitchMeta || {
                title: '',
                category: '',
                tags: [],
                notifyFollowers: true
              }) : undefined,
              // Ensure youtubeMeta exists for youtube platform
              youtubeMeta: output.platform === 'youtube' ? (output.youtubeMeta || {
                title: '',
                description: '',
                privacy: 'public' as const,
                category: 'Gaming',
                tags: [],
                madeForKids: false
              }) : undefined
            })))
          } else {
            setOutputs([
              { ...defaults.outputs[0], rtmpUrl: twitchUrl },
              { ...defaults.outputs[1], rtmpUrl: youtubeUrl }
            ])
          }
        } else {
          setResolution(defaults.resolution)
          setFps(defaults.fps)
          setBitrate(defaults.bitrate)
          setOutputs([
            { ...defaults.outputs[0], rtmpUrl: twitchUrl },
            { ...defaults.outputs[1], rtmpUrl: youtubeUrl }
          ])
        }
      } else {
        if (initialSettings.resolution) setResolution(initialSettings.resolution)
        if (initialSettings.fps) setFps(initialSettings.fps)
        if (initialSettings.bitrate) setBitrate(initialSettings.bitrate)
        if (initialSettings.encoder) setEncoder(initialSettings.encoder)
        if (initialSettings.outputs) setOutputs(initialSettings.outputs)
        if (initialSettings.testMode !== undefined) setTestMode(initialSettings.testMode)
        if (initialSettings.audio) setAudioConfig(initialSettings.audio)
      }
    } catch (error) {
      console.error('[StreamSettings] Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolutionChange = async (newRes: '720p' | '1080p' | '1440p'): Promise<void> => {
    setResolution(newRes)
    // Update recommended bitrate
    const recommended = await window.api.getRecommendedBitrate(newRes, fps)
    setBitrate(recommended)
  }

  const handleFpsChange = async (newFps: 30 | 60): Promise<void> => {
    setFps(newFps)
    // Update recommended bitrate
    const recommended = await window.api.getRecommendedBitrate(resolution, newFps)
    setBitrate(recommended)
  }

  const handleOutputChange = (
    index: number,
    field: keyof StreamOutput,
    value: string | boolean
  ): void => {
    setOutputs((prev) => {
      const newOutputs = [...prev]
      newOutputs[index] = { ...newOutputs[index], [field]: value }
      return newOutputs
    })
  }

  const handleTwitchMetaChange = (
    index: number,
    field: keyof TwitchMetadata,
    value: string | string[] | boolean
  ): void => {
    setOutputs((prev) => {
      const newOutputs = [...prev]
      const output = newOutputs[index]
      // Initialize twitchMeta if it doesn't exist
      const currentMeta = output.twitchMeta || {
        title: '',
        category: '',
        tags: [],
        notifyFollowers: true
      }
      // Handle tags array - limit to 10 tags
      if (field === 'tags' && Array.isArray(value)) {
        value = value.slice(0, 10)
      }
      newOutputs[index] = {
        ...output,
        twitchMeta: { ...currentMeta, [field]: value }
      }
      return newOutputs
    })
  }

  const handleYoutubeMetaChange = (
    index: number,
    field: keyof YouTubeMetadata,
    value: string | string[] | boolean
  ): void => {
    setOutputs((prev) => {
      const newOutputs = [...prev]
      const output = newOutputs[index]
      // Initialize youtubeMeta if it doesn't exist
      const currentMeta = output.youtubeMeta || {
        title: '',
        description: '',
        privacy: 'public' as const,
        category: 'Gaming',
        tags: [],
        madeForKids: false
      }
      newOutputs[index] = {
        ...output,
        youtubeMeta: { ...currentMeta, [field]: value }
      }
      return newOutputs
    })
  }

  const handleSave = (): void => {
    const settings: StreamSettingsData = {
      resolution,
      fps,
      bitrate,
      encoder,
      outputs,
      testMode,
      audio: audioConfig
    }

    // Save to localStorage for persistence
    saveSettingsToStorage(settings)

    // Callback to parent
    onSave(settings)
    onClose()
  }

  const handleAudioDeviceChange = (trackId: string, deviceName: string | null): void => {
    setAudioConfig(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === trackId ? { ...track, deviceName } : track
      )
    }))
  }

  const handleAudioTrackMute = (trackId: string): void => {
    setAudioConfig(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === trackId ? { ...track, muted: !track.muted } : track
      )
    }))
  }

  const toggleShowKey = (platform: string): void => {
    setShowKeys((prev) => ({ ...prev, [platform]: !prev[platform] }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl bg-hikari-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hikari-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Parametres du Stream</h2>
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

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-hikari-500 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Video Settings */}
              <section>
                <h3 className="mb-3 text-sm font-medium text-hikari-300">Video</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Resolution */}
                  <div>
                    <label className="mb-1 block text-xs text-hikari-400">Resolution</label>
                    <select
                      value={resolution}
                      onChange={(e) =>
                        handleResolutionChange(e.target.value as '720p' | '1080p' | '1440p')
                      }
                      className="w-full rounded-lg border border-hikari-700 bg-hikari-800 px-3 py-2 text-sm text-white focus:border-hikari-500 focus:outline-none"
                    >
                      <option value="720p">720p (1280x720)</option>
                      <option value="1080p">1080p (1920x1080)</option>
                      <option value="1440p">1440p (2560x1440)</option>
                    </select>
                  </div>

                  {/* FPS */}
                  <div>
                    <label className="mb-1 block text-xs text-hikari-400">Images/seconde</label>
                    <select
                      value={fps}
                      onChange={(e) => handleFpsChange(parseInt(e.target.value) as 30 | 60)}
                      className="w-full rounded-lg border border-hikari-700 bg-hikari-800 px-3 py-2 text-sm text-white focus:border-hikari-500 focus:outline-none"
                    >
                      <option value={30}>30 FPS</option>
                      <option value={60}>60 FPS</option>
                    </select>
                  </div>

                  {/* Bitrate */}
                  <div>
                    <label className="mb-1 block text-xs text-hikari-400">
                      Bitrate ({bitrate} kbps)
                    </label>
                    <input
                      type="range"
                      min={1000}
                      max={15000}
                      step={500}
                      value={bitrate}
                      onChange={(e) => setBitrate(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-hikari-500">
                      <span>1 Mbps</span>
                      <span>15 Mbps</span>
                    </div>
                  </div>

                  {/* Encoder */}
                  <div>
                    <label className="mb-1 block text-xs text-hikari-400">Encodeur</label>
                    <select
                      value={encoder}
                      onChange={(e) =>
                        setEncoder(e.target.value as 'nvenc' | 'amf' | 'qsv' | 'x264')
                      }
                      className="w-full rounded-lg border border-hikari-700 bg-hikari-800 px-3 py-2 text-sm text-white focus:border-hikari-500 focus:outline-none"
                    >
                      {encoders.map((enc) => (
                        <option key={enc.type} value={enc.type} disabled={!enc.available}>
                          {enc.name} {!enc.available && '(Non disponible)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Mode Test */}
              <section>
                <div className="flex items-center justify-between rounded-lg border border-yellow-600/50 bg-yellow-900/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-600/20">
                      <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium text-white">Mode Test</span>
                      <p className="text-xs text-hikari-400">Enregistre localement au lieu de streamer en live</p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={testMode}
                      onChange={(e) => setTestMode(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-hikari-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-yellow-500 peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
                {testMode && (
                  <p className="mt-2 text-xs text-yellow-400">
                    Les fichiers seront sauvegardés dans : Vidéos/Hikari-Stream-Tests/
                  </p>
                )}
              </section>

              {/* Audio */}
              <section>
                <h3 className="mb-3 text-sm font-medium text-hikari-300">Audio</h3>
                <div className="space-y-3">
                  {audioConfig.tracks.map((track) => (
                    <div
                      key={track.id}
                      className={`rounded-lg border p-3 ${
                        track.muted ? 'border-hikari-700 bg-hikari-800/50 opacity-60' : 'border-hikari-700 bg-hikari-800'
                      }`}
                    >
                      {/* Row 1: Icon + Name + Mute button */}
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-hikari-700">
                            {track.type === 'mic' && (
                              <svg className="h-4 w-4 text-hikari-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              </svg>
                            )}
                            {track.type === 'desktop' && (
                              <svg className="h-4 w-4 text-hikari-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-medium text-white">{track.name}</span>
                        </div>

                        {/* Mute button */}
                        <button
                          onClick={() => handleAudioTrackMute(track.id)}
                          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            track.muted
                              ? 'bg-red-600 text-white'
                              : 'bg-hikari-700 text-hikari-300 hover:bg-hikari-600'
                          }`}
                        >
                          {track.muted ? 'Muté' : 'Actif'}
                        </button>
                      </div>

                      {/* Row 2: Device selector (full width) */}
                      <select
                        value={track.deviceName || ''}
                        onChange={(e) => handleAudioDeviceChange(track.id, e.target.value || null)}
                        className="w-full rounded-lg border border-hikari-700 bg-hikari-900 px-3 py-2 text-sm text-white focus:border-hikari-500 focus:outline-none"
                        disabled={track.muted}
                      >
                        <option value="">-- Aucun (désactivé) --</option>
                        {/* Show recommended devices first, then all others */}
                        {audioDevices
                          .filter(d => track.type === 'mic' ? d.type === 'input' : d.type === 'output')
                          .map(device => (
                            <option key={device.id} value={device.name}>
                              {device.name} {device.isDefault && '★'}
                            </option>
                          ))}
                        {/* Separator and all devices for manual selection */}
                        {audioDevices.filter(d => track.type === 'mic' ? d.type !== 'input' : d.type !== 'output').length > 0 && (
                          <option disabled>── Autres périphériques ──</option>
                        )}
                        {audioDevices
                          .filter(d => track.type === 'mic' ? d.type !== 'input' : d.type !== 'output')
                          .map(device => (
                            <option key={`other-${device.id}`} value={device.name}>
                              {device.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  ))}
                </div>

                {audioDevices.length === 0 && (
                  <p className="mt-2 text-xs text-yellow-400">
                    Aucun périphérique audio détecté. Vérifiez vos paramètres système.
                  </p>
                )}

                {audioDevices.length > 0 && audioDevices.filter(d => d.type === 'output').length === 0 && (
                  <div className="mt-2 rounded-lg bg-hikari-800/50 p-3 text-xs text-hikari-400">
                    <p className="font-medium text-hikari-300">Note : Son PC</p>
                    <p className="mt-1">
                      Pour capturer le son du PC, vous pouvez utiliser SteelSeries Sonar Microphone
                      (qui route tout l'audio) ou activer "Stereo Mix" dans les paramètres Windows.
                    </p>
                    <p className="mt-1">
                      Pour le streaming mobile (Honor of Kings), l'audio viendra du téléphone via scrcpy.
                    </p>
                  </div>
                )}
              </section>

              {/* Platforms */}
              <section>
                <h3 className="mb-3 text-sm font-medium text-hikari-300">Plateformes</h3>
                <div className="space-y-3">
                  {outputs.map((output, index) => (
                    <div
                      key={output.platform}
                      className={`rounded-lg border p-4 transition-colors ${
                        output.enabled
                          ? 'border-hikari-600 bg-hikari-800'
                          : 'border-hikari-700 bg-hikari-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <PlatformIcon platform={output.platform} />
                          <span className="font-medium text-white capitalize">
                            {output.platform}
                          </span>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={output.enabled}
                            onChange={(e) =>
                              handleOutputChange(index, 'enabled', e.target.checked)
                            }
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-hikari-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-hikari-500 peer-checked:after:translate-x-full"></div>
                        </label>
                      </div>

                      {output.enabled && (
                        <div className="mt-3 space-y-3">
                          {/* Stream Key */}
                          <div>
                            <label className="mb-1 block text-xs text-hikari-400">
                              Cle de stream
                            </label>
                            <div className="flex gap-2">
                              <input
                                type={showKeys[output.platform] ? 'text' : 'password'}
                                value={output.streamKey}
                                onChange={(e) =>
                                  handleOutputChange(index, 'streamKey', e.target.value)
                                }
                                placeholder="Entrez votre cle de stream"
                                className="flex-1 rounded-lg border border-hikari-700 bg-hikari-900 px-3 py-2 text-sm text-white placeholder-hikari-500 focus:border-hikari-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => toggleShowKey(output.platform)}
                                className="rounded-lg border border-hikari-700 px-3 text-hikari-400 hover:bg-hikari-800 hover:text-white"
                              >
                                {showKeys[output.platform] ? (
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Twitch Metadata - Always show for Twitch */}
                          {output.platform === 'twitch' && (
                            <div className="space-y-3 border-t border-hikari-700 pt-3">
                              <h4 className="text-xs font-medium text-purple-400">Infos du stream Twitch</h4>

                              {/* Title */}
                              <div>
                                <label className="mb-1 block text-xs text-hikari-400">Titre du stream</label>
                                <input
                                  type="text"
                                  value={output.twitchMeta?.title || ''}
                                  onChange={(e) => handleTwitchMetaChange(index, 'title', e.target.value)}
                                  placeholder="Ex: Honor of Kings Ranked avec Jay !"
                                  maxLength={140}
                                  className="w-full rounded-lg border border-hikari-700 bg-hikari-900 px-3 py-2 text-sm text-white placeholder-hikari-500 focus:border-purple-500 focus:outline-none"
                                />
                                <span className="text-xs text-hikari-500">{(output.twitchMeta?.title || '').length}/140</span>
                              </div>

                              {/* Category */}
                              <div>
                                <label className="mb-1 block text-xs text-hikari-400">Categorie / Jeu</label>
                                <input
                                  type="text"
                                  value={output.twitchMeta?.category || ''}
                                  onChange={(e) => handleTwitchMetaChange(index, 'category', e.target.value)}
                                  placeholder="Ex: Honor of Kings"
                                  className="w-full rounded-lg border border-hikari-700 bg-hikari-900 px-3 py-2 text-sm text-white placeholder-hikari-500 focus:border-purple-500 focus:outline-none"
                                />
                              </div>

                              {/* Tags */}
                              <div>
                                <label className="mb-1 block text-xs text-hikari-400">Tags (separes par des virgules)</label>
                                <input
                                  type="text"
                                  value={(output.twitchMeta?.tags || []).join(', ')}
                                  onChange={(e) => handleTwitchMetaChange(index, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                                  placeholder="Ex: Francais, Mobile Gaming, MOBA"
                                  className="w-full rounded-lg border border-hikari-700 bg-hikari-900 px-3 py-2 text-sm text-white placeholder-hikari-500 focus:border-purple-500 focus:outline-none"
                                />
                                <span className="text-xs text-hikari-500">Max 10 tags</span>
                              </div>

                              {/* Notify Followers */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-hikari-300">Notifier les abonnes</span>
                                <label className="relative inline-flex cursor-pointer items-center">
                                  <input
                                    type="checkbox"
                                    checked={output.twitchMeta?.notifyFollowers ?? true}
                                    onChange={(e) => handleTwitchMetaChange(index, 'notifyFollowers', e.target.checked)}
                                    className="peer sr-only"
                                  />
                                  <div className="peer h-6 w-11 rounded-full bg-hikari-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-500 peer-checked:after:translate-x-full"></div>
                                </label>
                              </div>

                              {/* Bandwidth Test Mode */}
                              <div className="flex items-center justify-between rounded-lg border border-yellow-600/30 bg-yellow-900/10 p-3">
                                <div>
                                  <span className="text-sm text-hikari-300">Mode test bande passante</span>
                                  <p className="text-xs text-hikari-500">Stream prive pour tester votre connexion (invisible aux viewers)</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                  <input
                                    type="checkbox"
                                    checked={output.bandwidthTest ?? false}
                                    onChange={(e) => handleOutputChange(index, 'bandwidthTest', e.target.checked)}
                                    className="peer sr-only"
                                  />
                                  <div className="peer h-6 w-11 rounded-full bg-hikari-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-yellow-500 peer-checked:after:translate-x-full"></div>
                                </label>
                              </div>
                            </div>
                          )}

                          {/* YouTube Metadata - Always show for YouTube */}
                          {output.platform === 'youtube' && (
                            <div className="space-y-3 border-t border-hikari-700 pt-3">
                              <h4 className="text-xs font-medium text-red-400">Infos du stream YouTube</h4>

                              {/* Title */}
                              <div>
                                <label className="mb-1 block text-xs text-hikari-400">Titre du stream</label>
                                <input
                                  type="text"
                                  value={output.youtubeMeta?.title || ''}
                                  onChange={(e) => handleYoutubeMetaChange(index, 'title', e.target.value)}
                                  placeholder="Ex: LIVE Honor of Kings - Road to Master"
                                  maxLength={100}
                                  className="w-full rounded-lg border border-hikari-700 bg-hikari-900 px-3 py-2 text-sm text-white placeholder-hikari-500 focus:border-red-500 focus:outline-none"
                                />
                                <span className="text-xs text-hikari-500">{(output.youtubeMeta?.title || '').length}/100</span>
                              </div>

                              {/* Description */}
                              <div>
                                <label className="mb-1 block text-xs text-hikari-400">Description</label>
                                <textarea
                                  value={output.youtubeMeta?.description || ''}
                                  onChange={(e) => handleYoutubeMetaChange(index, 'description', e.target.value)}
                                  placeholder="Description du stream..."
                                  rows={3}
                                  className="w-full rounded-lg border border-hikari-700 bg-hikari-900 px-3 py-2 text-sm text-white placeholder-hikari-500 focus:border-red-500 focus:outline-none resize-none"
                                />
                              </div>

                              {/* Privacy */}
                              <div>
                                <label className="mb-1 block text-xs text-hikari-400">Visibilite</label>
                                <select
                                  value={output.youtubeMeta?.privacy || 'public'}
                                  onChange={(e) => handleYoutubeMetaChange(index, 'privacy', e.target.value)}
                                  className="w-full rounded-lg border border-hikari-700 bg-hikari-900 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                                >
                                  <option value="public">Public</option>
                                  <option value="unlisted">Non repertorie</option>
                                  <option value="private">Prive</option>
                                </select>
                              </div>

                              {/* Category */}
                              <div>
                                <label className="mb-1 block text-xs text-hikari-400">Categorie</label>
                                <select
                                  value={output.youtubeMeta?.category || 'Gaming'}
                                  onChange={(e) => handleYoutubeMetaChange(index, 'category', e.target.value)}
                                  className="w-full rounded-lg border border-hikari-700 bg-hikari-900 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                                >
                                  <option value="Gaming">Gaming</option>
                                  <option value="Entertainment">Divertissement</option>
                                  <option value="People & Blogs">People & Blogs</option>
                                  <option value="Education">Education</option>
                                  <option value="Science & Technology">Science & Tech</option>
                                </select>
                              </div>

                              {/* Tags */}
                              <div>
                                <label className="mb-1 block text-xs text-hikari-400">Tags (separes par des virgules)</label>
                                <input
                                  type="text"
                                  value={(output.youtubeMeta?.tags || []).join(', ')}
                                  onChange={(e) => handleYoutubeMetaChange(index, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                                  placeholder="Ex: gaming, mobile, honor of kings, moba"
                                  className="w-full rounded-lg border border-hikari-700 bg-hikari-900 px-3 py-2 text-sm text-white placeholder-hikari-500 focus:border-red-500 focus:outline-none"
                                />
                              </div>

                              {/* Made for Kids */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm text-hikari-300">Contenu pour enfants</span>
                                  <p className="text-xs text-hikari-500">Requis par la loi COPPA</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                  <input
                                    type="checkbox"
                                    checked={output.youtubeMeta?.madeForKids ?? false}
                                    onChange={(e) => handleYoutubeMetaChange(index, 'madeForKids', e.target.checked)}
                                    className="peer sr-only"
                                  />
                                  <div className="peer h-6 w-11 rounded-full bg-hikari-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-500 peer-checked:after:translate-x-full"></div>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Help Section: How to get stream keys */}
              <section>
                <h3 className="mb-3 text-sm font-medium text-hikari-300">Comment obtenir vos cles de stream</h3>
                <div className="space-y-3">
                  {/* Twitch Instructions */}
                  <div className="rounded-lg border border-purple-600/30 bg-purple-900/20 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="h-5 w-5 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                      </svg>
                      <span className="font-medium text-white">Twitch</span>
                    </div>
                    <ol className="text-xs text-hikari-300 space-y-1 ml-7 list-decimal">
                      <li>Connectez-vous sur <span className="text-purple-400">dashboard.twitch.tv</span></li>
                      <li>Allez dans <span className="text-white">Parametres</span> &gt; <span className="text-white">Stream</span></li>
                      <li>Cliquez sur <span className="text-white">Afficher</span> a cote de "Cle de stream principale"</li>
                      <li>Copiez la cle et collez-la ici</li>
                    </ol>
                  </div>

                  {/* YouTube Instructions */}
                  <div className="rounded-lg border border-red-600/30 bg-red-900/20 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      <span className="font-medium text-white">YouTube</span>
                    </div>
                    <ol className="text-xs text-hikari-300 space-y-1 ml-7 list-decimal">
                      <li>Connectez-vous sur <span className="text-red-400">studio.youtube.com</span></li>
                      <li>Cliquez sur <span className="text-white">Creer</span> &gt; <span className="text-white">Passer en direct</span></li>
                      <li>Choisissez <span className="text-white">Logiciel de streaming</span></li>
                      <li>Dans <span className="text-white">Parametres du flux</span>, copiez la <span className="text-white">Cle de flux</span></li>
                    </ol>
                    <p className="text-xs text-yellow-400 mt-2">
                      Note : Votre chaine doit etre verifiee (24h d'attente pour les nouvelles chaines)
                    </p>
                  </div>
                </div>
              </section>

              {/* Info */}
              <div className="rounded-lg bg-hikari-800/50 p-3 text-xs text-hikari-400">
                <p>
                  <strong>Bitrate recommande :</strong> Twitch limite a 6000 kbps. YouTube supporte
                  jusqu'a 51000 kbps.
                </p>
                <p className="mt-1">
                  <strong>Encodeur :</strong> NVENC (NVIDIA) ou AMF (AMD) offrent les meilleures
                  performances. x264 utilise le CPU.
                </p>
                <p className="mt-1">
                  <strong>Securite :</strong> Vos cles de stream sont stockees localement et ne sont jamais partagees.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-hikari-800 px-6 py-4">
          <button onClick={onClose} className="btn-secondary">
            Annuler
          </button>
          <button onClick={handleSave} className="btn-primary" disabled={loading}>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  )
}

function PlatformIcon({ platform }: { platform: string }): JSX.Element {
  if (platform === 'twitch') {
    return (
      <svg className="h-5 w-5 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    )
  }

  if (platform === 'youtube') {
    return (
      <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    )
  }

  return (
    <svg
      className="h-5 w-5 text-hikari-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>
  )
}

export default StreamSettings
