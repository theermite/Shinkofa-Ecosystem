/**
 * TaskModal - Modal pour créer/éditer une tâche
 * Shinkofa Platform - Next.js 15
 */

'use client'

import { useState } from 'react'
import { X, CheckSquare } from 'lucide-react'
import { useProjects } from '@/hooks/api/useProjects'

interface Task {
  id?: string
  title: string
  description?: string | null
  priority: 'p0' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5'
  difficulty_level?: 'quick' | 'medium' | 'complex' | 'long' | null
  project_id?: string | null
}

interface TaskModalProps {
  task?: Task
  onSave: (task: Omit<Task, 'id'>) => void
  onClose: () => void
}

const PRIORITIES = [
  { value: 'p0', label: 'P0 - Critique', color: 'bg-red-500' },
  { value: 'p1', label: 'P1 - Haute', color: 'bg-orange-500' },
  { value: 'p2', label: 'P2 - Moyenne-Haute', color: 'bg-yellow-500' },
  { value: 'p3', label: 'P3 - Normale', color: 'bg-blue-500' },
  { value: 'p4', label: 'P4 - Basse', color: 'bg-gray-400' },
  { value: 'p5', label: 'P5 - Très Basse', color: 'bg-gray-300' },
]

const DIFFICULTY_LEVELS = [
  { value: 'quick', label: '⚡ Rapide (< 30 min)' },
  { value: 'medium', label: '⏱️ Moyen (30 min - 2h)' },
  { value: 'complex', label: '🧩 Complexe (2h - 1 jour)' },
  { value: 'long', label: '📚 Long (> 1 jour)' },
]

export function TaskModal({ task, onSave, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState<'p0' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5'>(
    task?.priority || 'p3'
  )
  const [difficultyLevel, setDifficultyLevel] = useState<
    'quick' | 'medium' | 'complex' | 'long' | undefined
  >(task?.difficulty_level || undefined)
  const [projectId, setProjectId] = useState<string | undefined>(task?.project_id || undefined)

  // Fetch projects for dropdown
  const { data: projects } = useProjects({ status_filter: 'active' })

  const handleSave = () => {
    if (!title.trim()) return

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      difficulty_level: difficultyLevel,
      project_id: projectId || undefined,
    }

    onSave(taskData)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 animate-slide-up max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CheckSquare size={24} className="text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Titre de la tâche *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Terminer le rapport mensuel"
                maxLength={500}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none text-sm dark:bg-gray-700 dark:text-white"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Description (optionnel)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails supplémentaires..."
                maxLength={1000}
                rows={3}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none text-sm dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Priorité
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value as any)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      priority === p.value
                        ? `${p.color} text-white`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Difficulté (optionnel)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DIFFICULTY_LEVELS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() =>
                      setDifficultyLevel(
                        difficultyLevel === d.value ? undefined : (d.value as any)
                      )
                    }
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      difficultyLevel === d.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Assignment */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Projet (optionnel)
              </label>
              <select
                value={projectId || ''}
                onChange={(e) => setProjectId(e.target.value || undefined)}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">Aucun projet</option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.icon} {project.name}
                  </option>
                ))}
              </select>
              {projects && projects.length === 0 && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Aucun projet actif. Créez un projet d'abord.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {task ? 'Mettre à jour' : 'Créer la tâche'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
