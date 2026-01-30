/**
 * Dashboard Page - Overview of widgets and stats
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Puzzle, Activity, Clock, TrendingUp, ArrowRight, RefreshCw } from 'lucide-react'
import StatsCard from '@/components/StatsCard'
import WidgetCard from '@/components/WidgetCard'
import { useWidgetStore, type Widget } from '@/stores/widgetStore'
import api from '@/lib/api'

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
]

export default function Dashboard() {
  const { widgets, setWidgets } = useWidgetStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadWidgets = async () => {
      try {
        const { widgets: apiWidgets } = await api.getWidgets()
        setWidgets(apiWidgets)
      } catch {
        // Use local registry as fallback
        setWidgets(WIDGET_REGISTRY)
      } finally {
        setLoading(false)
      }
    }
    loadWidgets()
  }, [setWidgets])

  const displayWidgets = widgets.length > 0 ? widgets : WIDGET_REGISTRY

  const stats = {
    totalWidgets: displayWidgets.length,
    productionWidgets: displayWidgets.filter((w) => w.status === 'production').length,
    categories: new Set(displayWidgets.map((w) => w.category)).size,
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ermite-text dark:text-ermite-text light:text-gray-900">Dashboard</h1>
          <p className="text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700 mt-1">Overview of your Ermite Toolbox</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-ermite-card dark:bg-ermite-card light:bg-white hover:bg-ermite-card-hover dark:hover:bg-ermite-card-hover light:hover:bg-gray-100 border border-ermite-border dark:border-ermite-border light:border-gray-200 rounded-lg text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700 hover:text-ermite-text dark:hover:text-ermite-text light:hover:text-gray-900 transition-colors touch-manipulation"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Widgets"
          value={stats.totalWidgets}
          icon={Puzzle}
        />
        <StatsCard
          title="In Production"
          value={stats.productionWidgets}
          icon={Activity}
        />
        <StatsCard
          title="Categories"
          value={stats.categories}
          icon={TrendingUp}
        />
        <StatsCard
          title="Avg. Dev Time"
          value="2h"
          icon={Clock}
        />
      </div>

      {/* Recent Widgets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ermite-text dark:text-ermite-text light:text-gray-900">All Widgets</h2>
          <Link
            to="/widgets"
            className="flex items-center gap-1 text-sm text-ermite-primary hover:text-ermite-primary-hover transition-colors touch-manipulation"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-40 bg-ermite-card dark:bg-ermite-card light:bg-white rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {displayWidgets.slice(0, 6).map((widget) => (
              <WidgetCard key={widget.id} widget={widget} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
