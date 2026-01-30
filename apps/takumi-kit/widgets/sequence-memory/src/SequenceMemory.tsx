/**
 * SequenceMemory Widget
 * Remember and reproduce sequences of highlighted tiles
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { ermiteTheme } from '../../../shared/theme'
import type { DifficultyLevel, WidgetScore, WidgetCallbacks } from '../../../shared/types'
import { submitScore } from '../../../shared/api/client'

type GamePhase = 'idle' | 'showing' | 'input' | 'success' | 'failure'

interface SequenceMemoryProps extends WidgetCallbacks {
  difficulty?: DifficultyLevel
  userId?: string
  autoSubmitScore?: boolean
}

const WIDGET_ID = 'sequence-memory'
const WIDGET_NAME = 'Sequence Memory'

export function SequenceMemory({
  difficulty: initialDifficulty = 'medium' as DifficultyLevel,
  userId,
  autoSubmitScore = true,
  onComplete,
  onProgress,
  onError,
}: SequenceMemoryProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty)
  const [gridSize, setGridSize] = useState(3)
  const [sequence, setSequence] = useState<number[]>([])
  const [userInput, setUserInput] = useState<number[]>([])
  const [currentLevel, setCurrentLevel] = useState(1)
  const [highlightedTile, setHighlightedTile] = useState<number | null>(null)
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
      case 'easy': return { gridSize: 3, showTime: 700, pauseTime: 300, startLength: 3 }
      case 'medium': return { gridSize: 4, showTime: 500, pauseTime: 250, startLength: 4 }
      case 'hard': return { gridSize: 4, showTime: 400, pauseTime: 200, startLength: 5 }
      case 'expert': return { gridSize: 5, showTime: 300, pauseTime: 150, startLength: 6 }
      default: return { gridSize: 4, showTime: 500, pauseTime: 250, startLength: 4 }
    }
  }, [difficulty])

  const generateSequence = useCallback((length: number, size: number): number[] => {
    const totalTiles = size * size
    const newSequence: number[] = []
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * totalTiles))
    }
    return newSequence
  }, [])

  const showSequence = useCallback(async (seq: number[]) => {
    setGamePhase('showing')
    const settings = getSettings()

    for (let i = 0; i < seq.length; i++) {
      await new Promise<void>(resolve => {
        timeoutRef.current = setTimeout(() => {
          setHighlightedTile(seq[i])
          resolve()
        }, settings.pauseTime)
      })

      await new Promise<void>(resolve => {
        timeoutRef.current = setTimeout(() => {
          setHighlightedTile(null)
          resolve()
        }, settings.showTime)
      })
    }

    setGamePhase('input')
    setUserInput([])
  }, [getSettings])

  const startGame = useCallback(() => {
    startedAtRef.current = new Date().toISOString()
    const settings = getSettings()
    setGridSize(settings.gridSize)
    setScore(0)
    setMaxLevel(0)
    setCurrentLevel(1)

    const newSequence = generateSequence(settings.startLength, settings.gridSize)
    setSequence(newSequence)

    setTimeout(() => showSequence(newSequence), 500)
  }, [getSettings, generateSequence, showSequence])

  const handleTileClick = (tileIndex: number) => {
    if (gamePhase !== 'input') return

    setHighlightedTile(tileIndex)
    setTimeout(() => setHighlightedTile(null), 150)

    const newUserInput = [...userInput, tileIndex]
    setUserInput(newUserInput)

    const currentIndex = newUserInput.length - 1
    if (newUserInput[currentIndex] !== sequence[currentIndex]) {
      setGamePhase('failure')
      handleGameOver()
      return
    }

    if (newUserInput.length === sequence.length) {
      setGamePhase('success')
      const newLevel = currentLevel + 1
      const levelScore = sequence.length * 15 * getDifficultyMultiplier()
      const newScore = score + levelScore
      setScore(newScore)
      setMaxLevel(Math.max(maxLevel, currentLevel))

      if (onProgress) {
        onProgress({
          currentStep: currentLevel,
          totalSteps: 20,
          partialScore: newScore,
          metrics: { level: currentLevel, sequenceLength: sequence.length },
        })
      }

      setTimeout(() => {
        setCurrentLevel(newLevel)
        const newSequence = [...sequence, Math.floor(Math.random() * (gridSize * gridSize))]
        setSequence(newSequence)
        showSequence(newSequence)
      }, 800)
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
        sequenceLength: sequence.length,
        gridSize,
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
    setSequence([])
    setUserInput([])
    setCurrentLevel(1)
    setScore(0)
    setHighlightedTile(null)
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
      transition: 'transform 0.15s',
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
    tileGrid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
      gap: '0.5rem',
      width: '100%',
      maxWidth: '350px',
    },
    tile: (isHighlighted: boolean) => ({
      aspectRatio: '1',
      borderRadius: theme.borderRadius,
      backgroundColor: isHighlighted ? theme.colors.primary : theme.colors.card,
      border: 'none',
      cursor: gamePhase === 'input' ? 'pointer' : 'default',
      transition: 'transform 0.15s, background-color 0.15s',
      transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
      boxShadow: isHighlighted ? `0 0 20px ${theme.colors.primary}` : 'none',
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
        <h2 style={styles.title}>Sequence Memory</h2>
        <p style={styles.subtitle}>
          {gamePhase === 'idle' ? 'Memorisez la sequence de cases' :
           gamePhase === 'showing' ? 'Observez la sequence...' :
           gamePhase === 'input' ? 'Reproduisez la sequence !' :
           gamePhase === 'success' ? 'Excellent !' :
           'Partie terminee !'}
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
        <div style={styles.tileGrid}>
          {Array.from({ length: gridSize * gridSize }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleTileClick(index)}
              style={styles.tile(highlightedTile === index)}
              disabled={gamePhase !== 'input'}
              aria-label={`Tile ${index + 1}`}
            />
          ))}
        </div>

        {gamePhase === 'input' && (
          <p style={{ color: theme.colors.textSecondary }}>
            {userInput.length} / {sequence.length}
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
            <div style={styles.statLabel}>Sequence</div>
            <div style={styles.statValue}>{sequence.length}</div>
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

export default SequenceMemory
