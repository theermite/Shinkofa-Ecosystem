/**
 * Widget Detail Page - Detailed view with tabs
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Info,
  FileText,
  ListTodo,
  BarChart3,
  Power,
  Loader2,
  AlertCircle,
  Maximize2,
  Minimize2,
  Trash2,
  Settings,
} from 'lucide-react'
import { useWidgetStore, type Widget } from '@/stores/widgetStore'
import NotesEditor from '@/components/NotesEditor'
import FeatureChecklist from '@/components/FeatureChecklist'
import NotesSidePanel from '@/components/NotesSidePanel'
import ConfirmModal from '@/components/ConfirmModal'
import WidgetEditModal from '@/components/WidgetEditModal'
import { cn, statusColors, widgetCategories, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'

// Widget registry fallback
const WIDGET_REGISTRY: Widget[] = [
  { id: 'breathing-exercise', name: 'breathing-exercise', displayName: 'Breathing Exercise', description: 'Guided breathing exercises for relaxation and focus', status: 'production', version: '1.0.0', category: 'misc', port: 5171, createdAt: '2024-01-01', updatedAt: '2024-01-18' },
  { id: 'dodge-master', name: 'dodge-master', displayName: 'Dodge Master', description: 'Train your reflexes by dodging incoming obstacles', status: 'production', version: '1.0.0', category: 'moba', port: 5172, createdAt: '2024-01-01', updatedAt: '2024-01-18' },
  { id: 'image-pairs', name: 'image-pairs', displayName: 'Image Pairs', description: 'Match pairs of images to train visual memory', status: 'production', version: '1.0.0', category: 'memory', port: 5173, createdAt: '2024-01-01', updatedAt: '2024-01-18' },
  { id: 'last-hit-trainer', name: 'last-hit-trainer', displayName: 'Last Hit Trainer', description: 'Practice timing for last-hitting in MOBAs', status: 'production', version: '1.0.0', category: 'moba', port: 5174, createdAt: '2024-01-01', updatedAt: '2024-01-18' },
  { id: 'memory-cards', name: 'memory-cards', displayName: 'Memory Cards', description: 'Classic memory card matching game', status: 'production', version: '1.0.0', category: 'memory', port: 5175, createdAt: '2024-01-01', updatedAt: '2024-01-18' },
  { id: 'multi-task', name: 'multi-task', displayName: 'Multi-Task', description: 'Train your ability to handle multiple tasks simultaneously', status: 'production', version: '1.0.0', category: 'focus', port: 5176, createdAt: '2024-01-01', updatedAt: '2024-01-18' },
  { id: 'pattern-recall', name: 'pattern-recall', displayName: 'Pattern Recall', description: 'Memorize and recall increasingly complex patterns', status: 'production', version: '1.0.0', category: 'memory', port: 5177, createdAt: '2024-01-01', updatedAt: '2024-01-18' },
  { id: 'peripheral-vision', name: 'peripheral-vision', displayName: 'Peripheral Vision', description: 'Expand and train your peripheral awareness', status: 'production', version: '1.0.0', category: 'focus', port: 5178, createdAt: '2024-01-01', updatedAt: '2024-01-18' },
  { id: 'reaction-time', name: 'reaction-time', displayName: 'Reaction Time', description: 'Test and improve your reaction speed', status: 'production', version: '1.0.0', category: 'reaction', port: 5179, createdAt: '2024-01-01', updatedAt: '2024-01-18' },
  { id: 'sequence-memory', name: 'sequence-memory', displayName: 'Sequence Memory', description: 'Remember and reproduce sequences of increasing length', status: 'production', version: '1.0.0', category: 'memory', port: 5180, createdAt: '2024-01-01', updatedAt: '2024-01-18' },
  { id: 'skillshot-trainer', name: 'skillshot-trainer', displayName: 'Skillshot Trainer', description: 'Practice aiming and timing for skillshots', status: 'production', version: '1.0.0', category: 'moba', port: 5181, createdAt: '2024-01-01', updatedAt: '2024-01-18' },
  { id: 'tracking-focus', name: 'tracking-focus', displayName: 'Tracking Focus', description: 'Track moving targets to improve focus and attention', status: 'production', version: '1.0.0', category: 'focus', port: 5182, createdAt: '2024-01-01', updatedAt: '2024-01-18' },
]

type TabType = 'overview' | 'notes' | 'roadmap' | 'analytics'

const tabs: { id: TabType; label: string; icon: typeof Info }[] = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'roadmap', label: 'Roadmap', icon: ListTodo },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

type PlaygroundMode = 'preview' | 'dev' | 'prod'

export default function WidgetDetail() {
  const navigate = useNavigate()
  const { widgetId } = useParams<{ widgetId: string }>()
  const { widgets, notes, features, setNotes, setFeatures, setWidgets, deleteWidget: removeWidget } = useWidgetStore()
  const token = useAuthStore((state) => state.token)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [playgroundMode, setPlaygroundMode] = useState<PlaygroundMode>('preview')
  const [copied, setCopied] = useState(false)
  const [serverRunning, setServerRunning] = useState(false)
  const [serverLoading, setServerLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [notesPanelOpen, setNotesPanelOpen] = useState(false)

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteFiles, setDeleteFiles] = useState(false)

  const displayWidgets = widgets.length > 0 ? widgets : WIDGET_REGISTRY
  // Search by slug, id, or name (API returns slug as primary identifier)
  const widget = displayWidgets.find((w) =>
    w.slug === widgetId ||
    String(w.id) === widgetId ||
    w.name === widgetId
  )

  // Filter notes/features by widgetId (may be id or slug)
  const actualWidgetId = widget?.slug || String(widget?.id) || widgetId || ''
  const widgetNotes = notes.filter((n) => n.widgetId === actualWidgetId || n.widgetId === widgetId)
  const widgetFeatures = features.filter((f) => f.widgetId === actualWidgetId || f.widgetId === widgetId)

  // Check dev server status
  const checkServerStatus = async () => {
    if (!widget || !token) return
    try {
      const res = await fetch(`/api/v1/devserver/status/${widget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setServerRunning(data.running)
      }
    } catch {
      // Server check failed, ignore
    }
  }

  // Start dev server
  const startDevServer = async () => {
    if (!widget || !token) return
    setServerLoading(true)
    setServerError(null)
    try {
      const res = await fetch(`/api/v1/devserver/start/${widget.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setServerRunning(true)
        // Wait a bit for server to start
        setTimeout(() => setServerLoading(false), 2000)
      } else {
        const data = await res.json()
        setServerError(data.detail || 'Failed to start server')
        setServerLoading(false)
      }
    } catch (e) {
      setServerError('Failed to start server')
      setServerLoading(false)
    }
  }

  // Stop dev server
  const stopDevServer = async () => {
    if (!widget || !token) return
    setServerLoading(true)
    try {
      const res = await fetch(`/api/v1/devserver/stop/${widget.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setServerRunning(false)
      }
    } catch {
      // Ignore errors
    }
    setServerLoading(false)
  }

  // Delete widget
  const handleDeleteWidget = async () => {
    if (!widget) return
    setDeleteLoading(true)
    try {
      await api.deleteWidget(String(widget.slug || widget.id), deleteFiles)
      removeWidget(String(widget.slug || widget.id))
      setShowDeleteModal(false)
      navigate('/widgets')
    } catch (error) {
      console.error('Failed to delete widget:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  // Handle widget update
  const handleWidgetUpdate = (updatedWidget: Widget) => {
    setWidgets(widgets.map((w) =>
      (w.slug === widget?.slug || w.id === widget?.id) ? updatedWidget : w
    ))
  }

  useEffect(() => {
    // Load notes and features for this widget from API
    const loadWidgetData = async () => {
      if (!actualWidgetId) return

      try {
        // Load notes from API
        const notesResponse = await api.getNotes(actualWidgetId)
        if (notesResponse.notes) {
          // Transform API notes to store format (API uses snake_case, store uses camelCase)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformedNotes = notesResponse.notes.map((note: any) => ({
            id: String(note.id),
            widgetId: actualWidgetId,
            content: note.content,
            tags: note.tags || [],
            isPinned: note.is_pinned || false,
            priority: note.priority || 'medium',
            createdAt: note.created_at || note.createdAt,
            updatedAt: note.updated_at || note.updatedAt,
          }))
          setNotes(transformedNotes)
        }
      } catch (error) {
        console.error('Failed to load notes:', error)
      }

      try {
        // Load features from API
        const featuresResponse = await api.getFeatures(actualWidgetId)
        if (featuresResponse.features) {
          // Transform API features to store format (API uses snake_case, store uses camelCase)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformedFeatures = featuresResponse.features.map((feature: any) => ({
            id: String(feature.id),
            widgetId: actualWidgetId,
            title: feature.title,
            description: feature.description || '',
            status: feature.status || 'idea',
            priority: feature.priority || 'medium',
            tags: feature.tags || [],
            createdAt: feature.created_at || feature.createdAt,
            updatedAt: feature.updated_at || feature.updatedAt,
          }))
          setFeatures(transformedFeatures)
        }
      } catch (error) {
        console.error('Failed to load features:', error)
      }
    }

    loadWidgetData()
    // Check server status on mount
    checkServerStatus()
  }, [actualWidgetId, setNotes, setFeatures])

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  // Handle messages from preview iframe (back button)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data === 'closePreview') {
        setIsFullscreen(false)
        setActiveTab('overview')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  if (!widget) {
    return (
      <div className="text-center py-12">
        <p className="text-ermite-text-secondary">Widget not found.</p>
        <Link to="/widgets" className="text-ermite-primary hover:underline mt-2 inline-block">
          Back to widgets
        </Link>
      </div>
    )
  }

  const category = widgetCategories[widget.category] || { label: widget.category || 'Unknown', color: 'text-gray-400' }
  const displayName = widget.displayName || widget.name || 'Unnamed Widget'
  const description = widget.description || 'No description'
  const statusColor = statusColors[widget.status] || 'bg-gray-500/20 text-gray-400'

  // Determine embed URL based on mode
  const widgetSlug = widget.slug || widget.name || widget.id
  const embedUrl = playgroundMode === 'dev'
    ? `http://localhost:${widget.port || 5170}`
    : playgroundMode === 'preview'
    ? `/preview/${widgetSlug}`
    : `https://tools.theermite.com/w/${widgetSlug}/`
  const embedCode = `<iframe src="https://tools.theermite.com/w/${widgetSlug}/" width="100%" height="600" frameborder="0"></iframe>`

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <Link
            to="/widgets"
            className="inline-flex items-center gap-1 text-sm text-ermite-text-secondary hover:text-ermite-text mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to widgets
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-ermite-text">{displayName}</h1>
            <span
              className={cn(
                'px-2 py-1 rounded-md text-xs font-medium',
                statusColor
              )}
            >
              {widget.status}
            </span>
          </div>
          <p className="text-ermite-text-secondary mt-1">{description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-ermite-text-secondary flex-wrap">
            <span className={category.color}>{category.label}</span>
            <span>v{widget.version || '1.0.0'}</span>
            {widget.port && <span>Port {widget.port}</span>}
            {widget.updatedAt && <span>Updated {formatDate(widget.updatedAt)}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit Button */}
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-ermite-card hover:bg-ermite-card-hover border border-ermite-border text-ermite-text rounded-lg transition-colors"
            title="Modifier le widget"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Modifier</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-ermite-error/10 hover:bg-ermite-error/20 border border-ermite-error/30 text-ermite-error rounded-lg transition-colors"
            title="Supprimer le widget"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Supprimer</span>
          </button>

          {/* Open Widget Button */}
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-ermite-primary hover:bg-ermite-primary-hover text-white rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Ouvrir</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-ermite-border overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-ermite-primary text-ermite-primary'
                  : 'border-transparent text-ermite-text-secondary hover:text-ermite-text'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Embed Code */}
            <div className="bg-ermite-card rounded-xl p-6 border border-ermite-border">
              <h3 className="font-semibold text-ermite-text mb-4">Embed Code</h3>
              <div className="relative">
                <pre className="bg-ermite-bg-secondary p-4 rounded-lg overflow-x-auto text-sm text-ermite-text-secondary">
                  {embedCode}
                </pre>
                <button
                  onClick={copyEmbedCode}
                  className="absolute top-2 right-2 p-2 bg-ermite-card hover:bg-ermite-card-hover rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-ermite-success" />
                  ) : (
                    <Copy className="w-4 h-4 text-ermite-text-secondary" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-ermite-card rounded-xl p-6 border border-ermite-border">
                <p className="text-ermite-text-secondary text-sm">Notes</p>
                <p className="text-2xl font-bold text-ermite-text mt-1">{widgetNotes.length}</p>
              </div>
              <div className="bg-ermite-card rounded-xl p-6 border border-ermite-border">
                <p className="text-ermite-text-secondary text-sm">Features Planned</p>
                <p className="text-2xl font-bold text-ermite-text mt-1">
                  {widgetFeatures.filter((f) => f.status !== 'done').length}
                </p>
              </div>
              <div className="bg-ermite-card rounded-xl p-6 border border-ermite-border">
                <p className="text-ermite-text-secondary text-sm">Features Done</p>
                <p className="text-2xl font-bold text-ermite-text mt-1">
                  {widgetFeatures.filter((f) => f.status === 'done').length}
                </p>
              </div>
            </div>

            {/* Playground Section */}
            <div className="space-y-4">
              {/* Mode Selector */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-ermite-card rounded-xl p-4 border border-ermite-border">
                <div>
                  <p className="font-medium text-ermite-text">
                    Mode: {playgroundMode === 'preview' ? 'Preview (Built)' : playgroundMode === 'dev' ? 'Development (Local)' : 'Production (Live)'}
                  </p>
                  <p className="text-sm text-ermite-text-secondary">
                    {playgroundMode === 'preview' ? 'Local built version' : playgroundMode === 'dev' ? `localhost:${widget.port || 5170}` : 'tools.theermite.com'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setPlaygroundMode('preview')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm transition-colors',
                      playgroundMode === 'preview'
                        ? 'bg-ermite-primary text-white'
                        : 'bg-ermite-bg-secondary text-ermite-text-secondary hover:text-ermite-text'
                    )}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setPlaygroundMode('dev')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm transition-colors',
                      playgroundMode === 'dev'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-ermite-bg-secondary text-ermite-text-secondary hover:text-ermite-text'
                    )}
                  >
                    Dev Local
                  </button>
                  <button
                    onClick={() => setPlaygroundMode('prod')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm transition-colors',
                      playgroundMode === 'prod'
                        ? 'bg-ermite-success text-white'
                        : 'bg-ermite-bg-secondary text-ermite-text-secondary hover:text-ermite-text'
                    )}
                  >
                    Production
                  </button>
                </div>
              </div>

              {/* Dev Server Controls - Only show in dev mode */}
              {playgroundMode === 'dev' && (
                <div className="flex items-center justify-between bg-ermite-bg-secondary rounded-xl p-4 border border-ermite-border">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full',
                        serverRunning ? 'bg-green-500' : 'bg-gray-500'
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium text-ermite-text">
                        Dev Server: {serverRunning ? 'Running' : 'Stopped'}
                      </p>
                      {serverRunning && (
                        <p className="text-xs text-ermite-text-secondary">
                          Port {widget.port}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={serverRunning ? stopDevServer : startDevServer}
                    disabled={serverLoading}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                      serverRunning
                        ? 'bg-ermite-error/20 text-ermite-error hover:bg-ermite-error/30'
                        : 'bg-ermite-success/20 text-ermite-success hover:bg-ermite-success/30',
                      serverLoading && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {serverLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                    {serverRunning ? 'Stop Server' : 'Start Server'}
                  </button>
                </div>
              )}

              {/* Error Message */}
              {serverError && (
                <div className="flex items-center gap-2 p-3 bg-ermite-error/20 border border-ermite-error/50 rounded-lg text-ermite-error text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {serverError}
                </div>
              )}

              {/* Dev mode warning if server not running */}
              {playgroundMode === 'dev' && !serverRunning && !serverLoading && (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Start the dev server to preview the widget in development mode.
                </div>
              )}

              {/* Widget Preview with Notes Split View */}
              <div className={cn(
                "bg-ermite-card rounded-xl border border-ermite-border overflow-hidden",
                isFullscreen && "fixed inset-0 z-50 rounded-none border-0 bg-ermite-bg"
              )}>
                {/* Fullscreen Header */}
                {isFullscreen && (
                  <div className="flex items-center justify-between px-4 py-2 bg-ermite-bg-secondary border-b border-ermite-border">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setIsFullscreen(false)
                          setActiveTab('overview')
                        }}
                        className="flex items-center gap-2 p-2 hover:bg-ermite-card rounded-lg transition-colors text-ermite-text-secondary hover:text-ermite-text"
                        title="Retour"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <span className="text-ermite-text font-medium">{displayName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setNotesPanelOpen(!notesPanelOpen)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
                          notesPanelOpen
                            ? "bg-ermite-primary text-white"
                            : "bg-ermite-card hover:bg-ermite-card-hover text-ermite-text-secondary"
                        )}
                        title="Ouvrir les notes"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Notes</span>
                        {widgetNotes.length > 0 && (
                          <span className="px-1.5 py-0.5 bg-ermite-bg-secondary rounded text-xs">
                            {widgetNotes.length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setIsFullscreen(false)}
                        className="p-2 hover:bg-ermite-card rounded-lg transition-colors"
                        title="Exit fullscreen (Esc)"
                      >
                        <Minimize2 className="w-5 h-5 text-ermite-text" />
                      </button>
                    </div>
                  </div>
                )}

                {playgroundMode === 'dev' && !serverRunning ? (
                  <div className={cn(
                    "w-full flex items-center justify-center bg-ermite-bg-secondary",
                    isFullscreen ? "h-[calc(100dvh-49px)]" : "h-[600px]"
                  )}>
                    <div className="text-center">
                      <Power className="w-12 h-12 text-ermite-text-secondary mx-auto mb-4" />
                      <p className="text-ermite-text-secondary mb-4">
                        Dev server is not running
                      </p>
                      <button
                        onClick={startDevServer}
                        disabled={serverLoading}
                        className="px-4 py-2 bg-ermite-primary hover:bg-ermite-primary-hover text-white rounded-lg transition-colors"
                      >
                        Start Dev Server
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    "relative flex",
                    isFullscreen && "h-[calc(100dvh-49px)]"
                  )}>
                    {/* Main Preview Area */}
                    <div className={cn(
                      "flex-1 relative",
                      isFullscreen ? "h-full" : ""
                    )}>
                      {!isFullscreen && (
                        <button
                          onClick={() => setIsFullscreen(true)}
                          className="absolute top-3 right-3 z-10 p-2 bg-ermite-card/90 hover:bg-ermite-card border border-ermite-border rounded-lg transition-colors"
                          title="Fullscreen"
                        >
                          <Maximize2 className="w-5 h-5 text-ermite-text" />
                        </button>
                      )}
                      <iframe
                        src={embedUrl}
                        className={cn(
                          "w-full border-0",
                          isFullscreen ? "h-full" : "h-[600px]"
                        )}
                        style={isFullscreen ? { overflow: 'hidden' } : undefined}
                        title={`${displayName} Preview`}
                        allow="fullscreen"
                      />
                    </div>

                    {/* Notes Side Panel (fullscreen only) */}
                    {isFullscreen && (
                      <NotesSidePanel
                        widgetId={actualWidgetId}
                        notes={widgetNotes}
                        isOpen={notesPanelOpen}
                        onToggle={() => setNotesPanelOpen(!notesPanelOpen)}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <NotesEditor widgetId={actualWidgetId} notes={widgetNotes} />
        )}

        {activeTab === 'roadmap' && (
          <FeatureChecklist widgetId={actualWidgetId} features={widgetFeatures} />
        )}

        {activeTab === 'analytics' && (
          <div className="bg-ermite-card rounded-xl p-8 border border-ermite-border text-center">
            <BarChart3 className="w-12 h-12 text-ermite-text-secondary mx-auto mb-4" />
            <h3 className="font-semibold text-ermite-text mb-2">Analytics Coming Soon</h3>
            <p className="text-ermite-text-secondary">
              Track sessions, scores, and usage patterns for this widget.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteFiles(false)
        }}
        onConfirm={handleDeleteWidget}
        title="Supprimer le widget ?"
        message={`Cette action supprimera le widget "${displayName}" et toutes ses notes et fonctionnalites associees.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        loading={deleteLoading}
      >
        <label className="flex items-center gap-2 p-3 bg-ermite-bg-secondary rounded-lg cursor-pointer hover:bg-ermite-card-hover transition-colors">
          <input
            type="checkbox"
            checked={deleteFiles}
            onChange={(e) => setDeleteFiles(e.target.checked)}
            className="w-4 h-4 rounded border-ermite-border bg-ermite-bg-secondary text-ermite-primary focus:ring-ermite-primary"
          />
          <span className="text-sm text-ermite-text">
            Supprimer aussi les fichiers du widget (irreversible)
          </span>
        </label>
      </ConfirmModal>

      {/* Edit Widget Modal */}
      <WidgetEditModal
        widget={widget}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleWidgetUpdate}
      />
    </div>
  )
}
