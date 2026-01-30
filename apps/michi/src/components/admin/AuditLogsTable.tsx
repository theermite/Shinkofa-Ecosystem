/**
 * Audit Logs Table
 * Table des logs d'actions admin avec pagination
 */

'use client'

import { useState, useEffect } from 'react'
import { getAccessToken } from '@/contexts/AuthContext'

interface AuditLog {
  id: string
  admin_id: string
  admin_username: string | null
  target_user_id: string | null
  target_username: string | null
  action: string
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

interface AuditLogsTableProps {
  apiUrl: string
}

const ACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  reset_password: { label: 'Reset mot de passe', icon: '🔑', color: 'text-amber-600' },
  toggle_active: { label: 'Statut actif', icon: '🔄', color: 'text-blue-600' },
  force_verify_email: { label: 'Vérification email', icon: '📧', color: 'text-indigo-600' },
  suspend_user: { label: 'Suspension', icon: '⏸️', color: 'text-orange-600' },
  update_notes: { label: 'Notes admin', icon: '📝', color: 'text-gray-600' },
  update_subscription: { label: 'Subscription', icon: '💳', color: 'text-purple-600' },
  impersonate_user: { label: 'Impersonation', icon: '👤', color: 'text-pink-600' },
  export_users: { label: 'Export CSV', icon: '📊', color: 'text-green-600' },
}

export default function AuditLogsTable({ apiUrl }: AuditLogsTableProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [pagination.page, actionFilter])

  async function fetchLogs() {
    try {
      setIsLoading(true)
      const token = getAccessToken()
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        page_size: '15',
      })

      if (actionFilter) params.append('action', actionFilter)

      const res = await fetch(`${apiUrl}/auth/super-admin/admin/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          total_pages: data.total_pages,
        }))
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDetails = (details: Record<string, unknown> | null) => {
    if (!details) return null
    return JSON.stringify(details, null, 2)
  }

  return (
    <div>
      {/* Filter */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value)
            setPagination((prev) => ({ ...prev, page: 1 }))
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Toutes les actions</option>
          {Object.entries(ACTION_LABELS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.icon} {value.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Chargement...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun log trouvé
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Admin
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Cible
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  IP
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log) => {
                const actionConfig = ACTION_LABELS[log.action] || {
                  label: log.action,
                  icon: '?',
                  color: 'text-gray-600',
                }
                const isExpanded = expandedLog === log.id

                return (
                  <>
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {log.admin_username || log.admin_id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 ${actionConfig.color}`}
                        >
                          {actionConfig.icon} {actionConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {log.target_username ? (
                          <span className="text-gray-900 dark:text-white">
                            {log.target_username}
                          </span>
                        ) : log.target_user_id ? (
                          <span className="text-gray-500 text-xs">
                            {log.target_user_id.slice(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {log.ip_address || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {log.details && (
                          <button
                            onClick={() =>
                              setExpandedLog(isExpanded ? null : log.id)
                            }
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {isExpanded ? 'Masquer' : 'Voir'}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && log.details && (
                      <tr key={`${log.id}-details`}>
                        <td
                          colSpan={6}
                          className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50"
                        >
                          <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-x-auto">
                            {formatDetails(log.details)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {pagination.total} log(s)
        </p>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            disabled={pagination.page <= 1}
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 text-sm"
          >
            Precedent
          </button>
          <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} / {pagination.total_pages || 1}
          </span>
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            disabled={pagination.page >= pagination.total_pages}
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 text-sm"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}
