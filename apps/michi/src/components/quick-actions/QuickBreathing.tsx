/**
 * QuickBreathing - Respiration guidée avec animation et son
 * Shinkofa Platform - Next.js 15
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Wind, X, Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface QuickBreathingProps {
  onClose: () => void
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest'

interface BreathingPattern {
  name: string
  description: string
  inhale: number
  hold: number
  exhale: number
  rest: number
  frequency: number // Hz pour le son
}

const breathingPatterns: BreathingPattern[] = [
  {
    name: 'Cohérence Cardiaque',
    description: '5s inspiration / 5s expiration',
    inhale: 5,
    hold: 0,
    exhale: 5,
    rest: 0,
    frequency: 432, // Fréquence apaisante
  },
  {
    name: 'Relaxation 4-7-8',
    description: 'Calme profond et sommeil',
    inhale: 4,
    hold: 7,
    exhale: 8,
    rest: 0,
    frequency: 396, // Libération stress
  },
  {
    name: 'Énergisant',
    description: 'Boost d\'énergie',
    inhale: 4,
    hold: 4,
    exhale: 4,
    rest: 4,
    frequency: 528, // Réparation ADN
  },
]

export function QuickBreathing({ onClose }: QuickBreathingProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentPattern, setCurrentPattern] = useState(0)
  const [phase, setPhase] = useState<BreathPhase>('inhale')
  const [timeLeft, setTimeLeft] = useState(breathingPatterns[0].inhale)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [cycleCount, setCycleCount] = useState(0)

  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  const pattern = breathingPatterns[currentPattern]

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
      gainNodeRef.current.gain.value = 0
    }

    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Play sound
  useEffect(() => {
    if (!audioContextRef.current || !gainNodeRef.current) return

    if (isActive && soundEnabled) {
      // Create oscillator if not exists
      if (!oscillatorRef.current) {
        oscillatorRef.current = audioContextRef.current.createOscillator()
        oscillatorRef.current.type = 'sine'
        oscillatorRef.current.frequency.value = pattern.frequency
        oscillatorRef.current.connect(gainNodeRef.current)
        oscillatorRef.current.start()
      }

      // Fade in/out based on phase
      const targetVolume = phase === 'exhale' ? 0.1 : 0.05
      gainNodeRef.current.gain.setTargetAtTime(
        targetVolume,
        audioContextRef.current.currentTime,
        0.3
      )
    } else if (oscillatorRef.current && gainNodeRef.current) {
      // Fade out
      gainNodeRef.current.gain.setTargetAtTime(
        0,
        audioContextRef.current.currentTime,
        0.3
      )
    }
  }, [isActive, soundEnabled, phase, pattern.frequency])

  // Breathing cycle logic
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          let nextPhase: BreathPhase = 'inhale'
          let nextTime = pattern.inhale

          if (phase === 'inhale') {
            if (pattern.hold > 0) {
              nextPhase = 'hold'
              nextTime = pattern.hold
            } else {
              nextPhase = 'exhale'
              nextTime = pattern.exhale
            }
          } else if (phase === 'hold') {
            nextPhase = 'exhale'
            nextTime = pattern.exhale
          } else if (phase === 'exhale') {
            if (pattern.rest > 0) {
              nextPhase = 'rest'
              nextTime = pattern.rest
            } else {
              nextPhase = 'inhale'
              nextTime = pattern.inhale
              setCycleCount((c) => c + 1)
            }
          } else {
            nextPhase = 'inhale'
            nextTime = pattern.inhale
            setCycleCount((c) => c + 1)
          }

          setPhase(nextPhase)
          return nextTime
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, phase, pattern])

  const handleToggle = () => {
    if (!isActive) {
      setPhase('inhale')
      setTimeLeft(pattern.inhale)
      setCycleCount(0)
    }
    setIsActive(!isActive)
  }

  const handlePatternChange = (index: number) => {
    setCurrentPattern(index)
    setIsActive(false)
    setPhase('inhale')
    setTimeLeft(breathingPatterns[index].inhale)
    setCycleCount(0)

    // Update oscillator frequency
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.value = breathingPatterns[index].frequency
    }
  }

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Inspire'
      case 'hold':
        return 'Retiens'
      case 'exhale':
        return 'Expire'
      case 'rest':
        return 'Pause'
    }
  }

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return 'from-blue-400 to-blue-600'
      case 'hold':
        return 'from-purple-400 to-purple-600'
      case 'exhale':
        return 'from-green-400 to-green-600'
      case 'rest':
        return 'from-gray-400 to-gray-600'
    }
  }

  const getCircleScale = () => {
    const totalTime =
      phase === 'inhale'
        ? pattern.inhale
        : phase === 'hold'
        ? pattern.hold
        : phase === 'exhale'
        ? pattern.exhale
        : pattern.rest

    const progress = 1 - timeLeft / totalTime

    if (phase === 'inhale') {
      return 0.3 + progress * 0.7 // Grandit de 30% à 100%
    } else if (phase === 'exhale') {
      return 1 - progress * 0.7 // Rétrécit de 100% à 30%
    }
    return 1 // Hold et rest restent à 100%
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 z-50 animate-fade-in" onClick={onClose} />

      {/* Modal content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Wind size={24} className="text-cyan-400" />
              Respiration Guidée
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Pattern selector */}
          <div className="flex gap-2">
            {breathingPatterns.map((p, index) => (
              <button
                key={index}
                onClick={() => handlePatternChange(index)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentPattern === index
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-300 text-center">{pattern.description}</p>

          {/* Animation circle */}
          <div className="relative flex items-center justify-center h-64">
            <div
              className={`absolute w-48 h-48 rounded-full bg-gradient-to-br ${getPhaseColor()} transition-transform duration-1000 ease-in-out flex items-center justify-center shadow-2xl`}
              style={{
                transform: `scale(${getCircleScale()})`,
                boxShadow: isActive
                  ? `0 0 60px rgba(96, 165, 250, ${getCircleScale() * 0.5})`
                  : '0 0 20px rgba(96, 165, 250, 0.3)',
              }}
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{timeLeft}</div>
                <div className="text-lg text-white/90">{getPhaseText()}</div>
              </div>
            </div>
          </div>

          {/* Cycle count */}
          <div className="text-center text-gray-400 text-sm">
            Cycles complétés : {cycleCount}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={handleToggle}
              className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white'
              }`}
            >
              {isActive ? (
                <>
                  <Pause size={20} />
                  Pause
                </>
              ) : (
                <>
                  <Play size={20} />
                  Démarrer
                </>
              )}
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-6 py-4 rounded-lg transition-all flex items-center gap-2 ${
                soundEnabled
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-gray-500'
              }`}
              title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>

          {/* Frequency info */}
          <div className="bg-slate-800/50 rounded-lg p-3 text-sm text-gray-300">
            <p className="font-semibold mb-1">🎵 Fréquence : {pattern.frequency} Hz</p>
            <p className="text-xs text-gray-400">
              {pattern.frequency === 432 && 'Harmonie naturelle et relaxation'}
              {pattern.frequency === 396 && 'Libération du stress et des peurs'}
              {pattern.frequency === 528 && 'Transformation et réparation'}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
