/**
 * FeatureChecklist Component - Feature roadmap with status tracking
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2, X, Tag } from 'lucide-react'
import { useWidgetStore, type WidgetFeature } from '@/stores/widgetStore'
import { cn, priorityColors, formatDate } from '@/lib/utils'
import api from '@/lib/api'

interface FeatureChecklistProps {
  widgetId: string
  features: WidgetFeature[]
  onRefresh?: () => void
}

const statusOptions: WidgetFeature['status'][] = ['idea', 'planned', 'in_progress', 'done']
const priorityOptions: WidgetFeature['priority'][] = ['low', 'medium', 'high', 'critical']

const statusLabels: Record<WidgetFeature['status'], string> = {
  idea: 'Idea',
  planned: 'Planned',
  in_progress: 'In Progress',
  done: 'Done',
}

const priorityLabels: Record<WidgetFeature['priority'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export default function FeatureChecklist({ widgetId, features, onRefresh }: FeatureChecklistProps) {
  const { addFeature, updateFeature, deleteFeature } = useWidgetStore()
  const [isCreating, setIsCreating] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [newFeature, setNewFeature] = useState({
    title: '',
    description: '',
    priority: 'medium' as WidgetFeature['priority'],
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')

  const handleCreate = async () => {
    if (!newFeature.title.trim()) return

    setLoading(true)
    try {
      const { feature } = await api.createFeature(widgetId, {
        title: newFeature.title.trim(),
        description: newFeature.description.trim(),
        priority: newFeature.priority,
        tags: newFeature.tags,
      })
      addFeature(feature)
      setNewFeature({ title: '', description: '', priority: 'medium', tags: [] })
      setTagInput('')
      setIsCreating(false)
      onRefresh?.()
    } catch (error) {
      console.error('Failed to create feature:', error)
      // Fallback to local
      const feature: WidgetFeature = {
        id: crypto.randomUUID(),
        widgetId,
        title: newFeature.title.trim(),
        description: newFeature.description.trim(),
        status: 'idea',
        priority: newFeature.priority,
        tags: newFeature.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addFeature(feature)
      setNewFeature({ title: '', description: '', priority: 'medium', tags: [] })
      setTagInput('')
      setIsCreating(false)
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !newFeature.tags.includes(tag)) {
      setNewFeature({ ...newFeature, tags: [...newFeature.tags, tag] })
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setNewFeature({ ...newFeature, tags: newFeature.tags.filter((t) => t !== tag) })
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleStatusChange = async (id: string, status: WidgetFeature['status']) => {
    try {
      await api.updateFeature(widgetId, id, { status })
      updateFeature(id, { status })
      onRefresh?.()
    } catch (error) {
      console.error('Failed to update feature:', error)
      updateFeature(id, { status })
    }
  }

  const handlePriorityChange = async (id: string, priority: WidgetFeature['priority']) => {
    try {
      await api.updateFeature(widgetId, id, { priority })
      updateFeature(id, { priority })
      onRefresh?.()
    } catch (error) {
      console.error('Failed to update feature:', error)
      updateFeature(id, { priority })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this feature?')) return

    setLoading(true)
    try {
      await api.deleteFeature(widgetId, id)
      deleteFeature(id)
      onRefresh?.()
    } catch (error) {
      console.error('Failed to delete feature:', error)
      deleteFeature(id)
    } finally {
      setLoading(false)
    }
  }

  // Group features by status
  const groupedFeatures = statusOptions.reduce((acc, status) => {
    acc[status] = features.filter((f) => f.status === status)
    return acc
  }, {} as Record<WidgetFeature['status'], WidgetFeature[]>)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-ermite-text">Feature Roadmap ({features.length})</h3>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-ermite-primary hover:bg-ermite-primary-hover text-white text-sm rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Feature
          </button>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-ermite-card rounded-xl p-6 border border-ermite-border space-y-4">
          <input
            type="text"
            value={newFeature.title}
            onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
            placeholder="Feature title"
            className="w-full px-4 py-2.5 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-ermite-text placeholder-ermite-text-secondary focus:border-ermite-primary focus:outline-none"
            autoFocus
            disabled={loading}
          />
          <textarea
            value={newFeature.description}
            onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
            placeholder="Description (optional)"
            className="w-full h-20 px-4 py-2.5 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-ermite-text placeholder-ermite-text-secondary focus:border-ermite-primary focus:outline-none resize-none"
            disabled={loading}
          />
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm text-ermite-text-secondary mb-1 block">Priority</label>
              <select
                value={newFeature.priority}
                onChange={(e) =>
                  setNewFeature({ ...newFeature, priority: e.target.value as WidgetFeature['priority'] })
                }
                className="px-3 py-2 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-ermite-text focus:border-ermite-primary focus:outline-none"
                disabled={loading}
              >
                {priorityOptions.map((p) => (
                  <option key={p} value={p}>
                    {priorityLabels[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-ermite-text-secondary" />
              <span className="text-sm text-ermite-text-secondary">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {newFeature.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-1 bg-ermite-primary/20 text-ermite-primary text-sm rounded-md"
                >
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-ermite-error">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add tag (press Enter)"
              className="px-3 py-1.5 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-sm text-ermite-text placeholder-ermite-text-secondary focus:border-ermite-primary focus:outline-none"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreate}
              disabled={!newFeature.title.trim() || loading}
              className="flex items-center gap-2 px-4 py-2 bg-ermite-primary hover:bg-ermite-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Feature
            </button>
            <button
              onClick={() => setIsCreating(false)}
              disabled={loading}
              className="px-4 py-2 bg-ermite-card hover:bg-ermite-card-hover border border-ermite-border text-ermite-text-secondary rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Feature Columns */}
      {features.length === 0 && !isCreating ? (
        <div className="bg-ermite-card rounded-xl p-8 border border-ermite-border text-center">
          <p className="text-ermite-text-secondary">No features yet. Plan your roadmap!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusOptions.map((status) => (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'w-3 h-3 rounded-full',
                    status === 'idea' && 'bg-purple-500',
                    status === 'planned' && 'bg-blue-500',
                    status === 'in_progress' && 'bg-yellow-500',
                    status === 'done' && 'bg-green-500'
                  )}
                />
                <span className="text-sm font-medium text-ermite-text">{statusLabels[status]}</span>
                <span className="text-xs text-ermite-text-secondary">
                  ({groupedFeatures[status].length})
                </span>
              </div>

              <div className="space-y-2">
                {groupedFeatures[status].map((feature) => (
                  <div
                    key={feature.id}
                    className="bg-ermite-card rounded-lg border border-ermite-border p-3 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => toggleExpand(feature.id)}
                          className="flex items-center gap-1 text-left w-full"
                        >
                          {expandedId === feature.id ? (
                            <ChevronUp className="w-4 h-4 text-ermite-text-secondary flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-ermite-text-secondary flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium text-ermite-text truncate">
                            {feature.title}
                          </span>
                        </button>
                      </div>
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0',
                          priorityColors[feature.priority]
                        )}
                      >
                        {feature.priority}
                      </span>
                    </div>

                    {expandedId === feature.id && (
                      <div className="mt-3 pt-3 border-t border-ermite-border space-y-3">
                        {feature.description && (
                          <p className="text-sm text-ermite-text-secondary">
                            {feature.description}
                          </p>
                        )}

                        {feature.tags && feature.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {feature.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-ermite-primary/20 text-ermite-primary text-xs rounded-md"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <select
                            value={feature.status}
                            onChange={(e) =>
                              handleStatusChange(feature.id, e.target.value as WidgetFeature['status'])
                            }
                            className="text-xs px-2 py-1 bg-ermite-bg-secondary border border-ermite-border rounded text-ermite-text focus:border-ermite-primary focus:outline-none"
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {statusLabels[s]}
                              </option>
                            ))}
                          </select>

                          <select
                            value={feature.priority}
                            onChange={(e) =>
                              handlePriorityChange(
                                feature.id,
                                e.target.value as WidgetFeature['priority']
                              )
                            }
                            className="text-xs px-2 py-1 bg-ermite-bg-secondary border border-ermite-border rounded text-ermite-text focus:border-ermite-primary focus:outline-none"
                          >
                            {priorityOptions.map((p) => (
                              <option key={p} value={p}>
                                {priorityLabels[p]}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleDelete(feature.id)}
                            disabled={loading}
                            className="ml-auto p-1 text-ermite-text-secondary hover:text-ermite-error transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xs text-ermite-text-secondary">
                          Created {formatDate(feature.createdAt)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
