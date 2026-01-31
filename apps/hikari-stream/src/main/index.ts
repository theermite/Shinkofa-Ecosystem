import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { wsService } from './services/websocket'
import { dependenciesService } from './services/dependencies'
import { captureService } from './services/capture'
import { ffmpegService } from './services/ffmpeg'
import { scrcpyService } from './services/scrcpy'
import { streamingService } from './services/streaming'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0c4a6e',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// App lifecycle
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.shinkofa.hikari-stream')

  // Default open or close DevTools by F12 in development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Setup IPC handlers
  setupIpcHandlers()

  // Start WebSocket server
  try {
    const wsPort = await wsService.start()
    console.log(`[Main] WebSocket server started on port ${wsPort}`)
  } catch (error) {
    console.error('[Main] Failed to start WebSocket server:', error)
  }

  // Forward WebSocket events to renderer
  wsService.on('client:connected', (client) => {
    mainWindow?.webContents.send('ws:client-connected', {
      id: client.id,
      type: client.type
    })
  })

  wsService.on('client:disconnected', (clientId) => {
    mainWindow?.webContents.send('ws:client-disconnected', clientId)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  wsService.stop()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers
function setupIpcHandlers(): void {
  // ============ App Info ============
  ipcMain.handle('app:getVersion', () => app.getVersion())
  ipcMain.handle('app:getName', () => app.getName())

  // ============ Platform Info ============
  ipcMain.handle('platform:getInfo', () => ({
    platform: process.platform,
    arch: process.arch,
    version: process.version
  }))

  // ============ Window Controls ============
  ipcMain.on('window:minimize', () => mainWindow?.minimize())
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })
  ipcMain.on('window:close', () => mainWindow?.close())

  // ============ WebSocket ============
  ipcMain.handle('ws:getPort', () => wsService.getPort())
  ipcMain.handle('ws:getClients', () => wsService.connectedClients)

  ipcMain.on('ws:broadcast', (_event, message) => {
    wsService.broadcast(message)
  })

  // ============ Dependencies ============
  ipcMain.handle('deps:checkStatus', () => {
    return dependenciesService.checkStatus()
  })

  ipcMain.handle('deps:downloadFFmpeg', async () => {
    const success = await dependenciesService.downloadFFmpeg((percent) => {
      mainWindow?.webContents.send('deps:progress', { type: 'ffmpeg', percent })
    })
    return success
  })

  ipcMain.handle('deps:downloadScrcpy', async () => {
    const success = await dependenciesService.downloadScrcpy((percent) => {
      mainWindow?.webContents.send('deps:progress', { type: 'scrcpy', percent })
    })
    return success
  })

  ipcMain.handle('deps:getPaths', () => ({
    ffmpeg: dependenciesService.ffmpegPath,
    scrcpy: dependenciesService.scrcpyPath,
    adb: dependenciesService.adbPath
  }))

  // ============ ADB / Mobile Devices ============
  ipcMain.handle('adb:getDevices', async () => {
    return dependenciesService.checkAdbDevices()
  })

  // ============ Screen Capture ============
  ipcMain.handle('capture:getSources', async () => {
    return captureService.getScreenSources()
  })

  ipcMain.handle('capture:getScreens', async () => {
    return captureService.getScreens()
  })

  ipcMain.handle('capture:getWindows', async () => {
    return captureService.getWindows()
  })

  ipcMain.handle('capture:checkPermission', async () => {
    return captureService.checkScreenPermission()
  })

  // ============ FFmpeg ============
  ipcMain.handle('ffmpeg:isAvailable', () => {
    return ffmpegService.isAvailable
  })

  ipcMain.handle('ffmpeg:detectEncoders', async () => {
    return ffmpegService.detectEncoders()
  })

  ipcMain.handle('ffmpeg:getBestEncoder', async () => {
    return ffmpegService.getBestEncoder()
  })

  ipcMain.handle('ffmpeg:isRunning', () => {
    return ffmpegService.isRunning
  })

  ipcMain.handle('ffmpeg:getStats', () => {
    return ffmpegService.currentStats
  })

  ipcMain.on('ffmpeg:start', (_event, args: string[]) => {
    ffmpegService.start(args)
  })

  ipcMain.on('ffmpeg:stop', () => {
    ffmpegService.stop()
  })

  // Forward FFmpeg events to renderer
  ffmpegService.on('start', () => {
    mainWindow?.webContents.send('ffmpeg:started')
  })

  ffmpegService.on('stop', (code: number) => {
    mainWindow?.webContents.send('ffmpeg:stopped', code)
  })

  ffmpegService.on('stats', (stats) => {
    mainWindow?.webContents.send('ffmpeg:stats', stats)
  })

  ffmpegService.on('error', (error: Error) => {
    mainWindow?.webContents.send('ffmpeg:error', error.message)
  })

  // ============ Scrcpy / Mobile Cast ============
  ipcMain.handle('scrcpy:isAvailable', () => {
    return scrcpyService.isAvailable
  })

  ipcMain.handle('scrcpy:listDevices', async () => {
    return scrcpyService.listDevices()
  })

  ipcMain.handle('scrcpy:isRunning', () => {
    return scrcpyService.isRunning
  })

  ipcMain.handle('scrcpy:currentDevice', () => {
    return scrcpyService.currentDevice
  })

  ipcMain.handle('scrcpy:start', async (_event, options) => {
    return scrcpyService.start(options)
  })

  ipcMain.on('scrcpy:stop', () => {
    scrcpyService.stop()
  })

  ipcMain.handle('scrcpy:getStreamingDefaults', () => {
    return scrcpyService.getStreamingDefaults()
  })

  // Forward scrcpy events to renderer
  scrcpyService.on('start', (device) => {
    mainWindow?.webContents.send('scrcpy:started', device)
  })

  scrcpyService.on('stop', (code: number) => {
    mainWindow?.webContents.send('scrcpy:stopped', code)
  })

  scrcpyService.on('error', (error: Error) => {
    mainWindow?.webContents.send('scrcpy:error', error.message)
  })

  scrcpyService.on('output', (output: string) => {
    mainWindow?.webContents.send('scrcpy:output', output)
  })

  // ============ Streaming ============
  ipcMain.handle('stream:getState', () => {
    return streamingService.state
  })

  ipcMain.handle('stream:isLive', () => {
    return streamingService.isLive
  })

  ipcMain.handle('stream:getDefaultConfig', () => {
    return streamingService.getDefaultConfig()
  })

  ipcMain.handle('stream:getRecommendedBitrate', (_event, resolution: string, fps: number) => {
    return streamingService.getRecommendedBitrate(
      resolution as '720p' | '1080p' | '1440p',
      fps as 30 | 60
    )
  })

  ipcMain.handle('stream:getPlatformUrl', (_event, platform: string) => {
    return streamingService.getPlatformUrl(platform as 'twitch' | 'youtube' | 'custom')
  })

  ipcMain.handle('stream:start', async (_event, config) => {
    return streamingService.start(config)
  })

  ipcMain.on('stream:stop', () => {
    streamingService.stop()
  })

  // Forward streaming events to renderer
  streamingService.on('state', (state) => {
    mainWindow?.webContents.send('stream:state', state)
  })

  streamingService.on('live', () => {
    mainWindow?.webContents.send('stream:live')
  })

  streamingService.on('offline', () => {
    mainWindow?.webContents.send('stream:offline')
  })

  streamingService.on('stats', (stats) => {
    mainWindow?.webContents.send('stream:stats', stats)
  })

  streamingService.on('duration', (duration: number) => {
    mainWindow?.webContents.send('stream:duration', duration)
  })

  streamingService.on('error', (message: string) => {
    mainWindow?.webContents.send('stream:error', message)
  })
}
