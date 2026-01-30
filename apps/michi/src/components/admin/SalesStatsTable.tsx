/**
 * Sales Statistics Table Component
 * Display subscription and payment statistics for admin
 */

'use client'

import { useState, useEffect } from 'react'
import { getAccessToken } from '@/contexts/AuthContext'
import { RefreshCw, CreditCard, Gift, Tag, Edit2, X, Check } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || ''

interface SubscriptionStats {
  total_subscriptions: number
  active_subscriptions: number
  by_tier: Record<string, number>
  by_status: Record<string, number>
  total_revenue_monthly: number
  promotions_used: number
}

interface SubscriptionItem {
  id: string
  user_id: string
  username: string
  email: string
  tier: string
  status: string
  interval: string
  amount: number
  currency: string
  current_period_end: string | null
  custom_badge: string | null
  created_at: string
  has_promo: boolean
}

const TIER_LABELS: Record<string, { name: string; icon: string; color: string }> = {
  musha: { name: 'Musha', icon: '🥋', color: 'text-gray-600' },
  samurai: { name: 'Samurai', icon: '⚔️', color: 'text-blue-600' },
  samurai_famille: { name: 'Samurai+', icon: '⚔️', color: 'text-blue-600' },
  sensei: { name: 'Sensei', icon: '🏯', color: 'text-purple-600' },
  sensei_famille: { name: 'Sensei+', icon: '🏯', color: 'text-purple-600' },
  founder: { name: 'Fondateur', icon: '👑', color: 'text-amber-600' },
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Actif', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  trialing: { label: 'Essai', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  past_due: { label: 'Impaye', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  canceled: { label: 'Annule', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' },
  unpaid: { label: 'Non paye', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
}

interface EditingSubscription {
  id: string
  user_id: string
  amount: number
  has_promo: boolean
}

export default function SalesStatsTable() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 })
  const [tierFilter, setTierFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState<EditingSubscription | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchSubscriptions()
  }, [pagination.page, tierFilter, statusFilter])

  async function fetchStats() {
    try {
      const token = getAccessToken()
      const res = await fetch(`${API_URL}/auth/super-admin/admin/subscriptions/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  async function fetchSubscriptions() {
    setIsLoading(true)
    try {
      const token = getAccessToken()
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        page_size: '15',
      })
      if (tierFilter) params.append('tier', tierFilter)
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`${API_URL}/auth/super-admin/admin/subscriptions?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setSubscriptions(data.subscriptions)
        setPagination(prev => ({
          ...prev,
          total: data.total,
          total_pages: data.total_pages
        }))
      }
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string = 'eur') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount)
  }

  const startEditing = (sub: SubscriptionItem) => {
    setEditing({
      id: sub.id,
      user_id: sub.user_id,
      amount: sub.amount,
      has_promo: sub.has_promo
    })
  }

  const cancelEditing = () => {
    setEditing(null)
  }

  const saveEditing = async () => {
    if (!editing) return
    setIsSaving(true)
    try {
      const token = getAccessToken()
      const res = await fetch(`${API_URL}/auth/super-admin/admin/users/${editing.user_id}/subscription`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: editing.amount,
          has_promo: editing.has_promo
        })
      })
      if (res.ok) {
        setEditing(null)
        fetchStats()
        fetchSubscriptions()
      } else {
        const error = await res.json()
        alert(`Erreur: ${error.detail || 'Impossible de sauvegarder'}`)
      }
    } catch (err) {
      console.error('Failed to save subscription:', err)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active_subscriptions}</p>
            <p className="text-xs text-slate-500">Abonnements actifs</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Gift className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.by_tier?.founder || 0}</p>
            <p className="text-xs text-slate-500">Fondateurs</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.promotions_used || 0}</p>
            <p className="text-xs text-slate-500">Promos utilisees</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.total_revenue_monthly || 0)}</p>
            <p className="text-xs text-slate-500">MRR estime</p>
          </div>
        </div>
      )}

      {/* Tier breakdown */}
      {stats && (
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
          {Object.entries(stats.by_tier || {}).map(([tier, count]) => {
            const config = TIER_LABELS[tier] || { name: tier, icon: '👤', color: 'text-gray-600' }
            return (
              <button
                key={tier}
                onClick={() => {
                  setTierFilter(tier === tierFilter ? '' : tier)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  tierFilter === tier
                    ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-slate-900'
                    : ''
                } bg-slate-100 dark:bg-slate-700 ${config.color}`}
              >
                <span>{config.icon}</span>
                <span>{config.name}</span>
                <span className="bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded text-xs">{count}</span>
              </button>
            )
          })}
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
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="trialing">En essai</option>
          <option value="past_due">Impayes</option>
          <option value="canceled">Annules</option>
        </select>
        <button
          onClick={() => { fetchStats(); fetchSubscriptions(); }}
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Montant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Promo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Fin periode</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Aucun abonnement trouve
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const tierConfig = TIER_LABELS[sub.tier] || { name: sub.tier, icon: '👤', color: 'text-gray-600' }
                  const statusConfig = STATUS_LABELS[sub.status] || { label: sub.status, color: 'bg-gray-100 text-gray-700' }
                  const isEditing = editing?.id === sub.id

                  return (
                    <tr key={sub.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 ${isEditing ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{sub.username}</p>
                          <p className="text-xs text-slate-500">{sub.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 ${tierConfig.color}`}>
                          <span>{tierConfig.icon}</span>
                          <span className="font-medium">{tierConfig.name}</span>
                        </span>
                        {sub.custom_badge && (
                          <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">✨ {sub.custom_badge}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editing.amount}
                            onChange={(e) => setEditing({ ...editing, amount: parseFloat(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-slate-700 text-sm"
                          />
                        ) : (
                          <>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {sub.amount > 0 ? formatCurrency(sub.amount, sub.currency) : 'Gratuit'}
                            </span>
                            {sub.interval && sub.amount > 0 && (
                              <span className="text-xs text-slate-500 ml-1">/{sub.interval === 'yearly' ? 'an' : 'mois'}</span>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <button
                            onClick={() => setEditing({ ...editing, has_promo: !editing.has_promo })}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                              editing.has_promo
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                            }`}
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {editing.has_promo ? 'Promo ON' : 'Promo OFF'}
                          </button>
                        ) : sub.has_promo ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            <Tag className="w-3 h-3 mr-1" />
                            Promo
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {formatDate(sub.current_period_end)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={saveEditing}
                              disabled={isSaving}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors disabled:opacity-50"
                              title="Sauvegarder"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={isSaving}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                              title="Annuler"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(sub)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
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
