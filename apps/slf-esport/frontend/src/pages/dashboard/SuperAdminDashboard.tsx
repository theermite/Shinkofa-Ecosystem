/**
 * Super Admin Dashboard - Full system access with is_super_admin flag
 * Displayed when user.is_super_admin=true regardless of role
 */

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardHeader, CardBody, Button } from '@/components/ui'
import { Link } from 'react-router-dom'
import userService from '@/services/userService'

interface SuperAdminDashboardProps {
  onToggleSuperAdminMode?: () => void
}

export default function SuperAdminDashboard({ onToggleSuperAdminMode }: SuperAdminDashboardProps) {
  const { user } = useAuthStore()
  const [systemStats, setSystemStats] = useState({
    totalMembers: 0,
    activePlayers: 0,
    coaches: 0,
    managers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSystemStats()
  }, [])

  const loadSystemStats = async () => {
    try {
      setIsLoading(true)
      const allUsers = await userService.getAllUsers()
      setSystemStats({
        totalMembers: allUsers.length,
        activePlayers: allUsers.filter((u: any) => u.role === 'JOUEUR' && u.is_active).length,
        coaches: allUsers.filter((u: any) => u.role === 'COACH').length,
        managers: allUsers.filter((u: any) => u.role === 'MANAGER').length,
      })
    } catch (error) {
      console.error('Failed to load system stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">👑</span>
              <h1 className="text-3xl font-bold">
                Super Admin - {user?.full_name || user?.username}
              </h1>
            </div>
            <p className="text-purple-100">
              Accès complet au système - Rôle: {user?.role} avec privilèges super admin
            </p>
          </div>
          {onToggleSuperAdminMode && user?.role !== 'SUPER_ADMIN' && (
            <Button
              onClick={onToggleSuperAdminMode}
              variant="secondary"
              className="bg-orange-600 hover:bg-orange-700 text-white border-0"
            >
              Retour Mode {user?.role === 'COACH' ? 'Coach' : 'Normal'}
            </Button>
          )}
        </div>
      </div>

      {/* System-wide KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader title="Total Membres" />
          <CardBody>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-purple-600">
                {isLoading ? '...' : systemStats.totalMembers}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Tous utilisateurs
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Joueurs Actifs" />
          <CardBody>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-green-600">
                {isLoading ? '...' : systemStats.activePlayers}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              En activité
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Coachs" />
          <CardBody>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-blue-600">
                {isLoading ? '...' : systemStats.coaches}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Entraîneurs
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Managers" />
          <CardBody>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-red-600">
                {isLoading ? '...' : systemStats.managers}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gestionnaires
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Admin Actions */}
      <Card>
        <CardHeader
          title="⚙️ Administration Système"
          subtitle="Gestion complète de la plateforme"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to="/users">
              <div className="p-6 border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all cursor-pointer text-center">
                <div className="text-4xl mb-2">👥</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Gestion Utilisateurs
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  CRUD complet + rôles
                </p>
              </div>
            </Link>

            <Link to="/analytics">
              <div className="p-6 border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all cursor-pointer text-center">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Analytics Avancées
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Rapports détaillés
                </p>
              </div>
            </Link>

            <Link to="/settings">
              <div className="p-6 border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all cursor-pointer text-center">
                <div className="text-4xl mb-2">⚙️</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Paramètres Système
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Configuration
                </p>
              </div>
            </Link>

            <Link to="/reports">
              <div className="p-6 border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all cursor-pointer text-center">
                <div className="text-4xl mb-2">📈</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Rapports
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Export et analyses
                </p>
              </div>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Coach/Manager Tools */}
      <Card>
        <CardHeader
          title="🎮 Outils Coach & Manager"
          subtitle="Gestion quotidienne de l'équipe"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to="/calendar">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer text-center">
                <div className="text-4xl mb-2">📅</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Calendrier
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Sessions & événements
                </p>
              </div>
            </Link>

            <Link to="/exercises">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer text-center">
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Exercices
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Bibliothèque complète
                </p>
              </div>
            </Link>

            <Link to="/coaching">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer text-center">
                <div className="text-4xl mb-2">🎓</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Coaching
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Contenu éducatif
                </p>
              </div>
            </Link>

            <Link to="/media">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer text-center">
                <div className="text-4xl mb-2">📹</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Médias
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Upload & gestion
                </p>
              </div>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Super Admin Info */}
      <Card>
        <CardHeader
          title="👑 Privilèges Super Admin"
          subtitle="Capacités et responsabilités"
        />
        <CardBody>
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex gap-3">
              <span className="text-purple-600 font-bold text-lg">✓</span>
              <div>
                <p className="font-semibold mb-1">Accès complet à toutes les pages</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Vous avez accès à toutes les fonctionnalités de la plateforme, y compris celles réservées aux managers.
                  Votre flag is_super_admin bypass tous les contrôles de rôle.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-purple-600 font-bold text-lg">✓</span>
              <div>
                <p className="font-semibold mb-1">Gestion des utilisateurs et rôles</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Vous pouvez créer, modifier et supprimer des utilisateurs. Vous pouvez également modifier les rôles
                  de tous les utilisateurs de la plateforme.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-purple-600 font-bold text-lg">✓</span>
              <div>
                <p className="font-semibold mb-1">Permissions backend automatiques</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Toutes les routes API protégées par rôle sont automatiquement accessibles grâce à votre flag is_super_admin.
                  Le serveur vérifie ce flag en priorité avant de vérifier les rôles.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-purple-600 font-bold text-lg">✓</span>
              <div>
                <p className="font-semibold mb-1">Vous gardez votre rôle de {user?.role}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Votre rôle actuel est <strong>{user?.role}</strong>, ce qui vous permet de conserver votre identité
                  professionnelle tout en bénéficiant de tous les privilèges administrateur.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
            <p className="text-sm text-purple-900 dark:text-purple-100">
              <strong>🔒 Responsabilité :</strong> En tant que Super Admin, vous avez un accès complet au système.
              Utilisez vos privilèges de manière responsable et documentez les changements importants.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
