/**
 * ProjectCard Component - Display single project
 * Shinkofa Platform - Frontend
 */

'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Project } from '@/types/api'
import { format } from 'date-fns'
import { useDeleteProject } from '@/hooks/api/useProjects'

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onClick?: (project: Project) => void
  isExpanded?: boolean
}

const STATUS_LABELS: Record<string, string> = {
  active: '🟢 Actif',
  completed: '✅ Terminé',
  archived: '📦 Archivé',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
}

export function ProjectCard({ project, onEdit, onClick, isExpanded }: ProjectCardProps) {
  const deleteProject = useDeleteProject()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ? Cela supprimera également toutes les tâches associées.`
      )
    ) {
      deleteProject.mutate(project.id)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    if (onEdit) {
      onEdit(project)
    }
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(project)
    }
  }

  return (
    <Card
      variant="elevated"
      className="group hover:border-blue-200 dark:hover:border-blue-800 transition-colors cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon/Color Indicator */}
          <div
            className="mt-1 h-10 w-10 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: project.color + '20' }}
          >
            {project.icon || '📁'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title with expand indicator */}
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {project.name}
              </h3>
            </div>

            {/* Description */}
            {project.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {project.description}
              </p>
            )}

            {/* Badges */}
            <div className="mt-2 flex flex-wrap gap-2">
              {/* Status Badge */}
              <Badge variant="custom" size="sm" className={STATUS_COLORS[project.status]}>
                {STATUS_LABELS[project.status]}
              </Badge>

              {/* Created Date */}
              <Badge variant="default" size="sm">
                📅 Créé le {format(new Date(project.created_at), 'dd/MM/yyyy')}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0"
              aria-label="Edit project"
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
              disabled={deleteProject.isPending}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900"
              aria-label="Delete project"
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
