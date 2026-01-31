/**
 * Generic Exercise Page
 *
 * Dynamically renders any cognitive exercise based on route parameter
 */

import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getExerciseById } from '@/config/exerciseRegistry'
import { getExerciseDbId } from '@/config/exerciseIdMapping'
import { slfTheme } from '@/themes/slfTheme'
import memoryExerciseService from '@/services/memoryExerciseService'
import type { ExerciseSession, DifficultyLevel } from '@/types/cognitiveExercise'
import type { MemoryExerciseType, DifficultyLevel as BackendDifficultyLevel } from '@/types/memoryExercise'

const ExercisePage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const navigate = useNavigate()

  const exercise = exerciseId ? getExerciseById(exerciseId) : undefined

  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('MEDIUM')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">❌ Exercice introuvable</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">L'exercice demandé n'existe pas.</p>
          <button
            onClick={() => navigate('/exercises')}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            ← Retour aux exercices
          </button>
        </div>
      </div>
    )
  }

  const handleComplete = async (session: ExerciseSession) => {
    console.log('Exercise completed:', session)

    if (!currentSessionId) {
      console.error('No active session ID')
      alert('Erreur: Aucune session active')
      setIsPlaying(false)
      return
    }

    try {
      setIsLoading(true)

      // Map brain-training session to backend format
      const metadata = session.metadata || {}
      const accuracy = session.accuracy !== undefined ? session.accuracy :
                      (metadata.correct_moves && metadata.total_moves) ?
                      metadata.correct_moves / metadata.total_moves : 0

      // Update session with performance data
      const updatedSession = await memoryExerciseService.updateSession(currentSessionId, {
        completed_at: new Date().toISOString(),
        total_moves: metadata.total_moves || metadata.trials || 1,
        correct_moves: metadata.correct_moves || Math.floor((metadata.total_moves || 1) * accuracy),
        incorrect_moves: metadata.incorrect_moves || 0,
        time_elapsed_ms: session.duration_ms,
        max_sequence_reached: metadata.max_sequence_reached,
        final_score: session.score,
        score_breakdown: {
          accuracy,
          accuracy_score: session.score,
          time_score: metadata.time_score || 0,
          time_elapsed_ms: session.duration_ms,
          total_moves: metadata.total_moves || metadata.trials || 1,
          correct_moves: metadata.correct_moves || Math.floor((metadata.total_moves || 1) * accuracy),
          incorrect_moves: metadata.incorrect_moves || 0,
          max_sequence: metadata.max_sequence_reached,
          difficulty_multiplier: selectedDifficulty === 'EASY' ? 1.0 :
                                 selectedDifficulty === 'MEDIUM' ? 1.2 : 1.5,
          final_score: session.score,
        },
      })

      console.log('Session saved:', updatedSession)

      setIsPlaying(false)
      setCurrentSessionId(null)

      // Show success message with score
      alert(`✅ Exercice terminé!\n\nScore: ${updatedSession.final_score?.toFixed(0) || session.score}\nPrécision: ${(accuracy * 100).toFixed(1)}%\nTemps: ${(session.duration_ms / 1000).toFixed(1)}s`)
    } catch (err) {
      console.error('Failed to save session:', err)
      setError('Erreur lors de la sauvegarde du score')
      alert('⚠️ Exercice terminé mais erreur de sauvegarde. Réessaye plus tard.')
      setIsPlaying(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExit = () => {
    setIsPlaying(false)
  }

  const startExercise = async () => {
    if (!exercise) return

    try {
      setIsLoading(true)
      setError(null)

      // Get DB exercise ID
      const exerciseDbId = getExerciseDbId(exercise.id)

      // Convert difficulty to backend format (lowercase)
      const backendDifficulty = selectedDifficulty.toLowerCase() as BackendDifficultyLevel

      // Convert exercise type to backend format (lowercase with underscores)
      const backendExerciseType = exercise.type.toLowerCase() as MemoryExerciseType

      // Create session in backend
      // Remove difficulty from exerciseConfig to avoid override
      const { difficulty: _, ...configWithoutDifficulty } = exerciseConfig

      const session = await memoryExerciseService.createSession({
        exercise_id: exerciseDbId,
        config: {
          exercise_type: backendExerciseType,
          difficulty: backendDifficulty,
          ...configWithoutDifficulty,
          time_weight: exerciseConfig.time_weight || 0.5,
          accuracy_weight: exerciseConfig.accuracy_weight || 0.5,
        },
      })

      console.log('Session created:', session)
      setCurrentSessionId(session.id)
      setIsPlaying(true)
    } catch (err) {
      console.error('Failed to create session:', err)
      setError('Erreur lors de la création de la session')
      alert('⚠️ Impossible de démarrer l\'exercice. Vérifie ta connexion.')
    } finally {
      setIsLoading(false)
    }
  }

  // Merge default config with selected difficulty
  const exerciseConfig = {
    ...exercise.defaultConfig,
    difficulty: selectedDifficulty,
  }

  const ExerciseComponent = exercise.component

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!isPlaying ? (
        /* Exercise Info & Start Screen */
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/exercises')}
            className="mb-6 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2 transition-colors"
          >
            ← Retour aux exercices
          </button>

          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-medium p-8 mb-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="text-6xl">{exercise.icon || '🎮'}</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{exercise.title}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{exercise.description}</p>

                {/* Tags */}
                {exercise.tags && exercise.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {exercise.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Selection */}
            {exercise.difficulty.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Sélectionne la difficulté:
                </label>
                <div className="flex gap-3">
                  {exercise.difficulty.map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                        selectedDifficulty === diff
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {diff === 'EASY' && '🟢 Facile'}
                      {diff === 'MEDIUM' && '🟡 Moyen'}
                      {diff === 'HARD' && '🔴 Difficile'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Start Button */}
            <button
              onClick={startExercise}
              disabled={isLoading}
              className={`w-full py-4 text-white text-lg font-bold rounded-xl transition-colors shadow-medium ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 hover:shadow-strong'
              }`}
            >
              {isLoading ? '⏳ Création de la session...' : '🎮 Commencer l\'exercice'}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl">
                <p className="text-red-700 dark:text-red-300 text-sm">⚠️ {error}</p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-soft">
              <div className="text-2xl mb-2">⏱️</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Durée estimée</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">~{exercise.estimatedDuration} min</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-soft">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Catégorie</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">{exercise.category}</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-soft">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Meilleur score</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">-</div>
            </div>
          </div>
        </div>
      ) : (
        /* Exercise Player - Full Screen */
        <div className="h-screen flex items-center justify-center bg-gray-900">
          <div className="w-full h-full max-w-7xl mx-auto p-4">
            <ExerciseComponent config={exerciseConfig} theme={slfTheme} onComplete={handleComplete} onExit={handleExit} />
          </div>
        </div>
      )}
    </div>
  )
}

export default ExercisePage
