/**
 * CreateWidgetModal Component - Modal to create new widgets
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState } from 'react'
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import api from '@/lib/api'

interface CreateWidgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type WidgetCategory = 'memory' | 'focus' | 'reaction' | 'moba' | 'productivity' | 'wellness' | 'misc'
type WidgetTemplate = 'basic' | 'game' | 'productivity'

const categories: Array<{ id: WidgetCategory; label: string; description: string }> = [
  { id: 'memory', label: 'Memory', description: 'Memory training exercises' },
  { id: 'focus', label: 'Focus', description: 'Focus and attention training' },
  { id: 'reaction', label: 'Reaction', description: 'Reaction time exercises' },
  { id: 'moba', label: 'MOBA', description: 'MOBA game training tools' },
  { id: 'productivity', label: 'Productivity', description: 'Task management and productivity tools' },
  { id: 'wellness', label: 'Wellness', description: 'Health and wellness tools' },
  { id: 'misc', label: 'Misc', description: 'Other utilities and tools' },
]

const templates: Array<{ id: WidgetTemplate; label: string; description: string }> = [
  { id: 'basic', label: 'Basic', description: 'Simple starter template' },
  { id: 'game', label: 'Game', description: 'Game with score and phases' },
  { id: 'productivity', label: 'Productivity', description: 'List-based productivity tool' },
]

export default function CreateWidgetModal({ isOpen, onClose, onSuccess }: CreateWidgetModalProps) {
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<WidgetCategory>('misc')
  const [template, setTemplate] = useState<WidgetTemplate>('basic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleNameChange = (value: string) => {
    // Auto-generate kebab-case name
    const kebab = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    setName(kebab)

    // Auto-generate display name if empty
    if (!displayName || displayName === name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) {
      setDisplayName(value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim() || !displayName.trim() || !description.trim()) {
      setError('All fields are required')
      return
    }

    setLoading(true)
    try {
      const result = await api.createWidget({
        name: name.trim(),
        displayName: displayName.trim(),
        description: description.trim(),
        category,
        template,
      })

      setSuccess(result.message)
      setTimeout(() => {
        onSuccess()
        resetForm()
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create widget')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setDisplayName('')
    setDescription('')
    setCategory('misc')
    setTemplate('basic')
    setError('')
    setSuccess('')
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-ermite-card rounded-xl border border-ermite-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ermite-border">
          <h2 className="text-xl font-semibold text-ermite-text">Create New Widget</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-ermite-text-secondary hover:text-ermite-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-ermite-text mb-2">
              Widget ID (kebab-case)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="my-new-widget"
              className="w-full px-4 py-2.5 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-ermite-text placeholder-ermite-text-secondary focus:border-ermite-primary focus:outline-none"
              disabled={loading}
            />
            <p className="text-xs text-ermite-text-secondary mt-1">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-ermite-text mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="My New Widget"
              className="w-full px-4 py-2.5 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-ermite-text placeholder-ermite-text-secondary focus:border-ermite-primary focus:outline-none"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-ermite-text mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of what this widget does..."
              className="w-full h-24 px-4 py-2.5 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-ermite-text placeholder-ermite-text-secondary focus:border-ermite-primary focus:outline-none resize-none"
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-ermite-text mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as WidgetCategory)}
              className="w-full px-4 py-2.5 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-ermite-text focus:border-ermite-primary focus:outline-none"
              disabled={loading}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} - {cat.description}
                </option>
              ))}
            </select>
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-ermite-text mb-2">
              Template
            </label>
            <div className="grid grid-cols-3 gap-2">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setTemplate(tmpl.id)}
                  disabled={loading}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    template === tmpl.id
                      ? 'border-ermite-primary bg-ermite-primary/10 text-ermite-primary'
                      : 'border-ermite-border bg-ermite-bg-secondary text-ermite-text-secondary hover:border-ermite-primary/50'
                  }`}
                >
                  <div className="font-medium text-sm">{tmpl.label}</div>
                  <div className="text-xs opacity-70 mt-1">{tmpl.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-ermite-error/20 border border-ermite-error/50 rounded-lg text-ermite-error text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !name.trim() || !displayName.trim() || !description.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-ermite-primary hover:bg-ermite-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Widget'
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2.5 bg-ermite-card hover:bg-ermite-card-hover border border-ermite-border text-ermite-text-secondary font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
