/**
 * ProjectList Component - Display list of projects
 * Shinkofa Platform - Frontend
 */

'use client'

import { ProjectCard } from './ProjectCard'
import { ProjectTasks } from './ProjectTasks'
import type { Project, ProjectFilters } from '@/types/api'
import { useProjects } from '@/hooks/api/useProjects'

interface ProjectListProps {
  filters?: ProjectFilters
  onEditProject?: (project: Project) => void
  onProjectClick?: (project: Project) => void
  expandedProjectId?: string | null
  emptyMessage?: string
}

export function ProjectList({
  filters,
  onEditProject,
  onProjectClick,
  expandedProjectId,
  emptyMessage = 'Aucun projet trouvé.',
}: ProjectListProps) {
  const { data: projects, isLoading, error } = useProjects(filters)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {/* Loading skeletons */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
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
          Impossible de charger les projets. Veuillez réessayer.
        </p>
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
        <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📁</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Aucun projet
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <div key={project.id} className="space-y-2">
          <ProjectCard
            project={project}
            onEdit={onEditProject}
            onClick={onProjectClick}
            isExpanded={project.id === expandedProjectId}
          />
          {/* Tasks section - shown when project is expanded */}
          {project.id === expandedProjectId && (
            <div className="ml-12 border-l-2 border-blue-300 dark:border-blue-700 pl-4">
              <ProjectTasks projectId={project.id} projectName={project.name} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
