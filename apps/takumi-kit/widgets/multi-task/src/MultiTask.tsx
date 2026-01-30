/**
 * MultiTask Widget
 * Train multitasking - manage multiple simultaneous tasks
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { ermiteTheme } from '../../../shared/theme'
import type { DifficultyLevel, WidgetScore, WidgetCallbacks } from '../../../shared/types'
import { submitScore } from '../../../shared/api/client'

type GamePhase = 'idle' | 'playing' | 'complete'

interface Task {
  id: number
  type: 'math' | 'color' | 'direction'
  question: string
  answer: string
  options: string[]
  timeLimit: number
  createdAt: number
}

interface MultiTaskProps extends WidgetCallbacks {
  difficulty?: DifficultyLevel
  userId?: string
  autoSubmitScore?: boolean
  gameDuration?: number
}

const WIDGET_ID = 'multi-task'
const WIDGET_NAME = 'Multi Task'

const COLORS = ['Rouge', 'Bleu', 'Vert', 'Jaune']
const DIRECTIONS = ['Haut', 'Bas', 'Gauche', 'Droite']

export function MultiTask({
  difficulty: initialDifficulty = 'medium' as DifficultyLevel,
  userId,
  autoSubmitScore = true,
  gameDuration = 60,
  onComplete,
  onProgress,
  onError,
}: MultiTaskProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty)
  const [tasks, setTasks] = useState<Task[]>([])
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [timeLeft, setTimeLeft] = useState(gameDuration)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const taskIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef<string>('')
  const taskIdRef = useRef(0)

  const theme = ermiteTheme

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (taskIntervalRef.current) clearInterval(taskIntervalRef.current)
    }
  }, [])

  const getSettings = useCallback(() => {
    switch (difficulty) {
      case 'easy': return { maxTasks: 2, taskInterval: 4000, taskTime: 8000 }
      case 'medium': return { maxTasks: 3, taskInterval: 3000, taskTime: 6000 }
      case 'hard': return { maxTasks: 4, taskInterval: 2500, taskTime: 5000 }
      case 'expert': return { maxTasks: 5, taskInterval: 2000, taskTime: 4000 }
      default: return { maxTasks: 3, taskInterval: 3000, taskTime: 6000 }
    }
  }, [difficulty])

  const generateTask = useCallback((): Task => {
    const types: Array<'math' | 'color' | 'direction'> = ['math', 'color', 'direction']
    const type = types[Math.floor(Math.random() * types.length)]
    const settings = getSettings()
    const id = ++taskIdRef.current

    if (type === 'math') {
      const a = Math.floor(Math.random() * 10) + 1
      const b = Math.floor(Math.random() * 10) + 1
      const ops = ['+', '-', '*'] as const
      const op = ops[Math.floor(Math.random() * ops.length)]
      let result: number
      switch (op) {
        case '+': result = a + b; break
        case '-': result = a - b; break
        case '*': result = a * b; break
      }
      const options = [result.toString()]
      while (options.length < 4) {
        const fake = (result + Math.floor(Math.random() * 10) - 5).toString()
        if (!options.includes(fake)) options.push(fake)
      }
      return {
        id,
        type,
        question: `${a} ${op} ${b} = ?`,
        answer: result.toString(),
        options: options.sort(() => Math.random() - 0.5),
        timeLimit: settings.taskTime,
        createdAt: Date.now(),
      }
    }

    if (type === 'color') {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      return {
        id,
        type,
        question: `Couleur ?`,
        answer: color,
        options: [...COLORS].sort(() => Math.random() - 0.5),
        timeLimit: settings.taskTime,
        createdAt: Date.now(),
      }
    }

    const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
    return {
      id,
      type,
      question: `Direction ?`,
      answer: direction,
      options: [...DIRECTIONS].sort(() => Math.random() - 0.5),
      timeLimit: settings.taskTime,
      createdAt: Date.now(),
    }
  }, [getSettings])

  const startGame = useCallback(() => {
    startedAtRef.current = new Date().toISOString()
    setScore(0)
    setCorrect(0)
    setWrong(0)
    setTimeLeft(gameDuration)
    setTasks([])
    setGamePhase('playing')
    taskIdRef.current = 0

    const settings = getSettings()

    // Add initial task
    setTasks([generateTask()])

    // Timer countdown
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleGameComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Generate new tasks
    taskIntervalRef.current = setInterval(() => {
      setTasks(prev => {
        const now = Date.now()
        // Remove expired tasks
        const active = prev.filter(t => now - t.createdAt < t.timeLimit)
        // Add new task if under limit
        if (active.length < settings.maxTasks) {
          return [...active, generateTask()]
        }
        return active
      })
    }, settings.taskInterval)
  }, [gameDuration, getSettings, generateTask])

  const handleAnswer = (taskId: number, answer: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const isCorrect = answer === task.answer
    if (isCorrect) {
      const points = 100 * getDifficultyMultiplier()
      setScore(s => s + points)
      setCorrect(c => c + 1)
    } else {
      setWrong(w => w + 1)
    }

    setTasks(prev => prev.filter(t => t.id !== taskId))

    if (onProgress) {
      onProgress({
        currentStep: correct + wrong + 1,
        totalSteps: gameDuration,
        partialScore: score + (isCorrect ? 100 * getDifficultyMultiplier() : 0),
        metrics: { correct: correct + (isCorrect ? 1 : 0), wrong: wrong + (isCorrect ? 0 : 1) },
      })
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
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (taskIntervalRef.current) clearInterval(taskIntervalRef.current)
    setGamePhase('complete')

    const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0
    const finalScore = Math.round(score * (1 + accuracy / 200))

    const widgetScore: WidgetScore = {
      widgetId: WIDGET_ID,
      widgetName: WIDGET_NAME,
      userId,
      score: finalScore,
      metrics: {
        correct,
        wrong,
        accuracy,
        tasksPerMinute: Math.round(((correct + wrong) / gameDuration) * 60),
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
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (taskIntervalRef.current) clearInterval(taskIntervalRef.current)
    setGamePhase('idle')
    setTasks([])
    setScore(0)
    setCorrect(0)
    setWrong(0)
    setTimeLeft(gameDuration)
  }

  const getTaskColor = (type: Task['type']): string => {
    switch (type) {
      case 'math': return theme.colors.primary
      case 'color': return theme.colors.accent
      case 'direction': return theme.colors.success
    }
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
      marginBottom: '1rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
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
    timerBar: {
      height: '8px',
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: '4px',
      marginBottom: '1rem',
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
      flexDirection: 'column' as const,
      gap: '0.75rem',
      overflow: 'auto',
    },
    taskCard: (type: Task['type']) => ({
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius,
      padding: '1rem',
      borderLeft: `4px solid ${getTaskColor(type)}`,
    }),
    taskQuestion: {
      fontSize: '1rem',
      fontWeight: 'bold',
      marginBottom: '0.75rem',
    },
    taskOptions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.5rem',
    },
    optionBtn: {
      padding: '0.5rem',
      borderRadius: theme.borderRadius,
      backgroundColor: theme.colors.backgroundSecondary,
      border: 'none',
      cursor: 'pointer',
      color: theme.colors.text,
      fontFamily: theme.fontFamily,
      transition: 'background-color 0.15s',
    },
    statsPanel: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius,
      padding: '1rem',
      marginTop: '1rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
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
      marginTop: '1rem',
    }),
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Multi Task</h2>
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

      {gamePhase === 'playing' && (
        <div style={styles.timerBar}>
          <div style={styles.timerFill} />
        </div>
      )}

      <div style={styles.gameArea}>
        {gamePhase === 'playing' && tasks.map(task => (
          <div key={task.id} style={styles.taskCard(task.type)}>
            <div style={styles.taskQuestion}>
              {task.type === 'color' && (
                <span style={{ color: task.answer === 'Rouge' ? '#ef4444' : task.answer === 'Bleu' ? '#3b82f6' : task.answer === 'Vert' ? '#22c55e' : '#eab308' }}>
                  {task.question}
                </span>
              )}
              {task.type === 'direction' && (
                <span>
                  {task.answer === 'Haut' && '↑'} {task.answer === 'Bas' && '↓'} {task.answer === 'Gauche' && '←'} {task.answer === 'Droite' && '→'} {task.question}
                </span>
              )}
              {task.type === 'math' && task.question}
            </div>
            <div style={styles.taskOptions}>
              {task.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(task.id, opt)}
                  style={styles.optionBtn}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        {gamePhase === 'complete' && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.colors.success }}>
              Temps ecoule !
            </p>
            <p style={{ color: theme.colors.textSecondary, marginTop: '0.5rem' }}>
              Precision : {correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0}%
            </p>
          </div>
        )}
      </div>

      <div style={styles.statsPanel}>
        <div style={styles.statsGrid}>
          <div>
            <div style={styles.statLabel}>Temps</div>
            <div style={styles.statValue}>{timeLeft}s</div>
          </div>
          <div>
            <div style={styles.statLabel}>Correct</div>
            <div style={{ ...styles.statValue, color: theme.colors.success }}>{correct}</div>
          </div>
          <div>
            <div style={styles.statLabel}>Erreurs</div>
            <div style={{ ...styles.statValue, color: theme.colors.error }}>{wrong}</div>
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

export default MultiTask
