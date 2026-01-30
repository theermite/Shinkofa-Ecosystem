/**
 * WidgetEditModal Component - Modal for editing all widget properties
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState, useEffect } from 'react'
import { Loader2, X, Save } from 'lucide-react'
import { type Widget } from '@/stores/widgetStore'
import { widgetCategories } from '@/lib/utils'
import api from '@/lib/api'

interface WidgetEditModalProps {
  widget: Widget
  isOpen: boolean
  onClose: () => void
  onSave: (updatedWidget: Widget) => void
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'development', label: 'Development' },
  { value: 'testing', label: 'Testing' },
  { value: 'production', label: 'Production' },
  { value: 'deprecated', label: 'Deprecated' },
]

export default function WidgetEditModal({
  widget,
  isOpen,
  onClose,
  onSave,
}: WidgetEditModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [version, setVersion] = useState('')
  const [port, setPort] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (widget) {
      setName(widget.displayName || widget.name || '')
      setDescription(widget.description || '')
      setCategory(widget.category || 'misc')
      setStatus(widget.status || 'draft')
      setVersion(widget.version || '1.0.0')
      setPort(widget.port || '')
    }
  }, [widget])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const updateData: Partial<Widget> = {
        name,
        description,
        category,
        status,
        version,
        ...(port !== '' && { port: Number(port) }),
      }

      await api.updateWidget(String(widget.slug || widget.id), updateData)

      const updatedWidget = {
        ...widget,
        ...updateData,
        displayName: name,
      }

      onSave(updatedWidget)
      onClose()
    } catch (err) {
      console.error('Failed to update widget:', err)
      setError('Erreur lors de la mise a jour du widget')
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = Object.keys(widgetCategories) as Array<keyof typeof widgetCategories>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-ermite-card border border-ermite-border rounded-xl shadow-xl w-full max-w-lg animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1 text-ermite-text-secondary hover:text-ermite-text transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="text-xl font-bold text-ermite-text mb-6">
            Modifier le widget
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-ermite-error/20 border border-ermite-error/50 rounded-lg text-ermite-error text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Slug (read-only) */}
            <div>
              <label className="block text-sm font-medium text-ermite-text-secondary mb-1">
                Slug (identifiant)
              </label>
              <input
                type="text"
                value={widget.slug || widget.name || widget.id}
                disabled
                className="w-full px-3 py-2 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-ermite-text-secondary cursor-not-allowed"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-ermite-text-secondary mb-1">
                Nom d'affichage
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mon Widget"
                className="w-full px-3 py-2 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-ermite-text placeholder-ermite-text-secondary focus:border-ermite-primary focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-ermite-text-secondary mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du widget..."
                rows={3}
                className="w-full px-3 py-2 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-ermite-text placeholder-ermite-text-secondary focus:border-ermite-primary focus:outline-none resize-none"
                disabled={loading}
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ermite-text-secondary mb-1">
                  Categorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-ermite-text focus:border-ermite-primary focus:outline-none"
                  disabled={loading}
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {widgetCategories[cat].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ermite-text-secondary mb-1">
                  Statut
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-ermite-text focus:border-ermite-primary focus:outline-none"
                  disabled={loading}
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Version & Port */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ermite-text-secondary mb-1">
                  Version
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0.0"
                  className="w-full px-3 py-2 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-ermite-text placeholder-ermite-text-secondary focus:border-ermite-primary focus:outline-none"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ermite-text-secondary mb-1">
                  Port (dev)
                </label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value ? Number(e.target.value) : '')}
                  placeholder="5170"
                  className="w-full px-3 py-2 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-ermite-text placeholder-ermite-text-secondary focus:border-ermite-primary focus:outline-none"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-ermite-bg-secondary hover:bg-ermite-card-hover border border-ermite-border text-ermite-text rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-ermite-primary hover:bg-ermite-primary-hover text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
