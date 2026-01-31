/**
 * Joueur Dashboard - Player view
 */

import { useAuthStore } from '@/store/authStore'
import { Card, CardHeader, CardBody, Badge, Button } from '@/components/ui'
import { Link } from 'react-router-dom'

export default function JoueurDashboard() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenue, {user?.full_name || user?.username} ! 👋
        </h1>
        <p className="text-primary-100">
          Prêt à t'entraîner aujourd'hui ? Consulte tes exercices et ton calendrier.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Entraînements" />
          <CardBody>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-primary-600">12</span>
              <span className="text-gray-500 mb-1">cette semaine</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }} />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">75%</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Progression" />
          <CardBody>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-green-600">+18%</span>
              <span className="text-gray-500 mb-1">ce mois</span>
            </div>
            <Badge variant="success" className="mt-4">
              En progression
            </Badge>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Prochain entraînement" />
          <CardBody>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Aujourd'hui 18:00
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Session collective - 2h
            </p>
            <Badge variant="warning" className="mt-4">
              Dans 3 heures
            </Badge>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader
          title="Actions rapides"
          subtitle="Accède rapidement à tes outils d'entraînement"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/exercises">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer text-center">
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Exercices Cognitifs
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Entraîne tes réflexes et ta vision
                </p>
              </div>
            </Link>

            <Link to="/calendar">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer text-center">
                <div className="text-4xl mb-2">📅</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Calendrier
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Planning et sessions
                </p>
              </div>
            </Link>

            <Link to="/coaching">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer text-center">
                <div className="text-4xl mb-2">🧘</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Coaching Holistique
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Méditations et introspection
                </p>
              </div>
            </Link>

            <Link to="/profile">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer text-center">
                <div className="text-4xl mb-2">👤</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Mon Profil
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Paramètres et stats
                </p>
              </div>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader
          title="Activité récente"
          subtitle="Tes derniers exercices et entraînements"
        />
        <CardBody>
          <div className="space-y-4">
            {[
              {
                title: 'Reaction Time Test',
                score: '245ms',
                date: 'Il y a 2 heures',
                type: 'Réflexes',
              },
              {
                title: 'Visual Memory',
                score: '85%',
                date: 'Il y a 5 heures',
                type: 'Mémoire',
              },
              {
                title: 'Session collective',
                score: '2h',
                date: 'Hier',
                type: 'Entraînement',
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.date}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="primary">{activity.type}</Badge>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                    {activity.score}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline">
              Voir tout l'historique
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
