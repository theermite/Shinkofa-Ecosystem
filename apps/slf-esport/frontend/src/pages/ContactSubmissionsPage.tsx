/**
 * Contact Submissions Page - View and manage contact form submissions
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Badge, Button } from '@/components/ui'
import MainLayout from '@/components/layout/MainLayout'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'

interface ContactSubmission {
  id: number
  nom: string
  email: string
  sujet: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  source: string
  submitted_at: string
  read_at: string | null
  replied_at: string | null
  admin_notes: string | null
}

const STATUS_LABELS = {
  new: 'Nouveau',
  read: 'Lu',
  replied: 'Répondu',
  archived: 'Archivé'
}

const STATUS_COLORS = {
  new: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  read: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  replied: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
}

const SUJET_LABELS: Record<string, string> = {
  support: 'Support technique',
  abonnement: "Question d'abonnement",
  feedback: "Retour d'expérience",
  partenariat: 'Proposition de partenariat',
  media: 'Demande média/presse',
  autre: 'Autre'
}

export default function ContactSubmissionsPage() {
  const { user } = useAuthStore()
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  useEffect(() => {
    loadSubmissions()
  }, [statusFilter])

  const loadSubmissions = async () => {
    try {
      setIsLoading(true)
      const params = statusFilter ? { status_filter: statusFilter } : {}
      const response = await api.get('/contact-submissions/all', { params })
      setSubmissions(response.data.submissions)
    } catch (error) {
      console.error('Failed to load contact submissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/contact-submissions/${id}`, { status })
      await loadSubmissions()
      if (selectedSubmission?.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status: status as any })
      }
    } catch (error) {
      console.error('Failed to update submission status:', error)
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">📬 Demandes de Contact</h1>
          <p className="text-purple-100">
            Gérer les soumissions du formulaire de contact du site vitrine
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === null
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Toutes ({submissions.length})
              </button>
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Submissions List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : submissions.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Aucune demande
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Aucune soumission de contact pour le moment.
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-4">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardBody>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {submission.nom}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[submission.status]}`}>
                          {STATUS_LABELS[submission.status]}
                        </span>
                        <Badge variant="info" size="sm">
                          {SUJET_LABELS[submission.sujet] || submission.sujet}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        📧 <a href={`mailto:${submission.email}`} className="hover:underline">{submission.email}</a> •
                        📅 {formatDate(submission.submitted_at)}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                        {submission.message}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        👁️ Voir
                      </Button>
                      <a href={`mailto:${submission.email}`}>
                        <Button variant="primary" size="sm">
                          📧 Répondre
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader title={`Demande #${selectedSubmission.id}`} />
              <CardBody>
                <div className="space-y-4">
                  {/* Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nom</label>
                      <p className="text-gray-900 dark:text-white">{selectedSubmission.nom}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
                      <p className="text-gray-900 dark:text-white">
                        <a href={`mailto:${selectedSubmission.email}`} className="hover:underline">
                          {selectedSubmission.email}
                        </a>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sujet</label>
                      <p className="text-gray-900 dark:text-white">
                        {SUJET_LABELS[selectedSubmission.sujet]}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(selectedSubmission.submitted_at)}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Message</label>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg whitespace-pre-wrap">
                      {selectedSubmission.message}
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                      Changer le statut
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <Button
                          key={status}
                          variant={selectedSubmission.status === status ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => updateStatus(selectedSubmission.id, status)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <a href={`mailto:${selectedSubmission.email}`} className="flex-1">
                      <Button variant="primary" fullWidth>
                        📧 Répondre par email
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedSubmission(null)}
                    >
                      Fermer
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
