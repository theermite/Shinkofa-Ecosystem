import { useEffect, useState } from 'react'

interface StreamOutput {
  platform: 'twitch' | 'youtube' | 'custom'
  enabled: boolean
  rtmpUrl: string
  streamKey: string
}

interface EncoderInfo {
  name: string
  type: 'nvenc' | 'amf' | 'qsv' | 'x264'
  available: boolean
}

interface StreamSettingsProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: {
    resolution: '720p' | '1080p' | '1440p'
    fps: 30 | 60
    bitrate: number
    encoder: 'nvenc' | 'amf' | 'qsv' | 'x264'
    outputs: StreamOutput[]
  }) => void
  initialSettings?: {
    resolution: '720p' | '1080p' | '1440p'
    fps: 30 | 60
    bitrate: number
    encoder: 'nvenc' | 'amf' | 'qsv' | 'x264'
    outputs: StreamOutput[]
  }
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
    { platform: 'twitch', enabled: true, rtmpUrl: '', streamKey: '' },
    { platform: 'youtube', enabled: false, rtmpUrl: '', streamKey: '' }
  ])
  const [loading, setLoading] = useState(true)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
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

      // Load default config if no initial settings
      if (!initialSettings) {
        const defaults = await window.api.getStreamDefaultConfig()
        setResolution(defaults.resolution)
        setFps(defaults.fps)
        setBitrate(defaults.bitrate)

        // Load platform URLs
        const twitchUrl = await window.api.getPlatformUrl('twitch')
        const youtubeUrl = await window.api.getPlatformUrl('youtube')

        setOutputs([
          { ...defaults.outputs[0], rtmpUrl: twitchUrl },
          { ...defaults.outputs[1], rtmpUrl: youtubeUrl }
        ])
      } else {
        setResolution(initialSettings.resolution)
        setFps(initialSettings.fps)
        setBitrate(initialSettings.bitrate)
        setEncoder(initialSettings.encoder)
        setOutputs(initialSettings.outputs)
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

  const handleSave = (): void => {
    onSave({
      resolution,
      fps,
      bitrate,
      encoder,
      outputs
    })
    onClose()
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
                        <div className="mt-3">
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
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
