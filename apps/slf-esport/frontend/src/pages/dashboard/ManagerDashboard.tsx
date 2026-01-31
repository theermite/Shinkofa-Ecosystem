/**
 * Manager Dashboard - Optimized for analytics and team management
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardHeader, CardBody, Badge } from '@/components/ui'
import { Link } from 'react-router-dom'
import userService from '@/services/userService'

export default function ManagerDashboard() {
  const { user } = useAuthStore()
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    activePlayers: 0,
    coaches: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTeamStats()
  }, [])

  const loadTeamStats = async () => {
    try {
      setIsLoading(true)
      const players = await userService.getAllPlayers()
      setTeamStats({
        totalMembers: players.length,
        activePlayers: players.filter((p: any) => p.is_active).length,
        coaches: players.filter((p: any) => p.role === 'COACH').length,
      })
    } catch (error) {
      console.error('Failed to load team stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const guideSteps = [
    {
      step: '1',
      icon: '👥',
      title: 'Gérer l\'équipe',
      desc: 'Ajoutez vos joueurs et coachs depuis la section Utilisateurs. Chaque membre aura son compte personnel pour suivre sa progression.',
      color: 'red'
    },
    {
      step: '2',
      icon: '📊',
      title: 'Analytics en temps réel',
      desc: 'Consultez les performances de l\'équipe dans Analytics. Visualisez les scores, l\'assiduité, et identifiez les axes d\'amélioration.',
      color: 'blue'
    },
    {
      step: '3',
      icon: '📈',
      title: 'Rapports Obsidian',
      desc: 'Générez des rapports Markdown optimisés pour Obsidian. Exportez les données et créez votre base de connaissances structurée.',
      color: 'purple'
    },
    {
      step: '4',
      icon: '🎯',
      title: 'Coaching & Suivi',
      desc: 'Assignez des exercices, suivez l\'évolution, et accompagnez vos joueurs vers l\'excellence.',
      color: 'green'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Modern Welcome Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-pink-700 rounded-2xl p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full -ml-32 -mb-32 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl backdrop-blur-sm">
              📊
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Dashboard Manager
              </h1>
              <p className="text-red-100 text-lg">
                Bonjour {user?.full_name || user?.username} 👋
              </p>
            </div>
          </div>
          <p className="text-red-50 text-base max-w-2xl">
            Vue complète de l'équipe SLF avec analytics avancées et génération de rapports Obsidian.
          </p>
        </div>
      </div>

      {/* KPIs Card - Clean & Modern */}
      <Card>
        <CardHeader
          title="📈 Indicateurs Clés"
          subtitle="Vue d'ensemble de l'équipe"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Members */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-2xl">
                  👥
                </div>
                <Badge variant="primary" size="sm">Total</Badge>
              </div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Équipe complète
              </p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {isLoading ? '...' : teamStats.totalMembers}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                membres inscrits
              </p>
            </div>

            {/* Active Players */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-2xl">
                  🎮
                </div>
                <Badge variant="success" size="sm">Actifs</Badge>
              </div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                Joueurs actifs
              </p>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                {isLoading ? '...' : teamStats.activePlayers}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                en activité
              </p>
            </div>

            {/* Coaches */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-2xl">
                  🎯
                </div>
                <Badge variant="warning" size="sm">Staff</Badge>
              </div>
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                Coachs
              </p>
              <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                {isLoading ? '...' : teamStats.coaches}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                entraîneurs
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Actions - Modern Grid */}
      <Card>
        <CardHeader
          title="⚡ Actions Rapides"
          subtitle="Accès direct aux fonctionnalités principales"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Users Management */}
            <Link to="/users" className="group">
              <div className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 h-full">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">👥</div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  Utilisateurs
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gérer l'équipe complète
                </p>
              </div>
            </Link>

            {/* Analytics */}
            <Link to="/analytics" className="group">
              <div className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 h-full">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  Analytics
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Statistiques détaillées
                </p>
              </div>
            </Link>

            {/* Reports */}
            <Link to="/reports" className="group">
              <div className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 h-full">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📈</div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  Rapports
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Export Markdown Obsidian
                </p>
              </div>
            </Link>

            {/* Contact Submissions */}
            <Link to="/contact-submissions" className="group">
              <div className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 h-full">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📬</div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  Contact
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Demandes site vitrine
                </p>
              </div>
            </Link>

            {/* Settings */}
            <Link to="/settings" className="group">
              <div className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 h-full">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">⚙️</div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  Paramètres
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configuration équipe
                </p>
              </div>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Getting Started Guide - Obsidian Style */}
      <Card>
        <CardHeader
          title="📚 Guide de Démarrage"
          subtitle="Comment tirer le meilleur parti de votre dashboard Manager"
        />
        <CardBody>
          <div className="space-y-6">
            {guideSteps.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  item.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                  item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  item.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                  'bg-green-100 dark:bg-green-900/30'
                }`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-bold ${
                      item.color === 'red' ? 'bg-red-500' :
                      item.color === 'blue' ? 'bg-blue-500' :
                      item.color === 'purple' ? 'bg-purple-500' :
                      'bg-green-500'
                    }`}>
                      {item.step}
                    </span>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tip */}
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <h4 className="font-bold text-red-900 dark:text-red-100 mb-2">
                  Astuce Pro : Obsidian Integration
                </h4>
                <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
                  Les rapports générés sont au format Markdown avec métadonnées YAML, tags, et liens internes.
                  Parfait pour créer un système de gestion de connaissances (PKM) dans Obsidian.
                  Utilisez les templates de rapports pour créer des dashboards personnalisés dans votre vault.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
