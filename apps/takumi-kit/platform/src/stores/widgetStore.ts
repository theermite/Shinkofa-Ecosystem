/**
 * Widget Store - Zustand state management for widgets
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { create } from 'zustand'

export interface Widget {
  id: string | number
  slug?: string  // API returns slug as identifier
  name: string
  displayName?: string  // May not be present in API response
  description?: string
  status: string  // Allow any status from backend
  version?: string
  category: string  // Allow any category from backend
  port?: number
  createdAt?: string
  updatedAt?: string
  created_at?: string  // API uses snake_case
  updated_at?: string
}

export type NotePriority = 'low' | 'medium' | 'high'

export interface WidgetNote {
  id: string
  widgetId: string
  content: string
  tags: string[]
  priority: NotePriority
  createdAt: string
  updatedAt: string
}

export interface WidgetFeature {
  id: string
  widgetId: string
  title: string
  description: string
  status: 'idea' | 'planned' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface WidgetState {
  widgets: Widget[]
  selectedWidget: Widget | null
  notes: WidgetNote[]
  features: WidgetFeature[]
  setWidgets: (widgets: Widget[]) => void
  setSelectedWidget: (widget: Widget | null) => void
  deleteWidget: (id: string) => void
  setNotes: (notes: WidgetNote[]) => void
  setFeatures: (features: WidgetFeature[]) => void
  addNote: (note: WidgetNote) => void
  updateNote: (id: string, content: string, tags: string[], priority: NotePriority) => void
  deleteNote: (id: string) => void
  addFeature: (feature: WidgetFeature) => void
  updateFeature: (id: string, updates: Partial<WidgetFeature>) => void
  deleteFeature: (id: string) => void
}

export const useWidgetStore = create<WidgetState>((set) => ({
  widgets: [],
  selectedWidget: null,
  notes: [],
  features: [],
  setWidgets: (widgets) => set({ widgets }),
  setSelectedWidget: (widget) => set({ selectedWidget: widget }),
  deleteWidget: (id) =>
    set((state) => ({
      widgets: state.widgets.filter((w) => String(w.slug) !== id && String(w.id) !== id),
      notes: state.notes.filter((n) => n.widgetId !== id),
      features: state.features.filter((f) => f.widgetId !== id),
    })),
  setNotes: (notes) => set({ notes }),
  setFeatures: (features) => set({ features }),
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  updateNote: (id, content, tags, priority) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, content, tags, priority, updatedAt: new Date().toISOString() } : n
      ),
    })),
  deleteNote: (id) =>
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
  addFeature: (feature) =>
    set((state) => ({ features: [...state.features, feature] })),
  updateFeature: (id, updates) =>
    set((state) => ({
      features: state.features.map((f) =>
        f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
      ),
    })),
  deleteFeature: (id) =>
    set((state) => ({ features: state.features.filter((f) => f.id !== id) })),
}))
