/**
 * RitualList Component - List of rituals grouped by category
 * Shinkofa Platform - Frontend
 */

'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { RitualCard } from './RitualCard'
import type { Ritual, RitualCategory } from '@/types/api'
import { useMemo } from 'react'

interface RitualListProps {
  rituals: Ritual[]
  onEdit?: (ritual: Ritual) => void
}

const CATEGORY_INFO: Record<
  RitualCategory,
  { label: string; emoji: string; description: string }
> = {
  morning: {
    label: 'Rituels du Matin',
    emoji: '🌅',
    description: 'Commencez votre journée avec intention',
  },
  evening: {
    label: 'Rituels du Soir',
    emoji: '🌙',
    description: 'Terminez votre journée en beauté',
  },
  daily: {
    label: 'Rituels Quotidiens',
    emoji: '📅',
    description: 'Habitudes à pratiquer chaque jour',
  },
  custom: {
    label: 'Rituels Personnalisés',
    emoji: '⭐',
    description: 'Vos rituels sur mesure',
  },
}

export function RitualList({ rituals, onEdit }: RitualListProps) {
  // Group rituals by category
  const groupedRituals = useMemo(() => {
    const groups: Record<RitualCategory, Ritual[]> = {
      morning: [],
      evening: [],
      daily: [],
      custom: [],
    }

    // Sort rituals by order within each category
    rituals.forEach((ritual) => {
      groups[ritual.category].push(ritual)
    })

    // Sort each group by order
    Object.keys(groups).forEach((category) => {
      groups[category as RitualCategory].sort((a, b) => a.order - b.order)
    })

    return groups
  }, [rituals])

  // Calculate completion stats
  const stats = useMemo(() => {
    const total = rituals.length
    const completed = rituals.filter((r) => r.completed_today).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, percentage }
  }, [rituals])

  if (rituals.length === 0) {
    return (
      <Card variant="elevated">
        <CardContent className="p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🌸</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Aucun rituel pour le moment
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Commencez par créer votre premier rituel quotidien
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                📊 Progression du jour
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {stats.completed} / {stats.total} rituels complétés
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.percentage}%
                </div>
              </div>
              <div className="relative h-16 w-16">
                <svg className="h-16 w-16 transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-gray-200 dark:stroke-gray-700"
                    strokeWidth="3"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-blue-500 dark:stroke-blue-400"
                    strokeWidth="3"
                    strokeDasharray={`${stats.percentage} ${100 - stats.percentage}`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rituals grouped by category */}
      {(['morning', 'evening', 'daily', 'custom'] as RitualCategory[]).map((category) => {
        const categoryRituals = groupedRituals[category]
        if (categoryRituals.length === 0) return null

        const info = CATEGORY_INFO[category]
        const categoryCompleted = categoryRituals.filter((r) => r.completed_today).length
        const categoryTotal = categoryRituals.length
        const categoryPercentage =
          categoryTotal > 0 ? Math.round((categoryCompleted / categoryTotal) * 100) : 0

        return (
          <div key={category} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">
                  {info.emoji}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {info.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
                </div>
              </div>
              <Badge
                variant={categoryPercentage === 100 ? 'success' : 'default'}
                size="md"
              >
                {categoryCompleted}/{categoryTotal}
              </Badge>
            </div>

            {/* Category Rituals */}
            <div className="space-y-2">
              {categoryRituals.map((ritual) => (
                <RitualCard key={ritual.id} ritual={ritual} onEdit={onEdit} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
