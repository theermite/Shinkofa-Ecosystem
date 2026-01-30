/**
 * TaskCard Component - Display single task
 * Shinkofa Platform - Frontend
 */

'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Task } from '@/types/api'
import {
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from '@/lib/constants'
import { format } from 'date-fns'
import { useToggleTaskCompleted, useDeleteTask } from '@/hooks/api/useTasks'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  showProject?: boolean
}

export function TaskCard({ task, onEdit, showProject = true }: TaskCardProps) {
  const toggleCompleted = useToggleTaskCompleted()
  const deleteTask = useDeleteTask()

  const handleToggleCompleted = () => {
    toggleCompleted.mutate(task)
  }

  const handleDelete = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ?`)) {
      deleteTask.mutate(task.id)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task)
    }
  }

  return (
    <Card variant="elevated" className="group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleCompleted}
            disabled={toggleCompleted.isPending}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
            aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              className={`text-base font-semibold text-gray-900 dark:text-gray-100 ${
                task.completed ? 'line-through opacity-60' : ''
              }`}
            >
              {task.title}
            </h3>

            {/* Description */}
            {task.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {task.description}
              </p>
            )}

            {/* Badges */}
            <div className="mt-2 flex flex-wrap gap-2">
              {/* Priority Badge */}
              <Badge variant="custom" size="sm" className={PRIORITY_COLORS[task.priority]}>
                {PRIORITY_LABELS[task.priority]}
              </Badge>

              {/* Difficulty Badge */}
              {task.difficulty_level && (
                <Badge variant="custom" size="sm" className={DIFFICULTY_COLORS[task.difficulty_level]}>
                  {DIFFICULTY_LABELS[task.difficulty_level]}
                </Badge>
              )}

              {/* Daily Task Badge */}
              {task.is_daily_task && (
                <Badge variant="info" size="sm">
                  📅 Daily
                </Badge>
              )}

              {/* Due Date */}
              {task.due_date && (
                <Badge
                  variant={
                    new Date(task.due_date) < new Date() && !task.completed
                      ? 'error'
                      : 'default'
                  }
                  size="sm"
                >
                  🕐 {format(new Date(task.due_date), 'dd/MM/yyyy')}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0"
              aria-label="Edit task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900"
              aria-label="Delete task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
