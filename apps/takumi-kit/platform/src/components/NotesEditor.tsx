/**
 * NotesEditor Component - Markdown notes editor for widgets
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState } from 'react'
import { Plus, Save, Trash2, X, Tag, Loader2, Flag } from 'lucide-react'
import { useWidgetStore, type WidgetNote, type NotePriority } from '@/stores/widgetStore'
import { cn, formatDateTime, priorityColors } from '@/lib/utils'
import api from '@/lib/api'

interface NotesEditorProps {
  widgetId: string
  notes: WidgetNote[]
  onRefresh?: () => void
}

export default function NotesEditor({ widgetId, notes, onRefresh }: NotesEditorProps) {
  const { addNote, updateNote, deleteNote } = useWidgetStore()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [priority, setPriority] = useState<NotePriority>('medium')
  const [loading, setLoading] = useState(false)

  const priorityOptions: NotePriority[] = ['low', 'medium', 'high']
  const priorityLabels: Record<NotePriority, string> = {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute',
  }

  const handleCreate = async () => {
    if (!content.trim()) return

    setLoading(true)
    try {
      const { note } = await api.createNote(widgetId, content.trim(), tags, priority)
      addNote(note)
      resetForm()
      onRefresh?.()
    } catch (error) {
      console.error('Failed to create note:', error)
      // Fallback to local storage
      const newNote: WidgetNote = {
        id: crypto.randomUUID(),
        widgetId,
        content: content.trim(),
        tags,
        priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addNote(newNote)
      resetForm()
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingId || !content.trim()) return

    setLoading(true)
    try {
      await api.updateNote(widgetId, editingId, content.trim(), tags, priority)
      updateNote(editingId, content.trim(), tags, priority)
      resetForm()
      onRefresh?.()
    } catch (error) {
      console.error('Failed to update note:', error)
      // Fallback to local update
      updateNote(editingId, content.trim(), tags, priority)
      resetForm()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return

    setLoading(true)
    try {
      await api.deleteNote(widgetId, id)
      deleteNote(id)
      onRefresh?.()
    } catch (error) {
      console.error('Failed to delete note:', error)
      // Fallback to local delete
      deleteNote(id)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (note: WidgetNote) => {
    setEditingId(note.id)
    setContent(note.content)
    setTags(note.tags)
    setPriority(note.priority || 'medium')
    setIsCreating(false)
  }

  const resetForm = () => {
    setIsCreating(false)
    setEditingId(null)
    setContent('')
    setTags([])
    setTagInput('')
    setPriority('medium')
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const isEditing = isCreating || editingId !== null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-ermite-text">Notes ({notes.length})</h3>
        {!isEditing && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-ermite-primary hover:bg-ermite-primary-hover text-white text-sm rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        )}
      </div>

      {/* Editor */}
      {isEditing && (
        <div className="bg-ermite-card rounded-xl p-6 border border-ermite-border space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here... (Markdown supported)"
            className="w-full h-40 px-4 py-3 bg-ermite-bg-secondary border border-ermite-border rounded-lg text-ermite-text placeholder-ermite-text-secondary focus:border-ermite-primary focus:outline-none resize-none"
            autoFocus
            disabled={loading}
          />

          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-ermite-text-secondary" />
              <span className="text-sm text-ermite-text-secondary">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
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

          {/* Priority */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flag className="w-4 h-4 text-ermite-text-secondary" />
              <span className="text-sm text-ermite-text-secondary">Priorite</span>
            </div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as NotePriority)}
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

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={editingId ? handleUpdate : handleCreate}
              disabled={!content.trim() || loading}
              className="flex items-center gap-2 px-4 py-2 bg-ermite-primary hover:bg-ermite-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editingId ? 'Update' : 'Save'}
            </button>
            <button
              onClick={resetForm}
              disabled={loading}
              className="px-4 py-2 bg-ermite-card hover:bg-ermite-card-hover border border-ermite-border text-ermite-text-secondary rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 && !isEditing ? (
        <div className="bg-ermite-card rounded-xl p-8 border border-ermite-border text-center">
          <p className="text-ermite-text-secondary">No notes yet. Add your first note!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                'bg-ermite-card rounded-xl p-6 border border-ermite-border',
                editingId === note.id && 'ring-2 ring-ermite-primary'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {note.priority && note.priority !== 'medium' && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        priorityColors[note.priority]
                      )}
                    >
                      {priorityLabels[note.priority]}
                    </span>
                  )}
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-ermite-primary/20 text-ermite-primary text-xs rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditing(note)}
                    disabled={loading}
                    className="p-1.5 text-ermite-text-secondary hover:text-ermite-text transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={loading}
                    className="p-1.5 text-ermite-text-secondary hover:text-ermite-error transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-ermite-text whitespace-pre-wrap">{note.content}</p>
              <p className="text-xs text-ermite-text-secondary mt-4">
                Updated {formatDateTime(note.updatedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
