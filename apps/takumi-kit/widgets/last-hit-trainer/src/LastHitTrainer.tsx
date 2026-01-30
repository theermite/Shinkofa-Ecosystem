/**
 * LastHitTrainer Widget
 * Practice last-hitting minions like in MOBA games
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { ermiteTheme } from '../../../shared/theme'
import type { DifficultyLevel, WidgetScore, WidgetCallbacks } from '../../../shared/types'
import { submitScore } from '../../../shared/api/client'

type GamePhase = 'idle' | 'playing' | 'complete'

interface Minion {
  id: number
  x: number
  y: number
  health: number
  maxHealth: number
  damageRate: number
  gold: number
  dying: boolean
}

interface LastHitTrainerProps extends WidgetCallbacks {
  difficulty?: DifficultyLevel
  userId?: string
  autoSubmitScore?: boolean
  gameDuration?: number
}

const WIDGET_ID = 'last-hit-trainer'
const WIDGET_NAME = 'Last Hit Trainer'

const GAME_WIDTH = 400
const GAME_HEIGHT = 350

export function LastHitTrainer({
  difficulty: initialDifficulty = 'medium' as DifficultyLevel,
  userId,
  autoSubmitScore = true,
  gameDuration = 60,
  onComplete,
  onProgress,
  onError,
}: LastHitTrainerProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty)
  const [minions, setMinions] = useState<Minion[]>([])
  const [gold, setGold] = useState(0)
  const [lastHits, setLastHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [timeLeft, setTimeLeft] = useState(gameDuration)
  const [score, setScore] = useState(0)

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const minionIdRef = useRef(0)
  const startedAtRef = useRef<string>('')

  const theme = ermiteTheme

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const getSettings = useCallback(() => {
    switch (difficulty) {
      case 'easy': return { minionHealth: 100, damageRate: 3, spawnRate: 3000, maxMinions: 3, goldRange: [15, 25] }
      case 'medium': return { minionHealth: 100, damageRate: 5, spawnRate: 2500, maxMinions: 4, goldRange: [18, 28] }
      case 'hard': return { minionHealth: 100, damageRate: 7, spawnRate: 2000, maxMinions: 5, goldRange: [20, 32] }
      case 'expert': return { minionHealth: 100, damageRate: 10, spawnRate: 1500, maxMinions: 6, goldRange: [22, 35] }
      default: return { minionHealth: 100, damageRate: 5, spawnRate: 2500, maxMinions: 4, goldRange: [18, 28] }
    }
  }, [difficulty])

  const spawnMinion = useCallback((): Minion => {
    const settings = getSettings()
    const id = ++minionIdRef.current
    const gold = settings.goldRange[0] + Math.floor(Math.random() * (settings.goldRange[1] - settings.goldRange[0]))

    return {
      id,
      x: 50 + Math.random() * (GAME_WIDTH - 100),
      y: 50 + Math.random() * (GAME_HEIGHT - 100),
      health: settings.minionHealth,
      maxHealth: settings.minionHealth,
      damageRate: settings.damageRate + Math.random() * 2,
      gold,
      dying: false,
    }
  }, [getSettings])

  const startGame = useCallback(() => {
    startedAtRef.current = new Date().toISOString()
    setScore(0)
    setGold(0)
    setLastHits(0)
    setMisses(0)
    setTimeLeft(gameDuration)
    setMinions([])
    setGamePhase('playing')
    minionIdRef.current = 0

    const settings = getSettings()

    // Spawn initial minions
    const initialMinions: Minion[] = []
    for (let i = 0; i < 2; i++) {
      initialMinions.push(spawnMinion())
    }
    setMinions(initialMinions)

    let lastSpawn = Date.now()

    // Game loop - damage minions over time
    gameLoopRef.current = setInterval(() => {
      const now = Date.now()

      // Spawn new minions
      if (now - lastSpawn > settings.spawnRate) {
        lastSpawn = now
        setMinions(prev => {
          if (prev.length < settings.maxMinions) {
            return [...prev, spawnMinion()]
          }
          return prev
        })
      }

      // Damage minions
      setMinions(prev => {
        const updated = prev.map(m => {
          if (m.dying) return m
          const newHealth = m.health - m.damageRate * 0.016
          if (newHealth <= 0) {
            // Minion died without last hit
            setMisses(ms => ms + 1)
            return { ...m, health: 0, dying: true }
          }
          return { ...m, health: newHealth }
        })

        // Remove dead minions and spawn new ones
        const alive = updated.filter(m => !m.dying)
        const dead = updated.filter(m => m.dying)

        if (dead.length > 0 && alive.length < settings.maxMinions) {
          return [...alive, spawnMinion()]
        }

        return alive
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
  }, [gameDuration, getSettings, spawnMinion])

  const handleMinionClick = (minionId: number) => {
    if (gamePhase !== 'playing') return

    const minion = minions.find(m => m.id === minionId)
    if (!minion || minion.dying) return

    // Check if it's a valid last hit (health below threshold)
    const threshold = minion.maxHealth * 0.15
    if (minion.health <= threshold) {
      // Perfect last hit!
      setLastHits(lh => lh + 1)
      setGold(g => g + minion.gold)
      const points = Math.round(minion.gold * 10 * getDifficultyMultiplier())
      setScore(s => s + points)

      if (onProgress) {
        onProgress({
          currentStep: lastHits + 1,
          totalSteps: gameDuration,
          partialScore: score + points,
          metrics: { lastHits: lastHits + 1, gold: gold + minion.gold },
        })
      }
    } else {
      // Too early!
      setMisses(ms => ms + 1)
    }

    // Remove minion and spawn new one
    setMinions(prev => {
      const settings = getSettings()
      const remaining = prev.filter(m => m.id !== minionId)
      if (remaining.length < settings.maxMinions) {
        return [...remaining, spawnMinion()]
      }
      return remaining
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

    const accuracy = lastHits + misses > 0 ? Math.round((lastHits / (lastHits + misses)) * 100) : 0
    const finalScore = Math.round(score * (1 + accuracy / 200))

    const widgetScore: WidgetScore = {
      widgetId: WIDGET_ID,
      widgetName: WIDGET_NAME,
      userId,
      score: finalScore,
      metrics: {
        lastHits,
        misses,
        gold,
        accuracy,
        csPerMinute: Math.round((lastHits / gameDuration) * 60 * 10) / 10,
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
    setMinions([])
    setScore(0)
    setGold(0)
    setLastHits(0)
    setMisses(0)
    setTimeLeft(gameDuration)
  }

  const getHealthColor = (health: number, maxHealth: number): string => {
    const ratio = health / maxHealth
    if (ratio > 0.5) return theme.colors.success
    if (ratio > 0.15) return theme.colors.warning
    return theme.colors.error
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
    },
    minion: (m: Minion) => ({
      position: 'absolute' as const,
      left: `${m.x - 25}px`,
      top: `${m.y - 25}px`,
      width: '50px',
      height: '50px',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
    }),
    minionBody: {
      width: '40px',
      height: '40px',
      backgroundColor: theme.colors.accent,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
    },
    healthBar: {
      width: '45px',
      height: '6px',
      backgroundColor: theme.colors.card,
      borderRadius: '3px',
      marginTop: '2px',
      overflow: 'hidden',
    },
    healthFill: (health: number, maxHealth: number) => ({
      height: '100%',
      width: `${(health / maxHealth) * 100}%`,
      backgroundColor: getHealthColor(health, maxHealth),
      transition: 'width 0.1s',
    }),
    goldLabel: {
      fontSize: '0.6rem',
      color: theme.colors.accent,
      fontWeight: 'bold',
    },
    statsPanel: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius,
      padding: '0.75rem',
      marginTop: '0.5rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.5rem',
      textAlign: 'center' as const,
    },
    statLabel: {
      fontSize: '0.65rem',
      color: theme.colors.textSecondary,
    },
    statValue: {
      fontSize: '1rem',
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
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Last Hit Trainer</h2>
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
        <div style={styles.canvas}>
          {gamePhase === 'playing' && minions.map(minion => (
            <div
              key={minion.id}
              style={styles.minion(minion)}
              onClick={() => handleMinionClick(minion.id)}
            >
              <div style={styles.minionBody}>
                {minion.health <= minion.maxHealth * 0.15 ? '!' : ''}
              </div>
              <div style={styles.healthBar}>
                <div style={styles.healthFill(minion.health, minion.maxHealth)} />
              </div>
              <span style={styles.goldLabel}>{minion.gold}g</span>
            </div>
          ))}

          {gamePhase === 'complete' && (
            <div style={styles.completeOverlay}>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.success }}>
                Termine !
              </p>
              <p style={{ color: theme.colors.accent, marginTop: '0.5rem', fontSize: '1.25rem' }}>
                {gold} Gold
              </p>
              <p style={{ color: theme.colors.textSecondary, marginTop: '0.25rem' }}>
                CS/min : {Math.round((lastHits / gameDuration) * 60 * 10) / 10}
              </p>
            </div>
          )}

          {gamePhase === 'idle' && (
            <div style={{ ...styles.completeOverlay, backgroundColor: 'transparent' }}>
              <p style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: '1rem' }}>
                Cliquez quand la vie est rouge pour last hit !
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
            <div style={styles.statLabel}>Last Hits</div>
            <div style={{ ...styles.statValue, color: theme.colors.success }}>{lastHits}</div>
          </div>
          <div>
            <div style={styles.statLabel}>Rates</div>
            <div style={{ ...styles.statValue, color: theme.colors.error }}>{misses}</div>
          </div>
          <div>
            <div style={styles.statLabel}>Gold</div>
            <div style={{ ...styles.statValue, color: theme.colors.accent }}>{gold}</div>
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

export default LastHitTrainer
