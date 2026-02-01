import { spawn } from 'child_process'
import { EventEmitter } from 'events'
import { dependenciesService } from './dependencies'

export interface AudioDevice {
  id: string
  name: string
  type: 'input' | 'output'
  isDefault: boolean
}

export interface AudioTrackConfig {
  id: string
  name: string
  type: 'mic' | 'desktop' | 'phone' | 'music'
  deviceName: string | null
  volume: number // 0-100
  muted: boolean
}

export interface AudioMixConfig {
  tracks: AudioTrackConfig[]
  sampleRate: 44100 | 48000
  bitrate: 128 | 160 | 192 | 256
}

class AudioService extends EventEmitter {
  private _devices: AudioDevice[] = []
  private _currentConfig: AudioMixConfig | null = null

  get devices(): AudioDevice[] {
    return [...this._devices]
  }

  get currentConfig(): AudioMixConfig | null {
    return this._currentConfig
  }

  /**
   * Detect available audio devices using FFmpeg
   * On Windows, uses DirectShow (dshow) to list devices
   */
  async detectDevices(): Promise<AudioDevice[]> {
    return new Promise((resolve) => {
      const devices: AudioDevice[] = []
      const ffmpegPath = dependenciesService.ffmpegPath

      // FFmpeg command to list DirectShow devices
      const proc = spawn(ffmpegPath, [
        '-list_devices', 'true',
        '-f', 'dshow',
        '-i', 'dummy'
      ], { windowsHide: true })

      let output = ''

      proc.stderr?.on('data', (data: Buffer) => {
        output += data.toString()
      })

      proc.on('close', () => {
        // Parse FFmpeg output for audio devices
        // Format: [dshow @ 0000...] "Device Name" (audio)
        const lines = output.split('\n')

        for (const line of lines) {
          // Match lines with (audio) designation
          if (line.includes('(audio)') && !line.includes('Alternative name')) {
            const match = line.match(/"([^"]+)"/)
            if (match) {
              const deviceName = match[1]
              const lowerName = deviceName.toLowerCase()

              // Determine device type based on name patterns
              // Input = microphones, Output = desktop audio / monitoring
              const isDesktopAudio = lowerName.includes('stereo mix') ||
                                    lowerName.includes('loopback') ||
                                    lowerName.includes('what u hear') ||
                                    lowerName.includes('cable output') ||
                                    lowerName.includes('monitor of') ||
                                    lowerName.includes('virtual audio')

              // For SteelSeries Sonar: the "Microphone" device is actually routed
              // through Sonar and can be used as-is
              const deviceType: 'input' | 'output' = isDesktopAudio ? 'output' : 'input'

              // Count existing devices of same type for default selection
              const sameTypeCount = devices.filter(d => d.type === deviceType).length

              devices.push({
                id: this.sanitizeDeviceId(deviceName),
                name: deviceName,
                type: deviceType,
                isDefault: sameTypeCount === 0
              })
            }
          }
        }

        console.log('[Audio] Detected devices:', devices)
        this._devices = devices
        resolve(devices)
      })

      proc.on('error', (error) => {
        console.error('[Audio] Failed to detect devices:', error)
        resolve([])
      })
    })
  }

  /**
   * Get microphone devices
   */
  getMicrophones(): AudioDevice[] {
    return this._devices.filter(d => d.type === 'input')
  }

  /**
   * Get desktop audio devices (for capturing system sound)
   */
  getDesktopAudioDevices(): AudioDevice[] {
    return this._devices.filter(d => d.type === 'output')
  }

  /**
   * Get default microphone
   */
  getDefaultMicrophone(): AudioDevice | null {
    const mics = this.getMicrophones()
    return mics.find(m => m.isDefault) || mics[0] || null
  }

  /**
   * Get default desktop audio device
   */
  getDefaultDesktopAudio(): AudioDevice | null {
    const outputs = this.getDesktopAudioDevices()
    return outputs.find(o => o.isDefault) || outputs[0] || null
  }

  /**
   * Build FFmpeg audio input arguments
   * Returns array of args for multiple audio inputs that will be mixed
   */
  buildAudioInputArgs(config: AudioMixConfig): string[] {
    const args: string[] = []
    const activeInputs: { index: number; volume: number; name: string }[] = []
    let inputIndex = 1 // Start at 1 because video is input 0

    for (const track of config.tracks) {
      if (track.muted || !track.deviceName) continue

      // Add audio input
      args.push('-f', 'dshow')
      args.push('-i', `audio=${track.deviceName}`)

      activeInputs.push({
        index: inputIndex,
        volume: track.volume / 100,
        name: track.name
      })
      inputIndex++
    }

    // If we have audio inputs, add mix filter
    if (activeInputs.length > 0) {
      // Build amix filter for multiple audio sources
      // Format: [1:a]volume=0.8[a1];[2:a]volume=1.0[a2];[a1][a2]amix=inputs=2:duration=longest[aout]

      if (activeInputs.length === 1) {
        // Single input, just apply volume
        const input = activeInputs[0]
        args.push(
          '-filter_complex',
          `[${input.index}:a]volume=${input.volume}[aout]`
        )
      } else {
        // Multiple inputs, mix them
        const volumeFilters: string[] = []
        const mixInputs: string[] = []

        activeInputs.forEach((input, i) => {
          const label = `a${i}`
          volumeFilters.push(`[${input.index}:a]volume=${input.volume}[${label}]`)
          mixInputs.push(`[${label}]`)
        })

        const filterComplex = [
          ...volumeFilters,
          `${mixInputs.join('')}amix=inputs=${activeInputs.length}:duration=longest[aout]`
        ].join(';')

        args.push('-filter_complex', filterComplex)
      }

      // Map the mixed audio output
      args.push('-map', '[aout]')

      // Audio encoding settings
      args.push(
        '-c:a', 'aac',
        '-b:a', `${config.bitrate}k`,
        '-ar', config.sampleRate.toString(),
        '-ac', '2' // Stereo
      )
    }

    return args
  }

  /**
   * Build simple audio args (single source, no mixing)
   * Useful for quick setup
   */
  buildSimpleAudioArgs(micDevice: string | null, desktopDevice: string | null): string[] {
    const args: string[] = []

    // For now, prioritize desktop audio for game streaming
    const device = desktopDevice || micDevice

    if (device) {
      args.push(
        '-f', 'dshow',
        '-i', `audio=${device}`,
        '-c:a', 'aac',
        '-b:a', '160k',
        '-ar', '48000',
        '-ac', '2'
      )
    }

    return args
  }

  /**
   * Get default audio configuration
   */
  getDefaultConfig(): AudioMixConfig {
    const defaultMic = this.getDefaultMicrophone()
    const defaultDesktop = this.getDefaultDesktopAudio()

    return {
      tracks: [
        {
          id: 'mic',
          name: 'Microphone',
          type: 'mic',
          deviceName: defaultMic?.name || null,
          volume: 100,
          muted: false
        },
        {
          id: 'desktop',
          name: 'Son PC',
          type: 'desktop',
          deviceName: defaultDesktop?.name || null,
          volume: 80,
          muted: false
        },
        {
          id: 'phone',
          name: 'Téléphone',
          type: 'phone',
          deviceName: null, // Will be set when scrcpy audio is configured
          volume: 100,
          muted: false
        }
      ],
      sampleRate: 48000,
      bitrate: 160
    }
  }

  /**
   * Sanitize device name to create a safe ID
   */
  private sanitizeDeviceId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  /**
   * Test if a specific audio device is working
   */
  async testDevice(deviceName: string): Promise<boolean> {
    return new Promise((resolve) => {
      const ffmpegPath = dependenciesService.ffmpegPath

      // Try to capture 1 second of audio
      const proc = spawn(ffmpegPath, [
        '-f', 'dshow',
        '-i', `audio=${deviceName}`,
        '-t', '1',
        '-f', 'null',
        '-'
      ], { windowsHide: true })

      proc.on('close', (code) => {
        resolve(code === 0)
      })

      proc.on('error', () => {
        resolve(false)
      })

      // Timeout after 5 seconds
      setTimeout(() => {
        proc.kill()
        resolve(false)
      }, 5000)
    })
  }
}

// Singleton
export const audioService = new AudioService()
