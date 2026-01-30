/**
 * Holistic Profiles Table Component
 * Display holistic profiles statistics and list for admin
 */

'use client'

import { useState, useEffect } from 'react'
import { getAccessToken } from '@/contexts/AuthContext'
import { Check, X, RefreshCw, Brain, Sparkles, Star, Moon, Hash } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || ''

interface ProfileStats {
  total_profiles: number
  total_users_with_profile: number
  profiles_last_7_days: number
  profiles_last_30_days: number
  complete_profiles: number
  incomplete_profiles: number
  average_version: number
}

interface ProfileSummary {
  id: string
  user_id: string
  session_id: string
  version: number
  is_active: boolean
  has_psychological: boolean
  has_neurodivergence: boolean
  has_shinkofa: boolean
  has_design_human: boolean
  has_astrology: boolean
  has_numerology: boolean
  has_synthesis: boolean
  generated_at: string | null
  updated_at: string | null
  username: string | null
  email: string | null
}

interface ProfileListResponse {
  profiles: ProfileSummary[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export default function HolisticProfilesTable() {
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [profiles, setProfiles] = useState<ProfileSummary[]>([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 })
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
    fetchProfiles()
  }, [pagination.page, statusFilter])

  async function fetchStats() {
    try {
      const token = getAccessToken()
      const res = await fetch(`${API_URL}/admin/profiles/stats?authorization=${token}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch profile stats:', err)
    }
  }

  async function fetchProfiles() {
    setIsLoading(true)
    try {
      const token = getAccessToken()
      const params = new URLSearchParams({
        authorization: token || '',
        page: pagination.page.toString(),
        page_size: '15',
      })
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`${API_URL}/admin/profiles/?${params}`)
      if (res.ok) {
        const data: ProfileListResponse = await res.json()
        setProfiles(data.profiles)
        setPagination(prev => ({
          ...prev,
          total: data.total,
          total_pages: data.total_pages
        }))
      }
    } catch (err) {
      console.error('Failed to fetch profiles:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function regenerateProfile(profileId: string) {
    setRegeneratingId(profileId)
    try {
      const token = getAccessToken()
      const res = await fetch(
        `${API_URL}/admin/profiles/${profileId}/regenerate?authorization=${token}`,
        { method: 'POST' }
      )
      if (res.ok) {
        alert('Regeneration lancee. Le profil sera mis a jour dans quelques minutes.')
        fetchProfiles()
      }
    } catch (err) {
      console.error('Failed to regenerate profile:', err)
    } finally {
      setRegeneratingId(null)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const StatusIcon = ({ status }: { status: boolean }) => (
    status
      ? <Check className="w-4 h-4 text-emerald-500" />
      : <X className="w-4 h-4 text-slate-300 dark:text-slate-600" />
  )

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_profiles}</p>
            <p className="text-xs text-slate-500">Profils totaux</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">{stats.complete_profiles}</p>
            <p className="text-xs text-slate-500">Complets</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">{stats.incomplete_profiles}</p>
            <p className="text-xs text-slate-500">Incomplets</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{stats.profiles_last_7_days}</p>
            <p className="text-xs text-slate-500">7 derniers jours</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPagination(prev => ({ ...prev, page: 1 }))
          }}
          className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
        >
          <option value="">Tous les profils</option>
          <option value="complete">Complets uniquement</option>
          <option value="incomplete">Incomplets uniquement</option>
        </select>
        <button
          onClick={() => { fetchStats(); fetchProfiles(); }}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Rafraichir"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Utilisateur</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase" title="Psychologie"><Brain className="w-4 h-4 inline" /></th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase" title="Neurodivergence"><Sparkles className="w-4 h-4 inline" /></th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase" title="Design Humain"><Star className="w-4 h-4 inline" /></th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase" title="Astrologie"><Moon className="w-4 h-4 inline" /></th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase" title="Numerologie"><Hash className="w-4 h-4 inline" /></th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Synthese</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Genere le</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    Aucun profil holistique trouve
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {profile.username || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-slate-500">{profile.email || profile.user_id}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center"><StatusIcon status={profile.has_psychological} /></td>
                    <td className="px-3 py-3 text-center"><StatusIcon status={profile.has_neurodivergence} /></td>
                    <td className="px-3 py-3 text-center"><StatusIcon status={profile.has_design_human} /></td>
                    <td className="px-3 py-3 text-center"><StatusIcon status={profile.has_astrology} /></td>
                    <td className="px-3 py-3 text-center"><StatusIcon status={profile.has_numerology} /></td>
                    <td className="px-3 py-3 text-center">
                      {profile.has_synthesis ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                          Complet
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                          Partiel
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDate(profile.generated_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => regenerateProfile(profile.id)}
                        disabled={regeneratingId === profile.id}
                        className="px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {regeneratingId === profile.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          'Regenerer'
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page <= 1}
            className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-30"
          >
            Precedent
          </button>
          <span className="text-sm text-slate-500">
            Page {pagination.page} sur {pagination.total_pages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= pagination.total_pages}
            className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-30"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  )
}
