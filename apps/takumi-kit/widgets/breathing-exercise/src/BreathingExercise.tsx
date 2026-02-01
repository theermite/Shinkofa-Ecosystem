/**
 * Breathing Exercise Widget
 * Guided breathing with animation and therapeutic frequencies
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState, useEffect, useRef } from 'react'
import { ermiteTheme } from '../../../shared/theme'
import { DifficultyLevel, type WidgetScore, type WidgetCallbacks } from '../../../shared/types'
import { submitScore } from '../../../shared/api/client'

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest'

interface BreathingPattern {
  name: string
  description: string
  inhale: number
  hold: number
  exhale: number
  rest: number
  frequency: number
}

interface BreathingExerciseProps extends WidgetCallbacks {
  userId?: string
  autoSubmitScore?: boolean
}

const WIDGET_ID = 'breathing-exercise'
const WIDGET_NAME = 'Breathing Exercise'

const PATTERNS: BreathingPattern[] = [
  {
    name: 'Coherence',
    description: '5s inspiration / 5s expiration',
    inhale: 5, hold: 0, exhale: 5, rest: 0,
    frequency: 432,
  },
  {
    name: 'Relaxation 4-7-8',
    description: 'Calme profond et sommeil',
    inhale: 4, hold: 7, exhale: 8, rest: 0,
    frequency: 396,
  },
  {
    name: 'Energisant',
    description: "Boost d'energie",
    inhale: 4, hold: 4, exhale: 4, rest: 4,
    frequency: 528,
  },
]

export function BreathingExercise({
  userId,
  autoSubmitScore = true,
  onComplete,
  onProgress,
  onError,
}: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false)
  const [patternIndex, setPatternIndex] = useState(0)
  const [phase, setPhase] = useState<BreathPhase>('inhale')
  const [timeLeft, setTimeLeft] = useState(PATTERNS[0].inhale)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [cycleCount, setCycleCount] = useState(0)
  const [startTime, setStartTime] = useState(0)

  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  const pattern = PATTERNS[patternIndex]
  const theme = ermiteTheme

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
      gainNodeRef.current.gain.value = 0
    }
    return () => {
      oscillatorRef.current?.stop()
      audioContextRef.current?.close()
    }
  }, [])

  // Sound control
  useEffect(() => {
    if (!audioContextRef.current || !gainNodeRef.current) return

    if (isActive && soundEnabled) {
      if (!oscillatorRef.current) {
        oscillatorRef.current = audioContextRef.current.createOscillator()
        oscillatorRef.current.type = 'sine'
        oscillatorRef.current.frequency.value = pattern.frequency
        oscillatorRef.current.connect(gainNodeRef.current)
        oscillatorRef.current.start()
      }
      const targetVolume = phase === 'exhale' ? 0.1 : 0.05
      gainNodeRef.current.gain.setTargetAtTime(targetVolume, audioContextRef.current.currentTime, 0.3)
    } else if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.3)
    }
  }, [isActive, soundEnabled, phase, pattern.frequency])

  // Breathing cycle
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          let nextPhase: BreathPhase = 'inhale'
          let nextTime = pattern.inhale

          if (phase === 'inhale') {
            if (pattern.hold > 0) { nextPhase = 'hold'; nextTime = pattern.hold }
            else { nextPhase = 'exhale'; nextTime = pattern.exhale }
          } else if (phase === 'hold') {
            nextPhase = 'exhale'; nextTime = pattern.exhale
          } else if (phase === 'exhale') {
            if (pattern.rest > 0) { nextPhase = 'rest'; nextTime = pattern.rest }
            else { nextPhase = 'inhale'; nextTime = pattern.inhale; setCycleCount(c => c + 1) }
          } else {
            nextPhase = 'inhale'; nextTime = pattern.inhale; setCycleCount(c => c + 1)
          }

          setPhase(nextPhase)
          if (onProgress) {
            onProgress({
              currentStep: cycleCount,
              totalSteps: 0,
              metrics: { phase: nextPhase, cycles: cycleCount },
            })
          }
          return nextTime
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, phase, pattern, cycleCount])

  const handleToggle = async () => {
    if (!isActive) {
      setPhase('inhale')
      setTimeLeft(pattern.inhale)
      setCycleCount(0)
      setStartTime(Date.now())
    } else {
      const duration = Date.now() - startTime
      const score: WidgetScore = {
        widgetId: WIDGET_ID,
        widgetName: WIDGET_NAME,
        userId,
        score: cycleCount * 100,
        metrics: { cycles: cycleCount, durationMs: duration, pattern: pattern.name },
        difficulty: DifficultyLevel.MEDIUM,
        completedAt: new Date().toISOString(),
        duration,
      }

      if (autoSubmitScore && userId) {
        const result = await submitScore(score)
        if (!result.success && onError) onError(new Error(result.error || 'Failed'))
      }
      if (onComplete) onComplete(score)
    }
    setIsActive(!isActive)
  }

  const handlePatternChange = (index: number) => {
    setPatternIndex(index)
    setIsActive(false)
    setPhase('inhale')
    setTimeLeft(PATTERNS[index].inhale)
    setCycleCount(0)
    if (oscillatorRef.current) oscillatorRef.current.frequency.value = PATTERNS[index].frequency
  }

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Inspire'
      case 'hold': return 'Retiens'
      case 'exhale': return 'Expire'
      case 'rest': return 'Pause'
    }
  }

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return '#3b82f6'
      case 'hold': return '#8b5cf6'
      case 'exhale': return '#10b981'
      case 'rest': return '#6b7280'
    }
  }

  const getCircleScale = () => {
    const totalTime = phase === 'inhale' ? pattern.inhale :
      phase === 'hold' ? pattern.hold :
      phase === 'exhale' ? pattern.exhale : pattern.rest
    const progress = 1 - timeLeft / totalTime

    if (phase === 'inhale') return 0.3 + progress * 0.7
    if (phase === 'exhale') return 1 - progress * 0.7
    return 1
  }

  const styles = {
    container: {
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      borderRadius: theme.borderRadius,
      padding: '1.5rem',
      fontFamily: theme.fontFamily,
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
    },
    header: { fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' as const },
    patternSelector: { display: 'flex', gap: '0.5rem' },
    patternBtn: (active: boolean) => ({
      flex: 1,
      padding: '0.5rem',
      borderRadius: theme.borderRadius,
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '0.75rem',
      backgroundColor: active ? theme.colors.accent : theme.colors.card,
      color: theme.colors.text,
      transition: 'all 0.2s',
    }),
    circleContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
    },
    circle: {
      width: '180px',
      height: '180px',
      borderRadius: '50%',
      backgroundColor: getPhaseColor(),
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${getCircleScale()})`,
      transition: 'transform 1s ease-in-out, background-color 0.5s',
      boxShadow: `0 0 ${isActive ? 60 : 20}px ${getPhaseColor()}80`,
    },
    timeText: { fontSize: '3rem', fontWeight: 'bold', color: '#fff' },
    phaseText: { fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)' },
    cycleText: { textAlign: 'center' as const, color: theme.colors.textSecondary, fontSize: '0.875rem' },
    controls: { display: 'flex', gap: '0.75rem' },
    playBtn: {
      flex: 1,
      padding: '1rem',
      borderRadius: theme.borderRadius,
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '1rem',
      backgroundColor: isActive ? theme.colors.warning : theme.colors.accent,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontFamily: theme.fontFamily,
    },
    soundBtn: {
      padding: '1rem',
      borderRadius: theme.borderRadius,
      border: 'none',
      cursor: 'pointer',
      backgroundColor: soundEnabled ? theme.colors.card : theme.colors.backgroundSecondary,
      color: theme.colors.text,
      opacity: soundEnabled ? 1 : 0.6,
      fontSize: '1.25rem',
    },
    infoBox: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius,
      padding: '0.75rem',
      fontSize: '0.875rem',
      color: theme.colors.textSecondary,
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>Respiration Guidee</div>

      <div style={styles.patternSelector}>
        {PATTERNS.map((p, i) => (
          <button key={i} onClick={() => handlePatternChange(i)} style={styles.patternBtn(patternIndex === i)}>
            {p.name}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', color: theme.colors.textSecondary, fontSize: '0.875rem' }}>
        {pattern.description}
      </div>

      <div style={styles.circleContainer}>
        <div style={styles.circle}>
          <div style={styles.timeText}>{timeLeft}</div>
          <div style={styles.phaseText}>{getPhaseText()}</div>
        </div>
      </div>

      <div style={styles.cycleText}>Cycles completes : {cycleCount}</div>

      <div style={styles.controls}>
        <button onClick={handleToggle} style={styles.playBtn}>
          {isActive ? '⏸ Pause' : '▶ Demarrer'}
        </button>
        <button onClick={() => setSoundEnabled(!soundEnabled)} style={styles.soundBtn}>
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <div style={styles.infoBox}>
        <strong>Frequence : {pattern.frequency} Hz</strong>
        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
          {pattern.frequency === 432 && 'Harmonie naturelle et relaxation'}
          {pattern.frequency === 396 && 'Liberation du stress et des peurs'}
          {pattern.frequency === 528 && 'Transformation et reparation'}
        </div>
      </div>
    </div>
  )
}

export default BreathingExercise
