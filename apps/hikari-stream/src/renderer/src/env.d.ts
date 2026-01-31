/// <reference types="vite/client" />

interface DependencyInfo {
  installed: boolean
  path: string | null
  version: string | null
}

interface DepsStatus {
  ffmpeg: DependencyInfo
  scrcpy: DependencyInfo
}

interface DepsPaths {
  ffmpeg: string
  scrcpy: string
  adb: string
}

interface PlatformInfo {
  platform: string
  arch: string
  version: string
}

interface CaptureSource {
  id: string
  name: string
  thumbnail: string
  type: 'screen' | 'window'
}

interface EncoderInfo {
  name: string
  type: 'nvenc' | 'amf' | 'qsv' | 'x264'
  available: boolean
}

interface FFmpegStats {
  frame: number
  fps: number
  bitrate: number
  size: number
  time: string
  speed: number
}

interface AndroidDevice {
  serial: string
  status: 'device' | 'offline' | 'unauthorized' | 'no permissions'
  model?: string
  product?: string
}

interface ScrcpyOptions {
  serial?: string
  maxSize?: number
  bitrate?: string
  maxFps?: number
  noAudio?: boolean
  stayAwake?: boolean
}

interface ScrcpyDefaults {
  maxSize: number
  bitrate: string
  maxFps: number
  stayAwake: boolean
}

interface StreamOutput {
  platform: 'twitch' | 'youtube' | 'custom'
  enabled: boolean
  rtmpUrl: string
  streamKey: string
}

interface StreamConfig {
  resolution: '720p' | '1080p' | '1440p'
  fps: 30 | 60
  bitrate: number
  encoder: 'nvenc' | 'amf' | 'qsv' | 'x264'
  source: CaptureSource
  outputs: StreamOutput[]
}

interface StreamState {
  status: 'offline' | 'connecting' | 'live' | 'error'
  startTime: number | null
  duration: number
  stats: FFmpegStats
  error: string | null
}

interface Window {
  electron: typeof import('@electron-toolkit/preload').electronAPI
  api: {
    // App info
    getVersion: () => Promise<string>
    getName: () => Promise<string>

    // Platform
    getPlatformInfo: () => Promise<PlatformInfo>

    // Window controls
    minimizeWindow: () => void
    maximizeWindow: () => void
    closeWindow: () => void

    // WebSocket
    getWsPort: () => Promise<number>
    getWsClients: () => Promise<number>
    wsBroadcast: (message: { type: string; payload?: unknown }) => void

    // Dependencies
    checkDepsStatus: () => Promise<DepsStatus>
    downloadFFmpeg: () => Promise<boolean>
    downloadScrcpy: () => Promise<boolean>
    getDepsPaths: () => Promise<DepsPaths>

    // ADB / Mobile
    getAdbDevices: () => Promise<string[]>

    // Screen Capture
    getCaptureSources: () => Promise<CaptureSource[]>
    getCaptureScreens: () => Promise<CaptureSource[]>
    getCaptureWindows: () => Promise<CaptureSource[]>
    checkCapturePermission: () => Promise<boolean>

    // FFmpeg
    isFFmpegAvailable: () => Promise<boolean>
    detectEncoders: () => Promise<EncoderInfo[]>
    getBestEncoder: () => Promise<EncoderInfo>
    isFFmpegRunning: () => Promise<boolean>
    getFFmpegStats: () => Promise<FFmpegStats>
    startFFmpeg: (args: string[]) => void
    stopFFmpeg: () => void

    // Scrcpy / Mobile Cast
    isScrcpyAvailable: () => Promise<boolean>
    listMobileDevices: () => Promise<AndroidDevice[]>
    isScrcpyRunning: () => Promise<boolean>
    getScrcpyCurrentDevice: () => Promise<AndroidDevice | null>
    startScrcpy: (options?: ScrcpyOptions) => Promise<boolean>
    stopScrcpy: () => void
    getScrcpyDefaults: () => Promise<ScrcpyDefaults>

    // Streaming
    getStreamState: () => Promise<StreamState>
    isStreamLive: () => Promise<boolean>
    getStreamDefaultConfig: () => Promise<Omit<StreamConfig, 'source'>>
    getRecommendedBitrate: (resolution: string, fps: number) => Promise<number>
    getPlatformUrl: (platform: string) => Promise<string>
    startStream: (config: StreamConfig) => Promise<boolean>
    stopStream: () => void

    // Events
    on: (channel: string, callback: (...args: unknown[]) => void) => () => void
    once: (channel: string, callback: (...args: unknown[]) => void) => void
  }
}
