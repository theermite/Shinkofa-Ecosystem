/**
 * ProjectFilters Component - Filter projects by status
 * Shinkofa Platform - Frontend
 */

'use client'

import { Badge } from '@/components/ui/Badge'
import type { ProjectFilters as ProjectFiltersType } from '@/types/api'

interface ProjectFiltersProps {
  filters: ProjectFiltersType
  onFiltersChange: (filters: ProjectFiltersType) => void
}

export function ProjectFilters({ filters, onFiltersChange }: ProjectFiltersProps) {
  const handleStatusChange = (status_filter: 'active' | 'completed' | 'archived' | undefined) => {
    onFiltersChange({ ...filters, status_filter })
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Afficher:
      </span>

      {/* All projects */}
      <button
        onClick={() => handleStatusChange(undefined)}
        className={`transition-all ${
          filters.status_filter === undefined
            ? 'scale-110'
            : 'opacity-60 hover:opacity-100'
        }`}
      >
        <Badge
          variant={filters.status_filter === undefined ? 'info' : 'default'}
          size="md"
          className="cursor-pointer"
        >
          📁 Tous
        </Badge>
      </button>

      {/* Active projects */}
      <button
        onClick={() => handleStatusChange('active')}
        className={`transition-all ${
          filters.status_filter === 'active'
            ? 'scale-110'
            : 'opacity-60 hover:opacity-100'
        }`}
      >
        <Badge
          variant={filters.status_filter === 'active' ? 'success' : 'default'}
          size="md"
          className="cursor-pointer"
        >
          🟢 Actifs
        </Badge>
      </button>

      {/* Completed projects */}
      <button
        onClick={() => handleStatusChange('completed')}
        className={`transition-all ${
          filters.status_filter === 'completed'
            ? 'scale-110'
            : 'opacity-60 hover:opacity-100'
        }`}
      >
        <Badge
          variant={filters.status_filter === 'completed' ? 'info' : 'default'}
          size="md"
          className="cursor-pointer"
        >
          ✅ Terminés
        </Badge>
      </button>

      {/* Archived projects */}
      <button
        onClick={() => handleStatusChange('archived')}
        className={`transition-all ${
          filters.status_filter === 'archived'
            ? 'scale-110'
            : 'opacity-60 hover:opacity-100'
        }`}
      >
        <Badge
          variant={filters.status_filter === 'archived' ? 'default' : 'default'}
          size="md"
          className="cursor-pointer"
        >
          📦 Archivés
        </Badge>
      </button>
    </div>
  )
}
