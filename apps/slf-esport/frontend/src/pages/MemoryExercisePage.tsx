/**
 * Memory Exercise Page - Dedicated page for playing memory exercises
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardBody, Button } from '@/components/ui'
import exerciseService from '@/services/exerciseService'
import MemoryExercisePlayer from '@/components/games/memory/MemoryExercisePlayer'
import { MemoryExerciseType } from '@/types/memoryExercise'
import type { Exercise } from '@/types/exercise'
import { ExerciseCategory } from '@/types/exercise'

export default function MemoryExercisePage() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const navigate = useNavigate()

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (exerciseId) {
      loadExercise(parseInt(exerciseId))
    }
  }, [exerciseId])

  const loadExercise = async (id: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await exerciseService.getExercise(id)
      setExercise(data)

      // Verify it's a memory exercise
      if (data.category !== ExerciseCategory.MEMOIRE) {
        setError('Cet exercice n\'est pas un exercice de mémoire visuelle')
      }
    } catch (err: any) {
      console.error('Failed to load exercise:', err)
      setError(
        err.response?.data?.detail || 'Erreur de chargement de l\'exercice'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Map exercise name to memory exercise type
  const getMemoryExerciseType = (exercise: Exercise): MemoryExerciseType => {
    const name = exercise.name.toLowerCase()

    if (name.includes('carte') || name.includes('card') || name.includes('paires')) {
      return MemoryExerciseType.MEMORY_CARDS
    }
    if (name.includes('motif') || name.includes('pattern')) {
      return MemoryExerciseType.PATTERN_RECALL
    }
    if (name.includes('séquence') || name.includes('sequence') || name.includes('simon')) {
      return MemoryExerciseType.SEQUENCE_MEMORY
    }
    if (name.includes('image') || name.includes('association')) {
      return MemoryExerciseType.IMAGE_PAIRS
    }

    // Default to memory cards
    return MemoryExerciseType.MEMORY_CARDS
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Chargement de l'exercice...
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !exercise) {
    return (
      <MainLayout>
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">⚠️</span>
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Erreur
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error || 'Exercice introuvable'}
              </p>
              <Button variant="primary" onClick={() => navigate('/exercises')}>
                Retour aux exercices
              </Button>
            </div>
          </CardBody>
        </Card>
      </MainLayout>
    )
  }

  const memoryExerciseType = getMemoryExerciseType(exercise)

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/exercises')}
          >
            ← Retour aux exercices
          </Button>
        </div>

        {/* Memory Exercise Player */}
        <MemoryExercisePlayer
          exerciseId={exercise.id}
          exerciseName={exercise.name}
          exerciseType={memoryExerciseType}
        />
      </div>
    </MainLayout>
  )
}
