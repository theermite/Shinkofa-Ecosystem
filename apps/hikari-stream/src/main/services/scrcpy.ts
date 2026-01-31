import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { dependenciesService } from './dependencies'

export interface ScrcpyOptions {
  serial?: string // Device serial (optional if only one device)
  maxSize?: number // Max dimension (e.g., 1920 for 1080p)
  bitrate?: string // e.g., '8M' for 8 Mbps
  maxFps?: number // Max framerate
  crop?: string // Crop format: 'width:height:x:y'
  rotation?: 0 | 1 | 2 | 3 // 0, 90, 180, 270 degrees
  noAudio?: boolean // Disable audio forwarding
  noControl?: boolean // Disable device control (view only)
  stayAwake?: boolean // Keep device awake while mirroring
  showTouches?: boolean // Show touch indicators on device
  turnScreenOff?: boolean // Turn off device screen while mirroring
  windowTitle?: string // Custom window title
  alwaysOnTop?: boolean // Keep scrcpy window on top
}

export interface AndroidDevice {
  serial: string
  status: 'device' | 'offline' | 'unauthorized' | 'no permissions'
  model?: string
  product?: string
}

class ScrcpyService extends EventEmitter {
  private process: ChildProcess | null = null
  private _isRunning: boolean = false
  private _currentDevice: AndroidDevice | null = null

  get isRunning(): boolean {
    return this._isRunning
  }

  get currentDevice(): AndroidDevice | null {
    return this._currentDevice
  }

  get scrcpyPath(): string {
    return dependenciesService.scrcpyPath
  }

  get adbPath(): string {
    return dependenciesService.adbPath
  }

  get isAvailable(): boolean {
    return dependenciesService.isScrcpyInstalled()
  }

  /**
   * List connected Android devices via ADB
   */
  async listDevices(): Promise<AndroidDevice[]> {
    return new Promise((resolve) => {
      const devices: AndroidDevice[] = []

      try {
        const proc = spawn(this.adbPath, ['devices', '-l'], { windowsHide: true })
        let output = ''

        proc.stdout?.on('data', (data: Buffer) => {
          output += data.toString()
        })

        proc.on('close', () => {
          // Parse ADB output
          // Format: serial    status device:model product:name ...
          const lines = output.split('\n').slice(1) // Skip header

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue

            const parts = trimmed.split(/\s+/)
            if (parts.length >= 2) {
              const device: AndroidDevice = {
                serial: parts[0],
                status: parts[1] as AndroidDevice['status']
              }

              // Parse additional info
              for (const part of parts.slice(2)) {
                if (part.startsWith('model:')) {
                  device.model = part.replace('model:', '')
                } else if (part.startsWith('product:')) {
                  device.product = part.replace('product:', '')
                }
              }

              devices.push(device)
            }
          }

          console.log('[Scrcpy] Found devices:', devices)
          resolve(devices)
        })

        proc.on('error', (error) => {
          console.error('[Scrcpy] ADB error:', error)
          resolve([])
        })
      } catch (error) {
        console.error('[Scrcpy] Failed to list devices:', error)
        resolve([])
      }
    })
  }

  /**
   * Get device display name
   */
  getDeviceDisplayName(device: AndroidDevice): string {
    if (device.model) {
      return device.model.replace(/_/g, ' ')
    }
    return device.serial
  }

  /**
   * Start scrcpy for a device
   */
  async start(options: ScrcpyOptions = {}): Promise<boolean> {
    if (this._isRunning) {
      console.warn('[Scrcpy] Already running')
      return false
    }

    if (!this.isAvailable) {
      this.emit('error', new Error('scrcpy not available'))
      return false
    }

    // If no serial specified, check if there's exactly one device
    if (!options.serial) {
      const devices = await this.listDevices()
      const connected = devices.filter(d => d.status === 'device')

      if (connected.length === 0) {
        this.emit('error', new Error('No Android device connected'))
        return false
      }

      if (connected.length > 1) {
        this.emit('error', new Error('Multiple devices connected, please specify one'))
        return false
      }

      options.serial = connected[0].serial
      this._currentDevice = connected[0]
    }

    const args = this.buildArgs(options)
    console.log('[Scrcpy] Starting with args:', args.join(' '))

    try {
      this.process = spawn(this.scrcpyPath, args, {
        windowsHide: false, // Show scrcpy window
        cwd: dependenciesService.scrcpyDir // scrcpy needs to run from its directory
      })

      this._isRunning = true
      this.emit('start', this._currentDevice)

      this.process.stdout?.on('data', (data: Buffer) => {
        const output = data.toString()
        console.log('[Scrcpy]', output.trim())
        this.emit('output', output)
      })

      this.process.stderr?.on('data', (data: Buffer) => {
        const output = data.toString()
        console.log('[Scrcpy stderr]', output.trim())

        // Check for common errors
        if (output.includes('ERROR')) {
          this.emit('scrcpy:error', output)
        }
      })

      this.process.on('close', (code) => {
        this._isRunning = false
        this._currentDevice = null
        this.process = null
        console.log(`[Scrcpy] Process exited with code ${code}`)
        this.emit('stop', code)
      })

      this.process.on('error', (error) => {
        this._isRunning = false
        this._currentDevice = null
        console.error('[Scrcpy] Process error:', error)
        this.emit('error', error)
      })

      return true
    } catch (error) {
      console.error('[Scrcpy] Failed to start:', error)
      this.emit('error', error)
      return false
    }
  }

  /**
   * Stop scrcpy
   */
  stop(): void {
    if (this.process) {
      console.log('[Scrcpy] Stopping...')
      this.process.kill()
      this.process = null
      this._isRunning = false
      this._currentDevice = null
    }
  }

  /**
   * Build scrcpy command line arguments
   */
  private buildArgs(options: ScrcpyOptions): string[] {
    const args: string[] = []

    if (options.serial) {
      args.push('-s', options.serial)
    }

    if (options.maxSize) {
      args.push('-m', options.maxSize.toString())
    }

    if (options.bitrate) {
      args.push('-b', options.bitrate)
    }

    if (options.maxFps) {
      args.push('--max-fps', options.maxFps.toString())
    }

    if (options.crop) {
      args.push('--crop', options.crop)
    }

    if (options.rotation !== undefined) {
      args.push('--rotation', options.rotation.toString())
    }

    if (options.noAudio) {
      args.push('--no-audio')
    }

    if (options.noControl) {
      args.push('--no-control')
    }

    if (options.stayAwake) {
      args.push('--stay-awake')
    }

    if (options.showTouches) {
      args.push('--show-touches')
    }

    if (options.turnScreenOff) {
      args.push('--turn-screen-off')
    }

    if (options.windowTitle) {
      args.push('--window-title', options.windowTitle)
    }

    if (options.alwaysOnTop) {
      args.push('--always-on-top')
    }

    return args
  }

  /**
   * Get default options optimized for streaming
   */
  getStreamingDefaults(): ScrcpyOptions {
    return {
      maxSize: 1920, // 1080p max
      bitrate: '8M', // 8 Mbps
      maxFps: 60,
      stayAwake: true,
      windowTitle: 'Hikari Stream - Mobile',
      noAudio: false // Keep audio for game sounds
    }
  }
}

// Singleton
export const scrcpyService = new ScrcpyService()
