/**
 * ProjectCard - Project card with tasks and progress
 * Extracted from Planner Shinkofa
 *
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState } from 'react'
import { Edit2, Trash2, ChevronDown, ChevronUp, Plus, CheckCircle, Circle, Star, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ProjectModal from './ProjectModal'
import type { Project, Task, TaskDifficultyLevel } from '../../../../shared/types'
import { useTaskStore, selectDailyTasksCount } from '../../stores/taskStore'

interface ProjectCardProps {
  project: Project
  initialExpanded?: boolean
}

const difficultyConfig: Record<TaskDifficultyLevel, { emoji: string; color: string }> = {
  quick: { emoji: '⚡', color: 'text-green-600 dark:text-green-400' },
  medium: { emoji: '📝', color: 'text-blue-600 dark:text-blue-400' },
  complex: { emoji: '🧠', color: 'text-purple-600 dark:text-purple-400' },
  long: { emoji: '⏰', color: 'text-orange-600 dark:text-orange-400' },
}

// Sortable task item component
function SortableTaskItem({
  task,
  onToggle,
  onRemove,
  onPromote,
  canPromote,
}: {
  task: Task
  onToggle: () => void
  onRemove: () => void
  onPromote: () => void
  canPromote: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors ${
        isDragging ? 'shadow-lg bg-white dark:bg-gray-800' : ''
      }`}
    >
      <button
        className="p-2 -m-1 text-gray-400 hover:text-blue-500 transition-colors cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
        aria-label="Déplacer"
      >
        <GripVertical size={20} />
      </button>

      <button onClick={onToggle} className="flex-shrink-0">
        {task.completed ? (
          <CheckCircle size={18} className="text-green-500" />
        ) : (
          <Circle size={18} className="text-gray-400" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <span
          className={`text-sm ${
            task.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'
          }`}
        >
          {task.title}
        </span>
        {task.difficultyLevel && (
          <span className={`ml-2 text-xs ${difficultyConfig[task.difficultyLevel].color}`}>
            {difficultyConfig[task.difficultyLevel].emoji}
          </span>
        )}
      </div>

      {canPromote && !task.isDailyTask && (
        <button
          onClick={onPromote}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-orange-500 transition-colors"
          aria-label="Ajouter aux priorités"
          title="Ajouter aux priorités du jour"
        >
          <Star size={14} />
        </button>
      )}

      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Retirer du projet"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

export default function ProjectCard({ project, initialExpanded = false }: ProjectCardProps) {
  const {
    updateProject,
    deleteProject,
    toggleTask,
    addTask,
    assignTaskToProject,
    getTasksByProject,
    getUnassignedTasks,
    getProjectProgress,
    promoteToDailyTask,
    reorderTasks,
  } = useTaskStore()
  const dailyTasksCount = useTaskStore(selectDailyTasksCount)

  const [isExpanded, setIsExpanded] = useState(initialExpanded)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const projectTasks = getTasksByProject(project.id)
  const unassignedTasks = getUnassignedTasks()
  const { completed, total, percentage } = getProjectProgress(project.id)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 15 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleAddNewTask = () => {
    if (!newTaskTitle.trim()) return

    addTask({
      title: newTaskTitle.trim(),
      completed: false,
      priority: 'p1',
      projectId: project.id,
      order: projectTasks.length,
    })
    setNewTaskTitle('')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = projectTasks.findIndex((t) => t.id === active.id)
    const newIndex = projectTasks.findIndex((t) => t.id === over.id)

    const reordered = arrayMove(projectTasks, oldIndex, newIndex)
    reorderTasks(reordered.map((t) => t.id))
  }

  const handlePromoteTask = (taskId: string) => {
    if (dailyTasksCount >= 3) {
      alert('Maximum 3 tâches prioritaires (KAIDA). Complète ou supprime une tâche avant d\'en ajouter.')
      return
    }
    promoteToDailyTask(taskId)
  }

  const handleUpdateProject = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateProject(project.id, data)
    setShowEditModal(false)
  }

  const handleDeleteProject = () => {
    deleteProject(project.id)
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 overflow-hidden transition-all"
        style={{ borderLeftColor: project.color }}
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {project.icon && <span className="text-xl">{project.icon}</span>}
                <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    project.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : project.status === 'completed'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {project.status === 'active' ? 'En cours' : project.status === 'completed' ? 'Terminé' : 'Archivé'}
                </span>
              </div>
              {project.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                aria-label="Modifier"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {completed}/{total} tâches
              </span>
              <span className="text-sm font-medium" style={{ color: project.color }}>
                {percentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${percentage}%`, backgroundColor: project.color }}
              />
            </div>
          </div>

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} />
                Masquer les tâches
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Voir les tâches ({total})
              </>
            )}
          </button>
        </div>

        {/* Tasks list */}
        {isExpanded && (
          <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-2">
            {projectTasks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune tâche dans ce projet</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={projectTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  {projectTasks.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTask(task.id)}
                      onRemove={() => assignTaskToProject(task.id, undefined)}
                      onPromote={() => handlePromoteTask(task.id)}
                      canPromote={dailyTasksCount < 3}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}

            {/* Add new task */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNewTask()}
                  placeholder="Nouvelle tâche..."
                  className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none text-sm dark:bg-gray-700 dark:text-white"
                  maxLength={100}
                />
                <button
                  onClick={handleAddNewTask}
                  disabled={!newTaskTitle.trim()}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Add existing task */}
            {unassignedTasks.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                  <Plus size={14} />
                  Ajouter une tâche existante ({unassignedTasks.length})
                </summary>
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {unassignedTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => assignTaskToProject(task.id, project.id)}
                      className="w-full text-left p-2 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {task.title}
                    </button>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ProjectModal project={project} onSave={handleUpdateProject} onClose={() => setShowEditModal(false)} />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Supprimer le projet ?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{project.name}</strong> ? Les tâches associées ne seront pas
              supprimées, seulement dissociées du projet.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteProject}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Supprimer
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:border-red-300 transition-colors font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
