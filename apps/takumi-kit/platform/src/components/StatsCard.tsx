/**
 * StatsCard Component - Display statistics in a card format
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  className?: string
}

export default function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        'bg-ermite-card dark:bg-ermite-card light:bg-white rounded-xl p-5 sm:p-6 border border-ermite-border dark:border-ermite-border light:border-gray-200',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700 text-sm">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-ermite-text dark:text-ermite-text light:text-gray-900 mt-2">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-sm mt-2',
                trend.value >= 0 ? 'text-ermite-success' : 'text-ermite-error'
              )}
            >
              {trend.value >= 0 ? '+' : ''}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-ermite-primary/20 dark:bg-ermite-primary/20 light:bg-ermite-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-ermite-primary" />
        </div>
      </div>
    </div>
  )
}
