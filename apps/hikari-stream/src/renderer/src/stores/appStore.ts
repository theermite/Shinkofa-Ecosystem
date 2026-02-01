import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type StreamStatus = 'offline' | 'connecting' | 'live' | 'error'

export interface StreamStats {
  duration: number // seconds
  bitrate: number // kbps
  fps: number
  droppedFrames: number
  viewers: {
    twitch: number
    youtube: number
  }
}

export interface AudioTrack {
  id: string
  name: string
  type: 'mic' | 'desktop' | 'phone' | 'music' | 'alert'
  volume: number // 0-100
  muted: boolean
  level: number // 0-100 (VU meter)
  deviceId?: string // Selected audio device ID
  deviceLabel?: string // Selected audio device label
}

export interface SceneSourceConfig {
  activeSource: CaptureSource | null
  webcam: {
    enabled: boolean
    position: PipPosition
    customPosition?: CustomPosition
    size: PipSize
    customSize?: CustomSize
    zIndex: number
  } | null
  phone: {
    enabled: boolean
    position: PipPosition
    customPosition?: CustomPosition
    size: PipSize
    customSize?: CustomSize
    zIndex: number
  } | null
  overlays: Overlay[]
}

export interface Scene {
  id: string
  name: string
  isActive: boolean
  config: SceneSourceConfig
}

export interface ScreenBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface CaptureSource {
  id: string
  name: string
  thumbnail: string
  type: 'screen' | 'window'
  bounds?: ScreenBounds // Screen position and size (for multi-monitor support)
  displayId?: number // Display ID from Electron
}

export type PipPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'custom'
export type PipSize = 'small' | 'medium' | 'large' | 'full'

export interface CustomPosition {
  x: number // Percentage 0-100
  y: number // Percentage 0-100
}

export interface CustomSize {
  width: number // Percentage 0-100
  height: number // Percentage 0-100
}

export interface WebcamSource {
  id: string // Unique ID for this webcam instance
  deviceId: string
  label: string
  customLabel?: string // User-defined name
  enabled: boolean
  position: PipPosition
  customPosition?: CustomPosition // Used when position is 'custom'
  size: PipSize
  customSize?: CustomSize // Used for manual resize
  zIndex: number // Layer order (higher = on top)
}

export interface PhoneSource {
  id: string // Unique ID for this phone instance
  sourceId: string // Electron desktopCapturer source ID
  serial: string // ADB serial for identification
  name: string // Model name from ADB
  customLabel?: string // User-defined name
  enabled: boolean
  position: PipPosition
  customPosition?: CustomPosition // Used when position is 'custom'
  size: PipSize
  customSize?: CustomSize // Used for manual resize
  zIndex: number // Layer order (higher = on top)
}

// Saved device info for WiFi reconnection
export interface SavedDevice {
  serial: string // Original USB serial
  model: string
  customLabel?: string
  wifiIp?: string
  wifiPort?: number
  lastConnected: number // Unix timestamp
}

// Overlay types for custom sources (images, text, video, browser)
export type OverlayType = 'image' | 'text' | 'video' | 'browser'

export interface BaseOverlay {
  id: string
  name: string
  type: OverlayType
  enabled: boolean
  position: PipPosition
  customPosition?: CustomPosition
  size: PipSize
  customSize?: CustomSize
  zIndex: number
  opacity: number // 0-100
}

export interface ImageOverlay extends BaseOverlay {
  type: 'image'
  src: string // data URL or file path
  fit: 'contain' | 'cover' | 'fill'
}

export interface TextOverlay extends BaseOverlay {
  type: 'text'
  content: string
  fontFamily: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  color: string
  backgroundColor: string
  textAlign: 'left' | 'center' | 'right'
  padding: number
  borderRadius: number
  shadow: boolean
}

export interface VideoOverlay extends BaseOverlay {
  type: 'video'
  src: string
  loop: boolean
  muted: boolean
  autoplay: boolean
}

export interface BrowserOverlay extends BaseOverlay {
  type: 'browser'
  url: string
  refreshInterval: number // seconds, 0 = no auto-refresh
}

export type Overlay = ImageOverlay | TextOverlay | VideoOverlay | BrowserOverlay

// Transition types for scene switching
export type TransitionType = 'cut' | 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom' | 'wipe' | 'move'

export interface TransitionConfig {
  type: TransitionType
  duration: number // milliseconds (100-2000)
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

// Marker types for live stream moments
export type MarkerType = 'epic' | 'fail' | 'clip' | 'bug' | 'info' | 'custom'

export interface StreamMarker {
  id: string
  type: MarkerType
  timestamp: number // seconds from stream start
  description: string
  createdAt: number // Unix timestamp
}

export interface StreamSession {
  id: string
  startedAt: number // Unix timestamp
  endedAt: number | null // Unix timestamp when stream ended
  preset: string | null // Preset name used
  platforms: string[] // ['twitch', 'youtube']
  markers: StreamMarker[]
  stats: {
    duration: number
    peakViewers: number
    totalMessages: number
    newFollowers: number
  }
  game: string
  title: string
}

// Preset system for quick stream setup
export interface StreamPreset {
  id: string
  name: string
  icon: string // emoji or icon name
  createdAt: number
  updatedAt: number
  // Platform config
  platforms: {
    twitch: {
      enabled: boolean
      title: string
      gameId: string
      gameName: string
      tags: string[]
    }
    youtube: {
      enabled: boolean
      title: string
      description: string
      categoryId: string
      privacy: 'public' | 'unlisted' | 'private'
    }
  }
  // Stream settings
  resolution: '720p' | '1080p' | '1440p'
  fps: 30 | 60
  bitrate: number
  encoder: 'nvenc' | 'amf' | 'qsv' | 'x264'
  // Scene
  startSceneId: string
  // Audio config
  audioConfig: {
    mic: { volume: number; muted: boolean }
    desktop: { volume: number; muted: boolean }
    phone: { volume: number; muted: boolean }
    music: { volume: number; muted: boolean }
  }
}

interface AppState {
  // App info
  appInfo: {
    name: string
    version: string
    platform: string
  }
  isInitialized: boolean

  // Stream state
  streamStatus: StreamStatus
  streamStats: StreamStats

  // Audio
  audioTracks: AudioTrack[]

  // Scenes
  scenes: Scene[]
  activeSceneId: string | null

  // Sources
  activeSource: CaptureSource | null

  // Webcams (multi-webcam support)
  webcams: WebcamSource[]
  availableWebcams: MediaDeviceInfo[]

  // Phones (multi-phone support via scrcpy)
  phones: PhoneSource[]

  // Saved devices for WiFi reconnection
  savedDevices: SavedDevice[]

  // Legacy single webcam/phone (for backwards compatibility)
  webcam: WebcamSource | null
  phone: PhoneSource | null

  // Custom overlays (images, text, video, browser)
  overlays: Overlay[]

  // Scene transitions
  transitionConfig: TransitionConfig
  isTransitioning: boolean

  // Presets
  presets: StreamPreset[]
  activePresetId: string | null

  // Stream session & markers
  currentSession: StreamSession | null
  pastSessions: StreamSession[]

  // Actions
  setAppInfo: (info: { name: string; version: string; platform: string }) => void
  setInitialized: (value: boolean) => void
  setStreamStatus: (status: StreamStatus) => void
  updateStreamStats: (stats: Partial<StreamStats>) => void
  setAudioTrackVolume: (trackId: string, volume: number) => void
  toggleAudioTrackMute: (trackId: string) => void
  updateAudioLevel: (trackId: string, level: number) => void
  setAudioTrackDevice: (trackId: string, deviceId: string, deviceLabel: string) => void
  setActiveScene: (sceneId: string) => void
  addScene: (name: string) => void
  removeScene: (sceneId: string) => void
  renameScene: (sceneId: string, name: string) => void
  saveCurrentToScene: (sceneId: string) => void
  loadSceneConfig: (sceneId: string) => void
  setActiveSource: (source: CaptureSource | null) => void
  setWebcam: (webcam: WebcamSource | null) => void
  setAvailableWebcams: (webcams: MediaDeviceInfo[]) => void
  updateWebcamPosition: (position: PipPosition) => void
  updateWebcamCustomPosition: (x: number, y: number) => void
  updateWebcamSize: (size: PipSize) => void
  updateWebcamCustomSize: (width: number, height: number) => void
  toggleWebcam: () => void
  bringWebcamToFront: () => void
  setPhone: (phone: PhoneSource | null) => void
  updatePhonePosition: (position: PipPosition) => void
  updatePhoneCustomPosition: (x: number, y: number) => void
  updatePhoneSize: (size: PipSize) => void
  updatePhoneCustomSize: (width: number, height: number) => void
  togglePhone: () => void
  bringPhoneToFront: () => void
  // Multi-webcam actions
  addWebcam: (webcam: Omit<WebcamSource, 'id'>) => string
  removeWebcam: (webcamId: string) => void
  updateWebcam: (webcamId: string, updates: Partial<WebcamSource>) => void
  renameWebcam: (webcamId: string, label: string) => void
  // Multi-phone actions
  addPhone: (phone: Omit<PhoneSource, 'id'>) => string
  removePhone: (phoneId: string) => void
  updatePhone: (phoneId: string, updates: Partial<PhoneSource>) => void
  renamePhone: (phoneId: string, label: string) => void
  // Saved devices actions (for WiFi reconnection)
  saveDevice: (device: Omit<SavedDevice, 'lastConnected'>) => void
  updateSavedDevice: (serial: string, updates: Partial<SavedDevice>) => void
  removeSavedDevice: (serial: string) => void
  getSavedDevice: (serial: string) => SavedDevice | undefined
  // Overlay actions
  addOverlay: (overlay: Overlay) => void
  removeOverlay: (overlayId: string) => void
  updateOverlay: (overlayId: string, updates: Partial<Overlay>) => void
  toggleOverlay: (overlayId: string) => void
  updateOverlayPosition: (overlayId: string, position: PipPosition) => void
  updateOverlayCustomPosition: (overlayId: string, x: number, y: number) => void
  updateOverlayCustomSize: (overlayId: string, width: number, height: number) => void
  bringOverlayToFront: (overlayId: string) => void
  // Transition actions
  setTransitionConfig: (config: Partial<TransitionConfig>) => void
  setIsTransitioning: (value: boolean) => void
  switchSceneWithTransition: (sceneId: string) => void
  // Preset actions
  addPreset: (preset: Omit<StreamPreset, 'id' | 'createdAt' | 'updatedAt'>) => void
  updatePreset: (presetId: string, updates: Partial<StreamPreset>) => void
  removePreset: (presetId: string) => void
  setActivePreset: (presetId: string | null) => void
  applyPreset: (presetId: string) => void
  // Session & marker actions
  startSession: (title: string, game: string, platforms: string[]) => void
  endSession: () => void
  addMarker: (type: MarkerType, description?: string) => void
  removeMarker: (markerId: string) => void
  updateSessionStats: (stats: Partial<StreamSession['stats']>) => void
  exportSessionToObsidian: (sessionId: string, vaultPath: string) => Promise<boolean>
}

const defaultAudioTracks: AudioTrack[] = [
  { id: 'mic', name: 'Microphone', type: 'mic', volume: 100, muted: false, level: 0 },
  { id: 'desktop', name: 'Son PC', type: 'desktop', volume: 80, muted: false, level: 0 },
  { id: 'phone', name: 'Téléphone', type: 'phone', volume: 100, muted: false, level: 0 },
  { id: 'music', name: 'Musique', type: 'music', volume: 50, muted: false, level: 0 }
]

const defaultSceneConfig: SceneSourceConfig = {
  activeSource: null,
  webcam: null,
  phone: null,
  overlays: []
}

const defaultScenes: Scene[] = [
  { id: 'starting', name: 'Starting Soon', isActive: false, config: { ...defaultSceneConfig } },
  { id: 'live', name: 'Live', isActive: true, config: { ...defaultSceneConfig } },
  { id: 'pause', name: 'Pause', isActive: false, config: { ...defaultSceneConfig } },
  { id: 'ending', name: 'Ending', isActive: false, config: { ...defaultSceneConfig } }
]

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      appInfo: { name: '', version: '', platform: '' },
      isInitialized: false,
      streamStatus: 'offline',
      streamStats: {
        duration: 0,
        bitrate: 0,
        fps: 0,
        droppedFrames: 0,
        viewers: { twitch: 0, youtube: 0 }
      },
      audioTracks: defaultAudioTracks,
      scenes: defaultScenes,
      activeSceneId: 'live',
      activeSource: null,
      webcams: [],
      availableWebcams: [],
      phones: [],
      savedDevices: [],
      webcam: null, // Legacy single webcam (computed from webcams[0])
      phone: null, // Legacy single phone (computed from phones[0])
      overlays: [],
      transitionConfig: {
        type: 'fade',
        duration: 300,
        easing: 'ease-in-out'
      },
      isTransitioning: false,
      presets: [],
      activePresetId: null,
      currentSession: null,
      pastSessions: [],

      // Actions
  setAppInfo: (info): void => set({ appInfo: info }),

  setInitialized: (value): void => set({ isInitialized: value }),

  setStreamStatus: (status): void => set({ streamStatus: status }),

  updateStreamStats: (stats): void =>
    set((state) => ({
      streamStats: { ...state.streamStats, ...stats }
    })),

  setAudioTrackVolume: (trackId, volume): void =>
    set((state) => ({
      audioTracks: state.audioTracks.map((track) =>
        track.id === trackId ? { ...track, volume: Math.max(0, Math.min(100, volume)) } : track
      )
    })),

  toggleAudioTrackMute: (trackId): void =>
    set((state) => ({
      audioTracks: state.audioTracks.map((track) =>
        track.id === trackId ? { ...track, muted: !track.muted } : track
      )
    })),

  updateAudioLevel: (trackId, level): void =>
    set((state) => ({
      audioTracks: state.audioTracks.map((track) =>
        track.id === trackId ? { ...track, level } : track
      )
    })),

  setAudioTrackDevice: (trackId, deviceId, deviceLabel): void =>
    set((state) => ({
      audioTracks: state.audioTracks.map((track) =>
        track.id === trackId ? { ...track, deviceId, deviceLabel } : track
      )
    })),

  setActiveScene: (sceneId): void =>
    set((state) => {
      const scene = state.scenes.find((s) => s.id === sceneId)
      if (!scene) return state

      // Load the scene's configuration
      const newState: Partial<AppState> = {
        activeSceneId: sceneId,
        scenes: state.scenes.map((s) => ({
          ...s,
          isActive: s.id === sceneId
        })),
        activeSource: scene.config.activeSource
      }

      // Apply webcam config if available
      if (scene.config.webcam && state.webcam) {
        newState.webcam = {
          ...state.webcam,
          enabled: scene.config.webcam.enabled,
          position: scene.config.webcam.position,
          customPosition: scene.config.webcam.customPosition,
          size: scene.config.webcam.size,
          customSize: scene.config.webcam.customSize,
          zIndex: scene.config.webcam.zIndex
        }
      }

      // Apply phone config if available
      if (scene.config.phone && state.phone) {
        newState.phone = {
          ...state.phone,
          enabled: scene.config.phone.enabled,
          position: scene.config.phone.position,
          customPosition: scene.config.phone.customPosition,
          size: scene.config.phone.size,
          customSize: scene.config.phone.customSize,
          zIndex: scene.config.phone.zIndex
        }
      }

      // Apply overlays config if available
      if (scene.config.overlays) {
        newState.overlays = scene.config.overlays
      }

      return newState
    }),

  addScene: (name): void =>
    set((state) => {
      const id = `scene-${Date.now()}`
      const newScene: Scene = {
        id,
        name,
        isActive: false,
        config: {
          activeSource: state.activeSource,
          webcam: state.webcam
            ? {
                enabled: state.webcam.enabled,
                position: state.webcam.position,
                customPosition: state.webcam.customPosition,
                size: state.webcam.size,
                customSize: state.webcam.customSize,
                zIndex: state.webcam.zIndex
              }
            : null,
          phone: state.phone
            ? {
                enabled: state.phone.enabled,
                position: state.phone.position,
                customPosition: state.phone.customPosition,
                size: state.phone.size,
                customSize: state.phone.customSize,
                zIndex: state.phone.zIndex
              }
            : null,
          overlays: [...state.overlays]
        }
      }
      return { scenes: [...state.scenes, newScene] }
    }),

  removeScene: (sceneId): void =>
    set((state) => ({
      scenes: state.scenes.filter((s) => s.id !== sceneId),
      activeSceneId: state.activeSceneId === sceneId ? state.scenes[0]?.id || null : state.activeSceneId
    })),

  renameScene: (sceneId, name): void =>
    set((state) => ({
      scenes: state.scenes.map((s) => (s.id === sceneId ? { ...s, name } : s))
    })),

  saveCurrentToScene: (sceneId): void =>
    set((state) => ({
      scenes: state.scenes.map((s) =>
        s.id === sceneId
          ? {
              ...s,
              config: {
                activeSource: state.activeSource,
                webcam: state.webcam
                  ? {
                      enabled: state.webcam.enabled,
                      position: state.webcam.position,
                      customPosition: state.webcam.customPosition,
                      size: state.webcam.size,
                      customSize: state.webcam.customSize,
                      zIndex: state.webcam.zIndex
                    }
                  : null,
                phone: state.phone
                  ? {
                      enabled: state.phone.enabled,
                      position: state.phone.position,
                      customPosition: state.phone.customPosition,
                      size: state.phone.size,
                      customSize: state.phone.customSize,
                      zIndex: state.phone.zIndex
                    }
                  : null,
                overlays: [...state.overlays]
              }
            }
          : s
      )
    })),

  loadSceneConfig: (sceneId): void =>
    set((state) => {
      const scene = state.scenes.find((s) => s.id === sceneId)
      if (!scene) return state

      const newState: Partial<AppState> = {
        activeSource: scene.config.activeSource
      }

      if (scene.config.webcam && state.webcam) {
        newState.webcam = {
          ...state.webcam,
          enabled: scene.config.webcam.enabled,
          position: scene.config.webcam.position,
          customPosition: scene.config.webcam.customPosition,
          size: scene.config.webcam.size,
          customSize: scene.config.webcam.customSize,
          zIndex: scene.config.webcam.zIndex
        }
      }

      if (scene.config.phone && state.phone) {
        newState.phone = {
          ...state.phone,
          enabled: scene.config.phone.enabled,
          position: scene.config.phone.position,
          customPosition: scene.config.phone.customPosition,
          size: scene.config.phone.size,
          customSize: scene.config.phone.customSize,
          zIndex: scene.config.phone.zIndex
        }
      }

      if (scene.config.overlays) {
        newState.overlays = scene.config.overlays
      }

      return newState
    }),

  setActiveSource: (source): void => set({ activeSource: source }),

  setWebcam: (webcam): void => set({ webcam }),

  setAvailableWebcams: (webcams): void => set({ availableWebcams: webcams }),

  updateWebcamPosition: (position): void =>
    set((state) => ({
      webcam: state.webcam ? { ...state.webcam, position } : null
    })),

  updateWebcamCustomPosition: (x, y): void =>
    set((state) => ({
      webcam: state.webcam
        ? { ...state.webcam, position: 'custom' as PipPosition, customPosition: { x, y } }
        : null
    })),

  updateWebcamSize: (size): void =>
    set((state) => ({
      webcam: state.webcam ? { ...state.webcam, size, customSize: undefined } : null
    })),

  updateWebcamCustomSize: (width, height): void =>
    set((state) => ({
      webcam: state.webcam
        ? { ...state.webcam, customSize: { width: Math.max(5, Math.min(100, width)), height: Math.max(5, Math.min(100, height)) } }
        : null
    })),

  toggleWebcam: (): void =>
    set((state) => ({
      webcam: state.webcam ? { ...state.webcam, enabled: !state.webcam.enabled } : null
    })),

  bringWebcamToFront: (): void =>
    set((state) => ({
      webcam: state.webcam ? { ...state.webcam, zIndex: 20 } : null,
      phone: state.phone ? { ...state.phone, zIndex: 10 } : null
    })),

  setPhone: (phone): void => set({ phone }),

  updatePhonePosition: (position): void =>
    set((state) => ({
      phone: state.phone ? { ...state.phone, position } : null
    })),

  updatePhoneCustomPosition: (x, y): void =>
    set((state) => ({
      phone: state.phone
        ? { ...state.phone, position: 'custom' as PipPosition, customPosition: { x, y } }
        : null
    })),

  updatePhoneSize: (size): void =>
    set((state) => ({
      phone: state.phone ? { ...state.phone, size, customSize: undefined } : null
    })),

  updatePhoneCustomSize: (width, height): void =>
    set((state) => ({
      phone: state.phone
        ? { ...state.phone, customSize: { width: Math.max(5, Math.min(100, width)), height: Math.max(5, Math.min(100, height)) } }
        : null
    })),

  togglePhone: (): void =>
    set((state) => ({
      phone: state.phone ? { ...state.phone, enabled: !state.phone.enabled } : null
    })),

  bringPhoneToFront: (): void =>
    set((state) => ({
      phone: state.phone ? { ...state.phone, zIndex: 20 } : null,
      webcam: state.webcam ? { ...state.webcam, zIndex: 10 } : null
    })),

  // Multi-webcam actions
  addWebcam: (webcam): string => {
    const id = `webcam-${Date.now()}`
    set((state) => {
      const newWebcam = { ...webcam, id }
      const webcams = [...state.webcams, newWebcam]
      return {
        webcams,
        webcam: webcams[0] || null // Keep legacy webcam in sync
      }
    })
    return id
  },

  removeWebcam: (webcamId): void =>
    set((state) => {
      const webcams = state.webcams.filter((w) => w.id !== webcamId)
      return {
        webcams,
        webcam: webcams[0] || null
      }
    }),

  updateWebcam: (webcamId, updates): void =>
    set((state) => {
      const webcams = state.webcams.map((w) =>
        w.id === webcamId ? { ...w, ...updates } : w
      )
      return {
        webcams,
        webcam: webcams[0] || null
      }
    }),

  renameWebcam: (webcamId, label): void =>
    set((state) => {
      const webcams = state.webcams.map((w) =>
        w.id === webcamId ? { ...w, customLabel: label } : w
      )
      return {
        webcams,
        webcam: webcams[0] || null
      }
    }),

  // Multi-phone actions
  addPhone: (phone): string => {
    const id = `phone-${Date.now()}`
    set((state) => {
      const newPhone = { ...phone, id }
      const phones = [...state.phones, newPhone]
      return {
        phones,
        phone: phones[0] || null // Keep legacy phone in sync
      }
    })
    return id
  },

  removePhone: (phoneId): void =>
    set((state) => {
      const phones = state.phones.filter((p) => p.id !== phoneId)
      return {
        phones,
        phone: phones[0] || null
      }
    }),

  updatePhone: (phoneId, updates): void =>
    set((state) => {
      const phones = state.phones.map((p) =>
        p.id === phoneId ? { ...p, ...updates } : p
      )
      return {
        phones,
        phone: phones[0] || null
      }
    }),

  renamePhone: (phoneId, label): void =>
    set((state) => {
      const phones = state.phones.map((p) =>
        p.id === phoneId ? { ...p, customLabel: label } : p
      )
      return {
        phones,
        phone: phones[0] || null
      }
    }),

  // Saved devices actions (for WiFi reconnection)
  saveDevice: (device): void =>
    set((state) => {
      const existing = state.savedDevices.find((d) => d.serial === device.serial)
      if (existing) {
        return {
          savedDevices: state.savedDevices.map((d) =>
            d.serial === device.serial
              ? { ...d, ...device, lastConnected: Date.now() }
              : d
          )
        }
      }
      return {
        savedDevices: [...state.savedDevices, { ...device, lastConnected: Date.now() }]
      }
    }),

  updateSavedDevice: (serial, updates): void =>
    set((state) => ({
      savedDevices: state.savedDevices.map((d) =>
        d.serial === serial ? { ...d, ...updates, lastConnected: Date.now() } : d
      )
    })),

  removeSavedDevice: (serial): void =>
    set((state) => ({
      savedDevices: state.savedDevices.filter((d) => d.serial !== serial)
    })),

  getSavedDevice: (serial): SavedDevice | undefined => {
    return useAppStore.getState().savedDevices.find((d) => d.serial === serial)
  },

  // Overlay actions
  addOverlay: (overlay): void =>
    set((state) => ({
      overlays: [...state.overlays, overlay]
    })),

  removeOverlay: (overlayId): void =>
    set((state) => ({
      overlays: state.overlays.filter((o) => o.id !== overlayId)
    })),

  updateOverlay: (overlayId, updates): void =>
    set((state) => ({
      overlays: state.overlays.map((o) =>
        o.id === overlayId ? { ...o, ...updates } as Overlay : o
      )
    })),

  toggleOverlay: (overlayId): void =>
    set((state) => ({
      overlays: state.overlays.map((o) =>
        o.id === overlayId ? { ...o, enabled: !o.enabled } : o
      )
    })),

  updateOverlayPosition: (overlayId, position): void =>
    set((state) => ({
      overlays: state.overlays.map((o) =>
        o.id === overlayId ? { ...o, position } : o
      )
    })),

  updateOverlayCustomPosition: (overlayId, x, y): void =>
    set((state) => ({
      overlays: state.overlays.map((o) =>
        o.id === overlayId ? { ...o, position: 'custom' as PipPosition, customPosition: { x, y } } : o
      )
    })),

  updateOverlayCustomSize: (overlayId, width, height): void =>
    set((state) => ({
      overlays: state.overlays.map((o) =>
        o.id === overlayId
          ? { ...o, customSize: { width: Math.max(5, Math.min(100, width)), height: Math.max(5, Math.min(100, height)) } }
          : o
      )
    })),

  bringOverlayToFront: (overlayId): void =>
    set((state) => {
      const maxZ = Math.max(
        state.webcam?.zIndex || 0,
        state.phone?.zIndex || 0,
        ...state.overlays.map((o) => o.zIndex)
      )
      return {
        overlays: state.overlays.map((o) =>
          o.id === overlayId ? { ...o, zIndex: maxZ + 1 } : o
        )
      }
    }),

  // Transition actions
  setTransitionConfig: (config): void =>
    set((state) => ({
      transitionConfig: { ...state.transitionConfig, ...config }
    })),

  setIsTransitioning: (value): void =>
    set({ isTransitioning: value }),

  switchSceneWithTransition: (sceneId): void => {
    const state = useAppStore.getState()
    if (state.isTransitioning || state.activeSceneId === sceneId) return

    // Start transition
    set({ isTransitioning: true })

    // After transition duration, actually switch the scene
    setTimeout(() => {
      state.setActiveScene(sceneId)
      // Small delay before ending transition to allow content to render
      setTimeout(() => {
        set({ isTransitioning: false })
      }, 50)
    }, state.transitionConfig.duration)
  },

  // Preset actions
  addPreset: (preset): void =>
    set((state) => ({
      presets: [
        ...state.presets,
        {
          ...preset,
          id: `preset-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]
    })),

  updatePreset: (presetId, updates): void =>
    set((state) => ({
      presets: state.presets.map((p) =>
        p.id === presetId ? { ...p, ...updates, updatedAt: Date.now() } : p
      )
    })),

  removePreset: (presetId): void =>
    set((state) => ({
      presets: state.presets.filter((p) => p.id !== presetId),
      activePresetId: state.activePresetId === presetId ? null : state.activePresetId
    })),

  setActivePreset: (presetId): void =>
    set({ activePresetId: presetId }),

  applyPreset: (presetId): void => {
    const state = useAppStore.getState()
    const preset = state.presets.find((p) => p.id === presetId)
    if (!preset) return

    // Apply audio config
    const newAudioTracks = state.audioTracks.map((track) => {
      const config = preset.audioConfig[track.id as keyof typeof preset.audioConfig]
      if (config) {
        return { ...track, volume: config.volume, muted: config.muted }
      }
      return track
    })

    // Apply start scene
    if (preset.startSceneId && state.scenes.some((s) => s.id === preset.startSceneId)) {
      state.setActiveScene(preset.startSceneId)
    }

    set({
      activePresetId: presetId,
      audioTracks: newAudioTracks
    })
  },

  // Session & marker actions
  startSession: (title, game, platforms): void => {
    const state = useAppStore.getState()
    const activePreset = state.presets.find((p) => p.id === state.activePresetId)

    set({
      currentSession: {
        id: `session-${Date.now()}`,
        startedAt: Date.now(),
        endedAt: null,
        preset: activePreset?.name || null,
        platforms,
        markers: [],
        stats: {
          duration: 0,
          peakViewers: 0,
          totalMessages: 0,
          newFollowers: 0
        },
        game,
        title
      }
    })
  },

  endSession: (): void =>
    set((state) => {
      if (!state.currentSession) return state

      const endedSession = {
        ...state.currentSession,
        endedAt: Date.now(),
        stats: {
          ...state.currentSession.stats,
          duration: state.streamStats.duration
        }
      }

      return {
        currentSession: null,
        pastSessions: [endedSession, ...state.pastSessions].slice(0, 50) // Keep last 50 sessions
      }
    }),

  addMarker: (type, description): void =>
    set((state) => {
      if (!state.currentSession) return state

      const defaultDescriptions: Record<MarkerType, string> = {
        'epic': 'Moment epique',
        'fail': 'Fail memorable',
        'clip': 'Passage a clipper',
        'bug': 'Bug/probleme technique',
        'info': 'Information a noter',
        'custom': description || 'Marqueur'
      }

      const marker: StreamMarker = {
        id: `marker-${Date.now()}`,
        type,
        timestamp: state.streamStats.duration,
        description: description || defaultDescriptions[type],
        createdAt: Date.now()
      }

      return {
        currentSession: {
          ...state.currentSession,
          markers: [...state.currentSession.markers, marker]
        }
      }
    }),

  removeMarker: (markerId): void =>
    set((state) => {
      if (!state.currentSession) return state

      return {
        currentSession: {
          ...state.currentSession,
          markers: state.currentSession.markers.filter((m) => m.id !== markerId)
        }
      }
    }),

  updateSessionStats: (stats): void =>
    set((state) => {
      if (!state.currentSession) return state

      return {
        currentSession: {
          ...state.currentSession,
          stats: { ...state.currentSession.stats, ...stats }
        }
      }
    }),

  exportSessionToObsidian: async (sessionId, vaultPath): Promise<boolean> => {
    const state = useAppStore.getState()
    const session = state.pastSessions.find((s) => s.id === sessionId) ||
                   (state.currentSession?.id === sessionId ? state.currentSession : null)

    if (!session) return false

    const formatTimestamp = (seconds: number): string => {
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      const s = Math.floor(seconds % 60)
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const formatDate = (timestamp: number): string => {
      return new Date(timestamp).toISOString().split('T')[0]
    }

    const date = formatDate(session.startedAt)
    const duration = formatTimestamp(session.stats.duration)

    const markerIcons: Record<MarkerType, string> = {
      'epic': '⭐',
      'fail': '💀',
      'clip': '🎬',
      'bug': '🐛',
      'info': 'ℹ️',
      'custom': '📌'
    }

    const markdown = `---
date: ${date}
platforms: [${session.platforms.join(', ')}]
duration: ${duration}
peak_viewers: ${session.stats.peakViewers}
total_messages: ${session.stats.totalMessages}
new_followers: ${session.stats.newFollowers}
game: ${session.game}
preset: ${session.preset || 'none'}
---

# Stream - ${session.title} - ${date}

## Stats
- Duree : ${duration}
- Pic viewers : ${session.stats.peakViewers}
- Messages chat : ${session.stats.totalMessages}
- Nouveaux followers : ${session.stats.newFollowers}

## Marqueurs
${session.markers.length > 0
  ? session.markers.map((m) => `- ${formatTimestamp(m.timestamp)} - ${markerIcons[m.type]} [${m.type.toUpperCase()}] ${m.description}`).join('\n')
  : '_Aucun marqueur_'}

## Notes
_(Espace pour notes manuelles)_
`

    try {
      const fileName = `Stream-${session.title.replace(/[^a-zA-Z0-9]/g, '-')}-${date}.md`
      const filePath = `${vaultPath}/${fileName}`

      // Use Electron's IPC to write the file
      await window.api.writeFile(filePath, markdown)

      console.log('[AppStore] Session exported to Obsidian:', filePath)
      return true
    } catch (error) {
      console.error('[AppStore] Failed to export session:', error)
      return false
    }
  }
}),
    {
      name: 'hikari-stream-app-state',
      storage: createJSONStorage(() => localStorage),
      // Only persist specific keys (not transient data like streamStatus, streamStats, levels)
      partialize: (state) => ({
        scenes: state.scenes,
        activeSceneId: state.activeSceneId,
        webcams: state.webcams,
        phones: state.phones,
        savedDevices: state.savedDevices,
        webcam: state.webcam,
        phone: state.phone,
        overlays: state.overlays,
        transitionConfig: state.transitionConfig,
        presets: state.presets,
        activePresetId: state.activePresetId,
        pastSessions: state.pastSessions,
        audioTracks: state.audioTracks.map(track => ({
          ...track,
          level: 0 // Reset levels on load
        }))
      }),
      // Properly merge persisted state with initial state
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AppState> | undefined
        console.log('[AppStore] Rehydrating state from localStorage:', persisted ? 'found' : 'not found')
        if (!persisted) return currentState

        // Validate audioTracks - filter out any null/invalid tracks
        let validAudioTracks = currentState.audioTracks
        if (persisted.audioTracks && Array.isArray(persisted.audioTracks)) {
          validAudioTracks = persisted.audioTracks.filter(
            (track): track is AudioTrack =>
              track !== null &&
              track !== undefined &&
              typeof track === 'object' &&
              typeof track.id === 'string' &&
              typeof track.type === 'string'
          )
          // If no valid tracks, use defaults
          if (validAudioTracks.length === 0) {
            validAudioTracks = currentState.audioTracks
          }
        }

        // Validate scenes
        let validScenes = currentState.scenes
        if (persisted.scenes && Array.isArray(persisted.scenes)) {
          validScenes = persisted.scenes.filter(
            (scene): scene is Scene =>
              scene !== null &&
              scene !== undefined &&
              typeof scene === 'object' &&
              typeof scene.id === 'string' &&
              typeof scene.name === 'string'
          )
          // If no valid scenes, use defaults
          if (validScenes.length === 0) {
            validScenes = currentState.scenes
          }
        }

        // Validate overlays
        let validOverlays = currentState.overlays
        if (persisted.overlays && Array.isArray(persisted.overlays)) {
          validOverlays = persisted.overlays.filter(
            (overlay): overlay is Overlay =>
              overlay !== null &&
              overlay !== undefined &&
              typeof overlay === 'object' &&
              typeof overlay.id === 'string' &&
              typeof overlay.type === 'string'
          )
        }

        // Validate presets
        let validPresets = currentState.presets
        if (persisted.presets && Array.isArray(persisted.presets)) {
          validPresets = persisted.presets.filter(
            (preset): preset is StreamPreset =>
              preset !== null &&
              preset !== undefined &&
              typeof preset === 'object' &&
              typeof preset.id === 'string' &&
              typeof preset.name === 'string'
          )
        }

        // Validate pastSessions
        let validPastSessions = currentState.pastSessions
        if (persisted.pastSessions && Array.isArray(persisted.pastSessions)) {
          validPastSessions = persisted.pastSessions.filter(
            (session): session is StreamSession =>
              session !== null &&
              session !== undefined &&
              typeof session === 'object' &&
              typeof session.id === 'string'
          )
        }

        // Validate webcams
        let validWebcams = currentState.webcams
        if (persisted.webcams && Array.isArray(persisted.webcams)) {
          validWebcams = persisted.webcams.filter(
            (webcam): webcam is WebcamSource =>
              webcam !== null &&
              webcam !== undefined &&
              typeof webcam === 'object' &&
              typeof webcam.id === 'string' &&
              typeof webcam.deviceId === 'string'
          )
        }

        // Validate phones
        let validPhones = currentState.phones
        if (persisted.phones && Array.isArray(persisted.phones)) {
          validPhones = persisted.phones.filter(
            (phone): phone is PhoneSource =>
              phone !== null &&
              phone !== undefined &&
              typeof phone === 'object' &&
              typeof phone.id === 'string'
          )
        }

        // Validate savedDevices
        let validSavedDevices = currentState.savedDevices
        if (persisted.savedDevices && Array.isArray(persisted.savedDevices)) {
          validSavedDevices = persisted.savedDevices.filter(
            (device): device is SavedDevice =>
              device !== null &&
              device !== undefined &&
              typeof device === 'object' &&
              typeof device.serial === 'string'
          )
        }

        return {
          ...currentState,
          scenes: validScenes,
          activeSceneId: persisted.activeSceneId || currentState.activeSceneId,
          webcams: validWebcams,
          phones: validPhones,
          savedDevices: validSavedDevices,
          webcam: validWebcams[0] || persisted.webcam || currentState.webcam,
          phone: validPhones[0] || persisted.phone || currentState.phone,
          overlays: validOverlays,
          transitionConfig: persisted.transitionConfig || currentState.transitionConfig,
          presets: validPresets,
          activePresetId: persisted.activePresetId || currentState.activePresetId,
          pastSessions: validPastSessions,
          audioTracks: validAudioTracks
        }
      },
      onRehydrateStorage: () => (state) => {
        console.log('[AppStore] Hydration finished:', state ? 'success' : 'failed')
      }
    }
  )
)
