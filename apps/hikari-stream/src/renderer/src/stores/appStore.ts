import { create } from 'zustand'

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
}

export interface Scene {
  id: string
  name: string
  isActive: boolean
}

export interface CaptureSource {
  id: string
  name: string
  thumbnail: string
  type: 'screen' | 'window'
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

  // Actions
  setAppInfo: (info: { name: string; version: string; platform: string }) => void
  setInitialized: (value: boolean) => void
  setStreamStatus: (status: StreamStatus) => void
  updateStreamStats: (stats: Partial<StreamStats>) => void
  setAudioTrackVolume: (trackId: string, volume: number) => void
  toggleAudioTrackMute: (trackId: string) => void
  updateAudioLevel: (trackId: string, level: number) => void
  setActiveScene: (sceneId: string) => void
  addScene: (scene: Scene) => void
  setActiveSource: (source: CaptureSource | null) => void
}

const defaultAudioTracks: AudioTrack[] = [
  { id: 'mic', name: 'Microphone', type: 'mic', volume: 100, muted: false, level: 0 },
  { id: 'desktop', name: 'Son PC', type: 'desktop', volume: 80, muted: false, level: 0 },
  { id: 'phone', name: 'Téléphone', type: 'phone', volume: 100, muted: false, level: 0 },
  { id: 'music', name: 'Musique', type: 'music', volume: 50, muted: false, level: 0 }
]

const defaultScenes: Scene[] = [
  { id: 'starting', name: 'Starting Soon', isActive: false },
  { id: 'live', name: 'Live', isActive: true },
  { id: 'pause', name: 'Pause', isActive: false },
  { id: 'ending', name: 'Ending', isActive: false }
]

export const useAppStore = create<AppState>((set) => ({
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

  setActiveScene: (sceneId): void =>
    set((state) => ({
      activeSceneId: sceneId,
      scenes: state.scenes.map((scene) => ({
        ...scene,
        isActive: scene.id === sceneId
      }))
    })),

  addScene: (scene): void =>
    set((state) => ({
      scenes: [...state.scenes, scene]
    })),

  setActiveSource: (source): void => set({ activeSource: source })
}))
