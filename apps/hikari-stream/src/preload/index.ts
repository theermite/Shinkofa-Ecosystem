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
    bounds?: { x: number; y: number; width: number; height: number }
    displayId?: number
  }>> => ipcRenderer.invoke('capture:getSources'),

  getCaptureScreens: (): Promise<Array<{
    id: string
    name: string
    thumbnail: string
    type: 'screen'
    bounds?: { x: number; y: number; width: number; height: number }
    displayId?: number
  }>> => ipcRenderer.invoke('capture:getScreens'),

  getCaptureWindows: (): Promise<Array<{
    id: string
    name: string
    thumbnail: string
    type: 'window'
  }>> => ipcRenderer.invoke('capture:getWindows'),

  checkCapturePermission: (): Promise<boolean> => ipcRenderer.invoke('capture:checkPermission'),

  findScrcpyWindow: (): Promise<{
    id: string
    name: string
    thumbnail: string
    type: 'window'
  } | null> => ipcRenderer.invoke('capture:findScrcpyWindow'),

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
    tcpip?: string // IP address for WiFi connection
    maxSize?: number
    bitrate?: string
    maxFps?: number
    noAudio?: boolean
    stayAwake?: boolean
    windowTitle?: string
  }): Promise<boolean> => ipcRenderer.invoke('scrcpy:start', options),

  stopScrcpy: (): void => ipcRenderer.send('scrcpy:stop'),

  getScrcpyDefaults: (): Promise<{
    maxSize: number
    bitrate: string
    maxFps: number
    stayAwake: boolean
    windowTitle: string
  }> => ipcRenderer.invoke('scrcpy:getStreamingDefaults'),

  // WiFi connection methods
  enableScrcpyTcpip: (serial?: string): Promise<boolean> =>
    ipcRenderer.invoke('scrcpy:enableTcpip', serial),

  connectScrcpyWifi: (ipAddress: string, port?: number): Promise<boolean> =>
    ipcRenderer.invoke('scrcpy:connectWifi', ipAddress, port),

  disconnectScrcpyWifi: (ipAddress: string, port?: number): Promise<void> =>
    ipcRenderer.invoke('scrcpy:disconnectWifi', ipAddress, port),

  getScrcpyDeviceIp: (serial?: string): Promise<string | null> =>
    ipcRenderer.invoke('scrcpy:getDeviceIp', serial),

  // ============ Audio ============
  detectAudioDevices: (): Promise<Array<{
    id: string
    name: string
    type: 'input' | 'output'
    isDefault: boolean
  }>> => ipcRenderer.invoke('audio:detectDevices'),

  getAudioDevices: (): Promise<Array<{
    id: string
    name: string
    type: 'input' | 'output'
    isDefault: boolean
  }>> => ipcRenderer.invoke('audio:getDevices'),

  getMicrophones: (): Promise<Array<{
    id: string
    name: string
    type: 'input'
    isDefault: boolean
  }>> => ipcRenderer.invoke('audio:getMicrophones'),

  getDesktopAudioDevices: (): Promise<Array<{
    id: string
    name: string
    type: 'output'
    isDefault: boolean
  }>> => ipcRenderer.invoke('audio:getDesktopDevices'),

  getDefaultAudioConfig: (): Promise<{
    tracks: Array<{
      id: string
      name: string
      type: 'mic' | 'desktop' | 'phone' | 'music'
      deviceName: string | null
      volume: number
      muted: boolean
    }>
    sampleRate: 44100 | 48000
    bitrate: 128 | 160 | 192 | 256
  }> => ipcRenderer.invoke('audio:getDefaultConfig'),

  testAudioDevice: (deviceName: string): Promise<boolean> =>
    ipcRenderer.invoke('audio:testDevice', deviceName),

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

  // ============ Twitch Integration ============
  setTwitchCredentials: (clientId: string, clientSecret: string): Promise<boolean> =>
    ipcRenderer.invoke('twitch:setCredentials', clientId, clientSecret),

  hasTwitchCredentials: (): Promise<boolean> =>
    ipcRenderer.invoke('twitch:hasCredentials'),

  isTwitchAuthenticated: (): Promise<boolean> =>
    ipcRenderer.invoke('twitch:isAuthenticated'),

  getTwitchUserInfo: (): Promise<{ login: string; userId: string } | null> =>
    ipcRenderer.invoke('twitch:getUserInfo'),

  authenticateTwitch: (): Promise<boolean> =>
    ipcRenderer.invoke('twitch:authenticate'),

  disconnectTwitch: (): Promise<boolean> =>
    ipcRenderer.invoke('twitch:disconnect'),

  getTwitchChannelInfo: (): Promise<{
    title: string
    gameName: string
    gameId: string
    tags: string[]
  } | null> => ipcRenderer.invoke('twitch:getChannelInfo'),

  updateTwitchChannelInfo: (title?: string, gameId?: string, tags?: string[]): Promise<boolean> =>
    ipcRenderer.invoke('twitch:updateChannelInfo', title, gameId, tags),

  searchTwitchGames: (query: string): Promise<Array<{
    id: string
    name: string
    boxArtUrl: string
  }>> => ipcRenderer.invoke('twitch:searchGames', query),

  getTwitchStreamInfo: (): Promise<{
    isLive: boolean
    viewerCount: number
    startedAt: string | null
    title: string
    gameName: string
    thumbnailUrl: string | null
  } | null> => ipcRenderer.invoke('twitch:getStreamInfo'),

  // ============ YouTube Integration ============
  setYouTubeCredentials: (clientId: string, clientSecret: string): Promise<boolean> =>
    ipcRenderer.invoke('youtube:setCredentials', clientId, clientSecret),

  hasYouTubeCredentials: (): Promise<boolean> =>
    ipcRenderer.invoke('youtube:hasCredentials'),

  isYouTubeAuthenticated: (): Promise<boolean> =>
    ipcRenderer.invoke('youtube:isAuthenticated'),

  getYouTubeUserInfo: (): Promise<{ channelId: string; channelTitle: string } | null> =>
    ipcRenderer.invoke('youtube:getUserInfo'),

  authenticateYouTube: (): Promise<boolean> =>
    ipcRenderer.invoke('youtube:authenticate'),

  disconnectYouTube: (): Promise<boolean> =>
    ipcRenderer.invoke('youtube:disconnect'),

  getYouTubeChannelInfo: (): Promise<{
    id: string
    title: string
    description: string
    thumbnailUrl: string
    subscriberCount: number
  } | null> => ipcRenderer.invoke('youtube:getChannelInfo'),

  getYouTubeBroadcasts: (): Promise<Array<{
    id: string
    title: string
    description: string
    scheduledStartTime: string
    status: string
    privacyStatus: 'public' | 'private' | 'unlisted'
  }>> => ipcRenderer.invoke('youtube:getBroadcasts'),

  createYouTubeBroadcast: (
    title: string,
    description: string,
    privacyStatus: 'public' | 'private' | 'unlisted'
  ): Promise<{
    id: string
    title: string
    description: string
    scheduledStartTime: string
    status: string
    privacyStatus: 'public' | 'private' | 'unlisted'
  } | null> => ipcRenderer.invoke('youtube:createBroadcast', title, description, privacyStatus),

  createYouTubeStream: (title: string): Promise<{
    id: string
    rtmpUrl: string
    streamKey: string
  } | null> => ipcRenderer.invoke('youtube:createStream', title),

  bindYouTubeStreamToBroadcast: (broadcastId: string, streamId: string): Promise<boolean> =>
    ipcRenderer.invoke('youtube:bindStreamToBroadcast', broadcastId, streamId),

  transitionYouTubeBroadcast: (
    broadcastId: string,
    status: 'testing' | 'live' | 'complete'
  ): Promise<boolean> => ipcRenderer.invoke('youtube:transitionBroadcast', broadcastId, status),

  updateYouTubeBroadcast: (broadcastId: string, title: string, description?: string): Promise<boolean> =>
    ipcRenderer.invoke('youtube:updateBroadcast', broadcastId, title, description),

  getYouTubeCategories: (): Promise<Array<{ id: string; title: string }>> =>
    ipcRenderer.invoke('youtube:getCategories'),

  // ============ File System ============
  writeFile: (filePath: string, content: string): Promise<boolean> =>
    ipcRenderer.invoke('fs:writeFile', filePath, content),

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
