/**
 * Assign Exercise Modal - Coach assigns exercise to player
 */

import { FC, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import assignmentService from '@/services/assignmentService'
import { User } from '@/types/user'
import { Exercise } from '@/types/exercise'
import { ExerciseAssignmentCreate } from '@/types/assignment'

interface AssignExerciseModalProps {
  isOpen: boolean
  onClose: () => void
  player: User
  exercises: Exercise[]
}

const AssignExerciseModal: FC<AssignExerciseModalProps> = ({
  isOpen,
  onClose,
  player,
  exercises,
}) => {
  const queryClient = useQueryClient()
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetScore, setTargetScore] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState(5)
  const [isMandatory, setIsMandatory] = useState(false)
  const [error, setError] = useState('')

  // Create assignment mutation
  const createAssignment = useMutation(
    (data: ExerciseAssignmentCreate) => assignmentService.createAssignment(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myCreatedAssignments')
        queryClient.invalidateQueries('myAssignments')
        handleClose()
      },
      onError: (err: any) => {
        setError(err.response?.data?.detail || 'Erreur lors de l\'assignation')
      },
    }
  )

  const handleClose = () => {
    setSelectedExerciseId(null)
    setTitle('')
    setDescription('')
    setTargetScore('')
    setDueDate('')
    setPriority(5)
    setIsMandatory(false)
    setError('')
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedExerciseId) {
      setError('Veuillez sélectionner un exercice')
      return
    }

    const assignmentData: ExerciseAssignmentCreate = {
      exercise_id: selectedExerciseId,
      player_id: player.id,
      title: title || undefined,
      description: description || undefined,
      target_score: targetScore || undefined,
      due_date: dueDate || undefined,
      priority,
      is_mandatory: isMandatory,
    }

    createAssignment.mutate(assignmentData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Assigner un exercice à {player.username}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Exercise Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Exercice <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedExerciseId || ''}
              onChange={(e) => setSelectedExerciseId(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Sélectionner un exercice</option>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name} ({exercise.category})
                </option>
              ))}
            </select>
          </div>

          {/* Custom Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre personnalisé (optionnel)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Laisser vide pour utiliser le nom de l'exercice"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instructions / Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Ajouter des instructions spécifiques pour le joueur..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Target Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Objectif de score
            </label>
            <input
              type="text"
              value={targetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              placeholder="Ex: < 300ms, > 80%, 100 points"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date limite
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priorité: {priority}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span>Faible</span>
              <span>Moyenne</span>
              <span>Haute</span>
            </div>
          </div>

          {/* Mandatory */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="mandatory"
              checked={isMandatory}
              onChange={(e) => setIsMandatory(e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
            />
            <label
              htmlFor="mandatory"
              className="ml-2 text-sm text-gray-700 dark:text-gray-300"
            >
              Exercice obligatoire
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createAssignment.isLoading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createAssignment.isLoading ? 'Assignment...' : 'Assigner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssignExerciseModal
