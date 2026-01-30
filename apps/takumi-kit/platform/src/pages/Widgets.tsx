/**
 * Widgets Page - Full list of all widgets
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useEffect, useState } from 'react'
import { Search, Filter, Plus } from 'lucide-react'
import WidgetCard from '@/components/WidgetCard'
import CreateWidgetModal from '@/components/CreateWidgetModal'
import { useWidgetStore, type Widget } from '@/stores/widgetStore'
import api from '@/lib/api'
import { cn, widgetCategories } from '@/lib/utils'

// Widget registry - matches widgets/ folder
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
  { id: 'task-manager', name: 'task-manager', displayName: 'Task Manager', description: 'Manage tasks and projects with KAIDA principle (max 3 daily priorities)', status: 'production', version: '1.0.0', category: 'misc', port: 5183, createdAt: '2024-01-15', updatedAt: '2024-01-18' },
  { id: 'daily-journal', name: 'daily-journal', displayName: 'Daily Journal', description: 'Gratitude journal (3G/3R/1A) with mood check-ins for emotional tracking', status: 'production', version: '1.0.0', category: 'misc', port: 5184, createdAt: '2024-01-20', updatedAt: '2024-01-20' },
]

type CategoryFilter = keyof typeof widgetCategories | 'all'
type StatusFilter = 'all' | 'development' | 'production' | 'deprecated'

export default function Widgets() {
  const { widgets, setWidgets } = useWidgetStore()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const loadWidgets = async () => {
    setLoading(true)
    try {
      const { widgets: apiWidgets } = await api.getWidgets()
      setWidgets(apiWidgets)
    } catch {
      setWidgets(WIDGET_REGISTRY)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWidgets()
  }, [setWidgets])

  const displayWidgets = widgets.length > 0 ? widgets : WIDGET_REGISTRY

  const filteredWidgets = displayWidgets.filter((widget) => {
    const displayName = widget.displayName || widget.name || ''
    const description = widget.description || ''
    const matchesSearch =
      displayName.toLowerCase().includes(search.toLowerCase()) ||
      description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || widget.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || widget.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ermite-text dark:text-ermite-text light:text-gray-900">Widgets</h1>
          <p className="text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700 mt-1">
            {displayWidgets.length} widgets in your toolbox
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-ermite-primary hover:bg-ermite-primary-hover text-white font-medium rounded-lg transition-colors touch-manipulation"
        >
          <Plus className="w-5 h-5" />
          <span>New Widget</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search widgets..."
            className="w-full pl-10 pr-4 py-3 bg-ermite-card dark:bg-ermite-card light:bg-white border border-ermite-border dark:border-ermite-border light:border-gray-200 rounded-lg text-ermite-text dark:text-ermite-text light:text-gray-900 placeholder-ermite-text-secondary dark:placeholder-ermite-text-secondary light:placeholder-gray-400 focus:border-ermite-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-row gap-2 overflow-x-auto scrollbar-hide pb-1">
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Filter className="w-5 h-5 text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700 hidden sm:block" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
              className="px-3 py-2.5 bg-ermite-card dark:bg-ermite-card light:bg-white border border-ermite-border dark:border-ermite-border light:border-gray-200 rounded-lg text-ermite-text dark:text-ermite-text light:text-gray-900 focus:border-ermite-primary focus:outline-none transition-colors text-sm"
            >
              <option value="all">All Categories</option>
              {Object.entries(widgetCategories).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2.5 bg-ermite-card dark:bg-ermite-card light:bg-white border border-ermite-border dark:border-ermite-border light:border-gray-200 rounded-lg text-ermite-text dark:text-ermite-text light:text-gray-900 focus:border-ermite-primary focus:outline-none transition-colors text-sm flex-shrink-0"
          >
            <option value="all">All Status</option>
            <option value="production">Production</option>
            <option value="development">Development</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>
      </div>

      {/* Category Quick Filters - Horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
        <button
          onClick={() => setCategoryFilter('all')}
          className={cn(
            'px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap touch-manipulation flex-shrink-0',
            categoryFilter === 'all'
              ? 'bg-ermite-primary text-white'
              : 'bg-ermite-card dark:bg-ermite-card light:bg-white text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700 hover:bg-ermite-card-hover dark:hover:bg-ermite-card-hover light:hover:bg-gray-100'
          )}
        >
          All ({displayWidgets.length})
        </button>
        {Object.entries(widgetCategories).map(([key, { label, color }]) => {
          const count = displayWidgets.filter((w) => w.category === key).length
          return (
            <button
              key={key}
              onClick={() => setCategoryFilter(key as CategoryFilter)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap touch-manipulation flex-shrink-0',
                categoryFilter === key
                  ? 'bg-ermite-primary text-white'
                  : `bg-ermite-card dark:bg-ermite-card light:bg-white hover:bg-ermite-card-hover dark:hover:bg-ermite-card-hover light:hover:bg-gray-100 ${color}`
              )}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Widgets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-40 bg-ermite-card dark:bg-ermite-card light:bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredWidgets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700">No widgets found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredWidgets.map((widget) => (
            <WidgetCard key={widget.id} widget={widget} />
          ))}
        </div>
      )}

      {/* Create Widget Modal */}
      <CreateWidgetModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadWidgets}
      />
    </div>
  )
}
