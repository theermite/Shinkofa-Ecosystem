/**
 * PatternRecall Widget
 * Memorize and reproduce color patterns - Simon-style memory game
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { ermiteTheme } from '../../../shared/theme'
import type { DifficultyLevel, WidgetScore, WidgetCallbacks } from '../../../shared/types'
import { submitScore } from '../../../shared/api/client'

type GamePhase = 'idle' | 'showing' | 'input' | 'success' | 'failure' | 'complete'

interface PatternRecallProps extends WidgetCallbacks {
  difficulty?: DifficultyLevel
  userId?: string
  autoSubmitScore?: boolean
}

const WIDGET_ID = 'pattern-recall'
const WIDGET_NAME = 'Pattern Recall'

const COLORS = [
  { id: 0, color: '#ef4444', name: 'Rouge' },
  { id: 1, color: '#22c55e', name: 'Vert' },
  { id: 2, color: '#3b82f6', name: 'Bleu' },
  { id: 3, color: '#eab308', name: 'Jaune' },
]

export function PatternRecall({
  difficulty: initialDifficulty = 'medium' as DifficultyLevel,
  userId,
  autoSubmitScore = true,
  onComplete,
  onProgress,
  onError,
}: PatternRecallProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty)
  const [pattern, setPattern] = useState<number[]>([])
  const [userInput, setUserInput] = useState<number[]>([])
  const [currentLevel, setCurrentLevel] = useState(1)
  const [highlightedColor, setHighlightedColor] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [maxLevel, setMaxLevel] = useState(0)

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
      case 'easy': return { showTime: 800, pauseTime: 400, startLength: 2 }
      case 'medium': return { showTime: 600, pauseTime: 300, startLength: 3 }
      case 'hard': return { showTime: 400, pauseTime: 200, startLength: 4 }
      case 'expert': return { showTime: 300, pauseTime: 150, startLength: 5 }
      default: return { showTime: 600, pauseTime: 300, startLength: 3 }
    }
  }, [difficulty])

  const generatePattern = useCallback((length: number): number[] => {
    const newPattern: number[] = []
    for (let i = 0; i < length; i++) {
      newPattern.push(Math.floor(Math.random() * COLORS.length))
    }
    return newPattern
  }, [])

  const showPattern = useCallback(async (patternToShow: number[]) => {
    setGamePhase('showing')
    const settings = getSettings()

    for (let i = 0; i < patternToShow.length; i++) {
      await new Promise<void>(resolve => {
        timeoutRef.current = setTimeout(() => {
          setHighlightedColor(patternToShow[i])
          resolve()
        }, settings.pauseTime)
      })

      await new Promise<void>(resolve => {
        timeoutRef.current = setTimeout(() => {
          setHighlightedColor(null)
          resolve()
        }, settings.showTime)
      })
    }

    setGamePhase('input')
    setUserInput([])
  }, [getSettings])

  const startGame = useCallback(() => {
    startedAtRef.current = new Date().toISOString()
    setScore(0)
    setMaxLevel(0)
    setCurrentLevel(1)

    const settings = getSettings()
    const newPattern = generatePattern(settings.startLength)
    setPattern(newPattern)

    setTimeout(() => showPattern(newPattern), 500)
  }, [getSettings, generatePattern, showPattern])

  const handleColorClick = (colorId: number) => {
    if (gamePhase !== 'input') return

    setHighlightedColor(colorId)
    setTimeout(() => setHighlightedColor(null), 150)

    const newUserInput = [...userInput, colorId]
    setUserInput(newUserInput)

    const currentIndex = newUserInput.length - 1
    if (newUserInput[currentIndex] !== pattern[currentIndex]) {
      setGamePhase('failure')
      handleGameOver()
      return
    }

    if (newUserInput.length === pattern.length) {
      setGamePhase('success')
      const newLevel = currentLevel + 1
      const levelScore = pattern.length * 10 * getDifficultyMultiplier()
      const newScore = score + levelScore
      setScore(newScore)
      setMaxLevel(Math.max(maxLevel, currentLevel))

      if (onProgress) {
        onProgress({
          currentStep: currentLevel,
          totalSteps: 20,
          partialScore: newScore,
          metrics: { level: currentLevel, patternLength: pattern.length },
        })
      }

      setTimeout(() => {
        setCurrentLevel(newLevel)
        const newPattern = [...pattern, Math.floor(Math.random() * COLORS.length)]
        setPattern(newPattern)
        showPattern(newPattern)
      }, 1000)
    }
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

  const handleGameOver = async () => {
    const finalScore = score
    const finalMaxLevel = Math.max(maxLevel, currentLevel)

    const widgetScore: WidgetScore = {
      widgetId: WIDGET_ID,
      widgetName: WIDGET_NAME,
      userId,
      score: finalScore,
      metrics: {
        maxLevel: finalMaxLevel,
        patternLength: pattern.length,
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
    setPattern([])
    setUserInput([])
    setCurrentLevel(1)
    setScore(0)
    setHighlightedColor(null)
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
      fontFamily: theme.fontFamily,
    }),
    gameArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
    },
    colorGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      width: '100%',
      maxWidth: '300px',
    },
    colorButton: (color: string, isHighlighted: boolean) => ({
      aspectRatio: '1',
      borderRadius: theme.borderRadius,
      backgroundColor: color,
      border: 'none',
      cursor: gamePhase === 'input' ? 'pointer' : 'default',
      opacity: isHighlighted ? 1 : 0.6,
      transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
      transition: 'transform 0.15s, opacity 0.15s',
      boxShadow: isHighlighted ? '0 0 30px ' + color : 'none',
    }),
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
    message: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      textAlign: 'center' as const,
      padding: '1rem',
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
        <h2 style={styles.title}>Pattern Recall</h2>
        <p style={styles.subtitle}>
          {gamePhase === 'idle' ? 'Memorisez et reproduisez le pattern' :
           gamePhase === 'showing' ? 'Observez le pattern...' :
           gamePhase === 'input' ? 'A vous de jouer !' :
           gamePhase === 'success' ? 'Excellent !' :
           gamePhase === 'failure' ? 'Partie terminee !' : ''}
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
        <div style={styles.colorGrid}>
          {COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => handleColorClick(c.id)}
              style={styles.colorButton(c.color, highlightedColor === c.id)}
              disabled={gamePhase !== 'input'}
              aria-label={c.name}
            />
          ))}
        </div>

        {gamePhase === 'input' && (
          <p style={{ color: theme.colors.textSecondary }}>
            {userInput.length} / {pattern.length}
          </p>
        )}

        {gamePhase === 'failure' && (
          <div style={styles.message}>
            <p style={{ color: theme.colors.error }}>Game Over !</p>
            <p style={{ fontSize: '1rem', color: theme.colors.textSecondary, marginTop: '0.5rem' }}>
              Niveau atteint : {currentLevel}
            </p>
          </div>
        )}
      </div>

      <div style={styles.statsPanel}>
        <div style={styles.statsGrid}>
          <div>
            <div style={styles.statLabel}>Niveau</div>
            <div style={styles.statValue}>{currentLevel}</div>
          </div>
          <div>
            <div style={styles.statLabel}>Score</div>
            <div style={{ ...styles.statValue, color: theme.colors.primary }}>{score}</div>
          </div>
          <div>
            <div style={styles.statLabel}>Pattern</div>
            <div style={styles.statValue}>{pattern.length}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {gamePhase === 'idle' && (
          <button onClick={startGame} style={styles.actionBtn(true)}>
            Commencer
          </button>
        )}
        {gamePhase === 'failure' && (
          <button onClick={resetGame} style={styles.actionBtn(true)}>
            Rejouer
          </button>
        )}
      </div>
    </div>
  )
}

export default PatternRecall
