/**
 * API Client - HTTP client for backend communication
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useAuthStore } from '@/stores/authStore'

const API_BASE = '/api/v1'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    useAuthStore.getState().logout()
    throw new ApiError(401, 'Unauthorized')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new ApiError(response.status, error.detail || 'Request failed')
  }

  return response.json()
}

export const api = {
  // Auth
  login: (password: string) =>
    request<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  // Widgets
  getWidgets: () => request<{ widgets: import('@/stores/widgetStore').Widget[] }>('/widgets'),

  getWidget: (id: string) =>
    request<{ widget: import('@/stores/widgetStore').Widget }>(`/widgets/${id}`),

  updateWidget: (id: string, data: Partial<import('@/stores/widgetStore').Widget>) =>
    request<{ widget: import('@/stores/widgetStore').Widget }>(`/widgets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Notes
  getNotes: (widgetId: string) =>
    request<{ notes: import('@/stores/widgetStore').WidgetNote[] }>(`/widgets/${widgetId}/notes`),

  createNote: (widgetId: string, content: string, tags: string[], priority: import('@/stores/widgetStore').NotePriority = 'medium') =>
    request<{ note: import('@/stores/widgetStore').WidgetNote }>(`/widgets/${widgetId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content, tags, priority }),
    }),

  updateNote: (widgetId: string, noteId: string, content: string, tags: string[], priority: import('@/stores/widgetStore').NotePriority) =>
    request<{ note: import('@/stores/widgetStore').WidgetNote }>(
      `/widgets/${widgetId}/notes/${noteId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ content, tags, priority }),
      }
    ),

  deleteNote: (widgetId: string, noteId: string) =>
    request<void>(`/widgets/${widgetId}/notes/${noteId}`, { method: 'DELETE' }),

  // Features
  getFeatures: (widgetId: string) =>
    request<{ features: import('@/stores/widgetStore').WidgetFeature[] }>(
      `/widgets/${widgetId}/features`
    ),

  createFeature: (
    widgetId: string,
    data: { title: string; description: string; priority: string; tags?: string[] }
  ) =>
    request<{ feature: import('@/stores/widgetStore').WidgetFeature }>(
      `/widgets/${widgetId}/features`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  updateFeature: (
    widgetId: string,
    featureId: string,
    data: Partial<import('@/stores/widgetStore').WidgetFeature>
  ) =>
    request<{ feature: import('@/stores/widgetStore').WidgetFeature }>(
      `/widgets/${widgetId}/features/${featureId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    ),

  deleteFeature: (widgetId: string, featureId: string) =>
    request<void>(`/widgets/${widgetId}/features/${featureId}`, { method: 'DELETE' }),

  // Analytics
  getAnalytics: (params?: { widgetId?: string; from?: string; to?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.widgetId) searchParams.set('widget_id', params.widgetId)
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    const query = searchParams.toString()
    return request<{ analytics: AnalyticsData }>(`/analytics${query ? `?${query}` : ''}`)
  },

  // Context Export
  exportContext: () => request<{ context: ProjectContext }>('/context/export'),

  // Create new widget with scaffolding
  createWidget: (data: {
    name: string
    displayName: string
    description: string
    category: 'memory' | 'focus' | 'reaction' | 'moba' | 'productivity' | 'wellness' | 'misc'
    template?: 'basic' | 'game' | 'productivity'
  }) =>
    request<import('@/stores/widgetStore').Widget>('/widgets', {
      method: 'POST',
      body: JSON.stringify({
        slug: data.name, // name is already kebab-case from modal
        name: data.displayName,
        description: data.description,
        category: data.category,
        template: data.template || 'basic',
      }),
    }).then(widget => ({
      success: true,
      widgetId: widget.slug,
      path: `widgets/${widget.slug}`,
      message: `Widget "${widget.name}" created successfully!`,
    })),

  deleteWidget: (slug: string, deleteFiles = false) =>
    request<{ success: boolean; deleted: string }>(`/widgets/${slug}?delete_files=${deleteFiles}`, {
      method: 'DELETE',
    }),

  // Analytics dashboard
  getAnalyticsDashboard: () =>
    request<import('./api').AnalyticsDashboard>('/analytics/dashboard'),

  getWidgetAnalytics: (slug: string, days = 30) =>
    request<import('./api').WidgetAnalyticsSummary>(`/analytics/widgets/${slug}?days=${days}`),

  // Context Export for CLI
  exportContextMarkdown: () =>
    request<{ content: string; format: string }>('/context/export/markdown'),

  getCliSummary: () =>
    request<CliSummary>('/context/cli-summary'),
}

export interface AnalyticsDashboard {
  total_events: number
  total_sessions: number
  events_last_24h: number
  events_last_7d: number
  top_widgets: Array<{ slug: string; name: string; events: number }>
  events_by_type: Record<string, number>
  events_timeline: Array<{ date: string; events: number }>
}

export interface WidgetAnalyticsSummary {
  widget_slug: string
  total_events: number
  unique_sessions: number
  events_by_type: Record<string, number>
  last_event_at: string | null
}

export interface CliSummary {
  summary: {
    total_widgets: number
    total_pending_features: number
    recent_notes: number
  }
  widgets_with_pending: Array<{ slug: string; name: string; pending: number }>
  generated_at: string
}

export interface AnalyticsData {
  totalSessions: number
  totalWidgets: number
  avgScore: number
  avgDuration: number
  sessionsByWidget: Record<string, number>
  sessionsByDay: Array<{ date: string; count: number }>
  topWidgets: Array<{ id: string; name: string; sessions: number }>
}

export interface ProjectContext {
  generatedAt: string
  widgets: Array<{
    name: string
    status: string
    notes: string
    pendingFeatures: Array<{ title: string; priority: string }>
    recentChanges: string[]
  }>
  globalNotes: string
}

export default api
