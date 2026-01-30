/**
 * TaskItem - Individual task item with drag & drop support
 * Extracted from Planner Shinkofa
 *
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState } from 'react'
import { Trash2, Edit2, Check, X, GripVertical, Star, StarOff } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, TaskDifficultyLevel } from '../../../../shared/types'
import { useTaskStore } from '../../stores/taskStore'

interface TaskItemProps {
  task: Task
  showDragHandle?: boolean
  onPromoteClick?: () => void
}

const difficultyConfig: Record<TaskDifficultyLevel, { label: string; emoji: string; color: string; bgColor: string }> = {
  quick: { label: 'Rapide', emoji: '⚡', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  medium: { label: 'Moyenne', emoji: '📝', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  complex: { label: 'Complexe', emoji: '🧠', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  long: { label: 'Longue', emoji: '⏰', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
}

export default function TaskItem({ task, showDragHandle = true, onPromoteClick }: TaskItemProps) {
  const { toggleTask, updateTask, deleteTask, demoteFromDailyTask } = useTaskStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || '')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return
    updateTask(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
    })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditTitle(task.title)
    setEditDescription(task.description || '')
    setIsEditing(false)
  }

  const handleSetDifficulty = (level: TaskDifficultyLevel) => {
    updateTask(task.id, { difficultyLevel: level })
  }

  if (isEditing) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg space-y-3">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
          autoFocus
          maxLength={100}
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Description (optionnel)"
          className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white resize-none"
          rows={2}
          maxLength={300}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSaveEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Check size={16} />
            Sauvegarder
          </button>
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:border-blue-500 transition-colors flex items-center gap-2"
          >
            <X size={16} />
            Annuler
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-white dark:bg-gray-800 border-2 rounded-lg transition-all ${
        task.completed
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-start gap-2">
        {showDragHandle && (
          <button
            className="p-2 -m-1 text-gray-400 hover:text-blue-500 transition-colors cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
            aria-label="Déplacer la tâche"
          >
            <GripVertical size={24} />
          </button>
        )}

        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTask(task.id)}
          className="mt-1 w-5 h-5 rounded border-2 border-gray-300 cursor-pointer accent-blue-500"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-medium ${
                task.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'
              }`}
            >
              {task.title}
            </span>
            {task.isDailyTask && (
              <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                KAIDA
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
          )}

          {/* Difficulty selector */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(Object.keys(difficultyConfig) as TaskDifficultyLevel[]).map((level) => {
              const config = difficultyConfig[level]
              const isSelected = task.difficultyLevel === level

              return (
                <button
                  key={level}
                  onClick={() => handleSetDifficulty(level)}
                  className={`px-2 py-1 rounded-full text-xs transition-all ${
                    isSelected
                      ? `${config.bgColor} ${config.color} ring-2 ring-offset-1 ring-current`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={`Niveau : ${config.label}`}
                >
                  {config.emoji} {config.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-1">
          {task.isDailyTask ? (
            <button
              onClick={() => demoteFromDailyTask(task.id)}
              className="p-2 text-orange-500 hover:text-orange-600 transition-colors"
              aria-label="Retirer des tâches prioritaires"
              title="Retirer des priorités du jour"
            >
              <StarOff size={18} />
            </button>
          ) : onPromoteClick ? (
            <button
              onClick={onPromoteClick}
              className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
              aria-label="Ajouter aux tâches prioritaires"
              title="Ajouter aux priorités du jour"
            >
              <Star size={18} />
            </button>
          ) : null}

          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            aria-label="Modifier"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Supprimer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
