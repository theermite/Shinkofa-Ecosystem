/**
 * Reaction Time Widget
 * Measure reaction speed - Click when the button turns green
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { ermiteTheme } from '../../../shared/theme'
import type {
  DifficultyLevel,
  WidgetScore,
  ReactionTimeResult,
  ReactionTimeStats,
  WidgetCallbacks
} from '../../../shared/types'
import { submitScore } from '../../../shared/api/client'

type GamePhase = 'idle' | 'waiting' | 'ready' | 'tooEarly' | 'result'

interface ReactionTimeProps extends WidgetCallbacks {
  totalAttempts?: number
  difficulty?: DifficultyLevel
  userId?: string
  autoSubmitScore?: boolean
}

const WIDGET_ID = 'reaction-time'
const WIDGET_NAME = 'Reaction Time'

export function ReactionTime({
  totalAttempts = 5,
  difficulty: initialDifficulty = 'medium' as DifficultyLevel,
  userId,
  autoSubmitScore = true,
  onComplete,
  onProgress,
  onError,
}: ReactionTimeProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle')
  const [currentAttempt, setCurrentAttempt] = useState(0)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty)
  const [stats, setStats] = useState<ReactionTimeStats>({
    attempts: [],
    averageTime: 0,
    fastestTime: 0,
    slowestTime: 0,
    consistency: 0,
  })

  const startTimeRef = useRef<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedAtRef = useRef<string>('')

  const theme = ermiteTheme

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const getDifficultyDelays = useCallback((): { min: number; max: number } => {
    switch (difficulty) {
      case 'easy': return { min: 2000, max: 5000 }
      case 'medium': return { min: 1500, max: 4000 }
      case 'hard': return { min: 1000, max: 3000 }
      case 'expert': return { min: 500, max: 2000 }
      default: return { min: 1500, max: 4000 }
    }
  }, [difficulty])

  const calculateStats = (attempts: ReactionTimeResult[]): ReactionTimeStats => {
    if (attempts.length === 0) {
      return { attempts: [], averageTime: 0, fastestTime: 0, slowestTime: 0, consistency: 0 }
    }

    const times = attempts.map(a => a.reactionTime)
    const averageTime = times.reduce((a, b) => a + b, 0) / times.length
    const fastestTime = Math.min(...times)
    const slowestTime = Math.max(...times)
    const variance = times.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / times.length
    const consistency = Math.sqrt(variance)

    return { attempts, averageTime, fastestTime, slowestTime, consistency }
  }

  const handleComplete = async (finalStats: ReactionTimeStats) => {
    const score: WidgetScore = {
      widgetId: WIDGET_ID,
      widgetName: WIDGET_NAME,
      userId,
      score: Math.max(0, 500 - Math.round(finalStats.averageTime / 2)),
      metrics: {
        averageTime: finalStats.averageTime,
        fastestTime: finalStats.fastestTime,
        slowestTime: finalStats.slowestTime,
        consistency: finalStats.consistency,
        totalAttempts: finalStats.attempts.length,
      },
      difficulty,
      completedAt: new Date().toISOString(),
      duration: Date.now() - new Date(startedAtRef.current).getTime(),
    }

    if (autoSubmitScore && userId) {
      const result = await submitScore(score)
      if (!result.success && onError) {
        onError(new Error(result.error || 'Score submission failed'))
      }
    }

    if (onComplete) onComplete(score)
  }

  const startTest = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (currentAttempt === 0) startedAtRef.current = new Date().toISOString()

    setGamePhase('waiting')
    const delays = getDifficultyDelays()
    const delay = Math.random() * (delays.max - delays.min) + delays.min

    timeoutRef.current = setTimeout(() => {
      setGamePhase('ready')
      startTimeRef.current = Date.now()
    }, delay)
  }

  const handleClick = () => {
    if (gamePhase === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setGamePhase('tooEarly')
      return
    }

    if (gamePhase === 'ready') {
      const reactionTime = Date.now() - startTimeRef.current
      const newAttempt: ReactionTimeResult = { reactionTime, timestamp: Date.now() }
      const newAttempts = [...stats.attempts, newAttempt]
      const newStats = calculateStats(newAttempts)

      setStats(newStats)
      setCurrentAttempt(currentAttempt + 1)
      setGamePhase('result')

      if (onProgress) {
        onProgress({
          currentStep: currentAttempt + 1,
          totalSteps: totalAttempts,
          partialScore: Math.max(0, 500 - Math.round(newStats.averageTime / 2)),
          metrics: { lastReactionTime: reactionTime },
        })
      }

      if (currentAttempt + 1 >= totalAttempts) {
        handleComplete(newStats)
      } else {
        setTimeout(() => startTest(), 800)
      }
    }
  }

  const resetGame = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setGamePhase('idle')
    setCurrentAttempt(0)
    setStats({ attempts: [], averageTime: 0, fastestTime: 0, slowestTime: 0, consistency: 0 })
  }

  const getPhaseColor = (): string => {
    switch (gamePhase) {
      case 'waiting': return theme.colors.error
      case 'ready': return theme.colors.success
      case 'tooEarly': return theme.colors.warning
      default: return theme.colors.primary
    }
  }

  const getPhaseText = (): string => {
    switch (gamePhase) {
      case 'idle': return 'Cliquez pour commencer'
      case 'waiting': return 'Attendez...'
      case 'ready': return 'CLIQUEZ MAINTENANT !'
      case 'tooEarly': return 'Trop tot ! Attendez le vert'
      case 'result': return `${stats.attempts[stats.attempts.length - 1]?.reactionTime}ms`
    }
  }

  const styles = {
    container: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      padding: '1.5rem',
      fontFamily: theme.fontFamily,
      borderRadius: theme.borderRadius,
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '1.5rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: theme.colors.textSecondary,
    },
    difficultyPanel: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius,
      padding: '1rem',
      marginBottom: '1.5rem',
    },
    difficultyGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.5rem',
    },
    difficultyBtn: (isActive: boolean, color: string) => ({
      padding: '0.75rem',
      borderRadius: theme.borderRadius,
      fontWeight: 600,
      cursor: 'pointer',
      border: 'none',
      backgroundColor: isActive ? color : theme.colors.card,
      color: theme.colors.text,
      transition: 'transform 0.15s, background-color 0.15s',
      transform: isActive ? 'scale(1.05)' : 'scale(1)',
    }),
    reactionArea: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem',
      minHeight: '300px',
    },
    reactionButton: {
      width: '100%',
      maxWidth: '600px',
      height: '100%',
      minHeight: '250px',
      borderRadius: theme.borderRadius,
      backgroundColor: getPhaseColor(),
      border: 'none',
      cursor: gamePhase !== 'result' ? 'pointer' : 'default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#fff',
      transition: 'transform 0.15s, background-color 0.15s',
      fontFamily: theme.fontFamily,
    },
    statsPanel: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius,
      padding: '1rem',
      marginBottom: '1rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      textAlign: 'center' as const,
    },
    statLabel: {
      fontSize: '0.75rem',
      color: theme.colors.textSecondary,
    },
    statValue: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
    },
    actionBtn: (isPrimary: boolean) => ({
      flex: 1,
      padding: '0.75rem 1.5rem',
      borderRadius: theme.borderRadius,
      fontWeight: 600,
      cursor: 'pointer',
      border: 'none',
      backgroundColor: isPrimary ? theme.colors.primary : theme.colors.card,
      color: theme.colors.text,
      transition: 'opacity 0.15s',
      fontFamily: theme.fontFamily,
    }),
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Reaction Time</h2>
        <p style={styles.subtitle}>
          Tentative {currentAttempt + 1} / {totalAttempts}
        </p>
      </div>

      {/* Difficulty Selector */}
      {gamePhase === 'idle' && (
        <div style={styles.difficultyPanel}>
          <p style={{ textAlign: 'center', marginBottom: '0.75rem', fontWeight: 600 }}>
            Niveau de difficulte :
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
                {level === 'hard' && 'Difficile'}
                {level === 'expert' && 'Expert'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reaction Area */}
      <div style={styles.reactionArea}>
        <button
          onClick={handleClick}
          disabled={gamePhase === 'result'}
          style={styles.reactionButton}
        >
          {getPhaseText()}
        </button>
      </div>

      {/* Stats */}
      {stats.attempts.length > 0 && (
        <div style={styles.statsPanel}>
          <div style={styles.statsGrid}>
            <div>
              <div style={styles.statLabel}>Moyenne</div>
              <div style={styles.statValue}>{Math.round(stats.averageTime)}ms</div>
            </div>
            <div>
              <div style={styles.statLabel}>Plus rapide</div>
              <div style={{ ...styles.statValue, color: theme.colors.success }}>
                {Math.round(stats.fastestTime)}ms
              </div>
            </div>
            <div>
              <div style={styles.statLabel}>Plus lent</div>
              <div style={{ ...styles.statValue, color: theme.colors.warning }}>
                {Math.round(stats.slowestTime)}ms
              </div>
            </div>
            <div>
              <div style={styles.statLabel}>Regularite</div>
              <div style={styles.statValue}>±{Math.round(stats.consistency)}ms</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {gamePhase === 'idle' && (
          <button onClick={startTest} style={styles.actionBtn(true)}>
            Demarrer le Test
          </button>
        )}
        {currentAttempt >= totalAttempts && (
          <button onClick={resetGame} style={styles.actionBtn(false)}>
            Recommencer
          </button>
        )}
        {gamePhase === 'tooEarly' && (
          <button
            onClick={() => setGamePhase('idle')}
            style={{ ...styles.actionBtn(false), backgroundColor: theme.colors.warning }}
          >
            Reessayer
          </button>
        )}
      </div>
    </div>
  )
}

export default ReactionTime
