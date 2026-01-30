/**
 * WidgetCard Component - Display widget info in a card format
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { Link } from 'react-router-dom'
import { ExternalLink, Play } from 'lucide-react'
import type { Widget } from '@/stores/widgetStore'
import { cn, statusColors, widgetCategories } from '@/lib/utils'

interface WidgetCardProps {
  widget: Widget
}

export default function WidgetCard({ widget }: WidgetCardProps) {
  const category = widgetCategories[widget.category] || { label: widget.category || 'Unknown', color: 'text-gray-400' }
  const statusColor = statusColors[widget.status] || 'bg-gray-500/20 text-gray-400'
  const displayName = widget.displayName || widget.name || 'Unnamed Widget'
  const description = widget.description || 'No description'
  // Use slug for routing (API returns slug, fallback registry uses id=slug)
  const widgetSlug = widget.slug || widget.id || widget.name || 'unknown'

  return (
    <Link
      to={`/widgets/${widgetSlug}`}
      className="block bg-ermite-card dark:bg-ermite-card light:bg-white rounded-xl p-5 sm:p-6 border border-ermite-border dark:border-ermite-border light:border-gray-200 hover:border-ermite-primary transition-all hover:shadow-lg group touch-manipulation active:scale-[0.98]"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ermite-text dark:text-ermite-text light:text-gray-900 group-hover:text-ermite-primary transition-colors truncate">
            {displayName}
          </h3>
          <p className={cn('text-xs mt-1', category.color)}>{category.label}</p>
        </div>
        <span
          className={cn(
            'px-2 py-1 rounded-md text-xs font-medium ml-2 flex-shrink-0',
            statusColor
          )}
        >
          {widget.status}
        </span>
      </div>

      <p className="text-sm text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700 mb-4 line-clamp-2">
        {description}
      </p>

      <div className="flex items-center justify-between text-xs text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700">
        <span>v{widget.version || '1.0.0'}</span>
        <div className="flex items-center gap-2">
          {widget.port && (
            <span className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              Port {widget.port}
            </span>
          )}
          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-ermite-primary" />
        </div>
      </div>
    </Link>
  )
}
