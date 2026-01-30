/**
 * ImagePairs Widget
 * Match related image pairs - contextual memory game
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { ermiteTheme } from '../../../shared/theme'
import type { DifficultyLevel, WidgetScore, WidgetCallbacks } from '../../../shared/types'
import { submitScore } from '../../../shared/api/client'

type GamePhase = 'idle' | 'memorize' | 'playing' | 'complete'

interface Card {
  id: number
  pairId: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

interface ImagePairsProps extends WidgetCallbacks {
  difficulty?: DifficultyLevel
  userId?: string
  autoSubmitScore?: boolean
}

const WIDGET_ID = 'image-pairs'
const WIDGET_NAME = 'Image Pairs'

const EMOJI_PAIRS = [
  ['🌞', '🌙'], ['🔥', '💧'], ['🌲', '🪓'], ['🐝', '🍯'],
  ['🎵', '🎧'], ['📚', '📖'], ['✈️', '🌍'], ['🔑', '🔒'],
  ['☕', '🥐'], ['🎨', '🖼️'], ['⚽', '🥅'], ['🎸', '🎤'],
  ['🌈', '☀️'], ['🍕', '🧀'], ['🚗', '⛽'], ['💡', '🔌'],
]

export function ImagePairs({
  difficulty: initialDifficulty = 'medium' as DifficultyLevel,
  userId,
  autoSubmitScore = true,
  onComplete,
  onProgress,
  onError,
}: ImagePairsProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty)
  const [cards, setCards] = useState<Card[]>([])
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const [matches, setMatches] = useState(0)
  const [moves, setMoves] = useState(0)
  const [memorizeTime, setMemorizeTime] = useState(5)
  const [score, setScore] = useState(0)

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
      case 'easy': return { pairs: 4, memorizeTime: 8 }
      case 'medium': return { pairs: 6, memorizeTime: 6 }
      case 'hard': return { pairs: 8, memorizeTime: 4 }
      case 'expert': return { pairs: 10, memorizeTime: 3 }
      default: return { pairs: 6, memorizeTime: 6 }
    }
  }, [difficulty])

  const initializeCards = useCallback(() => {
    const settings = getSettings()
    const shuffledPairs = [...EMOJI_PAIRS].sort(() => Math.random() - 0.5).slice(0, settings.pairs)

    const cardArray: Card[] = []
    shuffledPairs.forEach((pair, pairIndex) => {
      cardArray.push(
        { id: pairIndex * 2, pairId: pairIndex, emoji: pair[0], isFlipped: true, isMatched: false },
        { id: pairIndex * 2 + 1, pairId: pairIndex, emoji: pair[1], isFlipped: true, isMatched: false }
      )
    })

    return cardArray.sort(() => Math.random() - 0.5)
  }, [getSettings])

  const startGame = useCallback(() => {
    startedAtRef.current = new Date().toISOString()
    const settings = getSettings()
    const newCards = initializeCards()

    setCards(newCards)
    setMatches(0)
    setMoves(0)
    setScore(0)
    setSelectedCards([])
    setMemorizeTime(settings.memorizeTime)
    setGamePhase('memorize')

    let countdown = settings.memorizeTime
    const countdownInterval = setInterval(() => {
      countdown--
      setMemorizeTime(countdown)
      if (countdown <= 0) {
        clearInterval(countdownInterval)
        setCards(prev => prev.map(card => ({ ...card, isFlipped: false })))
        setGamePhase('playing')
      }
    }, 1000)
  }, [getSettings, initializeCards])

  const handleCardClick = (cardId: number) => {
    if (gamePhase !== 'playing') return

    const card = cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched || selectedCards.length >= 2) return

    const newSelected = [...selectedCards, cardId]
    setSelectedCards(newSelected)
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c))

    if (newSelected.length === 2) {
      setMoves(m => m + 1)
      const [first, second] = newSelected
      const card1 = cards.find(c => c.id === first)!
      const card2 = cards.find(c => c.id === second)!

      if (card1.pairId === card2.pairId) {
        const newMatches = matches + 1
        setMatches(newMatches)
        setCards(prev => prev.map(c =>
          c.pairId === card1.pairId ? { ...c, isMatched: true, isFlipped: true } : c
        ))
        setSelectedCards([])

        const pairScore = 100 * getDifficultyMultiplier()
        setScore(s => s + pairScore)

        if (onProgress) {
          onProgress({
            currentStep: newMatches,
            totalSteps: getSettings().pairs,
            partialScore: score + pairScore,
            metrics: { matches: newMatches, moves: moves + 1 },
          })
        }

        if (newMatches === getSettings().pairs) {
          handleGameComplete()
        }
      } else {
        timeoutRef.current = setTimeout(() => {
          setCards(prev => prev.map(c =>
            (c.id === first || c.id === second) && !c.isMatched ? { ...c, isFlipped: false } : c
          ))
          setSelectedCards([])
        }, 1000)
      }
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

  const handleGameComplete = async () => {
    setGamePhase('complete')
    const settings = getSettings()
    const efficiency = Math.max(0, 1 - (moves - settings.pairs) / (settings.pairs * 2))
    const finalScore = Math.round(score * (1 + efficiency))

    const widgetScore: WidgetScore = {
      widgetId: WIDGET_ID,
      widgetName: WIDGET_NAME,
      userId,
      score: finalScore,
      metrics: {
        pairs: settings.pairs,
        moves,
        efficiency: Math.round(efficiency * 100),
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
    setCards([])
    setSelectedCards([])
    setMatches(0)
    setMoves(0)
    setScore(0)
  }

  const gridCols = Math.ceil(Math.sqrt(cards.length))

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
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
    },
    memorizeOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: theme.borderRadius,
      zIndex: 10,
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
      gap: '0.5rem',
      width: '100%',
      maxWidth: '400px',
      position: 'relative' as const,
    },
    card: (isFlipped: boolean, isMatched: boolean) => ({
      aspectRatio: '1',
      borderRadius: theme.borderRadius,
      backgroundColor: isFlipped ? theme.colors.card : theme.colors.primary,
      border: 'none',
      cursor: gamePhase === 'playing' && !isFlipped && !isMatched ? 'pointer' : 'default',
      fontSize: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s',
      transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
      opacity: isMatched ? 0.5 : 1,
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
        <h2 style={styles.title}>Image Pairs</h2>
        <p style={styles.subtitle}>
          {gamePhase === 'idle' ? 'Associez les paires liees' :
           gamePhase === 'memorize' ? `Memorisez ! ${memorizeTime}s` :
           gamePhase === 'playing' ? 'Trouvez les paires !' :
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
        {cards.length > 0 && (
          <div style={styles.cardGrid}>
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                style={styles.card(card.isFlipped, card.isMatched)}
                disabled={gamePhase !== 'playing' || card.isFlipped || card.isMatched}
                aria-label={card.isFlipped ? card.emoji : 'Hidden card'}
              >
                {card.isFlipped ? card.emoji : '?'}
              </button>
            ))}
          </div>
        )}

        {gamePhase === 'complete' && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme.colors.success }}>
              Felicitations !
            </p>
            <p style={{ color: theme.colors.textSecondary }}>
              Complete en {moves} coups
            </p>
          </div>
        )}
      </div>

      <div style={styles.statsPanel}>
        <div style={styles.statsGrid}>
          <div>
            <div style={styles.statLabel}>Paires</div>
            <div style={styles.statValue}>{matches} / {getSettings().pairs}</div>
          </div>
          <div>
            <div style={styles.statLabel}>Coups</div>
            <div style={styles.statValue}>{moves}</div>
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

export default ImagePairs
