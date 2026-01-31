import { desktopCapturer, systemPreferences } from 'electron'
import { EventEmitter } from 'events'

export interface ScreenSource {
  id: string
  name: string
  thumbnail: string // base64 data URL
  type: 'screen' | 'window'
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

      return sources.map(source => ({
        id: source.id,
        name: source.name,
        thumbnail: source.thumbnail.toDataURL(),
        type: source.id.startsWith('screen') ? 'screen' : 'window'
      }))
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
    source: ScreenSource
    fps: number
    captureAudio?: boolean
  }): string[] {
    const { source, fps, captureAudio } = options

    const args: string[] = []

    // Video input
    if (source.type === 'screen') {
      args.push(
        '-f', 'gdigrab',
        '-framerate', fps.toString(),
        '-i', 'desktop'
      )
    } else {
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
