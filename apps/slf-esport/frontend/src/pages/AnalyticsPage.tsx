/**
 * Analytics Page - Aggregated statistics and charts
 */

import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardHeader, CardBody, Button } from '@/components/ui'
import exerciseService from '@/services/exerciseService'
import sessionService from '@/services/sessionService'
import coachingService from '@/services/coachingService'
import { useAuthStore } from '@/store/authStore'
import type { ExerciseStats } from '@/types/exercise'
import type { SessionStats } from '@/types/session'
import type { JournalStats, GoalStats } from '@/types/coaching'

export default function AnalyticsPage() {
  const { user } = useAuthStore()

  const [exerciseStats, setExerciseStats] = useState<ExerciseStats[]>([])
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null)
  const [journalStats, setJournalStats] = useState<JournalStats | null>(null)
  const [goalStats, setGoalStats] = useState<GoalStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState(30) // Days

  useEffect(() => {
    loadAllStats()
  }, [period])

  const loadAllStats = async () => {
    setIsLoading(true)
    try {
      const [exercises, sessions, journal, goals] = await Promise.all([
        exerciseService.getMyStats(),
        sessionService.getMyStats(),
        coachingService.getMyJournalStats(period),
        coachingService.getMyGoalStats(),
      ])

      setExerciseStats(exercises)
      setSessionStats(sessions)
      setJournalStats(journal)
      setGoalStats(goals)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des statistiques...</p>
        </div>
      </MainLayout>
    )
  }

  // Prepare chart data
  const exerciseProgressData = exerciseStats
    .filter((stat) => stat.progression !== null)
    .map((stat) => ({
      name: stat.exercise_name.substring(0, 20),
      progression: stat.progression,
    }))
    .slice(0, 10)

  const moodData = journalStats
    ? Object.entries(journalStats.mood_distribution).map(([mood, count]) => ({
        name: mood,
        value: count,
      }))
    : []

  const MOOD_COLORS = {
    excellent: '#10b981',
    good: '#3b82f6',
    neutral: '#6b7280',
    low: '#f59e0b',
    bad: '#ef4444',
  }

  const sessionTypeData = sessionStats
    ? [
        { name: 'Complétées', value: sessionStats.completed_sessions },
        { name: 'À venir', value: sessionStats.upcoming_sessions },
        { name: 'Annulées', value: sessionStats.cancelled_sessions },
      ]
    : []

  const SESSION_TYPE_COLORS = ['#10b981', '#3b82f6', '#ef4444']

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">📊 Analytics & Progression</h1>
              <p className="text-primary-100">Vue d'ensemble de tes performances</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={period === 7 ? 'accent' : 'outline'}
                size="sm"
                onClick={() => setPeriod(7)}
              >
                7 jours
              </Button>
              <Button
                variant={period === 30 ? 'accent' : 'outline'}
                size="sm"
                onClick={() => setPeriod(30)}
              >
                30 jours
              </Button>
              <Button
                variant={period === 90 ? 'accent' : 'outline'}
                size="sm"
                onClick={() => setPeriod(90)}
              >
                90 jours
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Exercises */}
          <Card>
            <CardBody>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Exercices complétés</p>
              <p className="text-3xl font-bold text-blue-600">
                {exerciseStats.reduce((sum, stat) => sum + stat.total_attempts, 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {exerciseStats.filter((s) => s.total_attempts > 0).length} exercices différents
              </p>
            </CardBody>
          </Card>

          {/* Sessions */}
          {sessionStats && (
            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Heures d'entraînement</p>
                <p className="text-3xl font-bold text-green-600">{sessionStats.total_hours}h</p>
                <p className="text-xs text-gray-500 mt-1">
                  Assiduité: {sessionStats.attendance_rate}%
                </p>
              </CardBody>
            </Card>
          )}

          {/* Journal */}
          {journalStats && (
            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Entrées journal</p>
                <p className="text-3xl font-bold text-purple-600">{journalStats.total_entries}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Énergie moy: {journalStats.avg_energy_level || 'N/A'}/10
                </p>
              </CardBody>
            </Card>
          )}

          {/* Goals */}
          {goalStats && (
            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Objectifs complétés</p>
                <p className="text-3xl font-bold text-orange-600">
                  {goalStats.completed_goals}/{goalStats.total_goals}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Taux: {goalStats.completion_rate}%
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exercise Progression */}
          {exerciseProgressData.length > 0 && (
            <Card>
              <CardHeader title="📈 Progression Exercices Cognitifs" subtitle="Top 10 exercices" />
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={exerciseProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis label={{ value: 'Progression (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="progression" fill="#1c3049" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          )}

          {/* Session Distribution */}
          {sessionStats && sessionStats.total_sessions > 0 && (
            <Card>
              <CardHeader title="📅 Répartition Sessions" subtitle={`${sessionStats.total_sessions} sessions totales`} />
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sessionTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sessionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SESSION_TYPE_COLORS[index % SESSION_TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Distribution */}
          {moodData.length > 0 && (
            <Card>
              <CardHeader title="😊 Distribution Humeur" subtitle={`${period} derniers jours`} />
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {moodData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={MOOD_COLORS[entry.name as keyof typeof MOOD_COLORS] || '#6b7280'}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          )}

          {/* Journal Metrics */}
          {journalStats && journalStats.total_entries > 0 && (
            <Card>
              <CardHeader title="📔 Métriques Journal" subtitle={`${period} derniers jours`} />
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Niveau d'énergie moyen</span>
                      <span className="font-semibold text-blue-600">
                        {journalStats.avg_energy_level || 'N/A'}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(journalStats.avg_energy_level || 0) * 10}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Qualité entraînement moyenne</span>
                      <span className="font-semibold text-green-600">
                        {journalStats.avg_training_quality || 'N/A'}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(journalStats.avg_training_quality || 0) * 10}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Sommeil moyen</span>
                      <span className="font-semibold text-purple-600">
                        {journalStats.avg_sleep_hours || 'N/A'}h / nuit
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${((journalStats.avg_sleep_hours || 0) / 12) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total entrées</p>
                    <p className="text-2xl font-bold text-primary-600">{journalStats.total_entries}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Insights */}
        <Card>
          <CardHeader title="💡 Insights & Recommandations" />
          <CardBody>
            <div className="space-y-3">
              {exerciseStats.length > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>🎯 Exercices cognitifs:</strong> Tu as complété{' '}
                    {exerciseStats.reduce((sum, stat) => sum + stat.total_attempts, 0)} tentatives
                    sur {exerciseStats.filter((s) => s.total_attempts > 0).length} exercices différents.
                    Continue comme ça !
                  </p>
                </div>
              )}

              {sessionStats && sessionStats.attendance_rate >= 80 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    <strong>✅ Assiduité excellente:</strong> Ton taux de présence est de{' '}
                    {sessionStats.attendance_rate}% ! Tu as accumulé {sessionStats.total_hours}h
                    d'entraînement.
                  </p>
                </div>
              )}

              {journalStats && journalStats.avg_energy_level && journalStats.avg_energy_level < 5 && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm text-orange-900 dark:text-orange-100">
                    <strong>⚠️ Niveau d'énergie faible:</strong> Ton énergie moyenne est de{' '}
                    {journalStats.avg_energy_level}/10. Pense à te reposer et à bien dormir !
                  </p>
                </div>
              )}

              {goalStats && goalStats.in_progress_goals === 0 && goalStats.total_goals > 0 && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-purple-900 dark:text-purple-100">
                    <strong>🎯 Félicitations:</strong> Tu as complété tous tes objectifs ({goalStats.completed_goals}/{goalStats.total_goals}) !
                    Définis-en de nouveaux pour continuer à progresser.
                  </p>
                </div>
              )}

              {exerciseStats.length === 0 &&
                (!sessionStats || sessionStats.total_sessions === 0) &&
                (!journalStats || journalStats.total_entries === 0) && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>👋 Bienvenue !</strong> Commence à utiliser la plateforme pour voir
                      tes statistiques ici. Essaie les exercices cognitifs, réserve des sessions,
                      ou tiens ton journal !
                    </p>
                  </div>
                )}
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}
