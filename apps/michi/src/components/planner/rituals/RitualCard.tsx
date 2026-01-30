/**
 * RitualCard Component - Single ritual with checkbox
 * Shinkofa Platform - Frontend
 */

'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Ritual } from '@/types/api'
import { useUpdateRitual, useDeleteRitual } from '@/hooks/api/useRituals'
import { useTranslations } from 'next-intl'

interface RitualCardProps {
  ritual: Ritual
  onEdit?: (ritual: Ritual) => void
}

export function RitualCard({ ritual, onEdit }: RitualCardProps) {
  const t = useTranslations('rituals')
  const updateRitual = useUpdateRitual()
  const deleteRitual = useDeleteRitual()

  const handleToggle = () => {
    updateRitual.mutate({
      ritualId: ritual.id,
      input: { completed_today: !ritual.completed_today },
    })
  }

  const handleDelete = () => {
    if (confirm(t('deleteConfirm', { label: ritual.label }))) {
      deleteRitual.mutate(ritual.id)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent ritual toggle
    if (onEdit) {
      onEdit(ritual)
    }
  }

  return (
    <Card
      variant={ritual.completed_today ? 'default' : 'elevated'}
      className={`
        group transition-all duration-200
        ${ritual.completed_today ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'hover:border-blue-200 dark:hover:border-blue-800'}
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <button
            onClick={handleToggle}
            disabled={updateRitual.isPending}
            className={`
              relative h-6 w-6 rounded flex-shrink-0 border-2 transition-all
              ${
                ritual.completed_today
                  ? 'bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={ritual.completed_today ? t('markAsIncomplete', { label: ritual.label }) : t('markAsCompleted', { label: ritual.label })}
          >
            {ritual.completed_today && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="absolute inset-0 h-full w-full text-white"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </button>

          {/* Icon */}
          <span
            className={`text-2xl transition-all ${ritual.completed_today ? 'opacity-50 line-through' : ''}`}
            aria-hidden="true"
          >
            {ritual.icon}
          </span>

          {/* Label */}
          <span
            className={`
              flex-1 text-base font-medium transition-all
              ${
                ritual.completed_today
                  ? 'text-gray-600 dark:text-gray-400 line-through'
                  : 'text-gray-900 dark:text-gray-100'
              }
            `}
          >
            {ritual.label}
          </span>

          {/* Task count badge (if tasks exist) */}
          {ritual.tasks && ritual.tasks.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-3 w-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <span>{ritual.tasks.length}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0"
              aria-label={t('edit', { label: ritual.label })}
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
              disabled={deleteRitual.isPending}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900"
              aria-label={t('delete', { label: ritual.label })}
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

        {/* Tasks list with checkboxes (if exists and not completed) */}
        {ritual.tasks && ritual.tasks.length > 0 && !ritual.completed_today && (
          <div className="mt-3 pl-9 space-y-2">
            {ritual.tasks.map((task, index) => (
              <div key={index} className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const updatedTasks = [...ritual.tasks!]
                    updatedTasks[index] = { ...updatedTasks[index], completed: !updatedTasks[index].completed }
                    updateRitual.mutate({
                      ritualId: ritual.id,
                      input: { tasks: updatedTasks },
                    })
                  }}
                  disabled={updateRitual.isPending}
                  className={`
                    relative h-4 w-4 rounded flex-shrink-0 border-2 transition-all
                    ${
                      task.completed
                        ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  aria-label={task.completed ? t('markAsIncomplete', { label: task.label }) : t('markAsCompleted', { label: task.label })}
                >
                  {task.completed && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                      className="absolute inset-0 h-full w-full text-white"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
                <span className={`text-sm transition-all ${task.completed ? 'text-gray-500 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                  {task.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
