/**
 * TaskList Component - Display list of tasks
 * Shinkofa Platform - Frontend
 */

'use client'

import { TaskCard } from './TaskCard'
import type { Task, TaskFilters } from '@/types/api'
import { useTasks } from '@/hooks/api/useTasks'

interface TaskListProps {
  filters?: TaskFilters
  onEditTask?: (task: Task) => void
  emptyMessage?: string
}

export function TaskList({ filters, onEditTask, emptyMessage = 'Aucune tâche trouvée.' }: TaskListProps) {
  const { data: tasks, isLoading, error } = useTasks(filters)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {/* Loading skeletons */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <div className="text-red-600 dark:text-red-400 text-4xl mb-3">⚠️</div>
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300">
          Impossible de charger les tâches. Veuillez réessayer.
        </p>
      </div>
    )
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
        <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Aucune tâche
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEditTask}
        />
      ))}
    </div>
  )
}
