/**
 * Reaction Time Test - Custom Mini-Game
 * Tests reaction time by measuring how fast users click when a button turns green
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardHeader, CardBody, Button } from '@/components/ui'
import exerciseService from '@/services/exerciseService'

type GamePhase = 'idle' | 'waiting' | 'ready' | 'tooEarly' | 'result'

interface ReactionResult {
  reactionTime: number
  timestamp: number
}

interface GameStats {
  attempts: ReactionResult[]
  averageTime: number
  fastestTime: number
  slowestTime: number
  consistency: number // Standard deviation (lower is more consistent)
}

export default function ReactionTimeGame() {
  const navigate = useNavigate()
  const { id: exerciseId } = useParams<{ id: string }>()

  const [gamePhase, setGamePhase] = useState<GamePhase>('idle')
  const [currentAttempt, setCurrentAttempt] = useState(0)
  const [gameStats, setGameStats] = useState<GameStats>({
    attempts: [],
    averageTime: 0,
    fastestTime: 0,
    slowestTime: 0,
    consistency: 0,
  })
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const startTimeRef = useRef<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalAttempts = 5
  const minDelay = difficulty === 'easy' ? 2000 : difficulty === 'medium' ? 1500 : 1000
  const maxDelay = difficulty === 'easy' ? 5000 : difficulty === 'medium' ? 4000 : 3000

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const calculateStats = (attempts: ReactionResult[]): GameStats => {
    if (attempts.length === 0) {
      return {
        attempts: [],
        averageTime: 0,
        fastestTime: 0,
        slowestTime: 0,
        consistency: 0,
      }
    }

    const times = attempts.map((a) => a.reactionTime)
    const averageTime = times.reduce((a, b) => a + b, 0) / times.length
    const fastestTime = Math.min(...times)
    const slowestTime = Math.max(...times)

    // Calculate standard deviation for consistency score
    const variance = times.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / times.length
    const standardDeviation = Math.sqrt(variance)

    return {
      attempts,
      averageTime,
      fastestTime,
      slowestTime,
      consistency: standardDeviation,
    }
  }

  const startTest = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setGamePhase('waiting')
    const delay = Math.random() * (maxDelay - minDelay) + minDelay

    timeoutRef.current = setTimeout(() => {
      setGamePhase('ready')
      startTimeRef.current = Date.now()
    }, delay)
  }

  const handleClick = () => {
    if (gamePhase === 'waiting') {
      // Clicked too early
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setGamePhase('tooEarly')
      return
    }

    if (gamePhase === 'ready') {
      // Correct click - measure reaction time
      const reactionTime = Date.now() - startTimeRef.current
      const newAttempt: ReactionResult = {
        reactionTime,
        timestamp: Date.now(),
      }

      const newAttempts = [...gameStats.attempts, newAttempt]
      const newStats = calculateStats(newAttempts)
      setGameStats(newStats)
      setCurrentAttempt(currentAttempt + 1)
      setGamePhase('result')

      // Auto-start next attempt after showing result
      if (currentAttempt + 1 < totalAttempts) {
        setTimeout(() => {
          startTest()
        }, 1500)
      }
    }
  }

  const handleTouch = (e: React.TouchEvent) => {
    e.preventDefault() // Prevent scrolling on touch
    handleClick()
  }

  const resetGame = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setGamePhase('idle')
    setCurrentAttempt(0)
    setGameStats({
      attempts: [],
      averageTime: 0,
      fastestTime: 0,
      slowestTime: 0,
      consistency: 0,
    })
    setSubmitSuccess(false)
  }

  const handleSubmitScore = async () => {
    if (!exerciseId || gameStats.averageTime === 0) return

    setIsSubmitting(true)
    try {
      await exerciseService.submitScore({
        exercise_id: parseInt(exerciseId),
        score_value: Math.round(gameStats.averageTime),
        score_unit: 'ms',
        notes: `Moyenne de ${totalAttempts} tentatives. Meilleur: ${Math.round(gameStats.fastestTime)}ms, Pire: ${Math.round(gameStats.slowestTime)}ms, Consistance: ${Math.round(gameStats.consistency)}ms`,
      })
      setSubmitSuccess(true)
      setTimeout(() => {
        navigate(`/exercises/${exerciseId}`)
      }, 2000)
    } catch (error) {
      console.error('Error submitting score:', error)
      alert('Erreur lors de la sauvegarde du score. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getBackgroundColor = () => {
    switch (gamePhase) {
      case 'idle':
        return 'bg-gray-200 dark:bg-gray-700'
      case 'waiting':
        return 'bg-red-500'
      case 'ready':
        return 'bg-green-500'
      case 'tooEarly':
        return 'bg-orange-500'
      case 'result':
        return 'bg-blue-500'
      default:
        return 'bg-gray-200 dark:bg-gray-700'
    }
  }

  const getMessage = () => {
    switch (gamePhase) {
      case 'idle':
        return 'Clique sur "Commencer le test" pour démarrer'
      case 'waiting':
        return 'Attends le vert...'
      case 'ready':
        return 'CLIQUE MAINTENANT !'
      case 'tooEarly':
        return 'Trop tôt ! Attends le vert.'
      case 'result':
        const lastReaction = gameStats.attempts[gameStats.attempts.length - 1]
        return `${lastReaction.reactionTime}ms !`
      default:
        return ''
    }
  }

  const isGameComplete = currentAttempt >= totalAttempts
  const canStart = gamePhase === 'idle' || gamePhase === 'tooEarly'

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">⚡ Test de Temps de Réaction</h1>
              <p className="text-primary-100">
                Mesure ta vitesse de réaction en millisecondes
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
                    disabled={gamePhase !== 'idle'}
                  >
                    Facile (2-5s)
                  </Button>
                  <Button
                    variant={difficulty === 'medium' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setDifficulty('medium')}
                    disabled={gamePhase !== 'idle'}
                  >
                    Moyen (1.5-4s)
                  </Button>
                  <Button
                    variant={difficulty === 'hard' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setDifficulty('hard')}
                    disabled={gamePhase !== 'idle'}
                  >
                    Difficile (1-3s)
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                {canStart && !isGameComplete && (
                  <Button variant="primary" onClick={startTest}>
                    {currentAttempt === 0 ? '▶️ Commencer le test' : '▶️ Continuer'}
                  </Button>
                )}
                {isGameComplete && (
                  <>
                    <Button variant="primary" onClick={resetGame}>
                      🔄 Recommencer
                    </Button>
                    {exerciseId && !submitSuccess && (
                      <Button
                        variant="primary"
                        onClick={handleSubmitScore}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? '💾 Sauvegarde...' : '💾 Sauvegarder le score'}
                      </Button>
                    )}
                    {submitSuccess && (
                      <div className="text-green-600 font-semibold flex items-center">
                        ✅ Score sauvegardé ! Redirection...
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Progress */}
        <Card>
          <CardBody>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Progression</span>
                <span>
                  {currentAttempt} / {totalAttempts} tentatives
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(currentAttempt / totalAttempts) * 100}%` }}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Game Area */}
        <Card>
          <CardBody>
            <div
              className={`${getBackgroundColor()} rounded-xl transition-colors duration-150 cursor-pointer select-none flex items-center justify-center min-h-[400px] touch-none`}
              onClick={handleClick}
              onTouchStart={handleTouch}
              style={{ touchAction: 'none' }}
            >
              <div className="text-center">
                <p className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                  {getMessage()}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Results */}
        {gameStats.attempts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Moyenne</p>
                <p className="text-2xl font-bold text-primary-600">
                  {Math.round(gameStats.averageTime)}ms
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Meilleur</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(gameStats.fastestTime)}ms
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pire</p>
                <p className="text-2xl font-bold text-red-600">
                  {Math.round(gameStats.slowestTime)}ms
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Consistance</p>
                <p className="text-2xl font-bold text-purple-600">
                  ±{Math.round(gameStats.consistency)}ms
                </p>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Attempts History */}
        {gameStats.attempts.length > 0 && (
          <Card>
            <CardHeader title="📊 Historique des tentatives" />
            <CardBody>
              <div className="space-y-2">
                {gameStats.attempts.map((attempt, index) => (
                  <div
                    key={attempt.timestamp}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Tentative {index + 1}
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        attempt.reactionTime === gameStats.fastestTime
                          ? 'text-green-600'
                          : attempt.reactionTime === gameStats.slowestTime
                          ? 'text-red-600'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {attempt.reactionTime}ms
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader title="📖 Comment jouer" />
          <CardBody>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">1.</span>
                <p>Clique sur "Commencer le test" pour démarrer</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">2.</span>
                <p>L'écran devient rouge - ATTENDS !</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">3.</span>
                <p>Dès que l'écran devient VERT, clique le plus vite possible</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">4.</span>
                <p>
                  Répète 5 fois pour obtenir ton temps de réaction moyen en millisecondes
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">5.</span>
                <p>Si tu cliques trop tôt (sur le rouge), la tentative ne compte pas</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>🎯 Astuce :</strong> Un bon temps de réaction dans les jeux esport se
                  situe entre 150-300ms. Les joueurs professionnels peuvent descendre à 100-150ms !
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-900 dark:text-green-100">
                  <strong>⚡ Saviez-vous ?</strong> Le temps de réaction moyen d'un humain est de
                  250ms pour un stimulus visuel. Avec de l'entraînement, vous pouvez descendre à
                  200ms ou moins !
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-900 dark:text-purple-100">
                  <strong>🧠 Consistance :</strong> Une bonne consistance (faible écart-type) est
                  aussi importante qu'un temps rapide. Cela montre que votre concentration est
                  stable !
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}
