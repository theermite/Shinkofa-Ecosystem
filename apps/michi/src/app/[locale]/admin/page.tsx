/**
 * Admin Dashboard
 * Super Admin panel for managing users and platform
 * Improved UX/UI version
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getAccessToken } from '@/contexts/AuthContext'
import {
  UserManagementModal,
  SuspendUserModal,
  AuditLogsTable,
  ImpersonationBanner,
  ResetPasswordModal,
  MaintenanceControl,
  HolisticProfilesTable,
  SalesStatsTable,
} from '@/components/admin'

interface AdminStats {
  total_users: number
  active_users: number
  verified_users: number
  pioneers: number
  plans: Record<string, number>
  recent_signups: number
}

interface UserSubscription {
  id: string | null
  tier: string | null
  status: string | null
  amount: number | null
  current_period_end: string | null
  custom_badge: string | null
}

interface AdminUser {
  id: string
  email: string
  username: string
  is_active: boolean
  email_verified: boolean
  is_super_admin: boolean
  is_pioneer: boolean
  pioneer_number: number | null
  last_login_at: string | null
  suspended_until: string | null
  admin_notes: string | null
  created_at: string
  subscription: UserSubscription | null
}

interface UsersResponse {
  users: AdminUser[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

interface SuperAdminSession {
  is_active: boolean
  impersonated_user_id: string | null
}

const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || ''

const TIER_CONFIG: Record<string, { name: string; icon: string; color: string; bgColor: string }> = {
  musha: { name: 'Musha', icon: '🥋', color: 'text-gray-700 dark:text-gray-300', bgColor: 'bg-gray-100 dark:bg-gray-700' },
  samurai: { name: 'Samurai', icon: '⚔️', color: 'text-blue-700 dark:text-blue-300', bgColor: 'bg-blue-50 dark:bg-blue-900/30' },
  samurai_famille: { name: 'Samurai+', icon: '⚔️', color: 'text-blue-700 dark:text-blue-300', bgColor: 'bg-blue-50 dark:bg-blue-900/30' },
  sensei: { name: 'Sensei', icon: '🏯', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-50 dark:bg-purple-900/30' },
  sensei_famille: { name: 'Sensei+', icon: '🏯', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-50 dark:bg-purple-900/30' },
  founder: { name: 'Fondateur', icon: '👑', color: 'text-amber-700 dark:text-amber-300', bgColor: 'bg-amber-50 dark:bg-amber-900/30' },
  none: { name: 'Free', icon: '👤', color: 'text-gray-500 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-800' },
}

type Tab = 'users' | 'profiles' | 'sales' | 'audit'

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 })

  // Filters
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('')
  const [showPlansBreakdown, setShowPlansBreakdown] = useState(false)

  // Tabs
  const [activeTab, setActiveTab] = useState<Tab>('users')

  // Modals
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)

  // Impersonation
  const [impersonatedUser, setImpersonatedUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    checkAccess()
  }, [])

  useEffect(() => {
    if (isAuthorized) {
      fetchStats()
      fetchUsers()
      checkImpersonation()
    }
  }, [isAuthorized, pagination.page, search, tierFilter, activeFilter])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + R = Refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault()
        handleRefresh()
      }
      // Escape = Close modals
      if (e.key === 'Escape') {
        setShowUserModal(false)
        setShowSuspendModal(false)
        setShowResetPasswordModal(false)
        setSelectedUser(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await Promise.all([fetchStats(), fetchUsers()])
    setIsRefreshing(false)
  }, [search, tierFilter, activeFilter, pagination.page])

  async function checkAccess() {
    try {
      const token = getAccessToken()
      if (!token) {
        router.push('/auth/login')
        return
      }

      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        router.push('/auth/login')
        return
      }

      const user = await res.json()
      if (!user.is_super_admin) {
        setError('Acces refuse. Vous devez etre super admin.')
        setIsLoading(false)
        return
      }

      setIsAuthorized(true)
      setIsLoading(false)
    } catch {
      setError('Erreur de verification des acces')
      setIsLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const token = getAccessToken()
      const res = await fetch(`${API_URL}/auth/super-admin/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  async function fetchUsers() {
    try {
      const token = getAccessToken()
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        page_size: '20',
      })

      if (search) params.append('search', search)
      if (tierFilter) params.append('tier', tierFilter)
      if (activeFilter) params.append('is_active', activeFilter)

      const res = await fetch(`${API_URL}/auth/super-admin/admin/users-extended?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data: UsersResponse = await res.json()
        setUsers(data.users)
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          total_pages: data.total_pages,
        }))
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  async function checkImpersonation() {
    try {
      const token = getAccessToken()
      if (!token) {
        console.warn('No access token available for impersonation check')
        return
      }

      const res = await fetch(`${API_URL}/auth/super-admin/status`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const session: SuperAdminSession = await res.json()

        if (session.impersonated_user_id) {
          const userRes = await fetch(
            `${API_URL}/auth/super-admin/admin/users/${session.impersonated_user_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          if (userRes.ok) {
            const userData = await userRes.json()
            setImpersonatedUser(userData)
          } else {
            console.error('Failed to fetch impersonated user details:', await userRes.text())
            setImpersonatedUser(null)
          }
        } else {
          setImpersonatedUser(null)
        }
      } else {
        console.error('Failed to get super admin status:', await res.text())
      }
    } catch (err) {
      console.error('Failed to check impersonation:', err)
    }
  }

  async function updateUserSubscription(
    userId: string,
    updates: { tier?: string; custom_badge?: string }
  ) {
    try {
      const token = getAccessToken()
      const res = await fetch(
        `${API_URL}/auth/super-admin/admin/users/${userId}/subscription`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      )

      if (res.ok) {
        fetchUsers()
        fetchStats()
        setShowUserModal(false)
        setSelectedUser(null)
      }
    } catch (err) {
      console.error('Failed to update subscription:', err)
    }
  }

  async function toggleUserActive(userId: string, isActive: boolean) {
    try {
      const token = getAccessToken()
      const res = await fetch(
        `${API_URL}/auth/super-admin/admin/users/${userId}/toggle-active`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_active: isActive }),
        }
      )

      if (res.ok) {
        fetchUsers()
        fetchStats()
      }
    } catch (err) {
      console.error('Failed to toggle active:', err)
    }
  }

  async function forceVerifyEmail(userId: string, verified: boolean) {
    try {
      const token = getAccessToken()
      const res = await fetch(
        `${API_URL}/auth/super-admin/admin/users/${userId}/force-verify-email`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ verified }),
        }
      )

      if (res.ok) {
        fetchUsers()
        fetchStats()
      }
    } catch (err) {
      console.error('Failed to verify email:', err)
    }
  }

  async function suspendUser(userId: string, suspendedUntil: string | null, reason: string) {
    try {
      const token = getAccessToken()
      const res = await fetch(`${API_URL}/auth/super-admin/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suspended_until: suspendedUntil, reason }),
      })

      if (res.ok) {
        fetchUsers()
        setShowSuspendModal(false)
        setSelectedUser(null)
      }
    } catch (err) {
      console.error('Failed to suspend user:', err)
    }
  }

  async function updateNotes(userId: string, notes: string | null) {
    try {
      const token = getAccessToken()
      const res = await fetch(`${API_URL}/auth/super-admin/admin/users/${userId}/notes`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      })

      if (res.ok) {
        fetchUsers()
        setShowUserModal(false)
        setSelectedUser(null)
      }
    } catch (err) {
      console.error('Failed to update notes:', err)
    }
  }

  async function resetPassword(
    userId: string,
    method: 'email' | 'temp'
  ): Promise<{ temporary_password?: string }> {
    try {
      const token = getAccessToken()
      const res = await fetch(
        `${API_URL}/auth/super-admin/admin/users/${userId}/reset-password`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ method }),
        }
      )

      if (res.ok) {
        const data = await res.json()
        return { temporary_password: data.temporary_password }
      }
      return {}
    } catch (err) {
      console.error('Failed to reset password:', err)
      return {}
    }
  }

  async function startImpersonation(userId: string) {
    try {
      const token = getAccessToken()

      // Step 1: Enable super admin mode
      const toggleRes = await fetch(`${API_URL}/auth/super-admin/toggle`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: true }),
      })

      if (!toggleRes.ok) {
        const errorData = await toggleRes.json().catch(() => ({}))
        console.error('Failed to enable super admin mode:', errorData)
        alert('Erreur: Impossible d\'activer le mode super admin')
        return
      }

      // Step 2: Start impersonation
      const res = await fetch(`${API_URL}/auth/super-admin/impersonate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      })

      if (res.ok) {
        await checkImpersonation()
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('Failed to impersonate user:', errorData)
        alert('Erreur: Impossible d\'impersonner cet utilisateur')
      }
    } catch (err) {
      console.error('Failed to start impersonation:', err)
      alert('Erreur lors de l\'impersonation')
    }
  }

  async function stopImpersonation() {
    try {
      const token = getAccessToken()

      // Stop impersonation
      const res = await fetch(`${API_URL}/auth/super-admin/impersonate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: null }),
      })

      if (res.ok) {
        setImpersonatedUser(null)

        // Also disable super admin mode
        await fetch(`${API_URL}/auth/super-admin/toggle`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_active: false }),
        })
      } else {
        console.error('Failed to stop impersonation:', await res.text())
        alert('Erreur: Impossible d\'arreter l\'impersonation')
      }
    } catch (err) {
      console.error('Failed to stop impersonation:', err)
      alert('Erreur lors de l\'arret de l\'impersonation')
    }
  }

  async function exportUsers() {
    try {
      const token = getAccessToken()
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (tierFilter) params.append('tier', tierFilter)
      if (activeFilter) params.append('is_active', activeFilter)

      const res = await fetch(`${API_URL}/auth/super-admin/admin/users/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `shinkofa_users_${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      console.error('Failed to export users:', err)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('fr-FR')
  }

  const formatRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return 'Jamais'
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'A l\'instant'
    if (minutes < 60) return `Il y a ${minutes}min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days < 7) return `Il y a ${days}j`
    return formatDate(dateStr)
  }

  const isUserSuspended = (user: AdminUser) => {
    if (!user.suspended_until) return false
    return new Date(user.suspended_until) > new Date()
  }

  const hasActiveFilters = search || tierFilter || activeFilter

  const clearFilters = () => {
    setSearch('')
    setTierFilter('')
    setActiveFilter('')
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Verification...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Acces Refuse</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity"
          >
            Retour a l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 ${impersonatedUser ? 'pt-14' : ''}`}>
      {/* Impersonation Banner */}
      {impersonatedUser && (
        <ImpersonationBanner
          impersonatedUsername={impersonatedUser.username}
          onStopImpersonation={stopImpersonation}
        />
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Retour"
              >
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-xl">🛡️</span> Admin
                </h1>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <MaintenanceControl />
              <button
                onClick={() => router.push('/admin/bug-reports')}
                className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                title="Voir les bugs signalés"
              >
                <span>🐛</span>
                <span className="hidden sm:inline">Bug Reports</span>
              </button>
              <button
                onClick={() => router.push('/admin/suggestions')}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                title="Voir les suggestions"
              >
                <span>💡</span>
                <span className="hidden sm:inline">Idees</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                title="Rafraichir (Ctrl+R)"
              >
                <svg className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={exportUsers}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard
              label="Total"
              value={stats.total_users}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
              color="slate"
            />
            <StatCard
              label="Actifs"
              value={stats.active_users}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              color="emerald"
            />
            <StatCard
              label="Verifies"
              value={stats.verified_users}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
              color="blue"
            />
            <StatCard
              label="Pionniers"
              value={stats.pioneers}
              icon={<span className="text-lg">🏅</span>}
              color="amber"
            />
            <StatCard
              label="7 jours"
              value={stats.recent_signups}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
              color="purple"
              subLabel="+nouveaux"
            />
            <StatCard
              label="Fondateurs"
              value={stats.plans?.founder || 0}
              icon={<span className="text-lg">👑</span>}
              color="amber"
            />
          </div>
        )}

        {/* Plans Breakdown - Collapsible */}
        {stats && (
          <div className="mb-6">
            <button
              onClick={() => setShowPlansBreakdown(!showPlansBreakdown)}
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-3"
            >
              <svg className={`w-4 h-4 transition-transform ${showPlansBreakdown ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Repartition des plans
            </button>
            {showPlansBreakdown && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.plans).map(([tier, count]) => {
                  const config = TIER_CONFIG[tier] || TIER_CONFIG.none
                  return (
                    <button
                      key={tier}
                      onClick={() => {
                        setTierFilter(tier === tierFilter ? '' : tier)
                        setPagination((prev) => ({ ...prev, page: 1 }))
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        tierFilter === tier
                          ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-slate-900'
                          : ''
                      } ${config.bgColor} ${config.color}`}
                    >
                      <span>{config.icon}</span>
                      <span>{config.name}</span>
                      <span className="bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded text-xs font-bold">{count}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === 'users'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Utilisateurs
              {activeTab === 'users' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('profiles')}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === 'profiles'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Profils
              {activeTab === 'profiles' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === 'sales'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ventes
              {activeTab === 'sales' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === 'audit'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Audit
              {activeTab === 'audit' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"></span>
              )}
            </button>
          </div>

          {activeTab === 'users' ? (
            <>
              {/* Filters */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Rechercher par email ou username..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value)
                        setPagination((prev) => ({ ...prev, page: 1 }))
                      }}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  <select
                    value={tierFilter}
                    onChange={(e) => {
                      setTierFilter(e.target.value)
                      setPagination((prev) => ({ ...prev, page: 1 }))
                    }}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Tous les plans</option>
                    <option value="none">Sans plan</option>
                    <option value="musha">Musha</option>
                    <option value="samurai">Samurai</option>
                    <option value="sensei">Sensei</option>
                    <option value="founder">Fondateur</option>
                  </select>
                  <select
                    value={activeFilter}
                    onChange={(e) => {
                      setActiveFilter(e.target.value)
                      setPagination((prev) => ({ ...prev, page: 1 }))
                    }}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Tous statuts</option>
                    <option value="true">Actifs</option>
                    <option value="false">Inactifs</option>
                  </select>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Effacer
                    </button>
                  )}
                </div>
              </div>

              {/* Results count */}
              <div className="px-4 py-2 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pagination.total} resultat{pagination.total !== 1 ? 's' : ''}
                  {hasActiveFilters && ' (filtre actif)'}
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                        Connexion
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {users.map((u) => {
                      const tierKey = u.subscription?.tier || 'none'
                      const tierConfig = TIER_CONFIG[tierKey] || TIER_CONFIG.none
                      const suspended = isUserSuspended(u)

                      return (
                        <tr
                          key={u.id}
                          onClick={() => {
                            setSelectedUser(u)
                            setShowUserModal(true)
                          }}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer ${
                            suspended ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''
                          } ${!u.is_active ? 'opacity-60' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-slate-900 dark:text-white truncate">
                                    {u.username}
                                  </span>
                                  {u.is_super_admin && (
                                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded font-medium">
                                      Admin
                                    </span>
                                  )}
                                  {u.is_pioneer && (
                                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium">
                                      #{u.pioneer_number?.toString().padStart(3, '0')}
                                    </span>
                                  )}
                                  {u.admin_notes && (
                                    <span title="Notes admin" className="text-amber-500 text-xs">📝</span>
                                  )}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tierConfig.bgColor} ${tierConfig.color}`}>
                              <span>{tierConfig.icon}</span>
                              <span>{tierConfig.name}</span>
                            </span>
                            {u.subscription?.custom_badge && (
                              <div className="mt-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
                                ✨ {u.subscription.custom_badge}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="flex flex-col gap-1">
                              <StatusBadge
                                active={u.is_active}
                                label={u.is_active ? 'Actif' : 'Inactif'}
                              />
                              <StatusBadge
                                active={u.email_verified}
                                label={u.email_verified ? 'Verifie' : 'Non verifie'}
                                type="email"
                              />
                              {suspended && (
                                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                  ⏸️ Suspendu
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {formatRelativeTime(u.last_login_at)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedUser(u)
                                setShowUserModal(true)
                              }}
                              className="px-3 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            >
                              Gerer
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:cursor-not-allowed"
                    title="Premiere page"
                  >
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:cursor-not-allowed"
                    title="Page precedente"
                  >
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>

                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Page <span className="font-medium">{pagination.page}</span> sur <span className="font-medium">{pagination.total_pages || 1}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.total_pages}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:cursor-not-allowed"
                    title="Page suivante"
                  >
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setPagination((prev) => ({ ...prev, page: pagination.total_pages }))}
                    disabled={pagination.page >= pagination.total_pages}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:cursor-not-allowed"
                    title="Derniere page"
                  >
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : activeTab === 'profiles' ? (
            <HolisticProfilesTable />
          ) : activeTab === 'sales' ? (
            <SalesStatsTable />
          ) : (
            <AuditLogsTable apiUrl={API_URL} />
          )}
        </div>
      </main>

      {/* Modals */}
      {showUserModal && selectedUser && (
        <UserManagementModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false)
            setSelectedUser(null)
          }}
          onToggleActive={() => {
            toggleUserActive(selectedUser.id, !selectedUser.is_active)
            setShowUserModal(false)
            setSelectedUser(null)
          }}
          onForceVerifyEmail={() => {
            forceVerifyEmail(selectedUser.id, !selectedUser.email_verified)
            setShowUserModal(false)
            setSelectedUser(null)
          }}
          onResetPassword={() => {
            setShowUserModal(false)
            setShowResetPasswordModal(true)
          }}
          onSuspend={() => {
            setShowUserModal(false)
            setShowSuspendModal(true)
          }}
          onImpersonate={() => {
            startImpersonation(selectedUser.id)
            setShowUserModal(false)
            setSelectedUser(null)
          }}
          onUpdateNotes={(notes) => updateNotes(selectedUser.id, notes)}
          onUpdateSubscription={(tier, customBadge) => updateUserSubscription(selectedUser.id, { tier, custom_badge: customBadge })}
        />
      )}

      {showSuspendModal && selectedUser && (
        <SuspendUserModal
          username={selectedUser.username}
          currentSuspension={selectedUser.suspended_until}
          onClose={() => {
            setShowSuspendModal(false)
            setSelectedUser(null)
          }}
          onSuspend={(suspendedUntil, reason) => suspendUser(selectedUser.id, suspendedUntil, reason)}
        />
      )}

      {showResetPasswordModal && selectedUser && (
        <ResetPasswordModal
          username={selectedUser.username}
          hasEmail={!!selectedUser.email}
          onClose={() => {
            setShowResetPasswordModal(false)
            setSelectedUser(null)
          }}
          onReset={(method) => resetPassword(selectedUser.id, method)}
        />
      )}
    </div>
  )
}

// Components

function StatCard({
  label,
  value,
  icon,
  color,
  subLabel,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: 'slate' | 'emerald' | 'blue' | 'amber' | 'purple'
  subLabel?: string
}) {
  const colorClasses = {
    slate: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  }

  return (
    <div className={`rounded-xl p-4 ${colorClasses[color]} transition-all hover:scale-[1.02]`}>
      <div className="flex items-center gap-2 mb-2 opacity-70">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value.toLocaleString('fr-FR')}</div>
      {subLabel && <div className="text-xs opacity-60 mt-0.5">{subLabel}</div>}
    </div>
  )
}

function StatusBadge({
  active,
  label,
  type = 'status',
}: {
  active: boolean
  label: string
  type?: 'status' | 'email'
}) {
  if (type === 'email') {
    return (
      <span className={`inline-flex items-center gap-1 text-xs ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
        {active ? '✓' : '○'} {label}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
      {active ? '●' : '○'} {label}
    </span>
  )
}

