/**
 * Bug Reports Dashboard
 * Super Admin panel for managing user bug reports
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAccessToken } from '@/contexts/AuthContext'

interface BugReport {
  id: string
  user_id: string | null
  title: string
  description: string
  category: string
  status: string
  url: string | null
  user_agent: string | null
  screenshot_url: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

const STATUSES = [
  { value: 'nouveau', label: 'Nouveau', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'en_cours', label: 'En cours', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { value: 'résolu', label: 'Résolu', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'rejeté', label: 'Rejeté', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
]

const CATEGORIES = [
  { value: 'UI', label: 'Interface (UI)', icon: '🎨' },
  { value: 'Performance', label: 'Performance', icon: '⚡' },
  { value: 'Fonctionnel', label: 'Fonctionnel', icon: '⚙️' },
  { value: 'Sécurité', label: 'Sécurité', icon: '🔒' },
]

export default function BugReportsPage() {
  const router = useRouter()
  const [bugs, setBugs] = useState<BugReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    fetchBugs()
  }, [filterStatus, filterCategory])

  const fetchBugs = async () => {
    const token = getAccessToken()
    if (!token) {
      router.push('/auth/login')
      return
    }

    setLoading(true)

    const params = new URLSearchParams()
    if (filterStatus !== 'all') params.append('status_filter', filterStatus)
    if (filterCategory !== 'all') params.append('category_filter', filterCategory)

    const response = await fetch(
      `/api/bug-reports/?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (response.ok) {
      const data = await response.json()
      setBugs(data)
    } else {
      console.error('Failed to fetch bug reports')
    }

    setLoading(false)
  }

  const updateBugStatus = async (bugId: string, status: string, adminNotes?: string) => {
    const token = getAccessToken()
    if (!token) return

    const response = await fetch(
      `/api/bug-reports/${bugId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, admin_notes: adminNotes }),
      }
    )

    if (response.ok) {
      fetchBugs()
      setSelectedBug(null)
    }
  }

  const deleteBugReport = async (bugId: string) => {
    const token = getAccessToken()
    if (!token) return

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bug report ? Cette action est irréversible.')) {
      return
    }

    const response = await fetch(
      `/api/bug-reports/${bugId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (response.ok) {
      fetchBugs()
      setSelectedBug(null)
    }
  }

  const getStatusConfig = (status: string) => {
    return STATUSES.find((s) => s.value === status) || STATUSES[0]
  }

  const getCategoryConfig = (category: string) => {
    return CATEGORIES.find((c) => c.value === category) || CATEGORIES[0]
  }

  const stats = {
    total: bugs.length,
    nouveau: bugs.filter((b) => b.status === 'nouveau').length,
    en_cours: bugs.filter((b) => b.status === 'en_cours').length,
    résolu: bugs.filter((b) => b.status === 'résolu').length,
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span>🐛</span>
                Bug Reports
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Gérer les bugs signalés par les utilisateurs
              </p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
            >
              ← Retour Admin
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">Nouveaux</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.nouveau}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">En cours</p>
            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{stats.en_cours}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300">Résolus</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.résolu}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Statut
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="all">Tous</option>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Catégorie
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="all">Toutes</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bug List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mt-6 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              Chargement...
            </div>
          ) : bugs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              Aucun bug trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Titre & Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {bugs.map((bug) => {
                    const statusConfig = getStatusConfig(bug.status)
                    const categoryConfig = getCategoryConfig(bug.category)
                    return (
                      <tr key={bug.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{categoryConfig.icon}</span>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {bug.title}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {categoryConfig.label}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {new Date(bug.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedBug(bug)}
                            className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
                          >
                            Voir détails
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bug Detail Modal */}
      {selectedBug && (
        <BugDetailModal
          bug={selectedBug}
          onClose={() => setSelectedBug(null)}
          onUpdate={updateBugStatus}
          onDelete={deleteBugReport}
        />
      )}
    </div>
  )
}

// Bug Detail Modal Component
function BugDetailModal({
  bug,
  onClose,
  onUpdate,
  onDelete,
}: {
  bug: BugReport
  onClose: () => void
  onUpdate: (bugId: string, status: string, adminNotes?: string) => void
  onDelete: (bugId: string) => void
}) {
  const [status, setStatus] = useState(bug.status)
  const [adminNotes, setAdminNotes] = useState(bug.admin_notes || '')
  const statusConfig = STATUSES.find((s) => s.value === bug.status) || STATUSES[0]
  const categoryConfig = CATEGORIES.find((c) => c.value === bug.category) || CATEGORIES[0]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{categoryConfig.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {bug.title}
              </h2>
              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusConfig.color} mt-1`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Description
            </h3>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <p className="text-slate-900 dark:text-white whitespace-pre-wrap">
                {bug.description}
              </p>
            </div>
          </div>

          {/* Context */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Contexte Technique
            </h3>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600 space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>URL :</strong> {bug.url || 'Non spécifié'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 break-all">
                <strong>User Agent :</strong> {bug.user_agent || 'Non spécifié'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Date :</strong> {new Date(bug.created_at).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Update Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Changer le statut
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Notes administrateur
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Ajouter des notes internes..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onDelete(bug.id)}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              title="Supprimer ce bug report"
            >
              🗑️
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              onClick={() => onUpdate(bug.id, status, adminNotes || undefined)}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
