/**
 * EditRitualModal Component - Modal for editing an existing ritual
 * Shinkofa Platform - Frontend
 */

'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUpdateRitual } from '@/hooks/api/useRituals'
import type { Ritual, RitualTask } from '@/types/api'

interface EditRitualModalProps {
  ritual: Ritual | null
  isOpen: boolean
  onClose: () => void
}

// Extended icon library with categories
const ICON_CATEGORIES = {
  health: ['🧘', '🏃', '💪', '🚴', '🏊', '⛹️', '🧗', '🤸', '🏋️', '🥊'],
  wellness: ['❤️', '💚', '💙', '💜', '🧡', '💛', '🤍', '🖤', '❤️‍🔥', '💝'],
  food: ['🥗', '🍎', '🥑', '🥕', '🍊', '🥤', '☕', '🍵', '🥛', '🧃'],
  mind: ['🧠', '📖', '✍️', '🎨', '🎵', '🎭', '🎬', '📚', '💭', '🧩'],
  nature: ['🌸', '🌺', '🌻', '🌷', '🌹', '🍀', '🌿', '🌱', '🌾', '🌳'],
  energy: ['⚡', '🔥', '💫', '✨', '⭐', '🌟', '💥', '🌈', '☀️', '🌙'],
  spiritual: ['🕉️', '☯️', '🔯', '☪️', '✝️', '☦️', '⛩️', '🛐', '📿', '🙏'],
  productivity: ['🎯', '📝', '📊', '📈', '💼', '🗂️', '📋', '✅', '☑️', '✔️'],
  sleep: ['😴', '💤', '🌙', '🌛', '🌜', '🌚', '🌝', '🛌', '🌃', '🌌'],
  time: ['⏰', '⏱️', '⏲️', '⌛', '⏳', '🕐', '🕑', '🕒', '🕓', '🕔'],
}

export function EditRitualModal({ ritual, isOpen, onClose }: EditRitualModalProps) {
  const [label, setLabel] = useState('')
  const [icon, setIcon] = useState('✅')
  const [tasks, setTasks] = useState<RitualTask[]>([])
  const [currentTask, setCurrentTask] = useState('')
  const [selectedIconCategory, setSelectedIconCategory] = useState<keyof typeof ICON_CATEGORIES>('productivity')
  const updateRitual = useUpdateRitual()

  // Load ritual data when modal opens
  useEffect(() => {
    if (ritual) {
      setLabel(ritual.label)
      setIcon(ritual.icon)
      setTasks(ritual.tasks || [])
    }
  }, [ritual])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!ritual || !label.trim()) {
      return
    }

    updateRitual.mutate(
      {
        ritualId: ritual.id,
        input: {
          label: label.trim(),
          icon,
          tasks,
        },
      },
      {
        onSuccess: () => {
          onClose()
        },
        onError: (error) => {
          console.error('Failed to update ritual:', error)
        },
      }
    )
  }

  const handleAddTask = () => {
    if (currentTask.trim()) {
      setTasks([...tasks, { label: currentTask.trim(), completed: false }])
      setCurrentTask('')
    }
  }

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  const handleClose = () => {
    if (!updateRitual.isPending) {
      onClose()
    }
  }

  if (!ritual) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="✏️ Modifier le rituel" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Label */}
        <div>
          <label htmlFor="ritual-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom du rituel *
          </label>
          <Input
            id="ritual-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: Méditation matinale"
            disabled={updateRitual.isPending}
            required
            autoFocus
          />
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Icône
          </label>

          {/* Icon category tabs */}
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.keys(ICON_CATEGORIES).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedIconCategory(cat as keyof typeof ICON_CATEGORIES)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-all
                  ${
                    selectedIconCategory === cat
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Icon grid */}
          <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
            {ICON_CATEGORIES[selectedIconCategory].map((iconOption) => (
              <button
                key={iconOption}
                type="button"
                onClick={() => setIcon(iconOption)}
                disabled={updateRitual.isPending}
                className={`
                  p-2 rounded-lg border-2 transition-all text-center text-xl
                  ${
                    icon === iconOption
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {iconOption}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tâches du rituel (optionnel)
          </label>

          {/* Task list */}
          {tasks.length > 0 && (
            <div className="mb-3 space-y-2">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">{task.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add task input */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTask()
                }
              }}
              placeholder="Ajouter une tâche..."
              disabled={updateRitual.isPending}
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleAddTask}
              disabled={!currentTask.trim() || updateRitual.isPending}
            >
              ➕
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Appuyez sur Entrée ou cliquez sur ➕ pour ajouter une tâche
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleClose}
            disabled={updateRitual.isPending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!label.trim() || updateRitual.isPending}
          >
            {updateRitual.isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Mise à jour...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>

        {/* Error display */}
        {updateRitual.isError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              ❌ Une erreur est survenue lors de la mise à jour. Veuillez réessayer.
            </p>
          </div>
        )}
      </form>
    </Modal>
  )
}
