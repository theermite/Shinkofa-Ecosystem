/**
 * PeripheralVision Widget
 * Train peripheral vision by identifying targets at screen edges
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { ermiteTheme } from '../../../shared/theme'
import type { DifficultyLevel, WidgetScore, WidgetCallbacks } from '../../../shared/types'
import { submitScore } from '../../../shared/api/client'

type GamePhase = 'idle' | 'focus' | 'flash' | 'answer' | 'result' | 'complete'

interface PeripheralVisionProps extends WidgetCallbacks {
  difficulty?: DifficultyLevel
  userId?: string
  autoSubmitScore?: boolean
  totalRounds?: number
}

const WIDGET_ID = 'peripheral-vision'
const WIDGET_NAME = 'Peripheral Vision'

const SYMBOLS = ['▲', '■', '●', '◆', '★', '✦', '♦', '♠']

export function PeripheralVision({
  difficulty: initialDifficulty = 'medium' as DifficultyLevel,
  userId,
  autoSubmitScore = true,
  totalRounds = 10,
  onComplete,
  onProgress,
  onError,
}: PeripheralVisionProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty)
  const [currentRound, setCurrentRound] = useState(0)
  const [targetSymbol, setTargetSymbol] = useState('')
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 })
  const [showTarget, setShowTarget] = useState(false)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedAtRef = useRef<string>('')

  const theme = ermiteTheme

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const getSettings = useCallback(() => {
    switch (difficulty) {
      case 'easy': return { flashDuration: 500, distance: 150, focusTime: 1500 }
      case 'medium': return { flashDuration: 350, distance: 200, focusTime: 1200 }
      case 'hard': return { flashDuration: 250, distance: 250, focusTime: 1000 }
      case 'expert': return { flashDuration: 150, distance: 300, focusTime: 800 }
      default: return { flashDuration: 350, distance: 200, focusTime: 1200 }
    }
  }, [difficulty])

  const generateTarget = useCallback(() => {
    const settings = getSettings()
    const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    const angle = Math.random() * Math.PI * 2
    const distance = settings.distance * (0.7 + Math.random() * 0.3)

    return {
      symbol,
      position: {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      },
    }
  }, [getSettings])

  const startGame = useCallback(() => {
    startedAtRef.current = new Date().toISOString()
    setScore(0)
    setCorrect(0)
    setCurrentRound(0)
    setLastResult(null)
    startRound()
  }, [])

  const startRound = useCallback(() => {
    setGamePhase('focus')
    setShowTarget(false)
    const settings = getSettings()

    timeoutRef.current = setTimeout(() => {
      const target = generateTarget()
      setTargetSymbol(target.symbol)
      setTargetPosition(target.position)
      setShowTarget(true)
      setGamePhase('flash')

      timeoutRef.current = setTimeout(() => {
        setShowTarget(false)
        setGamePhase('answer')
      }, settings.flashDuration)
    }, settings.focusTime)
  }, [getSettings, generateTarget])

  const handleAnswer = (selectedSymbol: string) => {
    if (gamePhase !== 'answer') return

    const isCorrect = selectedSymbol === targetSymbol
    setLastResult(isCorrect ? 'correct' : 'wrong')
    setGamePhase('result')

    if (isCorrect) {
      const roundScore = 100 * getDifficultyMultiplier()
      setScore(s => s + roundScore)
      setCorrect(c => c + 1)
    }

    const nextRound = currentRound + 1
    setCurrentRound(nextRound)

    if (onProgress) {
      onProgress({
        currentStep: nextRound,
        totalSteps: totalRounds,
        partialScore: score + (isCorrect ? 100 * getDifficultyMultiplier() : 0),
        metrics: { correct: correct + (isCorrect ? 1 : 0), round: nextRound },
      })
    }

    timeoutRef.current = setTimeout(() => {
      if (nextRound >= totalRounds) {
        handleGameComplete()
      } else {
        startRound()
      }
    }, 1000)
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
    setGamePhase('complete')
    const accuracy = Math.round((correct / totalRounds) * 100)
    const finalScore = Math.round(score * (1 + accuracy / 200))

    const widgetScore: WidgetScore = {
      widgetId: WIDGET_ID,
      widgetName: WIDGET_NAME,
      userId,
      score: finalScore,
      metrics: {
        correct,
        totalRounds,
        accuracy,
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
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setGamePhase('idle')
    setCurrentRound(0)
    setScore(0)
    setCorrect(0)
    setShowTarget(false)
    setLastResult(null)
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
      marginBottom: '1rem',
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
      marginBottom: '1rem',
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
      transition: 'transform 0.15s',
      transform: isActive ? 'scale(1.05)' : 'scale(1)',
      fontFamily: theme.fontFamily,
    }),
    gameArea: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as const,
      minHeight: '300px',
    },
    focusPoint: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: theme.colors.primary,
      boxShadow: `0 0 20px ${theme.colors.primary}`,
    },
    target: {
      position: 'absolute' as const,
      fontSize: '2.5rem',
      color: theme.colors.accent,
      transform: `translate(${targetPosition.x}px, ${targetPosition.y}px)`,
      opacity: showTarget ? 1 : 0,
      transition: 'opacity 0.1s',
    },
    answerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.5rem',
      marginTop: '1rem',
    },
    answerBtn: {
      padding: '1rem',
      fontSize: '1.5rem',
      borderRadius: theme.borderRadius,
      backgroundColor: theme.colors.card,
      border: 'none',
      cursor: 'pointer',
      transition: 'transform 0.15s, background-color 0.15s',
    },
    resultText: {
      position: 'absolute' as const,
      fontSize: '3rem',
      fontWeight: 'bold',
      color: lastResult === 'correct' ? theme.colors.success : theme.colors.error,
    },
    statsPanel: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius,
      padding: '1rem',
      marginTop: '1rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem',
      textAlign: 'center' as const,
    },
    statLabel: {
      fontSize: '0.75rem',
      color: theme.colors.textSecondary,
    },
    statValue: {
      fontSize: '1.25rem',
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
      marginTop: '1rem',
    }),
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Peripheral Vision</h2>
        <p style={styles.subtitle}>
          {gamePhase === 'idle' ? 'Fixez le centre et identifiez le symbole' :
           gamePhase === 'focus' ? 'Fixez le point central...' :
           gamePhase === 'flash' ? '!' :
           gamePhase === 'answer' ? 'Quel symbole avez-vous vu ?' :
           gamePhase === 'result' ? (lastResult === 'correct' ? 'Correct !' : 'Incorrect') :
           'Termine !'}
        </p>
      </div>

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

      <div style={styles.gameArea}>
        {(gamePhase === 'focus' || gamePhase === 'flash') && (
          <>
            <div style={styles.focusPoint} />
            <div style={styles.target}>{targetSymbol}</div>
          </>
        )}

        {gamePhase === 'result' && (
          <div style={styles.resultText}>
            {lastResult === 'correct' ? '✓' : '✗'}
          </div>
        )}

        {gamePhase === 'complete' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.success }}>
              Termine !
            </p>
            <p style={{ color: theme.colors.textSecondary, marginTop: '0.5rem' }}>
              Precision : {Math.round((correct / totalRounds) * 100)}%
            </p>
          </div>
        )}
      </div>

      {gamePhase === 'answer' && (
        <div style={styles.answerGrid}>
          {SYMBOLS.map((symbol) => (
            <button
              key={symbol}
              onClick={() => handleAnswer(symbol)}
              style={styles.answerBtn}
            >
              {symbol}
            </button>
          ))}
        </div>
      )}

      <div style={styles.statsPanel}>
        <div style={styles.statsGrid}>
          <div>
            <div style={styles.statLabel}>Round</div>
            <div style={styles.statValue}>{currentRound} / {totalRounds}</div>
          </div>
          <div>
            <div style={styles.statLabel}>Correct</div>
            <div style={{ ...styles.statValue, color: theme.colors.success }}>{correct}</div>
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
            {gamePhase === 'idle' ? 'Commencer' : 'Rejouer'}
          </button>
        )}
      </div>
    </div>
  )
}

export default PeripheralVision
