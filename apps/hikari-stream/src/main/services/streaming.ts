import { EventEmitter } from 'events'
import { join } from 'path'
import { app } from 'electron'
import { ffmpegService, FFmpegStats } from './ffmpeg'
import { captureService, ScreenSource } from './capture'
import { audioService, AudioMixConfig } from './audio'

export interface StreamConfig {
  // Video settings
  resolution: '720p' | '1080p' | '1440p'
  fps: 30 | 60
  bitrate: number // kbps (e.g., 6000 for 6 Mbps)
  encoder: 'nvenc' | 'amf' | 'qsv' | 'x264'

  // Source (optional - can stream without screen capture)
  source?: ScreenSource | null

  // Audio
  audio?: AudioMixConfig

  // Test mode - records locally instead of streaming
  testMode?: boolean

  // Outputs (can stream to multiple platforms)
  outputs: StreamOutput[]
}

export interface StreamOutput {
  platform: 'twitch' | 'youtube' | 'custom'
  enabled: boolean
  rtmpUrl: string
  streamKey: string
  bandwidthTest?: boolean // Twitch only: stream privately for testing (won't appear live)
}

export interface StreamState {
  status: 'offline' | 'connecting' | 'live' | 'error'
  startTime: number | null
  duration: number // seconds
  stats: FFmpegStats
  error: string | null
}

// Default RTMP URLs for platforms
const PLATFORM_URLS: Record<string, string> = {
  twitch: 'rtmp://live.twitch.tv/app',
  youtube: 'rtmp://a.rtmp.youtube.com/live2',
  custom: ''
}

class StreamingService extends EventEmitter {
  private _state: StreamState = {
    status: 'offline',
    startTime: null,
    duration: 0,
    stats: {
      frame: 0,
      fps: 0,
      bitrate: 0,
      size: 0,
      time: '00:00:00.00',
      speed: 0
    },
    error: null
  }

  private config: StreamConfig | null = null
  private durationInterval: NodeJS.Timeout | null = null
  private connectionCheckTimeout: NodeJS.Timeout | null = null
  private hasReceivedStats: boolean = false

  constructor() {
    super()
    this.setupFFmpegListeners()
  }

  get state(): StreamState {
    return { ...this._state }
  }

  get isLive(): boolean {
    return this._state.status === 'live'
  }

  /**
   * Get default RTMP URL for a platform
   */
  getPlatformUrl(platform: 'twitch' | 'youtube' | 'custom'): string {
    return PLATFORM_URLS[platform] || ''
  }

  /**
   * Start streaming with the given configuration
   */
  async start(config: StreamConfig): Promise<boolean> {
    if (this.isLive) {
      console.warn('[Streaming] Already streaming')
      return false
    }

    // Validate config (skip for test mode)
    if (!config.testMode) {
      const enabledOutputs = config.outputs.filter((o) => o.enabled)
      if (enabledOutputs.length === 0) {
        this.setError('Aucune destination de stream configuree')
        return false
      }

      // Validate stream keys
      for (const output of enabledOutputs) {
        if (!output.streamKey) {
          this.setError(`Cle de stream manquante pour ${output.platform}`)
          return false
        }
      }
    } else {
      // Ensure test output directory exists
      const { mkdirSync, existsSync } = await import('fs')
      const testDir = this.getTestOutputDir()
      if (!existsSync(testDir)) {
        mkdirSync(testDir, { recursive: true })
        console.log(`[Streaming] Created test output directory: ${testDir}`)
      }
    }

    this.config = config
    this.setState({ status: 'connecting', error: null })

    try {
      // Build FFmpeg arguments
      const args = this.buildFFmpegArgs(config)
      console.log('[Streaming] Starting with config:', JSON.stringify({
        ...config,
        outputs: config.outputs.map(o => ({
          ...o,
          streamKey: o.streamKey ? '***HIDDEN***' : ''
        }))
      }, null, 2))

      // Log FFmpeg args with masked stream keys for debugging
      const maskedArgs = args.map(arg => {
        if (arg.includes('live_') || arg.includes('rtmp://')) {
          // Mask stream key in URLs
          return arg.replace(/\/[a-zA-Z0-9_-]{20,}(\||\]|$)/g, '/***STREAM_KEY***$1')
        }
        return arg
      })
      console.log('[Streaming] FFmpeg command:', maskedArgs.join(' '))

      // Start FFmpeg
      ffmpegService.start(args)

      return true
    } catch (error) {
      console.error('[Streaming] Failed to start:', error)
      this.setError(`Erreur: ${error}`)
      return false
    }
  }

  /**
   * Stop streaming
   */
  stop(): void {
    if (!this.isLive && this._state.status !== 'connecting') {
      return
    }

    console.log('[Streaming] Stopping stream...')
    ffmpegService.stop()
  }

  /**
   * Build FFmpeg command line arguments for streaming
   */
  private buildFFmpegArgs(config: StreamConfig): string[] {
    const { source, resolution, fps, bitrate, encoder, outputs, audio, testMode } = config

    const resMap = {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '1440p': { width: 2560, height: 1440 }
    }

    const encoderMap = {
      nvenc: 'h264_nvenc',
      amf: 'h264_amf',
      qsv: 'h264_qsv',
      x264: 'libx264'
    }

    const res = resMap[resolution]
    const args: string[] = []

    // Input 0: screen capture via gdigrab (Windows)
    const captureArgs = captureService.buildScreenCaptureArgs({
      source: source ?? null,
      fps,
      captureAudio: false // Audio handled separately
    })
    args.push(...captureArgs)

    // Audio inputs (input 1, 2, ...)
    let hasAudio = false
    const audioInputs: { index: number; volume: number }[] = []
    let inputIndex = 1

    if (audio) {
      for (const track of audio.tracks) {
        if (!track.muted && track.deviceName) {
          args.push('-f', 'dshow', '-i', `audio=${track.deviceName}`)
          audioInputs.push({ index: inputIndex, volume: track.volume / 100 })
          inputIndex++
          hasAudio = true
        }
      }
    }

    // Build filter complex for video and audio
    const filters: string[] = []

    // Video filter: force constant framerate (gdigrab only captures on changes)
    // This duplicates frames when screen is static to maintain constant fps
    if (source) {
      filters.push(`[0:v]fps=${fps}[vout]`)
    }

    // Audio mixing
    if (hasAudio) {
      if (audioInputs.length === 1) {
        // Single audio input
        const input = audioInputs[0]
        filters.push(`[${input.index}:a]volume=${input.volume}[aout]`)
      } else if (audioInputs.length > 1) {
        // Multiple audio inputs - mix them
        const volumeFilters: string[] = []
        const mixInputs: string[] = []

        audioInputs.forEach((input, i) => {
          const label = `a${i}`
          volumeFilters.push(`[${input.index}:a]volume=${input.volume}[${label}]`)
          mixInputs.push(`[${label}]`)
        })

        filters.push(...volumeFilters)
        filters.push(`${mixInputs.join('')}amix=inputs=${audioInputs.length}:duration=longest[aout]`)
      }

      // Apply filter complex
      args.push('-filter_complex', filters.join(';'))

      // Map video and audio outputs
      if (source) {
        args.push('-map', '[vout]')
      }
      args.push('-map', '[aout]')

      // Audio encoding
      args.push(
        '-c:a', 'aac',
        '-b:a', `${audio?.bitrate || 160}k`,
        '-ar', `${audio?.sampleRate || 48000}`,
        '-ac', '2'
      )
    } else {
      // No audio - add silent audio track for compatibility
      args.push(
        '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000'
      )

      // Apply video filter if we have a source
      if (source && filters.length > 0) {
        args.push('-filter_complex', filters.join(';'))
        args.push('-map', '[vout]')
      } else if (source) {
        args.push('-map', '0:v')
      }

      args.push(
        '-map', `${source ? 1 : 0}:a`,
        '-c:a', 'aac',
        '-b:a', '128k',
        '-shortest'
      )
    }

    // Video encoding
    args.push(
      '-c:v', encoderMap[encoder],
      '-b:v', `${bitrate}k`,
      '-maxrate', `${Math.round(bitrate * 1.5)}k`,
      '-bufsize', `${bitrate * 2}k`,
      '-s', `${res.width}x${res.height}`,
      '-pix_fmt', 'yuv420p',
      '-g', (fps * 2).toString() // Keyframe every 2 seconds
    )

    // Encoder-specific options
    if (encoder === 'nvenc') {
      args.push('-preset', 'p4', '-tune', 'll', '-rc', 'cbr')
    } else if (encoder === 'amf') {
      args.push('-quality', 'balanced', '-rc', 'cbr')
    } else if (encoder === 'qsv') {
      args.push('-preset', 'medium')
    } else if (encoder === 'x264') {
      args.push('-preset', 'veryfast', '-tune', 'zerolatency')
    }

    // Output
    if (testMode) {
      // Test mode: record locally instead of streaming
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const outputDir = this.getTestOutputDir()
      const outputPath = join(outputDir, `test-${timestamp}.mp4`)

      console.log(`[Streaming] TEST MODE - Recording to: ${outputPath}`)
      args.push('-f', 'mp4', outputPath)
    } else {
      // Live mode: stream to enabled platforms
      const enabledOutputs = outputs.filter((o) => o.enabled)

      if (enabledOutputs.length === 1) {
        // Single output - simple format
        const output = enabledOutputs[0]
        const rtmpUrl = output.rtmpUrl || this.getPlatformUrl(output.platform)
        // Append ?bandwidthtest=true for Twitch test mode
        const streamKey = output.platform === 'twitch' && output.bandwidthTest
          ? `${output.streamKey}?bandwidthtest=true`
          : output.streamKey
        const fullUrl = `${rtmpUrl}/${streamKey}`
        args.push('-f', 'flv', fullUrl)
      } else if (enabledOutputs.length > 1) {
        // Multiple outputs - use tee muxer
        const teeOutputs = enabledOutputs.map((output) => {
          const rtmpUrl = output.rtmpUrl || this.getPlatformUrl(output.platform)
          // Append ?bandwidthtest=true for Twitch test mode
          const streamKey = output.platform === 'twitch' && output.bandwidthTest
            ? `${output.streamKey}?bandwidthtest=true`
            : output.streamKey
          const fullUrl = `${rtmpUrl}/${streamKey}`
          return `[f=flv]${fullUrl}`
        })
        args.push('-f', 'tee', teeOutputs.join('|'))
      }
    }

    return args
  }

  /**
   * Get test recording output path
   */
  getTestOutputDir(): string {
    try {
      // Try to use Videos folder first
      return join(app.getPath('videos'), 'Hikari-Stream-Tests')
    } catch {
      // Fallback to user data folder
      return join(app.getPath('userData'), 'Tests')
    }
  }

  /**
   * Setup listeners for FFmpeg events
   */
  private setupFFmpegListeners(): void {
    ffmpegService.on('start', () => {
      console.log('[Streaming] FFmpeg process started, waiting for connection...')
      this.hasReceivedStats = false

      // Set a timeout to detect connection issues
      // If no stats received within 15 seconds, something is wrong
      this.connectionCheckTimeout = setTimeout(() => {
        if (!this.hasReceivedStats && this._state.status === 'connecting') {
          console.error('[Streaming] No stats received after 15 seconds - connection may have failed')
          this.setError('Connexion RTMP échouée - vérifiez votre clé de stream et votre connexion internet')
          ffmpegService.stop()
        }
      }, 15000)
    })

    ffmpegService.on('stop', (code: number) => {
      console.log('[Streaming] FFmpeg stopped with code:', code)
      this.stopDurationTimer()
      this.clearConnectionCheck()

      if (code !== 0 && (this._state.status === 'live' || this._state.status === 'connecting')) {
        this.setError(`Stream interrompu (code ${code})`)
      } else {
        this.setState({ status: 'offline', startTime: null })
      }

      this.emit('offline')
    })

    ffmpegService.on('stats', (stats: FFmpegStats) => {
      // First stats received = stream is actually live
      if (!this.hasReceivedStats) {
        this.hasReceivedStats = true
        this.clearConnectionCheck()
        console.log('[Streaming] First stats received - stream is LIVE!')
        this.setState({
          status: 'live',
          startTime: Date.now(),
          duration: 0
        })
        this.startDurationTimer()
        this.emit('live')
      }

      this._state.stats = stats
      this.emit('stats', stats)
    })

    ffmpegService.on('error', (error: Error) => {
      console.error('[Streaming] FFmpeg error:', error)
      this.setError(error.message)
    })
  }

  /**
   * Start duration timer
   */
  private startDurationTimer(): void {
    this.durationInterval = setInterval(() => {
      if (this._state.startTime) {
        this._state.duration = Math.floor((Date.now() - this._state.startTime) / 1000)
        this.emit('duration', this._state.duration)
      }
    }, 1000)
  }

  /**
   * Stop duration timer
   */
  private stopDurationTimer(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval)
      this.durationInterval = null
    }
  }

  /**
   * Clear connection check timeout
   */
  private clearConnectionCheck(): void {
    if (this.connectionCheckTimeout) {
      clearTimeout(this.connectionCheckTimeout)
      this.connectionCheckTimeout = null
    }
  }

  /**
   * Update state and emit change
   */
  private setState(updates: Partial<StreamState>): void {
    this._state = { ...this._state, ...updates }
    this.emit('state', this._state)
  }

  /**
   * Set error state
   */
  private setError(message: string): void {
    this._state.status = 'error'
    this._state.error = message
    this.emit('error', message)
    this.emit('state', this._state)
  }

  /**
   * Get recommended bitrate for resolution
   */
  getRecommendedBitrate(resolution: '720p' | '1080p' | '1440p', fps: 30 | 60): number {
    const bitrates = {
      '720p': { 30: 3000, 60: 4500 },
      '1080p': { 30: 4500, 60: 6000 },
      '1440p': { 30: 8000, 60: 12000 }
    }
    return bitrates[resolution][fps]
  }

  /**
   * Get default stream config
   */
  getDefaultConfig(): Omit<StreamConfig, 'source'> {
    return {
      resolution: '1080p',
      fps: 60,
      bitrate: 6000,
      encoder: 'x264', // Safe default, will be updated after detection
      outputs: [
        {
          platform: 'twitch',
          enabled: true,
          rtmpUrl: PLATFORM_URLS.twitch,
          streamKey: ''
        },
        {
          platform: 'youtube',
          enabled: false,
          rtmpUrl: PLATFORM_URLS.youtube,
          streamKey: ''
        }
      ]
    }
  }
}

// Singleton
export const streamingService = new StreamingService()
