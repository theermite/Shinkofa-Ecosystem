/**
 * SkillshotTrainer Widget
 * Practice aiming skillshots at moving targets
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { ermiteTheme } from '../../../shared/theme'
import type { DifficultyLevel, WidgetScore, WidgetCallbacks } from '../../../shared/types'
import { submitScore } from '../../../shared/api/client'

type GamePhase = 'idle' | 'playing' | 'complete'

interface Target {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
}

interface Projectile {
  id: number
  x: number
  y: number
  targetX: number
  targetY: number
  speed: number
}

interface SkillshotTrainerProps extends WidgetCallbacks {
  difficulty?: DifficultyLevel
  userId?: string
  autoSubmitScore?: boolean
  totalShots?: number
}

const WIDGET_ID = 'skillshot-trainer'
const WIDGET_NAME = 'Skillshot Trainer'

const GAME_WIDTH = 400
const GAME_HEIGHT = 400

export function SkillshotTrainer({
  difficulty: initialDifficulty = 'medium' as DifficultyLevel,
  userId,
  autoSubmitScore = true,
  totalShots = 15,
  onComplete,
  onProgress,
  onError,
}: SkillshotTrainerProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty)
  const [targets, setTargets] = useState<Target[]>([])
  const [projectiles, setProjectiles] = useState<Projectile[]>([])
  const [shotsRemaining, setShotsRemaining] = useState(totalShots)
  const [hits, setHits] = useState(0)
  const [score, setScore] = useState(0)

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const targetIdRef = useRef(0)
  const projectileIdRef = useRef(0)
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
      case 'easy': return { targetCount: 1, targetSpeed: 1, targetSize: 50, projectileSpeed: 8 }
      case 'medium': return { targetCount: 2, targetSpeed: 2, targetSize: 40, projectileSpeed: 10 }
      case 'hard': return { targetCount: 3, targetSpeed: 3, targetSize: 35, projectileSpeed: 12 }
      case 'expert': return { targetCount: 4, targetSpeed: 4, targetSize: 30, projectileSpeed: 15 }
      default: return { targetCount: 2, targetSpeed: 2, targetSize: 40, projectileSpeed: 10 }
    }
  }, [difficulty])

  const spawnTarget = useCallback((): Target => {
    const settings = getSettings()
    const id = ++targetIdRef.current
    const side = Math.floor(Math.random() * 4)
    let x, y, vx, vy

    switch (side) {
      case 0: // top
        x = Math.random() * GAME_WIDTH
        y = 0
        vx = (Math.random() - 0.5) * settings.targetSpeed * 2
        vy = Math.random() * settings.targetSpeed + 0.5
        break
      case 1: // right
        x = GAME_WIDTH
        y = Math.random() * GAME_HEIGHT
        vx = -(Math.random() * settings.targetSpeed + 0.5)
        vy = (Math.random() - 0.5) * settings.targetSpeed * 2
        break
      case 2: // bottom
        x = Math.random() * GAME_WIDTH
        y = GAME_HEIGHT
        vx = (Math.random() - 0.5) * settings.targetSpeed * 2
        vy = -(Math.random() * settings.targetSpeed + 0.5)
        break
      default: // left
        x = 0
        y = Math.random() * GAME_HEIGHT
        vx = Math.random() * settings.targetSpeed + 0.5
        vy = (Math.random() - 0.5) * settings.targetSpeed * 2
    }

    return { id, x, y, vx, vy, size: settings.targetSize }
  }, [getSettings])

  const startGame = useCallback(() => {
    startedAtRef.current = new Date().toISOString()
    setScore(0)
    setHits(0)
    setShotsRemaining(totalShots)
    setProjectiles([])
    setGamePhase('playing')
    targetIdRef.current = 0
    projectileIdRef.current = 0

    const settings = getSettings()
    const initialTargets: Target[] = []
    for (let i = 0; i < settings.targetCount; i++) {
      initialTargets.push(spawnTarget())
    }
    setTargets(initialTargets)

    gameLoopRef.current = setInterval(() => {
      // Move targets
      setTargets(prev => prev.map(target => {
        let { x, y, vx, vy } = target

        x += vx
        y += vy

        // Bounce off walls
        if (x <= 0 || x >= GAME_WIDTH - target.size) vx = -vx
        if (y <= 0 || y >= GAME_HEIGHT - target.size) vy = -vy

        x = Math.max(0, Math.min(GAME_WIDTH - target.size, x))
        y = Math.max(0, Math.min(GAME_HEIGHT - target.size, y))

        return { ...target, x, y, vx, vy }
      }))

      // Move projectiles
      setProjectiles(prev => prev.map(proj => {
        const dx = proj.targetX - proj.x
        const dy = proj.targetY - proj.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < proj.speed) {
          return { ...proj, x: proj.targetX, y: proj.targetY }
        }

        return {
          ...proj,
          x: proj.x + (dx / dist) * proj.speed,
          y: proj.y + (dy / dist) * proj.speed,
        }
      }).filter(proj => {
        const dx = proj.targetX - proj.x
        const dy = proj.targetY - proj.y
        return Math.sqrt(dx * dx + dy * dy) > 5
      }))
    }, 16)
  }, [totalShots, getSettings, spawnTarget])

  // Check collisions between projectiles and targets
  useEffect(() => {
    if (gamePhase !== 'playing') return

    projectiles.forEach(proj => {
      targets.forEach(target => {
        const dx = proj.x - (target.x + target.size / 2)
        const dy = proj.y - (target.y + target.size / 2)
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < target.size / 2 + 10) {
          // Hit!
          setHits(h => h + 1)
          const points = Math.round(100 * getDifficultyMultiplier())
          setScore(s => s + points)
          setTargets(prev => prev.filter(t => t.id !== target.id).concat([spawnTarget()]))
          setProjectiles(prev => prev.filter(p => p.id !== proj.id))

          if (onProgress) {
            onProgress({
              currentStep: totalShots - shotsRemaining + 1,
              totalSteps: totalShots,
              partialScore: score + points,
              metrics: { hits: hits + 1 },
            })
          }
        }
      })
    })
  }, [projectiles, targets, gamePhase])

  // Check game over
  useEffect(() => {
    if (gamePhase === 'playing' && shotsRemaining <= 0 && projectiles.length === 0) {
      handleGameComplete()
    }
  }, [shotsRemaining, projectiles, gamePhase])

  const getDifficultyMultiplier = (): number => {
    switch (difficulty) {
      case 'easy': return 1
      case 'medium': return 1.5
      case 'hard': return 2
      case 'expert': return 3
      default: return 1.5
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gamePhase !== 'playing' || shotsRemaining <= 0 || !gameAreaRef.current) return

    const rect = gameAreaRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const settings = getSettings()

    const projectile: Projectile = {
      id: ++projectileIdRef.current,
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT,
      targetX: x,
      targetY: y,
      speed: settings.projectileSpeed,
    }

    setProjectiles(prev => [...prev, projectile])
    setShotsRemaining(s => s - 1)
  }

  const handleGameComplete = async () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    setGamePhase('complete')

    const accuracy = Math.round((hits / totalShots) * 100)
    const finalScore = Math.round(score * (1 + accuracy / 200))

    const widgetScore: WidgetScore = {
      widgetId: WIDGET_ID,
      widgetName: WIDGET_NAME,
      userId,
      score: finalScore,
      metrics: {
        hits,
        totalShots,
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
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    setGamePhase('idle')
    setTargets([])
    setProjectiles([])
    setScore(0)
    setHits(0)
    setShotsRemaining(totalShots)
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
      cursor: gamePhase === 'playing' ? 'crosshair' : 'default',
    },
    target: (target: Target) => ({
      position: 'absolute' as const,
      left: `${target.x}px`,
      top: `${target.y}px`,
      width: `${target.size}px`,
      height: `${target.size}px`,
      backgroundColor: theme.colors.error,
      borderRadius: '50%',
      border: `3px solid ${theme.colors.warning}`,
    }),
    projectile: (proj: Projectile) => ({
      position: 'absolute' as const,
      left: `${proj.x - 5}px`,
      top: `${proj.y - 5}px`,
      width: '10px',
      height: '10px',
      backgroundColor: theme.colors.primary,
      borderRadius: '50%',
      boxShadow: `0 0 10px ${theme.colors.primary}`,
    }),
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
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Skillshot Trainer</h2>
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
          onClick={handleClick}
        >
          {gamePhase === 'playing' && (
            <>
              {targets.map(target => (
                <div key={target.id} style={styles.target(target)} />
              ))}
              {projectiles.map(proj => (
                <div key={proj.id} style={styles.projectile(proj)} />
              ))}
            </>
          )}

          {gamePhase === 'complete' && (
            <div style={styles.completeOverlay}>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.success }}>
                Termine !
              </p>
              <p style={{ color: theme.colors.textSecondary, marginTop: '0.5rem' }}>
                Precision : {Math.round((hits / totalShots) * 100)}%
              </p>
            </div>
          )}

          {gamePhase === 'idle' && (
            <div style={{ ...styles.completeOverlay, backgroundColor: 'transparent' }}>
              <p style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: '1rem' }}>
                Cliquez pour tirer sur les cibles
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={styles.statsPanel}>
        <div style={styles.statsGrid}>
          <div>
            <div style={styles.statLabel}>Tirs</div>
            <div style={styles.statValue}>{shotsRemaining}</div>
          </div>
          <div>
            <div style={styles.statLabel}>Touches</div>
            <div style={{ ...styles.statValue, color: theme.colors.success }}>{hits}</div>
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

export default SkillshotTrainer
