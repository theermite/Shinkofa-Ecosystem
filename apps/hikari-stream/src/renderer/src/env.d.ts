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

interface WebcamSource {
  deviceId: string
  label: string
  enabled: boolean
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  size: 'small' | 'medium' | 'large'
}

interface PhoneSource {
  sourceId: string
  name: string
  enabled: boolean
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  size: 'small' | 'medium' | 'large'
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
  tcpip?: string // IP address for WiFi connection
  maxSize?: number
  bitrate?: string
  maxFps?: number
  noAudio?: boolean
  audioSource?: 'output' | 'mic'
  audioCodec?: 'opus' | 'aac' | 'flac' | 'raw'
  audioBitrate?: string
  stayAwake?: boolean
  windowTitle?: string
}

interface ScrcpyDefaults {
  maxSize: number
  bitrate: string
  maxFps: number
  stayAwake: boolean
  windowTitle: string
  noAudio: boolean
  audioCodec: 'opus' | 'aac' | 'flac' | 'raw'
  audioBitrate: string
}

interface StreamOutput {
  platform: 'twitch' | 'youtube' | 'custom'
  enabled: boolean
  rtmpUrl: string
  streamKey: string
}

interface AudioDevice {
  id: string
  name: string
  type: 'input' | 'output'
  isDefault: boolean
}

interface AudioTrackConfig {
  id: string
  name: string
  type: 'mic' | 'desktop' | 'phone' | 'music'
  deviceName: string | null
  volume: number
  muted: boolean
}

interface AudioConfig {
  tracks: AudioTrackConfig[]
  sampleRate: 44100 | 48000
  bitrate: 128 | 160 | 192 | 256
}

interface StreamConfig {
  resolution: '720p' | '1080p' | '1440p'
  fps: 30 | 60
  bitrate: number
  encoder: 'nvenc' | 'amf' | 'qsv' | 'x264'
  source: CaptureSource
  outputs: StreamOutput[]
  testMode?: boolean
  audio?: AudioConfig
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
    findScrcpyWindow: () => Promise<CaptureSource | null>

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

    // Scrcpy WiFi
    enableScrcpyTcpip: (serial?: string) => Promise<boolean>
    connectScrcpyWifi: (ipAddress: string, port?: number) => Promise<boolean>
    disconnectScrcpyWifi: (ipAddress: string, port?: number) => Promise<void>
    getScrcpyDeviceIp: (serial?: string) => Promise<string | null>

    // Audio
    detectAudioDevices: () => Promise<AudioDevice[]>
    getAudioDevices: () => Promise<AudioDevice[]>
    getMicrophones: () => Promise<AudioDevice[]>
    getDesktopAudioDevices: () => Promise<AudioDevice[]>
    getDefaultAudioConfig: () => Promise<AudioConfig>
    testAudioDevice: (deviceName: string) => Promise<boolean>

    // Streaming
    getStreamState: () => Promise<StreamState>
    isStreamLive: () => Promise<boolean>
    getStreamDefaultConfig: () => Promise<Omit<StreamConfig, 'source'>>
    getRecommendedBitrate: (resolution: string, fps: number) => Promise<number>
    getPlatformUrl: (platform: string) => Promise<string>
    startStream: (config: StreamConfig) => Promise<boolean>
    stopStream: () => void

    // Twitch Integration
    setTwitchCredentials: (clientId: string, clientSecret: string) => Promise<boolean>
    hasTwitchCredentials: () => Promise<boolean>
    isTwitchAuthenticated: () => Promise<boolean>
    getTwitchUserInfo: () => Promise<{ login: string; userId: string } | null>
    authenticateTwitch: () => Promise<boolean>
    disconnectTwitch: () => Promise<boolean>
    getTwitchChannelInfo: () => Promise<{
      title: string
      gameName: string
      gameId: string
      tags: string[]
    } | null>
    updateTwitchChannelInfo: (title?: string, gameId?: string, tags?: string[]) => Promise<boolean>
    searchTwitchGames: (query: string) => Promise<Array<{
      id: string
      name: string
      boxArtUrl: string
    }>>
    getTwitchStreamInfo: () => Promise<{
      isLive: boolean
      viewerCount: number
      startedAt: string | null
      title: string
      gameName: string
      thumbnailUrl: string | null
    } | null>

    // YouTube Integration
    setYouTubeCredentials: (clientId: string, clientSecret: string) => Promise<boolean>
    hasYouTubeCredentials: () => Promise<boolean>
    isYouTubeAuthenticated: () => Promise<boolean>
    getYouTubeUserInfo: () => Promise<{ channelId: string; channelTitle: string } | null>
    authenticateYouTube: () => Promise<boolean>
    disconnectYouTube: () => Promise<boolean>
    getYouTubeChannelInfo: () => Promise<{
      id: string
      title: string
      description: string
      thumbnailUrl: string
      subscriberCount: number
    } | null>
    getYouTubeBroadcasts: () => Promise<Array<{
      id: string
      title: string
      description: string
      scheduledStartTime: string
      status: string
      privacyStatus: 'public' | 'private' | 'unlisted'
    }>>
    createYouTubeBroadcast: (
      title: string,
      description: string,
      privacyStatus: 'public' | 'private' | 'unlisted'
    ) => Promise<{
      id: string
      title: string
      description: string
      scheduledStartTime: string
      status: string
      privacyStatus: 'public' | 'private' | 'unlisted'
    } | null>
    createYouTubeStream: (title: string) => Promise<{
      id: string
      rtmpUrl: string
      streamKey: string
    } | null>
    bindYouTubeStreamToBroadcast: (broadcastId: string, streamId: string) => Promise<boolean>
    transitionYouTubeBroadcast: (broadcastId: string, status: 'testing' | 'live' | 'complete') => Promise<boolean>
    updateYouTubeBroadcast: (broadcastId: string, title: string, description?: string) => Promise<boolean>
    getYouTubeCategories: () => Promise<Array<{ id: string; title: string }>>

    // File System
    writeFile: (filePath: string, content: string) => Promise<boolean>

    // Events
    on: (channel: string, callback: (...args: unknown[]) => void) => () => void
    once: (channel: string, callback: (...args: unknown[]) => void) => void
  }
}
