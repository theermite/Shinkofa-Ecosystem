/**
 * Multi-Task Test - Custom Mini-Game
 * Tests ability to handle multiple simultaneous tasks (like in MOBA games)
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DOMPurify from 'dompurify'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardHeader, CardBody, Button } from '@/components/ui'

interface Task {
  id: number
  type: 'color' | 'math' | 'direction' | 'sequence'
  question: string
  correctAnswer: string
  options: string[]
  timeLeft: number
  maxTime: number
}

interface GameStats {
  tasksCompleted: number
  tasksFailed: number
  score: number
  avgResponseTime: number
  responseTimes: number[]
}

export default function MultiTaskGame() {
  const navigate = useNavigate()
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameStats, setGameStats] = useState<GameStats>({
    tasksCompleted: 0,
    tasksFailed: 0,
    score: 0,
    avgResponseTime: 0,
    responseTimes: [],
  })
  const [timeLeft, setTimeLeft] = useState(90) // 90 seconds game
  const [activeTasks, setActiveTasks] = useState<Task[]>([])
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const taskIdCounter = useRef(0)

  const maxConcurrentTasks = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3
  const taskInterval = difficulty === 'easy' ? 4000 : difficulty === 'medium' ? 3000 : 2000
  const taskDuration = difficulty === 'easy' ? 8000 : difficulty === 'medium' ? 6000 : 4000

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

    // Task spawner
    const spawner = setInterval(() => {
      if (activeTasks.length < maxConcurrentTasks) {
        spawnTask()
      }
    }, taskInterval)

    // Task timer
    const taskTimer = setInterval(() => {
      setActiveTasks((prev) => {
        return prev
          .map((task) => ({
            ...task,
            timeLeft: task.timeLeft - 100,
          }))
          .filter((task) => {
            if (task.timeLeft <= 0) {
              // Task expired
              setGameStats((stats) => ({
                ...stats,
                tasksFailed: stats.tasksFailed + 1,
                score: Math.max(0, stats.score - 15),
              }))
              return false
            }
            return true
          })
      })
    }, 100)

    return () => {
      clearInterval(timer)
      clearInterval(spawner)
      clearInterval(taskTimer)
    }
  }, [isPlaying, activeTasks.length, maxConcurrentTasks, taskInterval])

  const generateColorTask = (): Task => {
    const colors = ['Rouge', 'Bleu', 'Vert', 'Jaune', 'Orange', 'Violet']
    const textColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple']

    const textColor = colors[Math.floor(Math.random() * colors.length)]
    const displayColor = textColors[Math.floor(Math.random() * textColors.length)]

    const correctAnswer = displayColor === 'red' ? 'Rouge' :
                         displayColor === 'blue' ? 'Bleu' :
                         displayColor === 'green' ? 'Vert' :
                         displayColor === 'yellow' ? 'Jaune' :
                         displayColor === 'orange' ? 'Orange' : 'Violet'

    return {
      id: taskIdCounter.current++,
      type: 'color',
      question: `Couleur du texte (pas le mot): <span style="color: ${displayColor}">${textColor}</span>`,
      correctAnswer,
      options: colors,
      timeLeft: taskDuration,
      maxTime: taskDuration,
    }
  }

  const generateMathTask = (): Task => {
    const operations = ['+', '-', '*']
    const op = operations[Math.floor(Math.random() * operations.length)]

    let a = Math.floor(Math.random() * 20) + 1
    let b = Math.floor(Math.random() * 10) + 1
    let answer = 0

    if (op === '+') {
      answer = a + b
    } else if (op === '-') {
      answer = a - b
    } else {
      a = Math.floor(Math.random() * 10) + 1
      b = Math.floor(Math.random() * 10) + 1
      answer = a * b
    }

    const wrongAnswers = [
      answer + Math.floor(Math.random() * 5) + 1,
      answer - Math.floor(Math.random() * 5) - 1,
      answer + Math.floor(Math.random() * 10) + 5,
    ]

    const options = [answer.toString(), ...wrongAnswers.map(String)].sort(() => Math.random() - 0.5)

    return {
      id: taskIdCounter.current++,
      type: 'math',
      question: `Calcule: ${a} ${op} ${b} = ?`,
      correctAnswer: answer.toString(),
      options,
      timeLeft: taskDuration,
      maxTime: taskDuration,
    }
  }

  const generateDirectionTask = (): Task => {
    const directions = ['Haut', 'Bas', 'Gauche', 'Droite']
    const arrows = ['↑', '↓', '←', '→']

    const correctDir = directions[Math.floor(Math.random() * directions.length)]
    const arrowIndex = Math.floor(Math.random() * arrows.length)
    const arrow = arrows[arrowIndex]

    return {
      id: taskIdCounter.current++,
      type: 'direction',
      question: `Direction de la flèche: <span class="text-3xl">${arrow}</span>`,
      correctAnswer: directions[arrowIndex],
      options: directions,
      timeLeft: taskDuration,
      maxTime: taskDuration,
    }
  }

  const generateSequenceTask = (): Task => {
    const length = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5
    const numbers = Array.from({ length }, () => Math.floor(Math.random() * 9) + 1)
    const sequence = numbers.join(' → ')
    const correctAnswer = numbers[numbers.length - 1].toString()

    const options = [
      correctAnswer,
      Math.floor(Math.random() * 9) + 1,
      Math.floor(Math.random() * 9) + 1,
      Math.floor(Math.random() * 9) + 1,
    ].map(String).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)

    return {
      id: taskIdCounter.current++,
      type: 'sequence',
      question: `Dernier nombre: ${sequence}`,
      correctAnswer,
      options: options.sort(() => Math.random() - 0.5),
      timeLeft: taskDuration,
      maxTime: taskDuration,
    }
  }

  const spawnTask = () => {
    const taskTypes = [generateColorTask, generateMathTask, generateDirectionTask, generateSequenceTask]
    const taskGenerator = taskTypes[Math.floor(Math.random() * taskTypes.length)]
    const newTask = taskGenerator()

    setActiveTasks((prev) => [...prev, newTask])
  }

  const handleAnswer = (taskId: number, answer: string) => {
    const task = activeTasks.find((t) => t.id === taskId)
    if (!task) return

    const responseTime = task.maxTime - task.timeLeft
    const isCorrect = answer === task.correctAnswer

    setGameStats((stats) => {
      const newResponseTimes = isCorrect ? [...stats.responseTimes, responseTime] : stats.responseTimes
      return {
        ...stats,
        tasksCompleted: isCorrect ? stats.tasksCompleted + 1 : stats.tasksCompleted,
        tasksFailed: isCorrect ? stats.tasksFailed : stats.tasksFailed + 1,
        score: isCorrect ? stats.score + 25 : Math.max(0, stats.score - 10),
        responseTimes: newResponseTimes,
        avgResponseTime:
          newResponseTimes.length > 0
            ? newResponseTimes.reduce((a, b) => a + b, 0) / newResponseTimes.length
            : 0,
      }
    })

    // Remove answered task
    setActiveTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  const startGame = () => {
    setIsPlaying(true)
    setTimeLeft(90)
    setActiveTasks([])
    setGameStats({
      tasksCompleted: 0,
      tasksFailed: 0,
      score: 0,
      avgResponseTime: 0,
      responseTimes: [],
    })
    taskIdCounter.current = 0
  }

  const endGame = () => {
    setIsPlaying(false)
    setActiveTasks([])
  }

  const accuracy =
    gameStats.tasksCompleted + gameStats.tasksFailed > 0
      ? ((gameStats.tasksCompleted / (gameStats.tasksCompleted + gameStats.tasksFailed)) * 100).toFixed(1)
      : '0.0'

  const getTaskBorderColor = (task: Task) => {
    const percentage = (task.timeLeft / task.maxTime) * 100
    if (percentage > 60) return 'border-green-500'
    if (percentage > 30) return 'border-yellow-500'
    return 'border-red-500'
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🧠 Test Multi-Tâches</h1>
              <p className="text-primary-100">
                Gère plusieurs tâches simultanément comme dans un MOBA
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
                    Facile (1 tâche)
                  </Button>
                  <Button
                    variant={difficulty === 'medium' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setDifficulty('medium')}
                    disabled={isPlaying}
                  >
                    Moyen (2 tâches)
                  </Button>
                  <Button
                    variant={difficulty === 'hard' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setDifficulty('hard')}
                    disabled={isPlaying}
                  >
                    Difficile (3 tâches)
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Réussies</p>
              <p className="text-2xl font-bold text-green-600">{gameStats.tasksCompleted}</p>
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Temps réponse</p>
              <p className="text-2xl font-bold text-purple-600">
                {gameStats.avgResponseTime > 0 ? `${(gameStats.avgResponseTime / 1000).toFixed(1)}s` : '-'}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Active Tasks */}
        <div className="space-y-4">
          {activeTasks.map((task) => (
            <Card key={task.id}>
              <CardBody>
                <div className={`border-l-4 ${getTaskBorderColor(task)} pl-4`}>
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${(task.timeLeft / task.maxTime) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Question */}
                  <div
                    className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.question) }}
                  />

                  {/* Options */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 touch-manipulation">
                    {task.options.map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        onClick={() => handleAnswer(task.id, option)}
                        className="min-h-[44px] touch-none select-none"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {activeTasks.length === 0 && isPlaying && (
            <Card>
              <CardBody>
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Nouvelle tâche en préparation...
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {!isPlaying && (
            <Card>
              <CardBody>
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Clique sur "Commencer" pour lancer le test
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader title="📖 Comment jouer" />
          <CardBody>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">1.</span>
                <p>Des tâches variées apparaissent aléatoirement (couleurs, maths, directions, séquences)</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">2.</span>
                <p>Plusieurs tâches peuvent être actives en même temps selon la difficulté</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">3.</span>
                <p>Réponds correctement avant que le temps ne s'écoule (barre de progression)</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">4.</span>
                <p>+25 points par bonne réponse, -10 par erreur, -15 par timeout</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">5.</span>
                <p>Gère tes priorités : traite d'abord les tâches les plus urgentes !</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>🎯 Astuce :</strong> Dans un MOBA, tu dois gérer ton lane, regarder la minimap,
                tracker les cooldowns, communiquer avec l'équipe... tout en même temps ! Ce jeu entraîne
                exactement cette compétence.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}
