/**
 * NotesSidePanel Component - Compact notes panel for split-view
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState } from 'react'
import { Plus, Save, X, ChevronRight, ChevronLeft, FileText, Loader2 } from 'lucide-react'
import { useWidgetStore, type WidgetNote, type NotePriority } from '@/stores/widgetStore'
import { cn, priorityColors } from '@/lib/utils'
import api from '@/lib/api'

interface NotesSidePanelProps {
  widgetId: string
  notes: WidgetNote[]
  isOpen: boolean
  onToggle: () => void
  onRefresh?: () => void
}

export default function NotesSidePanel({
  widgetId,
  notes,
  isOpen,
  onToggle,
  onRefresh,
}: NotesSidePanelProps) {
  const { addNote } = useWidgetStore()
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<NotePriority>('medium')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleQuickAdd = async () => {
    if (!content.trim()) return

    setLoading(true)
    try {
      const { note } = await api.createNote(widgetId, content.trim(), [], priority)
      addNote(note)
      setContent('')
      setPriority('medium')
      setShowForm(false)
      onRefresh?.()
    } catch (error) {
      console.error('Failed to create note:', error)
      // Fallback to local storage
      const newNote: WidgetNote = {
        id: crypto.randomUUID(),
        widgetId,
        content: content.trim(),
        tags: [],
        priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addNote(newNote)
      setContent('')
      setPriority('medium')
      setShowForm(false)
    } finally {
      setLoading(false)
    }
  }

  const priorityLabels: Record<NotePriority, string> = {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute',
  }

  // Collapsed state - just show toggle button
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-ermite-card border border-ermite-border rounded-l-lg hover:bg-ermite-card-hover transition-colors group"
        title="Ouvrir les notes"
      >
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4 text-ermite-text-secondary group-hover:text-ermite-text" />
          <ChevronLeft className="w-4 h-4 text-ermite-text-secondary group-hover:text-ermite-text" />
        </div>
        {notes.length > 0 && (
          <span className="absolute -top-2 -left-2 w-5 h-5 bg-ermite-primary text-white text-xs rounded-full flex items-center justify-center">
            {notes.length}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="w-80 h-full bg-ermite-bg-secondary border-l border-ermite-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-ermite-border">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-ermite-primary" />
          <span className="font-medium text-ermite-text">Notes ({notes.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowForm(!showForm)}
            className="p-1.5 text-ermite-text-secondary hover:text-ermite-primary hover:bg-ermite-card rounded transition-colors"
            title="Ajouter une note"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 text-ermite-text-secondary hover:text-ermite-text hover:bg-ermite-card rounded transition-colors"
            title="Fermer le panneau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Add Form */}
      {showForm && (
        <div className="p-3 border-b border-ermite-border bg-ermite-card">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ecrivez votre note..."
            className="w-full h-20 px-3 py-2 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-sm text-ermite-text placeholder-ermite-text-secondary focus:border-ermite-primary focus:outline-none resize-none"
            autoFocus
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as NotePriority)}
              className="px-2 py-1 bg-ermite-bg-secondary border border-ermite-border rounded text-xs text-ermite-text focus:border-ermite-primary focus:outline-none"
              disabled={loading}
            >
              <option value="low">Priorite: Basse</option>
              <option value="medium">Priorite: Moyenne</option>
              <option value="high">Priorite: Haute</option>
            </select>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowForm(false)}
                disabled={loading}
                className="p-1.5 text-ermite-text-secondary hover:text-ermite-error transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleQuickAdd}
                disabled={!content.trim() || loading}
                className="flex items-center gap-1 px-2 py-1 bg-ermite-primary hover:bg-ermite-primary-hover disabled:opacity-50 text-white text-xs rounded transition-colors"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Sauver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-8 h-8 text-ermite-text-secondary mx-auto mb-2 opacity-50" />
            <p className="text-sm text-ermite-text-secondary">Aucune note</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-ermite-primary hover:underline mt-1"
            >
              Ajouter une note
            </button>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-ermite-card rounded-lg border border-ermite-border hover:border-ermite-primary/50 transition-colors"
            >
              {note.priority && note.priority !== 'medium' && (
                <span
                  className={cn(
                    'inline-block px-1.5 py-0.5 rounded text-xs font-medium mb-1',
                    priorityColors[note.priority]
                  )}
                >
                  {priorityLabels[note.priority]}
                </span>
              )}
              <p className="text-sm text-ermite-text whitespace-pre-wrap line-clamp-4">
                {note.content}
              </p>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-ermite-primary/20 text-ermite-primary text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
