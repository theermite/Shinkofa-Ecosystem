/**
 * PomodoroContext - Gestion globale du timer Pomodoro
 * Permet de minimiser/maximiser sans perdre le timer
 * Persiste dans localStorage pour survivre au refresh
 *
 * Copyright © 2026 La Voie Shinkofa
 */

'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'

// Types de sons disponibles
export type SoundType = 'zen' | 'gong' | 'bells' | 'forest' | 'piano'

export const SOUND_OPTIONS: { value: SoundType; label: string; description: string }[] = [
  { value: 'zen', label: 'Carillon Zen', description: 'Mélodie douce et apaisante' },
  { value: 'gong', label: 'Gong Tibétain', description: 'Son profond et résonnant' },
  { value: 'bells', label: 'Cloches', description: 'Cloches cristallines' },
  { value: 'forest', label: 'Forêt', description: 'Mélodie nature' },
  { value: 'piano', label: 'Piano', description: 'Notes de piano douces' },
]

interface PomodoroState {
  timeLeft: number
  isRunning: boolean
  isBreak: boolean
  isMinimized: boolean
  soundEnabled: boolean
  soundVolume: number
  soundType: SoundType
}

interface PomodoroContextType {
  timeLeft: number
  isRunning: boolean
  isBreak: boolean
  isMinimized: boolean
  isActive: boolean
  soundEnabled: boolean
  soundVolume: number
  soundType: SoundType
  isSoundPlaying: boolean
  startPomodoro: () => void
  pausePomodoro: () => void
  resetPomodoro: () => void
  minimizePomodoro: () => void
  maximizePomodoro: () => void
  closePomodoro: () => void
  setSoundEnabled: (enabled: boolean) => void
  setSoundVolume: (volume: number) => void
  setSoundType: (type: SoundType) => void
  testSound: () => void
  stopSound: () => void
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined)

const POMODORO_DURATION = 25 * 60 // 25 minutes
const BREAK_DURATION = 5 * 60 // 5 minutes
const STORAGE_KEY = 'shinkofa_pomodoro_state'

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundVolume, setSoundVolume] = useState(70)
  const [soundType, setSoundType] = useState<SoundType>('zen')
  const [isSoundPlaying, setIsSoundPlaying] = useState(false)

  // Ref pour l'AudioContext actif (permet d'arrêter le son)
  const audioContextRef = useRef<AudioContext | null>(null)
  const soundTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Charger l'état depuis localStorage au démarrage
  useEffect(() => {
    if (typeof window === 'undefined') return

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const state: PomodoroState & { isActive: boolean; lastUpdate: number } = JSON.parse(saved)

        if (state.isRunning && state.isActive) {
          const elapsed = Math.floor((Date.now() - state.lastUpdate) / 1000)
          const newTimeLeft = Math.max(0, state.timeLeft - elapsed)

          setTimeLeft(newTimeLeft)
          setIsRunning(newTimeLeft > 0)
          setIsBreak(state.isBreak)
          setIsMinimized(state.isMinimized)
          setIsActive(state.isActive)
        } else {
          setTimeLeft(state.timeLeft)
          setIsRunning(state.isRunning)
          setIsBreak(state.isBreak)
          setIsMinimized(state.isMinimized)
          setIsActive(state.isActive)
        }
        setSoundEnabled(state.soundEnabled ?? true)
        setSoundVolume(state.soundVolume ?? 70)
        setSoundType(state.soundType ?? 'zen')
      } catch (e) {
        console.error('Error loading Pomodoro state:', e)
      }
    }
  }, [])

  // Sauvegarder l'état dans localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    const state = {
      timeLeft,
      isRunning,
      isBreak,
      isMinimized,
      isActive,
      soundEnabled,
      soundVolume,
      soundType,
      lastUpdate: Date.now(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [timeLeft, isRunning, isBreak, isMinimized, isActive, soundEnabled, soundVolume, soundType])

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  // Arrêter le son
  const stopSound = () => {
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close()
      } catch (e) {
        // Ignore
      }
      audioContextRef.current = null
    }
    if (soundTimeoutRef.current) {
      clearTimeout(soundTimeoutRef.current)
      soundTimeoutRef.current = null
    }
    setIsSoundPlaying(false)
  }

  // Jouer le son de notification
  const playNotificationSound = () => {
    if (!soundEnabled || typeof window === 'undefined') return

    // Arrêter tout son en cours
    stopSound()

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return

      const audioContext = new AudioContextClass()
      audioContextRef.current = audioContext
      setIsSoundPlaying(true)

      const volume = (soundVolume / 100) * 0.25

      // Définir les mélodies selon le type de son (~15 secondes)
      let notes: { freq: number; start: number; duration: number; type?: OscillatorType }[] = []

      switch (soundType) {
        case 'zen':
          // Carillon zen - mélodie apaisante (15 sec)
          notes = [
            { freq: 523.25, start: 0, duration: 2.0 },
            { freq: 659.25, start: 0.8, duration: 2.0 },
            { freq: 783.99, start: 1.6, duration: 2.0 },
            { freq: 1046.50, start: 2.4, duration: 2.5 },
            { freq: 783.99, start: 4.0, duration: 2.0 },
            { freq: 659.25, start: 5.5, duration: 2.0 },
            { freq: 523.25, start: 7.0, duration: 2.5 },
            { freq: 659.25, start: 8.5, duration: 2.0 },
            { freq: 783.99, start: 10.0, duration: 2.0 },
            { freq: 1046.50, start: 11.5, duration: 2.5 },
            { freq: 783.99, start: 13.0, duration: 2.5 },
          ]
          break

        case 'gong':
          // Gong tibétain - sons graves résonnants avec harmoniques (15 sec)
          // Fréquences plus audibles (130-440 Hz) avec harmoniques
          notes = [
            // Premier coup de gong
            { freq: 130.81, start: 0, duration: 4.0, type: 'sine' },      // C3 fondamentale
            { freq: 261.63, start: 0, duration: 3.5, type: 'sine' },      // C4 harmonique
            { freq: 196.00, start: 0.1, duration: 3.0, type: 'sine' },    // G3 quinte
            // Second coup
            { freq: 146.83, start: 4.5, duration: 4.0, type: 'sine' },    // D3
            { freq: 293.66, start: 4.5, duration: 3.5, type: 'sine' },    // D4 harmonique
            { freq: 220.00, start: 4.6, duration: 3.0, type: 'sine' },    // A3
            // Troisième coup
            { freq: 130.81, start: 9.0, duration: 5.0, type: 'sine' },    // C3
            { freq: 261.63, start: 9.0, duration: 4.5, type: 'sine' },    // C4
            { freq: 196.00, start: 9.1, duration: 4.0, type: 'sine' },    // G3
            { freq: 392.00, start: 9.2, duration: 3.5, type: 'sine' },    // G4 brillance
          ]
          break

        case 'bells':
          // Cloches cristallines (15 sec)
          notes = [
            { freq: 1318.51, start: 0, duration: 1.8, type: 'sine' },
            { freq: 1567.98, start: 1.2, duration: 1.8, type: 'sine' },
            { freq: 1760, start: 2.4, duration: 1.8, type: 'sine' },
            { freq: 2093, start: 3.6, duration: 2.0, type: 'sine' },
            { freq: 1760, start: 5.0, duration: 1.8, type: 'sine' },
            { freq: 1567.98, start: 6.2, duration: 1.8, type: 'sine' },
            { freq: 1318.51, start: 7.4, duration: 2.0, type: 'sine' },
            { freq: 1567.98, start: 9.0, duration: 1.8, type: 'sine' },
            { freq: 1760, start: 10.2, duration: 1.8, type: 'sine' },
            { freq: 2093, start: 11.4, duration: 2.0, type: 'sine' },
            { freq: 1760, start: 13.0, duration: 2.5, type: 'sine' },
          ]
          break

        case 'forest':
          // Mélodie nature/forêt - chants d'oiseaux (15 sec)
          notes = [
            { freq: 1046.50, start: 0, duration: 0.4 },
            { freq: 1318.51, start: 0.5, duration: 0.4 },
            { freq: 1567.98, start: 1.0, duration: 0.6 },
            { freq: 1318.51, start: 2.0, duration: 0.4 },
            { freq: 1046.50, start: 2.5, duration: 0.6 },
            { freq: 783.99, start: 3.5, duration: 1.0 },
            { freq: 1046.50, start: 5.0, duration: 0.4 },
            { freq: 1318.51, start: 5.5, duration: 0.4 },
            { freq: 1567.98, start: 6.0, duration: 0.6 },
            { freq: 1760, start: 7.0, duration: 1.0 },
            { freq: 1567.98, start: 8.5, duration: 0.6 },
            { freq: 1318.51, start: 9.5, duration: 1.0 },
            { freq: 1046.50, start: 11.0, duration: 0.4 },
            { freq: 1318.51, start: 11.5, duration: 0.4 },
            { freq: 1567.98, start: 12.0, duration: 0.6 },
            { freq: 1760, start: 13.0, duration: 2.5 },
          ]
          break

        case 'piano':
          // Mélodie piano douce - progression d'accords (15 sec)
          notes = [
            // Accord 1 - C maj
            { freq: 261.63, start: 0, duration: 2.5, type: 'triangle' },
            { freq: 329.63, start: 0, duration: 2.5, type: 'triangle' },
            { freq: 392, start: 0, duration: 2.5, type: 'triangle' },
            // Accord 2 - G maj
            { freq: 196.00, start: 3.0, duration: 2.5, type: 'triangle' },
            { freq: 246.94, start: 3.0, duration: 2.5, type: 'triangle' },
            { freq: 293.66, start: 3.0, duration: 2.5, type: 'triangle' },
            // Accord 3 - Am
            { freq: 220.00, start: 6.0, duration: 2.5, type: 'triangle' },
            { freq: 261.63, start: 6.0, duration: 2.5, type: 'triangle' },
            { freq: 329.63, start: 6.0, duration: 2.5, type: 'triangle' },
            // Accord 4 - F maj
            { freq: 174.61, start: 9.0, duration: 2.5, type: 'triangle' },
            { freq: 220.00, start: 9.0, duration: 2.5, type: 'triangle' },
            { freq: 261.63, start: 9.0, duration: 2.5, type: 'triangle' },
            // Résolution - C maj
            { freq: 261.63, start: 12.0, duration: 3.5, type: 'triangle' },
            { freq: 329.63, start: 12.0, duration: 3.5, type: 'triangle' },
            { freq: 392, start: 12.0, duration: 3.5, type: 'triangle' },
          ]
          break
      }

      // Calculer la durée totale
      const totalDuration = Math.max(...notes.map(n => n.start + n.duration)) + 0.5

      // Jouer toutes les notes
      notes.forEach(({ freq, start, duration, type = 'sine' }) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.type = type
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + start)

        // Enveloppe ADSR
        const attackTime = soundType === 'gong' ? 0.1 : 0.05
        const decayLevel = soundType === 'gong' ? 0.9 : 0.7

        gainNode.gain.setValueAtTime(0, audioContext.currentTime + start)
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + start + attackTime)
        gainNode.gain.linearRampToValueAtTime(volume * decayLevel, audioContext.currentTime + start + attackTime + 0.1)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + start + duration)

        oscillator.start(audioContext.currentTime + start)
        oscillator.stop(audioContext.currentTime + start + duration)
      })

      // Cleanup après la fin
      soundTimeoutRef.current = setTimeout(() => {
        stopSound()
      }, totalDuration * 1000)
    } catch (e) {
      setIsSoundPlaying(false)
    }
  }

  const handleTimerComplete = () => {
    playNotificationSound()

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Shinkofa Pomodoro', {
        body: isBreak ? '☕ Pause terminée ! Retour au travail.' : '🍅 Pomodoro terminé ! Prends une pause.',
        icon: '/apple-touch-icon.png',
      })
    }

    if (isBreak) {
      setTimeLeft(POMODORO_DURATION)
      setIsBreak(false)
      setIsRunning(false)
    } else {
      setTimeLeft(BREAK_DURATION)
      setIsBreak(true)
      setIsRunning(false)
    }
  }

  const startPomodoro = () => {
    setIsActive(true)
    setIsRunning(true)

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const pausePomodoro = () => {
    setIsRunning(false)
  }

  const resetPomodoro = () => {
    setIsRunning(false)
    setTimeLeft(isBreak ? BREAK_DURATION : POMODORO_DURATION)
  }

  const minimizePomodoro = () => {
    setIsMinimized(true)
  }

  const maximizePomodoro = () => {
    setIsMinimized(false)
  }

  const closePomodoro = () => {
    stopSound()
    setIsActive(false)
    setIsMinimized(false)
    setIsRunning(false)
    setTimeLeft(POMODORO_DURATION)
    setIsBreak(false)

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return (
    <PomodoroContext.Provider
      value={{
        timeLeft,
        isRunning,
        isBreak,
        isMinimized,
        isActive,
        soundEnabled,
        soundVolume,
        soundType,
        isSoundPlaying,
        startPomodoro,
        pausePomodoro,
        resetPomodoro,
        minimizePomodoro,
        maximizePomodoro,
        closePomodoro,
        setSoundEnabled,
        setSoundVolume,
        setSoundType,
        testSound: playNotificationSound,
        stopSound,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  )
}

export function usePomodoro() {
  const context = useContext(PomodoroContext)
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider')
  }
  return context
}
