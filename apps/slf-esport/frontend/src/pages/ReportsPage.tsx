/**
 * Reports Page - Team reports and data export
 */

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardHeader, CardBody, Button, Badge } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

export default function ReportsPage() {
  const { user } = useAuthStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleGenerateReport = async (reportType: string) => {
    setIsGenerating(true)
    setMessage(null)

    try {
      // TODO: Implement API call to generate report
      await new Promise(resolve => setTimeout(resolve, 2000))
      setMessage({ type: 'success', text: `Rapport "${reportType}" généré avec succès. Téléchargement démarré.` })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors de la génération du rapport',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Check if user has permission (coaches, managers, and super admins)
  if (user?.role !== 'MANAGER' && user?.role !== 'COACH' && !user?.is_super_admin) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <CardBody>
              <div className="text-center">
                <span className="text-6xl mb-4">⚠️</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Accès refusé
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Cette page est réservée aux managers et coachs uniquement.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const reportCategories = [
    {
      title: 'Rapports de Progression',
      description: 'Analyses détaillées des performances individuelles et de l\'équipe',
      reports: [
        {
          name: 'Progression Individuelle',
          description: 'Rapport détaillé de progression pour chaque joueur',
          icon: '👤',
          format: 'PDF',
        },
        {
          name: 'Progression d\'Équipe',
          description: 'Vue d\'ensemble des performances globales',
          icon: '👥',
          format: 'PDF',
        },
        {
          name: 'Comparatif Mensuel',
          description: 'Comparaison des performances mois par mois',
          icon: '📊',
          format: 'Excel',
        },
      ],
    },
    {
      title: 'Rapports d\'Assiduité',
      description: 'Suivi de présence et engagement',
      reports: [
        {
          name: 'Assiduité Hebdomadaire',
          description: 'Taux de présence aux sessions d\'entraînement',
          icon: '📅',
          format: 'Excel',
        },
        {
          name: 'Participation aux Exercices',
          description: 'Détail de participation par exercice',
          icon: '🎯',
          format: 'PDF',
        },
      ],
    },
    {
      title: 'Rapports d\'Exercices',
      description: 'Statistiques détaillées sur les exercices cognitifs',
      reports: [
        {
          name: 'Performance par Catégorie',
          description: 'Scores moyens par catégorie d\'exercice',
          icon: '🏆',
          format: 'Excel',
        },
        {
          name: 'Historique des Scores',
          description: 'Évolution des scores dans le temps',
          icon: '📈',
          format: 'CSV',
        },
        {
          name: 'Top Performers',
          description: 'Classement des meilleurs joueurs',
          icon: '🥇',
          format: 'PDF',
        },
      ],
    },
    {
      title: 'Rapports Financiers',
      description: 'Suivi du budget et ROI (Manager uniquement)',
      reports: [
        {
          name: 'Budget Mensuel',
          description: 'Détail des dépenses et investissements',
          icon: '💰',
          format: 'Excel',
          managerOnly: true,
        },
        {
          name: 'ROI Progression',
          description: 'Analyse du retour sur investissement',
          icon: '📊',
          format: 'PDF',
          managerOnly: true,
        },
      ],
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Rapports et Exports</h1>
          <p className="text-blue-100">
            Génération de rapports détaillés et export de données
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader
            title="Actions Rapides"
            subtitle="Générez rapidement les rapports les plus courants"
          />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="primary"
                onClick={() => handleGenerateReport('Rapport Hebdomadaire Complet')}
                disabled={isGenerating}
                className="p-6 h-auto flex flex-col items-center gap-2"
              >
                <span className="text-3xl">📊</span>
                <span className="font-semibold">Rapport Hebdomadaire</span>
                <span className="text-xs opacity-80">Vue complète de la semaine</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleGenerateReport('Export Données Brutes')}
                disabled={isGenerating}
                className="p-6 h-auto flex flex-col items-center gap-2"
              >
                <span className="text-3xl">📁</span>
                <span className="font-semibold">Export Données</span>
                <span className="text-xs opacity-80">Toutes les données (CSV)</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleGenerateReport('Rapport Performance Mensuel')}
                disabled={isGenerating}
                className="p-6 h-auto flex flex-col items-center gap-2"
              >
                <span className="text-3xl">📈</span>
                <span className="font-semibold">Performance Mensuelle</span>
                <span className="text-xs opacity-80">Analyse du mois</span>
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Report Categories */}
        {reportCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader
              title={category.title}
              subtitle={category.description}
            />
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.reports.map((report, reportIndex) => {
                  // Hide manager-only reports for non-managers (super admins allowed)
                  if (report.managerOnly && user?.role !== 'MANAGER' && !user?.is_super_admin) {
                    return null
                  }

                  return (
                    <div
                      key={reportIndex}
                      className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-3xl">{report.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {report.name}
                            </h3>
                            <Badge variant="info" size="sm">
                              {report.format}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {report.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => handleGenerateReport(report.name)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? 'Génération...' : 'Générer'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardBody>
          </Card>
        ))}

        {/* Export History */}
        <Card>
          <CardHeader
            title="Historique des Exports"
            subtitle="Rapports récemment générés"
          />
          <CardBody>
            <div className="space-y-3">
              {[
                { name: 'Rapport Hebdomadaire Complet', date: 'Aujourd\'hui à 10:30', format: 'PDF', size: '2.4 MB' },
                { name: 'Export Données Brutes', date: 'Hier à 15:45', format: 'CSV', size: '1.8 MB' },
                { name: 'Performance Mensuelle', date: 'Il y a 3 jours', format: 'Excel', size: '3.2 MB' },
              ].map((export_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {export_.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {export_.date} • {export_.format} • {export_.size}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Info */}
        <Card>
          <CardHeader
            title="ℹ️ Informations"
            subtitle="À propos des rapports"
          />
          <CardBody>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <strong>Formats disponibles :</strong> Les rapports sont disponibles en PDF (lecture/impression),
                Excel (analyse avancée), ou CSV (import dans d'autres outils).
              </p>
              <p>
                <strong>Historique :</strong> Les rapports générés sont conservés pendant 30 jours.
                Vous pouvez les télécharger à nouveau depuis l'historique.
              </p>
              <p>
                <strong>Automatisation :</strong> Configurez l'envoi automatique de rapports hebdomadaires
                dans les paramètres de notification.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}
