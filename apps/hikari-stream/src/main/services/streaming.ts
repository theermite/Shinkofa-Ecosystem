import { EventEmitter } from 'events'
import { ffmpegService, FFmpegStats } from './ffmpeg'
import { captureService, ScreenSource } from './capture'

export interface StreamConfig {
  // Video settings
  resolution: '720p' | '1080p' | '1440p'
  fps: 30 | 60
  bitrate: number // kbps (e.g., 6000 for 6 Mbps)
  encoder: 'nvenc' | 'amf' | 'qsv' | 'x264'

  // Source
  source: ScreenSource

  // Outputs (can stream to multiple platforms)
  outputs: StreamOutput[]
}

export interface StreamOutput {
  platform: 'twitch' | 'youtube' | 'custom'
  enabled: boolean
  rtmpUrl: string
  streamKey: string
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

    // Validate config
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

    this.config = config
    this.setState({ status: 'connecting', error: null })

    try {
      // Build FFmpeg arguments
      const args = this.buildFFmpegArgs(config)
      console.log('[Streaming] Starting with config:', config)

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
    const { source, resolution, fps, bitrate, encoder, outputs } = config

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

    // Input: screen capture via gdigrab (Windows)
    const captureArgs = captureService.buildScreenCaptureArgs({
      source,
      fps,
      captureAudio: false // TODO: audio mixing later
    })
    args.push(...captureArgs)

    // Video encoding
    args.push(
      '-c:v',
      encoderMap[encoder],
      '-b:v',
      `${bitrate}k`,
      '-maxrate',
      `${Math.round(bitrate * 1.5)}k`,
      '-bufsize',
      `${bitrate * 2}k`,
      '-s',
      `${res.width}x${res.height}`,
      '-pix_fmt',
      'yuv420p',
      '-g',
      (fps * 2).toString() // Keyframe every 2 seconds
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

    // Output to each enabled platform
    const enabledOutputs = outputs.filter((o) => o.enabled)
    for (const output of enabledOutputs) {
      const rtmpUrl = output.rtmpUrl || this.getPlatformUrl(output.platform)
      const fullUrl = `${rtmpUrl}/${output.streamKey}`

      args.push('-f', 'flv', fullUrl)
    }

    return args
  }

  /**
   * Setup listeners for FFmpeg events
   */
  private setupFFmpegListeners(): void {
    ffmpegService.on('start', () => {
      console.log('[Streaming] FFmpeg started')
      this.setState({
        status: 'live',
        startTime: Date.now(),
        duration: 0
      })
      this.startDurationTimer()
      this.emit('live')
    })

    ffmpegService.on('stop', (code: number) => {
      console.log('[Streaming] FFmpeg stopped with code:', code)
      this.stopDurationTimer()

      if (code !== 0 && this._state.status === 'live') {
        this.setError(`Stream interrompu (code ${code})`)
      } else {
        this.setState({ status: 'offline', startTime: null })
      }

      this.emit('offline')
    })

    ffmpegService.on('stats', (stats: FFmpegStats) => {
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
