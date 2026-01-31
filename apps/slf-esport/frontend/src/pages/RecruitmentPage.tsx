/**
 * Recruitment Page - View and manage player recruitment applications
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Badge, Button } from '@/components/ui'
import MainLayout from '@/components/layout/MainLayout'
import { useAuthStore } from '@/store/authStore'
import recruitmentService, { RecruitmentApplication, RecruitmentStats } from '@/services/recruitmentService'

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Nouvelle',
  REVIEWED: 'Examinée',
  INTERVIEW_SCHEDULED: 'Entretien planifié',
  ACCEPTED: 'Acceptée',
  REJECTED: 'Refusée',
  WITHDRAWN: 'Retirée'
}

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  REVIEWED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  INTERVIEW_SCHEDULED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  REJECTED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  WITHDRAWN: 'bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-400'
}

export default function RecruitmentPage() {
  const { user } = useAuthStore()
  const [applications, setApplications] = useState<RecruitmentApplication[]>([])
  const [stats, setStats] = useState<RecruitmentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<RecruitmentApplication | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [applicationsData, statsData] = await Promise.all([
        recruitmentService.getAllApplications(statusFilter || undefined),
        recruitmentService.getStats()
      ])
      setApplications(applicationsData.applications)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load recruitment data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await recruitmentService.updateApplication(id, { status })
      await loadData()
      if (selectedApplication?.id === id) {
        setSelectedApplication({ ...selectedApplication, status: status as any })
      }
    } catch (error) {
      console.error('Failed to update application status:', error)
    }
  }

  const saveNotes = async (id: number) => {
    try {
      await recruitmentService.updateApplication(id, { admin_notes: adminNotes })
      await loadData()
      if (selectedApplication?.id === id) {
        setSelectedApplication({ ...selectedApplication, admin_notes: adminNotes })
      }
    } catch (error) {
      console.error('Failed to save notes:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Check permissions
  if (user?.role !== 'MANAGER' && user?.role !== 'COACH' && !user?.is_super_admin) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <CardBody>
              <div className="text-center">
                <span className="text-6xl mb-4 block">⚠️</span>
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">🎮 Candidatures de Recrutement</h1>
          <p className="text-blue-100">
            Gérer les candidatures de joueurs souhaitant rejoindre l'équipe
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardBody>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{stats.new}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nouvelles</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{stats.reviewed}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Examinées</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Acceptées</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-600">{stats.rejected}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Refusées</p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === null
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Toutes
              </button>
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications List */}
          <Card>
            <CardHeader title="📋 Liste des candidatures" />
            <CardBody>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl block mb-2">📭</span>
                  <p className="text-gray-600 dark:text-gray-400">Aucune candidature</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelectedApplication(app)
                        setAdminNotes(app.admin_notes || '')
                      }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedApplication?.id === app.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {app.pseudo}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {app.first_name} {app.last_name}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                          {STATUS_LABELS[app.status]}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          {app.country} • {app.age} ans
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatDate(app.submitted_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Application Detail */}
          <Card>
            <CardHeader title="📄 Détail de la candidature" />
            <CardBody>
              {selectedApplication ? (
                <div className="space-y-4">
                  {/* Header Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedApplication.pseudo}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedApplication.first_name} {selectedApplication.last_name}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selectedApplication.status]}`}>
                      {STATUS_LABELS[selectedApplication.status]}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Email</p>
                      <a href={`mailto:${selectedApplication.email}`} className="text-primary-600 hover:underline">
                        {selectedApplication.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Âge</p>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.age} ans</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Pays</p>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.country}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Langues</p>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.languages}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Statut actuel</p>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.current_status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Disponibilité</p>
                      <p className="text-gray-900 dark:text-white">{selectedApplication.availability}</p>
                    </div>
                  </div>

                  {/* Motivation */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💬 Motivation</h4>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      {selectedApplication.motivation}
                    </p>
                  </div>

                  {/* Interview Availability */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📅 Disponibilité entretien</h4>
                    <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      {selectedApplication.interview_availability}
                    </p>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📝 Notes internes</h4>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Ajouter des notes pour l'équipe..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={3}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => saveNotes(selectedApplication.id)}
                    >
                      Enregistrer les notes
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => updateStatus(selectedApplication.id, 'ACCEPTED')}
                      disabled={selectedApplication.status === 'ACCEPTED'}
                    >
                      ✅ Accepter
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => updateStatus(selectedApplication.id, 'INTERVIEW_SCHEDULED')}
                      disabled={selectedApplication.status === 'INTERVIEW_SCHEDULED'}
                    >
                      📅 Planifier entretien
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(selectedApplication.id, 'REJECTED')}
                      disabled={selectedApplication.status === 'REJECTED'}
                    >
                      ❌ Refuser
                    </Button>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                    <p>Soumise le {formatDate(selectedApplication.submitted_at)}</p>
                    {selectedApplication.reviewed_at && (
                      <p>Examinée le {formatDate(selectedApplication.reviewed_at)}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-4xl block mb-2">👈</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sélectionne une candidature pour voir les détails
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
