/**
 * ProjectModal - Modal pour créer/éditer un projet
 * Shinkofa Platform - Next.js 15
 */

'use client'

import { useState } from 'react'
import { X, FolderOpen } from 'lucide-react'

interface Project {
  id?: string
  name: string
  description?: string
  color: string
  icon?: string
  status: 'active' | 'completed' | 'archived'
}

interface ProjectModalProps {
  project?: Project
  onSave: (project: Omit<Project, 'id'>) => void
  onClose: () => void
}

const PRESET_COLORS = [
  '#1c3049', // Shinkofa Bleu Marine
  '#e08f34', // Shinkofa Orange
  '#f5cd3e', // Shinkofa Jaune
  '#ef4444', // Rouge
  '#10b981', // Vert
  '#3b82f6', // Bleu
  '#8b5cf6', // Violet
  '#ec4899', // Rose
  '#f59e0b', // Ambre
  '#14b8a6', // Teal
]

const PRESET_ICONS = ['📂', '🎯', '💼', '🎨', '🏠', '💪', '📚', '🌟', '🚀', '💡']

export function ProjectModal({ project, onSave, onClose }: ProjectModalProps) {
  const [name, setName] = useState(project?.name || '')
  const [description, setDescription] = useState(project?.description || '')
  const [color, setColor] = useState(project?.color || PRESET_COLORS[0])
  const [icon, setIcon] = useState(project?.icon || '📂')
  const [status, setStatus] = useState<'active' | 'completed' | 'archived'>(
    project?.status || 'active'
  )

  const handleSave = () => {
    if (!name.trim()) return

    const projectData = {
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      icon,
      status,
    }

    onSave(projectData)
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
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-slide-up max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FolderOpen size={24} className="text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project ? 'Modifier le projet' : 'Nouveau projet'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Nom du projet *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Refonte site web"
                maxLength={100}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none text-sm dark:bg-gray-700 dark:text-white"
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
                placeholder="Décrivez brièvement ce projet..."
                maxLength={300}
                rows={3}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none text-sm dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Icône
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_ICONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg border-2 transition-colors ${
                      icon === emoji
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-orange-500'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Couleur
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      color === c
                        ? 'border-orange-500 scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Couleur ${c}`}
                  />
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Statut
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    status === 'active'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  En cours
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('completed')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    status === 'completed'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Complété
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('archived')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    status === 'archived'
                      ? 'bg-gray-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Archivé
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {project ? 'Modifier' : 'Créer'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-gray-400 transition-colors"
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
