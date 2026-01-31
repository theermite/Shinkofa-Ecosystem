/**
 * Memory Exercise Player - Main wrapper component
 * Handles exercise type selection, session management, and auto-save
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MemoryExerciseType,
  DifficultyLevel,
  MemoryExerciseConfig,
  ConfigPreset,
  MemoryExerciseSession,
} from '@/types/memoryExercise'
import memoryExerciseService from '@/services/memoryExerciseService'
import { Card, CardHeader, CardBody, Button } from '@/components/ui'
import MemoryCardGame from './MemoryCardGame'
import PatternRecall from './PatternRecall'
import SequenceMemory from './SequenceMemory'
import ImagePairs from './ImagePairs'

interface MemoryExercisePlayerProps {
  exerciseId: number
  exerciseName: string
  exerciseType: MemoryExerciseType
}

interface GameStats {
  total_moves: number
  correct_moves: number
  incorrect_moves: number
  time_elapsed_ms: number
  max_sequence_reached?: number
  completed: boolean
}

export default function MemoryExercisePlayer({
  exerciseId,
  exerciseName,
  exerciseType,
}: MemoryExercisePlayerProps) {
  const navigate = useNavigate()

  const [presets, setPresets] = useState<ConfigPreset[]>([])
  const [selectedPreset, setSelectedPreset] = useState<ConfigPreset | null>(null)
  const [currentSession, setCurrentSession] = useState<MemoryExerciseSession | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [finalScore, setFinalScore] = useState<number | null>(null)

  useEffect(() => {
    loadPresets()
  }, [exerciseType])

  const loadPresets = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await memoryExerciseService.getPresets(exerciseType)
      setPresets(data)

      // Auto-select first preset (usually Easy)
      if (data.length > 0) {
        setSelectedPreset(data[0])
      }
    } catch (err: any) {
      console.error('Failed to load presets:', err)
      setError(err.response?.data?.detail || 'Erreur de chargement des configurations')
    } finally {
      setIsLoading(false)
    }
  }

  const startGame = async () => {
    if (!selectedPreset) return

    setError(null)
    setIsSaving(true)

    try {
      // Create session
      const session = await memoryExerciseService.createSession({
        exercise_id: exerciseId,
        config: selectedPreset.config,
      })

      setCurrentSession(session)
      setIsPlaying(true)
      setFinalScore(null)
    } catch (err: any) {
      console.error('Failed to create session:', err)
      setError(err.response?.data?.detail || 'Erreur de création de la session')
    } finally {
      setIsSaving(false)
    }
  }

  const handleProgress = async (stats: GameStats) => {
    if (!currentSession) return

    // Auto-save progress (non-blocking)
    try {
      await memoryExerciseService.updateSession(currentSession.id, {
        total_moves: stats.total_moves,
        correct_moves: stats.correct_moves,
        incorrect_moves: stats.incorrect_moves,
        time_elapsed_ms: stats.time_elapsed_ms,
        max_sequence_reached: stats.max_sequence_reached,
      })
    } catch (err) {
      console.warn('Failed to auto-save progress:', err)
    }
  }

  const handleComplete = async (stats: GameStats) => {
    if (!currentSession) return

    setIsSaving(true)

    try {
      // Save final results
      const updated = await memoryExerciseService.updateSession(currentSession.id, {
        completed_at: new Date().toISOString(),
        total_moves: stats.total_moves,
        correct_moves: stats.correct_moves,
        incorrect_moves: stats.incorrect_moves,
        time_elapsed_ms: stats.time_elapsed_ms,
        max_sequence_reached: stats.max_sequence_reached,
      })

      setFinalScore(updated.final_score || 0)
      setIsPlaying(false)
    } catch (err: any) {
      console.error('Failed to save results:', err)
      setError(err.response?.data?.detail || 'Erreur de sauvegarde des résultats')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRestart = () => {
    setCurrentSession(null)
    setIsPlaying(false)
    setFinalScore(null)
  }

  const getDifficultyColor = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return 'bg-green-500'
      case DifficultyLevel.MEDIUM:
        return 'bg-yellow-500'
      case DifficultyLevel.HARD:
        return 'bg-orange-500'
      case DifficultyLevel.EXPERT:
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const renderGame = () => {
    if (!selectedPreset || !currentSession) return null

    const gameProps = {
      config: selectedPreset.config,
      onComplete: handleComplete,
      onProgress: handleProgress,
    }

    switch (exerciseType) {
      case MemoryExerciseType.MEMORY_CARDS:
        return <MemoryCardGame {...gameProps} />
      case MemoryExerciseType.PATTERN_RECALL:
        return <PatternRecall {...gameProps} />
      case MemoryExerciseType.SEQUENCE_MEMORY:
        return <SequenceMemory {...gameProps} />
      case MemoryExerciseType.IMAGE_PAIRS:
        return <ImagePairs {...gameProps} />
      default:
        return <div>Type d'exercice non supporté</div>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Chargement...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Erreur
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button variant="primary" onClick={loadPresets}>
              Réessayer
            </Button>
          </div>
        </CardBody>
      </Card>
    )
  }

  // Show game if playing
  if (isPlaying && selectedPreset) {
    return (
      <div className="h-full">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {exerciseName}
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getDifficultyColor(
              selectedPreset.difficulty
            )}`}
          >
            {selectedPreset.name}
          </span>
        </div>
        {renderGame()}
      </div>
    )
  }

  // Show results if completed
  if (finalScore !== null) {
    return (
      <Card>
        <CardHeader title="🎉 Exercice terminé !" />
        <CardBody>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-3xl font-bold text-primary-600 mb-2">
              Score: {finalScore.toFixed(0)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Difficulté: {selectedPreset?.name}
            </p>

            <div className="flex gap-3 justify-center flex-wrap">
              <Button variant="primary" onClick={handleRestart}>
                🔄 Rejouer
              </Button>
              <Button variant="outline" onClick={() => navigate('/exercises')}>
                📋 Retour aux exercices
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(`/exercises/${exerciseId}`)}
              >
                📊 Voir mes stats
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  // Show difficulty selection
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={exerciseName}
          subtitle="Choisis ta difficulté pour commencer"
        />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setSelectedPreset(preset)}
                className={`
                  p-6 rounded-lg border-2 transition-all
                  ${
                    selectedPreset?.name === preset.name
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                  }
                  touch-manipulation
                `}
              >
                <div
                  className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${getDifficultyColor(
                    preset.difficulty
                  )}`}
                >
                  <span className="text-2xl text-white">
                    {preset.difficulty === DifficultyLevel.EASY && '😊'}
                    {preset.difficulty === DifficultyLevel.MEDIUM && '😐'}
                    {preset.difficulty === DifficultyLevel.HARD && '😤'}
                    {preset.difficulty === DifficultyLevel.EXPERT && '😈'}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {preset.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {preset.config.grid_rows && preset.config.grid_cols
                    ? `Grille ${preset.config.grid_rows}×${preset.config.grid_cols}`
                    : ''}
                  {preset.config.initial_sequence_length
                    ? `Séquence ${preset.config.initial_sequence_length}+`
                    : ''}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={startGame}
              disabled={!selectedPreset || isSaving}
            >
              {isSaving ? 'Chargement...' : '▶ Commencer'}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader title="💡 Comment jouer" />
        <CardBody>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            {exerciseType === MemoryExerciseType.MEMORY_CARDS && (
              <>
                <p>
                  <strong>🎯 Objectif :</strong> Trouve toutes les paires de
                  cartes identiques
                </p>
                <p>
                  <strong>🎮 Comment :</strong> Clique sur 2 cartes pour les
                  retourner. Si elles correspondent, elles restent visibles.
                </p>
              </>
            )}
            {exerciseType === MemoryExerciseType.PATTERN_RECALL && (
              <>
                <p>
                  <strong>🎯 Objectif :</strong> Mémorise et reproduis le motif
                  de couleurs
                </p>
                <p>
                  <strong>🎮 Comment :</strong> Observe le motif, puis recréé-le
                  en cliquant sur les cellules
                </p>
              </>
            )}
            {exerciseType === MemoryExerciseType.SEQUENCE_MEMORY && (
              <>
                <p>
                  <strong>🎯 Objectif :</strong> Mémorise et répète la séquence
                  (style Simon)
                </p>
                <p>
                  <strong>🎮 Comment :</strong> Observe l'ordre des cases qui
                  s'allument, puis reproduis-le
                </p>
              </>
            )}
            {exerciseType === MemoryExerciseType.IMAGE_PAIRS && (
              <>
                <p>
                  <strong>🎯 Objectif :</strong> Associe les paires d'images liées
                  au gaming
                </p>
                <p>
                  <strong>🎮 Comment :</strong> Trouve les paires d'icônes qui vont
                  ensemble (arme + dégâts, etc.)
                </p>
              </>
            )}
            <p className="text-primary-600 dark:text-primary-400">
              <strong>⚡ Astuce :</strong> Tes performances sont automatiquement
              sauvegardées et ton score sera ajouté à tes statistiques !
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
