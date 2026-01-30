/**
 * Analytics Page - Overview statistics and charts
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { BarChart3, TrendingUp, Clock, Users, Calendar } from 'lucide-react'
import StatsCard from '@/components/StatsCard'

export default function Analytics() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ermite-text">Analytics</h1>
        <p className="text-ermite-text-secondary mt-1">Track widget usage and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Sessions" value="0" icon={Users} />
        <StatsCard title="Avg. Score" value="0" icon={TrendingUp} />
        <StatsCard title="Avg. Duration" value="0s" icon={Clock} />
        <StatsCard title="Active Days" value="0" icon={Calendar} />
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-ermite-card rounded-xl p-6 border border-ermite-border">
          <h3 className="font-semibold text-ermite-text mb-4">Sessions Over Time</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-ermite-text-secondary mx-auto mb-4" />
              <p className="text-ermite-text-secondary">
                Charts will appear once tracking is enabled
              </p>
            </div>
          </div>
        </div>

        <div className="bg-ermite-card rounded-xl p-6 border border-ermite-border">
          <h3 className="font-semibold text-ermite-text mb-4">Widget Popularity</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-ermite-text-secondary mx-auto mb-4" />
              <p className="text-ermite-text-secondary">
                Tracking data will appear here
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-ermite-card rounded-xl p-6 border border-ermite-border">
        <h3 className="font-semibold text-ermite-text mb-4">Tracking Setup</h3>
        <p className="text-ermite-text-secondary mb-4">
          To track analytics, add the following script to your widgets:
        </p>
        <pre className="bg-ermite-bg-secondary p-4 rounded-lg overflow-x-auto text-sm text-ermite-text-secondary">
{`// Add to your widget when a session completes
ermiteTrack({
  widgetId: 'your-widget-id',
  platform: 'web', // or 'mobile', 'desktop'
  score: 85,
  duration: 120 // seconds
})`}
        </pre>
      </div>
    </div>
  )
}
