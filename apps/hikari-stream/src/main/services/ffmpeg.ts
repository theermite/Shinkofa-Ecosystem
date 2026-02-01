import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { existsSync } from 'fs'
import { dependenciesService } from './dependencies'

export interface FFmpegStats {
  frame: number
  fps: number
  bitrate: number // kbps
  size: number // bytes
  time: string // HH:MM:SS.ms
  speed: number
}

export interface EncoderInfo {
  name: string
  type: 'nvenc' | 'amf' | 'qsv' | 'x264'
  available: boolean
}

class FFmpegService extends EventEmitter {
  private process: ChildProcess | null = null
  private _isRunning: boolean = false
  private stats: FFmpegStats = {
    frame: 0,
    fps: 0,
    bitrate: 0,
    size: 0,
    time: '00:00:00.00',
    speed: 0
  }

  get isRunning(): boolean {
    return this._isRunning
  }

  get currentStats(): FFmpegStats {
    return { ...this.stats }
  }

  get ffmpegPath(): string {
    return dependenciesService.ffmpegPath
  }

  get isAvailable(): boolean {
    return existsSync(this.ffmpegPath)
  }

  /**
   * Detect available hardware encoders
   */
  async detectEncoders(): Promise<EncoderInfo[]> {
    const encoders: EncoderInfo[] = [
      { name: 'NVIDIA NVENC (H.264)', type: 'nvenc', available: false },
      { name: 'AMD AMF (H.264)', type: 'amf', available: false },
      { name: 'Intel QuickSync (H.264)', type: 'qsv', available: false },
      { name: 'x264 (Software)', type: 'x264', available: true } // Always available
    ]

    if (!this.isAvailable) return encoders

    // Check NVENC
    try {
      await this.testEncoder('h264_nvenc')
      encoders[0].available = true
      console.log('[FFmpeg] NVENC encoder available')
    } catch {
      console.log('[FFmpeg] NVENC encoder not available')
    }

    // Check AMF
    try {
      await this.testEncoder('h264_amf')
      encoders[1].available = true
      console.log('[FFmpeg] AMF encoder available')
    } catch {
      console.log('[FFmpeg] AMF encoder not available')
    }

    // Check QuickSync
    try {
      await this.testEncoder('h264_qsv')
      encoders[2].available = true
      console.log('[FFmpeg] QuickSync encoder available')
    } catch {
      console.log('[FFmpeg] QuickSync encoder not available')
    }

    return encoders
  }

  private testEncoder(encoder: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn(this.ffmpegPath, [
        '-f', 'lavfi',
        '-i', 'nullsrc=s=1920x1080:d=1',
        '-c:v', encoder,
        '-f', 'null',
        '-'
      ], { windowsHide: true })

      proc.on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`Encoder ${encoder} not available`))
      })

      proc.on('error', reject)

      // Timeout after 5 seconds
      setTimeout(() => {
        proc.kill()
        reject(new Error('Timeout'))
      }, 5000)
    })
  }

  /**
   * Get best available encoder
   */
  async getBestEncoder(): Promise<EncoderInfo> {
    const encoders = await this.detectEncoders()
    // Priority: NVENC > AMF > QSV > x264
    return encoders.find(e => e.available) || encoders[3]
  }

  /**
   * Start FFmpeg process with given arguments
   */
  start(args: string[]): void {
    if (this._isRunning) {
      console.warn('[FFmpeg] Process already running')
      return
    }

    if (!this.isAvailable) {
      this.emit('error', new Error('FFmpeg not available'))
      return
    }

    console.log('[FFmpeg] Starting with args:', args.join(' '))

    this.process = spawn(this.ffmpegPath, args, {
      windowsHide: true
    })

    this._isRunning = true
    this.emit('start')

    // Buffer for collecting stderr output for error detection
    let stderrBuffer = ''

    // Parse stderr for progress and errors
    this.process.stderr?.on('data', (data: Buffer) => {
      const output = data.toString()
      stderrBuffer += output

      // Log all FFmpeg output for debugging
      console.log('[FFmpeg stderr]', output.trim())

      this.parseProgress(output)

      // Detect RTMP connection errors
      if (
        output.includes('Connection refused') ||
        output.includes('Connection timed out') ||
        output.includes('Failed to connect') ||
        output.includes('Server returned 4') || // RTMP errors 4xx
        output.includes('RTMP_Connect') ||
        output.includes('WriteN, RTMP send error') ||
        output.includes('Handshake') && output.includes('error')
      ) {
        console.error('[FFmpeg] RTMP connection error detected:', output)
        this.emit('error', new Error(`Erreur connexion RTMP: ${output.trim()}`))
      }
    })

    this.process.on('close', (code) => {
      this._isRunning = false
      this.process = null
      console.log(`[FFmpeg] Process exited with code ${code}`)
      this.emit('stop', code)
    })

    this.process.on('error', (error) => {
      this._isRunning = false
      console.error('[FFmpeg] Process error:', error)
      this.emit('error', error)
    })
  }

  /**
   * Stop FFmpeg process
   */
  stop(): void {
    if (this.process) {
      console.log('[FFmpeg] Stopping process...')
      // Send 'q' to gracefully stop FFmpeg
      this.process.stdin?.write('q')

      // Force kill after 3 seconds if still running
      setTimeout(() => {
        if (this.process) {
          this.process.kill('SIGKILL')
        }
      }, 3000)
    }
  }

  /**
   * Parse FFmpeg progress output
   */
  private parseProgress(output: string): void {
    // FFmpeg outputs progress like:
    // frame=  123 fps= 60 q=23.0 size=    1234kB time=00:00:02.05 bitrate=4567.8kbits/s speed=1.02x

    const frameMatch = output.match(/frame=\s*(\d+)/)
    const fpsMatch = output.match(/fps=\s*([\d.]+)/)
    const sizeMatch = output.match(/size=\s*(\d+)kB/)
    const timeMatch = output.match(/time=(\d+:\d+:\d+\.\d+)/)
    const bitrateMatch = output.match(/bitrate=\s*([\d.]+)kbits\/s/)
    const speedMatch = output.match(/speed=\s*([\d.]+)x/)

    let updated = false

    if (frameMatch) {
      this.stats.frame = parseInt(frameMatch[1])
      updated = true
    }
    if (fpsMatch) {
      this.stats.fps = parseFloat(fpsMatch[1])
      updated = true
    }
    if (sizeMatch) {
      this.stats.size = parseInt(sizeMatch[1]) * 1024
      updated = true
    }
    if (timeMatch) {
      this.stats.time = timeMatch[1]
      updated = true
    }
    if (bitrateMatch) {
      this.stats.bitrate = parseFloat(bitrateMatch[1])
      updated = true
    }
    if (speedMatch) {
      this.stats.speed = parseFloat(speedMatch[1])
      updated = true
    }

    if (updated) {
      this.emit('stats', this.stats)
    }

    // Emit raw output for debugging
    if (output.includes('error') || output.includes('Error')) {
      this.emit('ffmpeg:error', output)
    }
  }

  /**
   * Build FFmpeg arguments for streaming
   */
  buildStreamArgs(options: {
    input: string // Input source (e.g., 'desktop', 'gdigrab')
    videoEncoder: 'nvenc' | 'amf' | 'qsv' | 'x264'
    resolution: '720p' | '1080p' | '1440p'
    fps: 30 | 60
    bitrate: number // kbps
    outputs: { url: string; key: string }[]
  }): string[] {
    const { input, videoEncoder, resolution, fps, bitrate, outputs } = options

    const resMap = {
      '720p': '1280x720',
      '1080p': '1920x1080',
      '1440p': '2560x1440'
    }

    const encoderMap = {
      'nvenc': 'h264_nvenc',
      'amf': 'h264_amf',
      'qsv': 'h264_qsv',
      'x264': 'libx264'
    }

    const args: string[] = [
      '-y', // Overwrite output
      '-f', 'gdigrab', // Windows screen capture
      '-framerate', fps.toString(),
      '-i', input,
      '-c:v', encoderMap[videoEncoder],
      '-b:v', `${bitrate}k`,
      '-maxrate', `${bitrate * 1.5}k`,
      '-bufsize', `${bitrate * 2}k`,
      '-s', resMap[resolution],
      '-pix_fmt', 'yuv420p',
      '-g', (fps * 2).toString(), // Keyframe every 2 seconds
    ]

    // Encoder-specific options
    if (videoEncoder === 'nvenc') {
      args.push('-preset', 'p4', '-tune', 'll', '-rc', 'cbr')
    } else if (videoEncoder === 'x264') {
      args.push('-preset', 'veryfast', '-tune', 'zerolatency')
    }

    // Add outputs
    for (const output of outputs) {
      args.push('-f', 'flv', `${output.url}/${output.key}`)
    }

    return args
  }
}

// Singleton
export const ffmpegService = new FFmpegService()
