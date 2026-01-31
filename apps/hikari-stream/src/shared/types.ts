/**
 * Shared types between main and renderer processes
 */

// Stream configuration
export interface StreamConfig {
  platforms: {
    twitch: PlatformConfig | null
    youtube: PlatformConfig | null
  }
  encoding: EncodingConfig
  audio: AudioConfig
}

export interface PlatformConfig {
  enabled: boolean
  streamKey: string
  title: string
  description: string
  category: string
  tags: string[]
}

export interface EncodingConfig {
  resolution: '720p' | '1080p' | '1440p'
  fps: 30 | 60
  bitrate: number // kbps
  encoder: 'nvenc' | 'amf' | 'qsv' | 'x264'
  preset: 'ultrafast' | 'veryfast' | 'fast' | 'medium'
}

export interface AudioConfig {
  sampleRate: 44100 | 48000
  bitrate: 128 | 160 | 192 | 256 | 320
  tracks: AudioTrackConfig[]
}

export interface AudioTrackConfig {
  id: string
  name: string
  deviceId: string
  volume: number
  muted: boolean
}

// Presets
export interface StreamPreset {
  id: string
  name: string
  icon?: string
  platforms: {
    twitch?: Partial<PlatformConfig>
    youtube?: Partial<PlatformConfig>
  }
  defaultScene: string
  audioConfig?: Partial<AudioConfig>
  createdAt: string
  updatedAt: string
}

// Scenes
export interface SceneConfig {
  id: string
  name: string
  layout: LayoutElement[]
}

export interface LayoutElement {
  id: string
  type: 'video' | 'image' | 'text' | 'shape' | 'placeholder'
  handle: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  visible: boolean
  properties: Record<string, unknown>
}

// Device info
export interface DeviceInfo {
  id: string
  name: string
  type: 'screen' | 'window' | 'webcam' | 'audio'
}

// scrcpy / mobile cast
export interface MobileDevice {
  id: string
  model: string
  connected: boolean
  connectionType: 'usb' | 'wifi'
  ipAddress?: string
}

// Stream Deck actions
export interface StreamDeckAction {
  id: string
  type:
    | 'scene'
    | 'mute'
    | 'start_stop'
    | 'marker'
    | 'toggle_element'
    | 'move_element'
    | 'macro'
  label: string
  icon?: string
  config: Record<string, unknown>
}

// Markers
export interface StreamMarker {
  id: string
  timestamp: number // seconds from stream start
  type: 'epic' | 'fail' | 'clip' | 'bug' | 'info' | 'custom'
  description: string
  createdAt: string
}

// Export for Obsidian
export interface StreamSession {
  id: string
  date: string
  preset: string
  platforms: string[]
  duration: number // seconds
  stats: {
    peakViewers: number
    averageViewers: number
    totalMessages: number
    newFollowers: number
  }
  markers: StreamMarker[]
  notes: string
}
