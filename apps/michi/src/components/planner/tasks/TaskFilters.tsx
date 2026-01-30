/**
 * TaskFilters Component - Filter tasks by status/project
 * Shinkofa Platform - Frontend
 */

'use client'

import { Badge } from '@/components/ui/Badge'
import type { TaskFilters as TaskFiltersType } from '@/types/api'

interface TaskFiltersProps {
  filters: TaskFiltersType
  onFiltersChange: (filters: TaskFiltersType) => void
}

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const handleStatusChange = (completed: boolean | undefined) => {
    onFiltersChange({ ...filters, completed })
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Afficher:
      </span>

      {/* All tasks */}
      <button
        onClick={() => handleStatusChange(undefined)}
        className={`transition-all ${
          filters.completed === undefined
            ? 'scale-110'
            : 'opacity-60 hover:opacity-100'
        }`}
      >
        <Badge
          variant={filters.completed === undefined ? 'info' : 'default'}
          size="md"
          className="cursor-pointer"
        >
          📋 Toutes
        </Badge>
      </button>

      {/* Active tasks */}
      <button
        onClick={() => handleStatusChange(false)}
        className={`transition-all ${
          filters.completed === false
            ? 'scale-110'
            : 'opacity-60 hover:opacity-100'
        }`}
      >
        <Badge
          variant={filters.completed === false ? 'warning' : 'default'}
          size="md"
          className="cursor-pointer"
        >
          ⏳ En cours
        </Badge>
      </button>

      {/* Completed tasks */}
      <button
        onClick={() => handleStatusChange(true)}
        className={`transition-all ${
          filters.completed === true
            ? 'scale-110'
            : 'opacity-60 hover:opacity-100'
        }`}
      >
        <Badge
          variant={filters.completed === true ? 'success' : 'default'}
          size="md"
          className="cursor-pointer"
        >
          ✅ Complétées
        </Badge>
      </button>
    </div>
  )
}
