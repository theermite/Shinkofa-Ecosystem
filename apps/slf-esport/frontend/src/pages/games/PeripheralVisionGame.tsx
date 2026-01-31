/**
 * Peripheral Vision Trainer - Custom Mini-Game
 * Tests and trains peripheral vision by displaying targets at random positions
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardHeader, CardBody, Button } from '@/components/ui'

interface Target {
  id: number
  x: number
  y: number
  active: boolean
}

interface GameStats {
  hits: number
  misses: number
  score: number
  avgReactionTime: number
  reactionTimes: number[]
}

export default function PeripheralVisionGame() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameStats, setGameStats] = useState<GameStats>({
    hits: 0,
    misses: 0,
    score: 0,
    avgReactionTime: 0,
    reactionTimes: [],
  })
  const [timeLeft, setTimeLeft] = useState(60) // 60 seconds game
  const [targets, setTargets] = useState<Target[]>([])
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [currentTargetTime, setCurrentTargetTime] = useState<number>(0)

  const targetRadius = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 15
  const targetDuration = difficulty === 'easy' ? 2000 : difficulty === 'medium' ? 1500 : 1000
  const spawnInterval = difficulty === 'easy' ? 1500 : difficulty === 'medium' ? 1000 : 750

  useEffect(() => {
    if (!isPlaying) return

    // Game timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Spawn targets
    const spawner = setInterval(() => {
      spawnTarget()
    }, spawnInterval)

    return () => {
      clearInterval(timer)
      clearInterval(spawner)
    }
  }, [isPlaying, difficulty])

  useEffect(() => {
    if (!isPlaying) return

    // Remove expired targets
    const cleaner = setInterval(() => {
      setTargets((prev) => {
        const now = Date.now()
        return prev.filter((target) => {
          const elapsed = now - currentTargetTime
          if (target.active && elapsed > targetDuration) {
            // Missed target
            setGameStats((stats) => ({
              ...stats,
              misses: stats.misses + 1,
              score: Math.max(0, stats.score - 10),
            }))
            return false
          }
          return true
        })
      })
    }, 100)

    return () => clearInterval(cleaner)
  }, [isPlaying, currentTargetTime, targetDuration])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Draw center point
    ctx.fillStyle = '#1c3049'
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 5, 0, Math.PI * 2)
    ctx.fill()

    // Draw targets
    targets.forEach((target) => {
      if (target.active) {
        // Outer circle (pulsing effect)
        const pulseRadius = targetRadius + Math.sin(Date.now() / 100) * 3
        ctx.fillStyle = 'rgba(224, 143, 52, 0.3)'
        ctx.beginPath()
        ctx.arc(target.x, target.y, pulseRadius, 0, Math.PI * 2)
        ctx.fill()

        // Main target
        ctx.fillStyle = '#e08f34'
        ctx.beginPath()
        ctx.arc(target.x, target.y, targetRadius, 0, Math.PI * 2)
        ctx.fill()

        // Inner circle
        ctx.fillStyle = '#f5cd3e'
        ctx.beginPath()
        ctx.arc(target.x, target.y, targetRadius / 2, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }, [targets])

  const spawnTarget = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const margin = targetRadius + 10

    const newTarget: Target = {
      id: Date.now(),
      x: margin + Math.random() * (canvas.width - 2 * margin),
      y: margin + Math.random() * (canvas.height - 2 * margin),
      active: true,
    }

    setTargets((prev) => [...prev, newTarget])
    setCurrentTargetTime(Date.now())
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isPlaying) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    // Convert display coordinates to canvas coordinates
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    processHit(x, y)
  }

  const handleCanvasTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isPlaying) return
    e.preventDefault() // Prevent scrolling on touch

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0] || e.changedTouches[0]

    // Convert display coordinates to canvas coordinates
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (touch.clientX - rect.left) * scaleX
    const y = (touch.clientY - rect.top) * scaleY

    processHit(x, y)
  }

  const processHit = (x: number, y: number) => {
    // Check if clicked/touched on any target
    let hit = false
    setTargets((prev) => {
      return prev.filter((target) => {
        if (!target.active) return false

        const distance = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2))
        if (distance <= targetRadius) {
          hit = true
          const reactionTime = Date.now() - currentTargetTime

          setGameStats((stats) => {
            const newReactionTimes = [...stats.reactionTimes, reactionTime]
            return {
              ...stats,
              hits: stats.hits + 1,
              score: stats.score + 20,
              reactionTimes: newReactionTimes,
              avgReactionTime:
                newReactionTimes.reduce((a, b) => a + b, 0) / newReactionTimes.length,
            }
          })

          return false // Remove hit target
        }

        return true
      })
    })

    if (!hit) {
      // Missed click/touch
      setGameStats((stats) => ({
        ...stats,
        score: Math.max(0, stats.score - 5),
      }))
    }
  }

  const startGame = () => {
    setIsPlaying(true)
    setTimeLeft(60)
    setTargets([])
    setGameStats({
      hits: 0,
      misses: 0,
      score: 0,
      avgReactionTime: 0,
      reactionTimes: [],
    })
    setCurrentTargetTime(Date.now())
  }

  const endGame = () => {
    setIsPlaying(false)
    setTargets([])
  }

  const accuracy = gameStats.hits + gameStats.misses > 0
    ? ((gameStats.hits / (gameStats.hits + gameStats.misses)) * 100).toFixed(1)
    : '0.0'

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">👁️ Vision Périphérique</h1>
              <p className="text-primary-100">
                Entraîne ta vision périphérique en cliquant sur les cibles
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/exercises')}>
              ← Retour aux exercices
            </Button>
          </div>
        </div>

        {/* Game Controls */}
        <Card>
          <CardHeader title="⚙️ Contrôles" />
          <CardBody>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Difficulté</p>
                <div className="flex gap-2">
                  <Button
                    variant={difficulty === 'easy' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setDifficulty('easy')}
                    disabled={isPlaying}
                  >
                    Facile
                  </Button>
                  <Button
                    variant={difficulty === 'medium' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setDifficulty('medium')}
                    disabled={isPlaying}
                  >
                    Moyen
                  </Button>
                  <Button
                    variant={difficulty === 'hard' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setDifficulty('hard')}
                    disabled={isPlaying}
                  >
                    Difficile
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                {!isPlaying ? (
                  <Button variant="primary" onClick={startGame}>
                    ▶️ Commencer
                  </Button>
                ) : (
                  <Button variant="danger" onClick={endGame}>
                    ⏹️ Arrêter
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Temps restant</p>
              <p className="text-2xl font-bold text-orange-600">{timeLeft}s</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Score</p>
              <p className="text-2xl font-bold text-primary-600">{gameStats.score}</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hits</p>
              <p className="text-2xl font-bold text-green-600">{gameStats.hits}</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Précision</p>
              <p className="text-2xl font-bold text-blue-600">{accuracy}%</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Temps réaction</p>
              <p className="text-2xl font-bold text-purple-600">
                {gameStats.avgReactionTime > 0 ? `${gameStats.avgReactionTime.toFixed(0)}ms` : '-'}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Game Canvas */}
        <Card>
          <CardBody>
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onClick={handleCanvasClick}
                onTouchStart={handleCanvasTouch}
                onTouchEnd={handleCanvasTouch}
                className="border-2 border-primary-300 dark:border-primary-700 rounded-lg bg-white dark:bg-gray-900 cursor-crosshair select-none"
                style={{ maxWidth: '100%', height: 'auto', touchAction: 'none' }}
              />
            </div>
          </CardBody>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader title="📖 Comment jouer" />
          <CardBody>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">1.</span>
                <p>Fixe le point central noir au milieu de l'écran</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">2.</span>
                <p>Des cibles orange apparaissent aléatoirement sur l'écran</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">3.</span>
                <p>Utilise ta vision périphérique pour repérer les cibles sans bouger les yeux</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">4.</span>
                <p>Clique sur les cibles le plus rapidement possible</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">5.</span>
                <p>+20 points par cible touchée, -10 points par cible manquée, -5 par clic raté</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>🎯 Astuce :</strong> Dans MOBA, une bonne vision périphérique te permet de
                voir les ganks, les objectifs et les teamfights sans perdre de vue ton lane !
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}
