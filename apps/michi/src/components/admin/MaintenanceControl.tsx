/**
 * Maintenance Control Component
 * Admin control for maintenance mode
 */

'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Power, X } from 'lucide-react'
import { getAccessToken } from '@/contexts/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || ''

interface MaintenanceStatus {
  maintenance_mode: boolean
  message: string | null
  started_at: string | null
  started_by: string | null
}

export function MaintenanceControl() {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<MaintenanceStatus | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  async function fetchStatus() {
    try {
      const token = getAccessToken()
      const res = await fetch(`${API_URL}/system/maintenance/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
        setMessage(data.message || '')
      }
    } catch (err) {
      console.error('Failed to fetch maintenance status:', err)
    }
  }

  async function toggleMaintenance(enabled: boolean) {
    setIsLoading(true)
    try {
      const token = getAccessToken()
      const res = await fetch(`${API_URL}/system/maintenance`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maintenance_mode: enabled,
          message: enabled ? message || 'Maintenance en cours. Le service sera retabli dans quelques minutes.' : null,
        }),
      })

      if (res.ok) {
        await fetchStatus()
        if (!enabled) setIsOpen(false)
      }
    } catch (err) {
      console.error('Failed to toggle maintenance:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          status?.maintenance_mode
            ? 'bg-amber-500 hover:bg-amber-600 text-white'
            : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
        }`}
        title={status?.maintenance_mode ? 'Maintenance active' : 'Mode maintenance'}
      >
        <AlertTriangle size={16} />
        <span className="hidden sm:inline">
          {status?.maintenance_mode ? 'Maintenance ON' : 'Maintenance'}
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-amber-500" size={24} />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Mode Maintenance
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Status */}
              <div className={`p-4 rounded-xl ${
                status?.maintenance_mode
                  ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                  : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status?.maintenance_mode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                  }`}></div>
                  <span className={`font-medium ${
                    status?.maintenance_mode
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {status?.maintenance_mode ? 'Maintenance ACTIVE' : 'Services operationnels'}
                  </span>
                </div>
                {status?.maintenance_mode && status?.started_at && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    Demarree le {new Date(status.started_at).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Message affiche aux utilisateurs
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Maintenance en cours. Le service sera retabli dans quelques minutes."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  disabled={isLoading}
                />
              </div>

              {/* Info */}
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Le message sera affiche en haut de toutes les pages. Les utilisateurs peuvent le masquer temporairement.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              {status?.maintenance_mode ? (
                <button
                  onClick={() => toggleMaintenance(false)}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                >
                  <Power size={18} />
                  {isLoading ? 'Desactivation...' : 'Desactiver la maintenance'}
                </button>
              ) : (
                <button
                  onClick={() => toggleMaintenance(true)}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium disabled:opacity-50"
                >
                  <AlertTriangle size={18} />
                  {isLoading ? 'Activation...' : 'Activer la maintenance'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
