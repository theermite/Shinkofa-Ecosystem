/**
 * ProjectList - List of projects with sections
 * Extracted from Planner Shinkofa
 *
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState } from 'react'
import { Plus, FolderOpen } from 'lucide-react'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import type { Project } from '../../../../shared/types'
import { useTaskStore, selectActiveProjects, selectCompletedProjects, selectArchivedProjects } from '../../stores/taskStore'

export default function ProjectList() {
  const { addProject } = useTaskStore()
  const activeProjects = useTaskStore(selectActiveProjects)
  const completedProjects = useTaskStore(selectCompletedProjects)
  const archivedProjects = useTaskStore(selectArchivedProjects)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newlyCreatedProjectId, setNewlyCreatedProjectId] = useState<string | null>(null)

  const handleCreateProject = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject = addProject(data)
    setNewlyCreatedProjectId(newProject.id)
    setTimeout(() => setNewlyCreatedProjectId(null), 5000)
  }

  const hasProjects = activeProjects.length > 0 || completedProjects.length > 0 || archivedProjects.length > 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FolderOpen size={24} />
          Mes Projets
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Nouveau Projet
        </button>
      </div>

      {!hasProjects ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <FolderOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">Aucun projet pour le moment</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Créer mon premier projet
          </button>
        </div>
      ) : (
        <>
          {/* Active projects */}
          {activeProjects.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                En cours ({activeProjects.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {activeProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    initialExpanded={project.id === newlyCreatedProjectId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed projects */}
          {completedProjects.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                Terminés ({completedProjects.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {completedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}

          {/* Archived projects */}
          {archivedProjects.length > 0 && (
            <details className="space-y-4">
              <summary className="text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full" />
                Archivés ({archivedProjects.length})
              </summary>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {archivedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </details>
          )}
        </>
      )}

      {showCreateModal && <ProjectModal onSave={handleCreateProject} onClose={() => setShowCreateModal(false)} />}
    </div>
  )
}
