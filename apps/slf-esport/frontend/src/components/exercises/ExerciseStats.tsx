/**
 * Exercise Statistics Component
 *
 * Displays user's performance statistics for brain-training exercises
 */

import React, { useEffect, useState } from 'react'
import memoryExerciseService from '@/services/memoryExerciseService'
import type { MemoryExerciseStats } from '@/types/memoryExercise'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface ExerciseStatsProps {
  userId?: number // If provided, shows stats for specific user (coach view)
}

export default function ExerciseStats({ userId }: ExerciseStatsProps) {
  const [stats, setStats] = useState<MemoryExerciseStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<MemoryExerciseStats | null>(null)

  useEffect(() => {
    loadStats()
  }, [userId])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = userId
        ? await memoryExerciseService.getUserStats(userId)
        : await memoryExerciseService.getMyStats()
      setStats(data)
      if (data.length > 0) {
        setSelectedExercise(data[0])
      }
    } catch (err) {
      console.error('Failed to load exercise stats:', err)
      setError('Impossible de charger les statistiques')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Chargement des statistiques...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl p-4">
        <p className="text-red-700 dark:text-red-300">⚠️ {error}</p>
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Aucune statistique disponible. Joue des exercices pour voir tes performances!
        </p>
        <a
          href="/exercises"
          className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
        >
          Voir les exercices
        </a>
      </div>
    )
  }

  // Calculate totals
  const totalAttempts = stats.reduce((sum, s) => sum + s.total_attempts, 0)
  const totalCompleted = stats.reduce((sum, s) => sum + s.completed_attempts, 0)
  const avgScore = stats.reduce((sum, s) => sum + (s.avg_score || 0), 0) / stats.length
  const bestScoreOverall = Math.max(...stats.map((s) => s.best_score || 0))

  // Chart data for selected exercise
  const chartData = selectedExercise
    ? {
        labels: selectedExercise.recent_scores.map((_, i) => `Session ${selectedExercise.recent_scores.length - i}`),
        datasets: [
          {
            label: 'Score',
            data: selectedExercise.recent_scores.slice().reverse(),
            borderColor: '#3CB371',
            backgroundColor: 'rgba(60, 179, 113, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      }
    : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">{totalAttempts}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Sessions totales</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-secondary-600 dark:text-secondary-400 mb-1">{totalCompleted}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Complétées</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-success-600 dark:text-success-400 mb-1">
            {avgScore.toFixed(0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Score moyen</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-3xl font-bold text-accent-600 dark:text-accent-500 mb-1">
            {bestScoreOverall.toFixed(0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Meilleur score</div>
        </div>
      </div>

      {/* Exercise Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Détails par exercice</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {stats.map((stat) => (
            <button
              key={stat.exercise_id}
              onClick={() => setSelectedExercise(stat)}
              className={`p-3 rounded-lg text-left transition-all ${
                selectedExercise?.exercise_id === stat.exercise_id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div className="text-sm font-medium truncate">{stat.exercise_name}</div>
              <div className="text-xs opacity-80 mt-1">{stat.completed_attempts} sessions</div>
            </button>
          ))}
        </div>

        {/* Selected Exercise Details */}
        {selectedExercise && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {selectedExercise.best_score?.toFixed(0) || '-'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Meilleur score</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {selectedExercise.avg_score?.toFixed(0) || '-'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Score moyen</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {selectedExercise.best_accuracy ? (selectedExercise.best_accuracy * 100).toFixed(0) : '-'}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Meilleure précision</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {selectedExercise.fastest_time_ms
                    ? (selectedExercise.fastest_time_ms / 1000).toFixed(1)
                    : '-'}
                  s
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Temps le plus rapide</div>
              </div>
            </div>

            {/* Progression Chart */}
            {selectedExercise.recent_scores.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  Progression (10 dernières sessions)
                </h4>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4" style={{ height: '250px' }}>
                  {chartData && <Line data={chartData} options={chartOptions} />}
                </div>

                {/* Improvement Rate */}
                {selectedExercise.improvement_rate !== null &&
                  selectedExercise.improvement_rate !== undefined && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Taux d'amélioration:</span>
                      <span
                        className={`text-sm font-bold ${
                          selectedExercise.improvement_rate >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {selectedExercise.improvement_rate >= 0 ? '↗' : '↘'}{' '}
                        {Math.abs(selectedExercise.improvement_rate).toFixed(1)}%
                      </span>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
