/**
 * Settings Page - Team configuration and system settings
 */

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardHeader, CardBody, Button, Input, Badge } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Team Settings State
  const [teamSettings, setTeamSettings] = useState({
    teamName: 'SLF Esport',
    teamDescription: 'Équipe professionnelle Honor of Kings',
    teamGoal: 'Niveau européen compétitif',
    weeklyHoursTarget: 20,
    coachingSessionsPerWeek: 3,
    minAttendanceRate: 85,
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    sessionReminders: true,
    progressReports: true,
    weeklyDigest: true,
  })

  const handleSaveTeamSettings = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      // TODO: Implement API call to save team settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage({ type: 'success', text: 'Paramètres d\'équipe sauvegardés avec succès' })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors de la sauvegarde des paramètres',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      // TODO: Implement API call to save notification settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage({ type: 'success', text: 'Préférences de notifications sauvegardées avec succès' })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors de la sauvegarde des notifications',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Check if user has permission (managers and super admins)
  if (user?.role !== 'MANAGER' && !user?.is_super_admin) {
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
                  Cette page est réservée aux managers uniquement.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Paramètres d'Équipe</h1>
          <p className="text-purple-100">
            Configuration globale de l'équipe SLF Esport
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

        {/* Team Information */}
        <Card>
          <CardHeader
            title="Informations Générales"
            subtitle="Configuration de base de l'équipe"
          />
          <CardBody>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom de l'équipe
                </label>
                <Input
                  type="text"
                  value={teamSettings.teamName}
                  onChange={(e) => setTeamSettings({ ...teamSettings, teamName: e.target.value })}
                  placeholder="SLF Esport"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={3}
                  value={teamSettings.teamDescription}
                  onChange={(e) => setTeamSettings({ ...teamSettings, teamDescription: e.target.value })}
                  placeholder="Description de votre équipe..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Objectif principal
                </label>
                <Input
                  type="text"
                  value={teamSettings.teamGoal}
                  onChange={(e) => setTeamSettings({ ...teamSettings, teamGoal: e.target.value })}
                  placeholder="Niveau européen compétitif"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="primary" onClick={handleSaveTeamSettings} disabled={isSaving}>
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Training Goals */}
        <Card>
          <CardHeader
            title="Objectifs d'Entraînement"
            subtitle="Cibles hebdomadaires pour l'équipe"
          />
          <CardBody>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Heures d'entraînement par semaine (par joueur)
                </label>
                <Input
                  type="number"
                  value={teamSettings.weeklyHoursTarget}
                  onChange={(e) => setTeamSettings({ ...teamSettings, weeklyHoursTarget: parseInt(e.target.value) })}
                  min={1}
                  max={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sessions de coaching par semaine
                </label>
                <Input
                  type="number"
                  value={teamSettings.coachingSessionsPerWeek}
                  onChange={(e) => setTeamSettings({ ...teamSettings, coachingSessionsPerWeek: parseInt(e.target.value) })}
                  min={1}
                  max={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Taux d'assiduité minimum (%)
                </label>
                <Input
                  type="number"
                  value={teamSettings.minAttendanceRate}
                  onChange={(e) => setTeamSettings({ ...teamSettings, minAttendanceRate: parseInt(e.target.value) })}
                  min={0}
                  max={100}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="primary" onClick={handleSaveTeamSettings} disabled={isSaving}>
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader
            title="Notifications"
            subtitle="Préférences de notifications pour l'équipe"
          />
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Notifications par email
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Recevoir les notifications importantes par email
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                  className="w-5 h-5 text-primary-600"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Rappels de session
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rappels avant les sessions d'entraînement
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.sessionReminders}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, sessionReminders: e.target.checked })}
                  className="w-5 h-5 text-primary-600"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Rapports de progression
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Recevoir les rapports de progression des joueurs
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.progressReports}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, progressReports: e.target.checked })}
                  className="w-5 h-5 text-primary-600"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Résumé hebdomadaire
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Recevoir un résumé hebdomadaire des performances
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.weeklyDigest}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyDigest: e.target.checked })}
                  className="w-5 h-5 text-primary-600"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="primary" onClick={handleSaveNotifications} disabled={isSaving}>
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader
            title="Informations Système"
            subtitle="État et statistiques de la plateforme"
          />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Version
                  </span>
                  <Badge variant="info" size="sm">v1.0.0</Badge>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Statut API
                  </span>
                  <Badge variant="success" size="sm">En ligne</Badge>
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Dernière mise à jour
                  </span>
                  <span className="text-xs text-gray-500">Aujourd'hui</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}
