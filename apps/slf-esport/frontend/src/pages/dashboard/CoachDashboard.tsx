/**
 * Coach Dashboard - Coach view with team overview
 */

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardHeader, CardBody, Badge, Button } from '@/components/ui'
import { Link } from 'react-router-dom'
import api from '@/services/api'

interface CoachDashboardStats {
  active_players: number
  total_capacity: number
  attendance_rate: number
  progression_rate: number
  upcoming_sessions: number
}

interface CoachDashboardProps {
  onToggleSuperAdminMode?: () => void
}

export default function CoachDashboard({ onToggleSuperAdminMode }: CoachDashboardProps) {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<CoachDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<CoachDashboardStats>('/stats/coach-dashboard')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAttendanceBadge = (rate: number) => {
    if (rate >= 90) return { variant: 'success' as const, label: 'Excellent' }
    if (rate >= 75) return { variant: 'warning' as const, label: 'Bien' }
    return { variant: 'danger' as const, label: 'À améliorer' }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-secondary to-accent rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Dashboard Coach - {user?.full_name || user?.username}
            </h1>
            <p className="text-orange-100">
              Suivi de l'équipe La Salade de Fruits
            </p>
          </div>
          {onToggleSuperAdminMode && (
            <Button
              onClick={onToggleSuperAdminMode}
              variant="secondary"
              className="bg-purple-600 hover:bg-purple-700 text-white border-0"
            >
              <span className="mr-2">👑</span>
              Mode Super Admin
            </Button>
          )}
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader title="Joueurs actifs" />
          <CardBody>
            {isLoading ? (
              <div className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            ) : (
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-secondary">
                  {stats?.active_players ?? 0}
                </span>
                <span className="text-gray-500 mb-1">/ {stats?.total_capacity ?? 10}</span>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Assiduité" />
          <CardBody>
            {isLoading ? (
              <div className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            ) : (
              <>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-green-600">
                    {stats?.attendance_rate ?? 0}%
                  </span>
                </div>
                {stats && stats.attendance_rate > 0 && (
                  <Badge variant={getAttendanceBadge(stats.attendance_rate).variant} className="mt-4">
                    {getAttendanceBadge(stats.attendance_rate).label}
                  </Badge>
                )}
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Progression" />
          <CardBody>
            {isLoading ? (
              <div className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            ) : (
              <>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-primary-600">
                    {stats?.progression_rate !== undefined && stats.progression_rate !== 0
                      ? `${stats.progression_rate > 0 ? '+' : ''}${stats.progression_rate}%`
                      : '--'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {stats?.progression_rate !== 0 ? 'vs. mois dernier' : 'Pas encore de données'}
                </p>
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Sessions planifiées" />
          <CardBody>
            {isLoading ? (
              <div className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            ) : (
              <>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-accent">
                    {stats?.upcoming_sessions ?? 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Cette semaine
                </p>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Actions Coach" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/media">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-secondary hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all cursor-pointer text-center">
                <div className="text-4xl mb-2">📹</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Upload Contenu
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Vidéos, audios, PDF
                </p>
              </div>
            </Link>

            <Link to="/team">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-secondary hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all cursor-pointer text-center">
                <div className="text-4xl mb-2">👥</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Gestion Équipe
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Voir tous les joueurs
                </p>
              </div>
            </Link>

            <Link to="/calendar">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-secondary hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all cursor-pointer text-center">
                <div className="text-4xl mb-2">📅</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Planifier Session
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Calendrier équipe
                </p>
              </div>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Performance individuelle"
            subtitle="Top 5 joueurs cette semaine"
          />
          <CardBody>
            {stats && stats.active_players > 0 ? (
              <div className="space-y-3">
                {/* TODO: Fetch real player performance data from API */}
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="font-medium">Données de performance disponibles</p>
                  <p className="text-sm mt-1">
                    Complétez des sessions pour voir les statistiques
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-3">👥</div>
                <p className="font-medium">Aucun joueur actif</p>
                <p className="text-sm mt-1">
                  Créez des comptes joueurs pour voir leurs performances
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Alertes et notifications"
            subtitle="Points d'attention"
          />
          <CardBody>
            {stats && (stats.active_players > 0 || stats.upcoming_sessions > 0) ? (
              <div className="space-y-3">
                {/* Show notifications when there are upcoming sessions */}
                {stats.upcoming_sessions > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                          {stats.upcoming_sessions} session{stats.upcoming_sessions > 1 ? 's' : ''} planifiée{stats.upcoming_sessions > 1 ? 's' : ''}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Cette semaine
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Default message when no specific alerts */}
                {stats.upcoming_sessions === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="font-medium">Aucune alerte</p>
                    <p className="text-sm mt-1">
                      Tout est en ordre pour le moment
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-3">🔔</div>
                <p className="font-medium">Aucune notification</p>
                <p className="text-sm mt-1">
                  Les alertes apparaîtront ici
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
