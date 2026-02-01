import { desktopCapturer, systemPreferences, screen } from 'electron'
import { EventEmitter } from 'events'

export interface ScreenBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface ScreenSource {
  id: string
  name: string
  thumbnail: string // base64 data URL
  type: 'screen' | 'window'
  bounds?: ScreenBounds // Screen position and size (for screens only)
  displayId?: number // Display ID from Electron (for screens only)
}

export interface AudioDevice {
  deviceId: string
  label: string
  kind: 'audioinput' | 'audiooutput'
}

class CaptureService extends EventEmitter {
  /**
   * Get available screens and windows for capture
   */
  async getScreenSources(): Promise<ScreenSource[]> {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 320, height: 180 },
        fetchWindowIcons: true
      })

      // Get all displays to match with screen sources
      const displays = screen.getAllDisplays()
      console.log('[Capture] Displays:', displays.map(d => ({
        id: d.id,
        bounds: d.bounds,
        label: d.label
      })))

      return sources.map(source => {
        const isScreen = source.id.startsWith('screen')
        let bounds: ScreenBounds | undefined
        let displayId: number | undefined

        if (isScreen) {
          // Extract display index from source.id (format: "screen:INDEX:0")
          const match = source.id.match(/screen:(\d+):/)
          if (match) {
            const displayIndex = parseInt(match[1], 10)
            const display = displays[displayIndex]
            if (display) {
              bounds = {
                x: display.bounds.x,
                y: display.bounds.y,
                width: display.bounds.width,
                height: display.bounds.height
              }
              displayId = display.id
              console.log(`[Capture] Screen ${displayIndex} (${source.name}): bounds=`, bounds)
            }
          }
        }

        return {
          id: source.id,
          name: source.name,
          thumbnail: source.thumbnail.toDataURL(),
          type: isScreen ? 'screen' : 'window',
          bounds,
          displayId
        } as ScreenSource
      })
    } catch (error) {
      console.error('[Capture] Failed to get screen sources:', error)
      return []
    }
  }

  /**
   * Get available screens only
   */
  async getScreens(): Promise<ScreenSource[]> {
    const sources = await this.getScreenSources()
    return sources.filter(s => s.type === 'screen')
  }

  /**
   * Get available windows only
   */
  async getWindows(): Promise<ScreenSource[]> {
    const sources = await this.getScreenSources()
    return sources.filter(s => s.type === 'window')
  }

  /**
   * Check if we have screen recording permission (macOS)
   */
  async checkScreenPermission(): Promise<boolean> {
    if (process.platform === 'darwin') {
      const status = systemPreferences.getMediaAccessStatus('screen')
      return status === 'granted'
    }
    // Windows doesn't require explicit permission
    return true
  }

  /**
   * Request screen recording permission (macOS)
   */
  async requestScreenPermission(): Promise<boolean> {
    if (process.platform === 'darwin') {
      // On macOS, we need to trigger the permission dialog
      // This is done by attempting to capture
      try {
        await desktopCapturer.getSources({ types: ['screen'] })
        return true
      } catch {
        return false
      }
    }
    return true
  }

  /**
   * Get GDI window title for FFmpeg gdigrab
   * Windows only - returns the window title for -i parameter
   */
  getGdiGrabInput(source: ScreenSource): string {
    if (source.type === 'screen') {
      // For screen capture, use 'desktop' for primary or specific monitor
      return 'desktop'
    } else {
      // For window capture, use the window title
      // Remove the " - " suffix that Electron adds
      return `title=${source.name}`
    }
  }

  /**
   * Build FFmpeg input args for screen/window capture (Windows)
   */
  buildScreenCaptureArgs(options: {
    source: ScreenSource | null
    fps: number
    captureAudio?: boolean
  }): string[] {
    const { source, fps, captureAudio } = options

    const args: string[] = []

    // If no source, return empty args (stream without screen capture)
    if (!source) {
      console.log('[Capture] No source provided, skipping screen capture args')
      return args
    }

    // Video input
    if (source.type === 'screen') {
      args.push('-f', 'gdigrab')
      args.push('-framerate', fps.toString())

      // If we have bounds, capture only that specific screen region
      if (source.bounds) {
        console.log(`[Capture] Capturing screen region: offset=(${source.bounds.x},${source.bounds.y}) size=${source.bounds.width}x${source.bounds.height}`)
        args.push('-offset_x', source.bounds.x.toString())
        args.push('-offset_y', source.bounds.y.toString())
        args.push('-video_size', `${source.bounds.width}x${source.bounds.height}`)
      }

      args.push('-i', 'desktop')
    } else {
      // Window capture - use window title
      args.push(
        '-f', 'gdigrab',
        '-framerate', fps.toString(),
        '-i', `title=${source.name}`
      )
    }

    // Audio input (if requested)
    if (captureAudio) {
      args.push(
        '-f', 'dshow',
        '-i', 'audio=virtual-audio-capturer' // Requires virtual audio device
      )
    }

    return args
  }
}

// Singleton
export const captureService = new CaptureService()
