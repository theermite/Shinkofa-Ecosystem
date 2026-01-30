/**
 * DodgeMaster Widget
 * Dodge falling obstacles using keyboard or touch
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { ermiteTheme } from '../../../shared/theme'
import type { DifficultyLevel, WidgetScore, WidgetCallbacks } from '../../../shared/types'
import { submitScore } from '../../../shared/api/client'

type GamePhase = 'idle' | 'playing' | 'complete'

interface Obstacle {
  id: number
  x: number
  y: number
  width: number
  speed: number
}

interface DodgeMasterProps extends WidgetCallbacks {
  difficulty?: DifficultyLevel
  userId?: string
  autoSubmitScore?: boolean
}

const WIDGET_ID = 'dodge-master'
const WIDGET_NAME = 'Dodge Master'

const GAME_WIDTH = 400
const GAME_HEIGHT = 500
const PLAYER_WIDTH = 40
const PLAYER_HEIGHT = 40

export function DodgeMaster({
  difficulty: initialDifficulty = 'medium' as DifficultyLevel,
  userId,
  autoSubmitScore = true,
  onComplete,
  onProgress,
  onError,
}: DodgeMasterProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty)
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [score, setScore] = useState(0)
  const [survivalTime, setSurvivalTime] = useState(0)

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const obstacleIdRef = useRef(0)
  const startedAtRef = useRef<string>('')
  const gameAreaRef = useRef<HTMLDivElement>(null)

  const theme = ermiteTheme

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [])

  const getSettings = useCallback(() => {
    switch (difficulty) {
      case 'easy': return { spawnRate: 1500, baseSpeed: 2, maxObstacles: 5, obstacleWidth: 50 }
      case 'medium': return { spawnRate: 1000, baseSpeed: 3, maxObstacles: 8, obstacleWidth: 45 }
      case 'hard': return { spawnRate: 700, baseSpeed: 4, maxObstacles: 12, obstacleWidth: 40 }
      case 'expert': return { spawnRate: 500, baseSpeed: 5, maxObstacles: 15, obstacleWidth: 35 }
      default: return { spawnRate: 1000, baseSpeed: 3, maxObstacles: 8, obstacleWidth: 45 }
    }
  }, [difficulty])

  const startGame = useCallback(() => {
    startedAtRef.current = new Date().toISOString()
    setScore(0)
    setSurvivalTime(0)
    setObstacles([])
    setPlayerX(GAME_WIDTH / 2 - PLAYER_WIDTH / 2)
    setGamePhase('playing')
    obstacleIdRef.current = 0

    const settings = getSettings()
    let lastSpawn = 0
    let gameTime = 0

    gameLoopRef.current = setInterval(() => {
      gameTime += 16
      const currentTime = Date.now()

      // Spawn obstacles
      if (currentTime - lastSpawn > settings.spawnRate) {
        lastSpawn = currentTime
        const newObstacle: Obstacle = {
          id: ++obstacleIdRef.current,
          x: Math.random() * (GAME_WIDTH - settings.obstacleWidth),
          y: -30,
          width: settings.obstacleWidth,
          speed: settings.baseSpeed + Math.random() * 2,
        }
        setObstacles(prev => [...prev.slice(-settings.maxObstacles), newObstacle])
      }

      // Update survival time and score
      setSurvivalTime(Math.floor(gameTime / 1000))
      setScore(Math.floor(gameTime / 100) * getDifficultyMultiplier())

      // Move obstacles
      setObstacles(prev => prev
        .map(obs => ({ ...obs, y: obs.y + obs.speed }))
        .filter(obs => obs.y < GAME_HEIGHT + 50)
      )
    }, 16)
  }, [getSettings])

  const getDifficultyMultiplier = (): number => {
    switch (difficulty) {
      case 'easy': return 1
      case 'medium': return 1.5
      case 'hard': return 2
      case 'expert': return 3
      default: return 1.5
    }
  }

  // Check collisions
  useEffect(() => {
    if (gamePhase !== 'playing') return

    const playerTop = GAME_HEIGHT - PLAYER_HEIGHT - 20
    const playerBottom = playerTop + PLAYER_HEIGHT
    const playerLeft = playerX
    const playerRight = playerX + PLAYER_WIDTH

    for (const obs of obstacles) {
      const obsBottom = obs.y + 30
      const obsTop = obs.y
      const obsLeft = obs.x
      const obsRight = obs.x + obs.width

      if (
        playerRight > obsLeft &&
        playerLeft < obsRight &&
        playerBottom > obsTop &&
        playerTop < obsBottom
      ) {
        handleGameOver()
        return
      }
    }
  }, [obstacles, playerX, gamePhase])

  // Keyboard controls
  useEffect(() => {
    if (gamePhase !== 'playing') return

    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 20
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setPlayerX(prev => Math.max(0, prev - speed))
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setPlayerX(prev => Math.min(GAME_WIDTH - PLAYER_WIDTH, prev + speed))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gamePhase])

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gamePhase !== 'playing' || !gameAreaRef.current) return
    const rect = gameAreaRef.current.getBoundingClientRect()
    const touchX = e.touches[0].clientX - rect.left
    setPlayerX(Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, touchX - PLAYER_WIDTH / 2)))
  }

  const handleGameOver = async () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    setGamePhase('complete')

    const widgetScore: WidgetScore = {
      widgetId: WIDGET_ID,
      widgetName: WIDGET_NAME,
      userId,
      score,
      metrics: {
        survivalTime,
        obstaclesDodged: score / 10,
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
    setGamePhase('idle')
    setObstacles([])
    setScore(0)
    setSurvivalTime(0)
    setPlayerX(GAME_WIDTH / 2 - PLAYER_WIDTH / 2)
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
      touchAction: 'none',
    },
    player: {
      position: 'absolute' as const,
      bottom: '20px',
      left: `${playerX}px`,
      width: `${PLAYER_WIDTH}px`,
      height: `${PLAYER_HEIGHT}px`,
      backgroundColor: theme.colors.primary,
      borderRadius: '8px',
      transition: 'left 0.05s',
    },
    obstacle: (obs: Obstacle) => ({
      position: 'absolute' as const,
      left: `${obs.x}px`,
      top: `${obs.y}px`,
      width: `${obs.width}px`,
      height: '30px',
      backgroundColor: theme.colors.error,
      borderRadius: '4px',
    }),
    statsPanel: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius,
      padding: '0.75rem',
      marginTop: '0.5rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
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
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Dodge Master</h2>
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

      <div style={styles.gameArea}>
        <div
          ref={gameAreaRef}
          style={styles.canvas}
          onTouchMove={handleTouchMove}
        >
          {gamePhase === 'playing' && (
            <>
              <div style={styles.player} />
              {obstacles.map(obs => (
                <div key={obs.id} style={styles.obstacle(obs)} />
              ))}
            </>
          )}

          {gamePhase === 'complete' && (
            <div style={styles.completeOverlay}>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.error }}>
                Game Over !
              </p>
              <p style={{ color: theme.colors.textSecondary, marginTop: '0.5rem' }}>
                Survie : {survivalTime}s
              </p>
            </div>
          )}

          {gamePhase === 'idle' && (
            <div style={{ ...styles.completeOverlay, backgroundColor: 'transparent' }}>
              <p style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: '1rem' }}>
                Utilisez les fleches ou glissez pour esquiver
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={styles.statsPanel}>
        <div style={styles.statsGrid}>
          <div>
            <div style={styles.statLabel}>Temps</div>
            <div style={styles.statValue}>{survivalTime}s</div>
          </div>
          <div>
            <div style={styles.statLabel}>Score</div>
            <div style={{ ...styles.statValue, color: theme.colors.primary }}>{Math.round(score)}</div>
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

export default DodgeMaster
