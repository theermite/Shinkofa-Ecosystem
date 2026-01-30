/**
 * Memory Card Game Widget
 * Match pairs of cards to test your memory
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState, useEffect, useRef } from 'react'
import { ermiteTheme } from '../../../shared/theme'
import type { DifficultyLevel, WidgetScore, WidgetCallbacks } from '../../../shared/types'
import { submitScore } from '../../../shared/api/client'

interface Card {
  id: number
  value: string
  isFlipped: boolean
  isMatched: boolean
}

interface MemoryCardGameProps extends WidgetCallbacks {
  difficulty?: DifficultyLevel
  userId?: string
  autoSubmitScore?: boolean
}

const WIDGET_ID = 'memory-cards'
const WIDGET_NAME = 'Memory Cards'

const EMOJI_SET = ['🎮', '🕹️', '👾', '🎯', '🏆', '⚔️', '🛡️', '💎', '🔥', '⚡', '🌟', '💫']

export function MemoryCardGame({
  difficulty: initialDifficulty = 'medium' as DifficultyLevel,
  userId,
  autoSubmitScore = true,
  onComplete,
  onProgress,
  onError,
}: MemoryCardGameProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty)
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [correctMoves, setCorrectMoves] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [canFlip, setCanFlip] = useState(true)

  const startTimeRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const theme = ermiteTheme

  const getGridSize = () => {
    switch (difficulty) {
      case 'easy': return { rows: 2, cols: 3 }
      case 'medium': return { rows: 4, cols: 4 }
      case 'hard': return { rows: 4, cols: 5 }
      case 'expert': return { rows: 5, cols: 6 }
      default: return { rows: 4, cols: 4 }
    }
  }

  const { rows, cols } = getGridSize()
  const totalPairs = (rows * cols) / 2

  useEffect(() => {
    initializeGame()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [difficulty])

  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(Date.now() - startTimeRef.current)
      }, 100)
      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [gameStarted, gameCompleted])

  useEffect(() => {
    if (matchedPairs === totalPairs && totalPairs > 0 && gameStarted) {
      completeGame()
    }
  }, [matchedPairs, totalPairs])

  const initializeGame = () => {
    const selectedEmojis = EMOJI_SET.slice(0, totalPairs)
    const cardValues = [...selectedEmojis, ...selectedEmojis]
    const shuffled = cardValues
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, id: index }))

    setCards(shuffled)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setCorrectMoves(0)
    setTimeElapsed(0)
    setGameStarted(false)
    setGameCompleted(false)
    setCanFlip(true)
  }

  const handleCardClick = (cardId: number) => {
    if (!canFlip || gameCompleted) return
    if (flippedCards.includes(cardId)) return
    if (cards[cardId].isMatched) return

    if (!gameStarted) {
      setGameStarted(true)
      startTimeRef.current = Date.now()
    }

    const newFlipped = [...flippedCards, cardId]
    setFlippedCards(newFlipped)
    setCards(prev => prev.map(card =>
      card.id === cardId ? { ...card, isFlipped: true } : card
    ))

    if (newFlipped.length === 2) {
      setCanFlip(false)
      setMoves(prev => prev + 1)

      const [firstId, secondId] = newFlipped
      const firstCard = cards[firstId]
      const secondCard = cards[secondId]

      if (firstCard.value === secondCard.value) {
        setCorrectMoves(prev => prev + 1)
        setCards(prev => prev.map(card =>
          card.id === firstId || card.id === secondId
            ? { ...card, isMatched: true }
            : card
        ))
        setMatchedPairs(prev => prev + 1)
        setFlippedCards([])
        setCanFlip(true)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, isFlipped: false }
              : card
          ))
          setFlippedCards([])
          setCanFlip(true)
        }, 1000)
      }
    }
  }

  const completeGame = async () => {
    if (gameCompleted) return

    const elapsed = Date.now() - startTimeRef.current
    setGameCompleted(true)
    setTimeElapsed(elapsed)
    if (timerRef.current) clearInterval(timerRef.current)

    const accuracy = moves > 0 ? (correctMoves / moves) * 100 : 0
    const score: WidgetScore = {
      widgetId: WIDGET_ID,
      widgetName: WIDGET_NAME,
      userId,
      score: Math.round(accuracy * 10 - elapsed / 1000),
      metrics: {
        moves,
        correctMoves,
        incorrectMoves: moves - correctMoves,
        timeElapsedMs: elapsed,
        accuracy,
        pairs: totalPairs,
      },
      difficulty,
      completedAt: new Date().toISOString(),
      duration: elapsed,
    }

    if (autoSubmitScore && userId) {
      const result = await submitScore(score)
      if (!result.success && onError) {
        onError(new Error(result.error || 'Score submission failed'))
      }
    }

    if (onComplete) onComplete(score)
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const accuracy = moves > 0 ? ((correctMoves / moves) * 100).toFixed(0) : '0'

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
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius,
      padding: '0.75rem',
      marginBottom: '1rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.5rem',
      textAlign: 'center' as const,
    },
    statLabel: { fontSize: '0.75rem', opacity: 0.8 },
    statValue: { fontSize: '1.25rem', fontWeight: 'bold' },
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
      transform: isActive ? 'scale(1.05)' : 'scale(1)',
      transition: 'all 0.15s',
    }),
    gameGrid: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '0.5rem',
      padding: '0.5rem',
    },
    card: (isFlipped: boolean, isMatched: boolean) => ({
      aspectRatio: '1',
      borderRadius: theme.borderRadius,
      cursor: isMatched ? 'default' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      backgroundColor: isFlipped || isMatched ? '#fff' : theme.colors.accent,
      color: isFlipped || isMatched ? '#000' : '#fff',
      opacity: isMatched ? 0.6 : 1,
      transition: 'all 0.3s',
      border: 'none',
      fontFamily: 'inherit',
    }),
    restartBtn: {
      marginTop: '1rem',
      padding: '0.75rem',
      borderRadius: theme.borderRadius,
      backgroundColor: theme.colors.card,
      color: theme.colors.text,
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600,
      fontFamily: theme.fontFamily,
    },
    completionOverlay: {
      position: 'fixed' as const,
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    },
    completionModal: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius,
      padding: '2rem',
      textAlign: 'center' as const,
      maxWidth: '400px',
      width: '90%',
    },
  }

  return (
    <div style={styles.container}>
      {/* Stats Header */}
      <div style={styles.header}>
        <div style={styles.statsGrid}>
          <div>
            <div style={styles.statLabel}>Temps</div>
            <div style={styles.statValue}>{formatTime(timeElapsed)}</div>
          </div>
          <div>
            <div style={styles.statLabel}>Paires</div>
            <div style={styles.statValue}>{matchedPairs}/{totalPairs}</div>
          </div>
          <div>
            <div style={styles.statLabel}>Coups</div>
            <div style={styles.statValue}>{moves}</div>
          </div>
          <div>
            <div style={styles.statLabel}>Precision</div>
            <div style={styles.statValue}>{accuracy}%</div>
          </div>
        </div>
      </div>

      {/* Difficulty Selector */}
      {!gameStarted && (
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
                {level === 'easy' && '3'}
                {level === 'medium' && '8'}
                {level === 'hard' && '10'}
                {level === 'expert' && '15'}
                <div style={{ fontSize: '0.625rem', opacity: 0.7 }}>paires</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Game Grid */}
      <div style={styles.gameGrid}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={!canFlip || card.isMatched || card.isFlipped}
            style={styles.card(card.isFlipped, card.isMatched)}
          >
            {card.isFlipped || card.isMatched ? card.value : '?'}
          </button>
        ))}
      </div>

      {/* Restart Button */}
      <button onClick={initializeGame} style={styles.restartBtn}>
        Recommencer
      </button>

      {/* Completion Modal */}
      {gameCompleted && (
        <div style={styles.completionOverlay} onClick={() => setGameCompleted(false)}>
          <div style={styles.completionModal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Bravo !</h3>
            <p>Temps : {formatTime(timeElapsed)}</p>
            <p>Coups : {moves}</p>
            <p>Precision : {accuracy}%</p>
            <button
              onClick={initializeGame}
              style={{ ...styles.restartBtn, backgroundColor: theme.colors.primary, marginTop: '1.5rem' }}
            >
              Rejouer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MemoryCardGame
