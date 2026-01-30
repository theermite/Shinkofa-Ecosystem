/**
 * TrackingFocus Widget
 * Track and follow moving objects with your cursor
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { ermiteTheme } from '../../../shared/theme'
import type { DifficultyLevel, WidgetScore, WidgetCallbacks } from '../../../shared/types'
import { submitScore } from '../../../shared/api/client'

type GamePhase = 'idle' | 'playing' | 'complete'

interface Target {
  x: number
  y: number
  vx: number
  vy: number
}

interface TrackingFocusProps extends WidgetCallbacks {
  difficulty?: DifficultyLevel
  userId?: string
  autoSubmitScore?: boolean
  gameDuration?: number
}

const WIDGET_ID = 'tracking-focus'
const WIDGET_NAME = 'Tracking Focus'

const GAME_WIDTH = 400
const GAME_HEIGHT = 400
const TARGET_SIZE = 50
const TRACKING_THRESHOLD = 30

export function TrackingFocus({
  difficulty: initialDifficulty = 'medium' as DifficultyLevel,
  userId,
  autoSubmitScore = true,
  gameDuration = 30,
  onComplete,
  onProgress,
  onError,
}: TrackingFocusProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty)
  const [target, setTarget] = useState<Target>({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: 2, vy: 2 })
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [isTracking, setIsTracking] = useState(false)
  const [trackingTime, setTrackingTime] = useState(0)
  const [timeLeft, setTimeLeft] = useState(gameDuration)
  const [score, setScore] = useState(0)

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef<string>('')
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const trackingTimeRef = useRef(0)
  const totalTimeRef = useRef(0)

  const theme = ermiteTheme

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const getSettings = useCallback(() => {
    switch (difficulty) {
      case 'easy': return { speed: 2, acceleration: 0.02, directionChange: 0.02 }
      case 'medium': return { speed: 3, acceleration: 0.03, directionChange: 0.04 }
      case 'hard': return { speed: 4, acceleration: 0.04, directionChange: 0.06 }
      case 'expert': return { speed: 5, acceleration: 0.05, directionChange: 0.08 }
      default: return { speed: 3, acceleration: 0.03, directionChange: 0.04 }
    }
  }, [difficulty])

  const startGame = useCallback(() => {
    startedAtRef.current = new Date().toISOString()
    setScore(0)
    setTrackingTime(0)
    setTimeLeft(gameDuration)
    setIsTracking(false)
    trackingTimeRef.current = 0
    totalTimeRef.current = 0

    const settings = getSettings()
    setTarget({
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      vx: (Math.random() - 0.5) * settings.speed * 2,
      vy: (Math.random() - 0.5) * settings.speed * 2,
    })

    setGamePhase('playing')

    // Game loop
    gameLoopRef.current = setInterval(() => {
      const settings = getSettings()
      totalTimeRef.current += 16

      setTarget(prev => {
        let { x, y, vx, vy } = prev

        // Random direction changes
        if (Math.random() < settings.directionChange) {
          vx += (Math.random() - 0.5) * settings.acceleration * 50
          vy += (Math.random() - 0.5) * settings.acceleration * 50
        }

        // Speed limit
        const speed = Math.sqrt(vx * vx + vy * vy)
        const maxSpeed = settings.speed * 1.5
        if (speed > maxSpeed) {
          vx = (vx / speed) * maxSpeed
          vy = (vy / speed) * maxSpeed
        }

        // Move
        x += vx
        y += vy

        // Bounce off walls
        if (x <= TARGET_SIZE / 2 || x >= GAME_WIDTH - TARGET_SIZE / 2) {
          vx = -vx * 0.9
          x = Math.max(TARGET_SIZE / 2, Math.min(GAME_WIDTH - TARGET_SIZE / 2, x))
        }
        if (y <= TARGET_SIZE / 2 || y >= GAME_HEIGHT - TARGET_SIZE / 2) {
          vy = -vy * 0.9
          y = Math.max(TARGET_SIZE / 2, Math.min(GAME_HEIGHT - TARGET_SIZE / 2, y))
        }

        return { x, y, vx, vy }
      })
    }, 16)

    // Timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleGameComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [gameDuration, getSettings])

  // Check if cursor is tracking target
  useEffect(() => {
    if (gamePhase !== 'playing') return

    const dx = cursorPos.x - target.x
    const dy = cursorPos.y - target.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const tracking = distance < TRACKING_THRESHOLD + TARGET_SIZE / 2

    setIsTracking(tracking)

    if (tracking) {
      trackingTimeRef.current += 16
      setTrackingTime(Math.floor(trackingTimeRef.current / 1000 * 10) / 10)
      const points = Math.round(getDifficultyMultiplier())
      setScore(s => s + points)
    }
  }, [cursorPos, target, gamePhase])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gamePhase !== 'playing' || !gameAreaRef.current) return
    const rect = gameAreaRef.current.getBoundingClientRect()
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gamePhase !== 'playing' || !gameAreaRef.current) return
    e.preventDefault()
    const rect = gameAreaRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    setCursorPos({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    })
  }

  const getDifficultyMultiplier = (): number => {
    switch (difficulty) {
      case 'easy': return 1
      case 'medium': return 1.5
      case 'hard': return 2
      case 'expert': return 3
      default: return 1.5
    }
  }

  const handleGameComplete = async () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    setGamePhase('complete')

    const trackingPercentage = totalTimeRef.current > 0
      ? Math.round((trackingTimeRef.current / totalTimeRef.current) * 100)
      : 0

    const finalScore = Math.round(score * (1 + trackingPercentage / 100))

    const widgetScore: WidgetScore = {
      widgetId: WIDGET_ID,
      widgetName: WIDGET_NAME,
      userId,
      score: finalScore,
      metrics: {
        trackingTime: Math.round(trackingTimeRef.current / 100) / 10,
        trackingPercentage,
        difficulty,
      },
      difficulty,
      completedAt: new Date().toISOString(),
      duration: Date.now() - new Date(startedAtRef.current).getTime(),
    }

    if (autoSubmitScore && userId) {
      const result = await submitScore(widgetScore)
      if (!result.success && onError) {
        onError(new Error(result.error || 'Score submission failed'))
      }
    }

    if (onComplete) onComplete(widgetScore)
  }

  const resetGame = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    setGamePhase('idle')
    setScore(0)
    setTrackingTime(0)
    setTimeLeft(gameDuration)
    setIsTracking(false)
  }

  const styles = {
    container: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      padding: '1rem',
      fontFamily: theme.fontFamily,
      borderRadius: theme.borderRadius,
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '0.5rem',
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
    },
    difficultyPanel: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius,
      padding: '1rem',
      marginBottom: '1rem',
    },
    difficultyGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.5rem',
    },
    difficultyBtn: (isActive: boolean, color: string) => ({
      padding: '0.5rem',
      borderRadius: theme.borderRadius,
      fontWeight: 600,
      cursor: 'pointer',
      border: 'none',
      backgroundColor: isActive ? color : theme.colors.card,
      color: theme.colors.text,
      fontSize: '0.85rem',
      fontFamily: theme.fontFamily,
    }),
    timerBar: {
      height: '6px',
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: '3px',
      marginBottom: '0.5rem',
      overflow: 'hidden',
    },
    timerFill: {
      height: '100%',
      backgroundColor: timeLeft > 10 ? theme.colors.primary : theme.colors.error,
      width: `${(timeLeft / gameDuration) * 100}%`,
      transition: 'width 1s linear',
    },
    gameArea: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    canvas: {
      width: `${GAME_WIDTH}px`,
      maxWidth: '100%',
      height: `${GAME_HEIGHT}px`,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius,
      position: 'relative' as const,
      overflow: 'hidden',
      cursor: 'none',
      touchAction: 'none',
    },
    target: {
      position: 'absolute' as const,
      left: `${target.x - TARGET_SIZE / 2}px`,
      top: `${target.y - TARGET_SIZE / 2}px`,
      width: `${TARGET_SIZE}px`,
      height: `${TARGET_SIZE}px`,
      borderRadius: '50%',
      backgroundColor: isTracking ? theme.colors.success : theme.colors.primary,
      border: `3px solid ${isTracking ? theme.colors.success : theme.colors.accent}`,
      boxShadow: isTracking ? `0 0 20px ${theme.colors.success}` : 'none',
      transition: 'background-color 0.1s, box-shadow 0.1s',
    },
    cursor: {
      position: 'absolute' as const,
      left: `${cursorPos.x - 8}px`,
      top: `${cursorPos.y - 8}px`,
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      backgroundColor: 'transparent',
      border: `2px solid ${theme.colors.text}`,
      pointerEvents: 'none' as const,
    },
    statsPanel: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius,
      padding: '0.75rem',
      marginTop: '0.5rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '0.5rem',
      textAlign: 'center' as const,
    },
    statLabel: {
      fontSize: '0.7rem',
      color: theme.colors.textSecondary,
    },
    statValue: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
    },
    actionBtn: (isPrimary: boolean) => ({
      padding: '0.75rem 1.5rem',
      borderRadius: theme.borderRadius,
      fontWeight: 600,
      cursor: 'pointer',
      border: 'none',
      backgroundColor: isPrimary ? theme.colors.primary : theme.colors.card,
      color: theme.colors.text,
      fontFamily: theme.fontFamily,
      marginTop: '0.5rem',
    }),
    completeOverlay: {
      position: 'absolute' as const,
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius,
    },
    trackingIndicator: {
      position: 'absolute' as const,
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '0.25rem 0.75rem',
      borderRadius: theme.borderRadius,
      backgroundColor: isTracking ? theme.colors.success : theme.colors.error,
      fontSize: '0.8rem',
      fontWeight: 'bold',
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Tracking Focus</h2>
      </div>

      {gamePhase === 'idle' && (
        <div style={styles.difficultyPanel}>
          <p style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
            Difficulte :
          </p>
          <div style={styles.difficultyGrid}>
            {(['easy', 'medium', 'hard', 'expert'] as DifficultyLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                style={styles.difficultyBtn(
                  difficulty === level,
                  level === 'easy' ? theme.colors.success :
                  level === 'medium' ? theme.colors.primary :
                  level === 'hard' ? theme.colors.warning :
                  theme.colors.error
                )}
              >
                {level === 'easy' && 'Facile'}
                {level === 'medium' && 'Moyen'}
                {level === 'hard' && 'Dur'}
                {level === 'expert' && 'Expert'}
              </button>
            ))}
          </div>
        </div>
      )}

      {gamePhase === 'playing' && (
        <div style={styles.timerBar}>
          <div style={styles.timerFill} />
        </div>
      )}

      <div style={styles.gameArea}>
        <div
          ref={gameAreaRef}
          style={styles.canvas}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
        >
          {gamePhase === 'playing' && (
            <>
              <div style={styles.trackingIndicator}>
                {isTracking ? 'TRACKING' : 'LOST'}
              </div>
              <div style={styles.target} />
              <div style={styles.cursor} />
            </>
          )}

          {gamePhase === 'complete' && (
            <div style={styles.completeOverlay}>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.success }}>
                Termine !
              </p>
              <p style={{ color: theme.colors.textSecondary, marginTop: '0.5rem' }}>
                Temps suivi : {trackingTime}s
              </p>
            </div>
          )}

          {gamePhase === 'idle' && (
            <div style={{ ...styles.completeOverlay, backgroundColor: 'transparent' }}>
              <p style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: '1rem' }}>
                Suivez la cible avec votre curseur
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={styles.statsPanel}>
        <div style={styles.statsGrid}>
          <div>
            <div style={styles.statLabel}>Temps</div>
            <div style={styles.statValue}>{timeLeft}s</div>
          </div>
          <div>
            <div style={styles.statLabel}>Suivi</div>
            <div style={{ ...styles.statValue, color: theme.colors.success }}>{trackingTime}s</div>
          </div>
          <div>
            <div style={styles.statLabel}>Score</div>
            <div style={{ ...styles.statValue, color: theme.colors.primary }}>{score}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {(gamePhase === 'idle' || gamePhase === 'complete') && (
          <button onClick={startGame} style={styles.actionBtn(true)}>
            {gamePhase === 'idle' ? 'Jouer' : 'Rejouer'}
          </button>
        )}
      </div>
    </div>
  )
}

export default TrackingFocus
