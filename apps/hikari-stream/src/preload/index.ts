const { contextBridge, ipcRenderer } = require('electron')

// Custom APIs for renderer
const api = {
  // ============ App Info ============
  getVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
  getName: (): Promise<string> => ipcRenderer.invoke('app:getName'),

  // ============ Platform Info ============
  getPlatformInfo: (): Promise<{
    platform: string
    arch: string
    version: string
  }> => ipcRenderer.invoke('platform:getInfo'),

  // ============ Window Controls ============
  minimizeWindow: (): void => ipcRenderer.send('window:minimize'),
  maximizeWindow: (): void => ipcRenderer.send('window:maximize'),
  closeWindow: (): void => ipcRenderer.send('window:close'),

  // ============ WebSocket ============
  getWsPort: (): Promise<number> => ipcRenderer.invoke('ws:getPort'),
  getWsClients: (): Promise<number> => ipcRenderer.invoke('ws:getClients'),
  wsBroadcast: (message: { type: string; payload?: unknown }): void => {
    ipcRenderer.send('ws:broadcast', message)
  },

  // ============ Dependencies ============
  checkDepsStatus: (): Promise<{
    ffmpeg: { installed: boolean; path: string | null; version: string | null }
    scrcpy: { installed: boolean; path: string | null; version: string | null }
  }> => ipcRenderer.invoke('deps:checkStatus'),

  downloadFFmpeg: (): Promise<boolean> => ipcRenderer.invoke('deps:downloadFFmpeg'),
  downloadScrcpy: (): Promise<boolean> => ipcRenderer.invoke('deps:downloadScrcpy'),

  getDepsPaths: (): Promise<{
    ffmpeg: string
    scrcpy: string
    adb: string
  }> => ipcRenderer.invoke('deps:getPaths'),

  // ============ ADB / Mobile ============
  getAdbDevices: (): Promise<string[]> => ipcRenderer.invoke('adb:getDevices'),

  // ============ Screen Capture ============
  getCaptureSources: (): Promise<Array<{
    id: string
    name: string
    thumbnail: string
    type: 'screen' | 'window'
  }>> => ipcRenderer.invoke('capture:getSources'),

  getCaptureScreens: (): Promise<Array<{
    id: string
    name: string
    thumbnail: string
    type: 'screen'
  }>> => ipcRenderer.invoke('capture:getScreens'),

  getCaptureWindows: (): Promise<Array<{
    id: string
    name: string
    thumbnail: string
    type: 'window'
  }>> => ipcRenderer.invoke('capture:getWindows'),

  checkCapturePermission: (): Promise<boolean> => ipcRenderer.invoke('capture:checkPermission'),

  // ============ FFmpeg ============
  isFFmpegAvailable: (): Promise<boolean> => ipcRenderer.invoke('ffmpeg:isAvailable'),

  detectEncoders: (): Promise<Array<{
    name: string
    type: 'nvenc' | 'amf' | 'qsv' | 'x264'
    available: boolean
  }>> => ipcRenderer.invoke('ffmpeg:detectEncoders'),

  getBestEncoder: (): Promise<{
    name: string
    type: 'nvenc' | 'amf' | 'qsv' | 'x264'
    available: boolean
  }> => ipcRenderer.invoke('ffmpeg:getBestEncoder'),

  isFFmpegRunning: (): Promise<boolean> => ipcRenderer.invoke('ffmpeg:isRunning'),

  getFFmpegStats: (): Promise<{
    frame: number
    fps: number
    bitrate: number
    size: number
    time: string
    speed: number
  }> => ipcRenderer.invoke('ffmpeg:getStats'),

  startFFmpeg: (args: string[]): void => ipcRenderer.send('ffmpeg:start', args),
  stopFFmpeg: (): void => ipcRenderer.send('ffmpeg:stop'),

  // ============ Scrcpy / Mobile Cast ============
  isScrcpyAvailable: (): Promise<boolean> => ipcRenderer.invoke('scrcpy:isAvailable'),

  listMobileDevices: (): Promise<Array<{
    serial: string
    status: 'device' | 'offline' | 'unauthorized' | 'no permissions'
    model?: string
    product?: string
  }>> => ipcRenderer.invoke('scrcpy:listDevices'),

  isScrcpyRunning: (): Promise<boolean> => ipcRenderer.invoke('scrcpy:isRunning'),

  getScrcpyCurrentDevice: (): Promise<{
    serial: string
    status: string
    model?: string
  } | null> => ipcRenderer.invoke('scrcpy:currentDevice'),

  startScrcpy: (options?: {
    serial?: string
    maxSize?: number
    bitrate?: string
    maxFps?: number
    noAudio?: boolean
    stayAwake?: boolean
  }): Promise<boolean> => ipcRenderer.invoke('scrcpy:start', options),

  stopScrcpy: (): void => ipcRenderer.send('scrcpy:stop'),

  getScrcpyDefaults: (): Promise<{
    maxSize: number
    bitrate: string
    maxFps: number
    stayAwake: boolean
  }> => ipcRenderer.invoke('scrcpy:getStreamingDefaults'),

  // ============ Streaming ============
  getStreamState: (): Promise<{
    status: 'offline' | 'connecting' | 'live' | 'error'
    startTime: number | null
    duration: number
    stats: {
      frame: number
      fps: number
      bitrate: number
      size: number
      time: string
      speed: number
    }
    error: string | null
  }> => ipcRenderer.invoke('stream:getState'),

  isStreamLive: (): Promise<boolean> => ipcRenderer.invoke('stream:isLive'),

  getStreamDefaultConfig: (): Promise<{
    resolution: '720p' | '1080p' | '1440p'
    fps: 30 | 60
    bitrate: number
    encoder: 'nvenc' | 'amf' | 'qsv' | 'x264'
    outputs: Array<{
      platform: 'twitch' | 'youtube' | 'custom'
      enabled: boolean
      rtmpUrl: string
      streamKey: string
    }>
  }> => ipcRenderer.invoke('stream:getDefaultConfig'),

  getRecommendedBitrate: (resolution: string, fps: number): Promise<number> =>
    ipcRenderer.invoke('stream:getRecommendedBitrate', resolution, fps),

  getPlatformUrl: (platform: string): Promise<string> =>
    ipcRenderer.invoke('stream:getPlatformUrl', platform),

  startStream: (config: {
    resolution: '720p' | '1080p' | '1440p'
    fps: 30 | 60
    bitrate: number
    encoder: 'nvenc' | 'amf' | 'qsv' | 'x264'
    source: { id: string; name: string; thumbnail: string; type: 'screen' | 'window' }
    outputs: Array<{
      platform: 'twitch' | 'youtube' | 'custom'
      enabled: boolean
      rtmpUrl: string
      streamKey: string
    }>
  }): Promise<boolean> => ipcRenderer.invoke('stream:start', config),

  stopStream: (): void => ipcRenderer.send('stream:stop'),

  // ============ Event Listeners ============
  on: (channel: string, callback: (...args: unknown[]) => void): (() => void) => {
    const validChannels = [
      'stream:state',
      'stream:live',
      'stream:offline',
      'stream:stats',
      'stream:duration',
      'stream:error',
      'audio:levels',
      'scrcpy:status',
      'scrcpy:started',
      'scrcpy:stopped',
      'scrcpy:error',
      'scrcpy:output',
      'ffmpeg:status',
      'ffmpeg:started',
      'ffmpeg:stopped',
      'ffmpeg:stats',
      'ffmpeg:error',
      'deps:progress',
      'ws:client-connected',
      'ws:client-disconnected'
    ]

    if (validChannels.includes(channel)) {
      const listener = (_event: Electron.IpcRendererEvent, ...args: unknown[]): void => {
        callback(...args)
      }
      ipcRenderer.on(channel, listener)

      // Return cleanup function
      return () => {
        ipcRenderer.removeListener(channel, listener)
      }
    }

    return () => {}
  },

  once: (channel: string, callback: (...args: unknown[]) => void): void => {
    ipcRenderer.once(channel, (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args))
  }
}

// Expose APIs to renderer
contextBridge.exposeInMainWorld('api', api)
