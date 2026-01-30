/**
 * Suspend User Modal
 * Modal pour suspendre un utilisateur avec date et raison
 */

'use client'

import { useState } from 'react'

interface SuspendUserModalProps {
  username: string
  currentSuspension: string | null
  onClose: () => void
  onSuspend: (suspendedUntil: string | null, reason: string) => void
}

export default function SuspendUserModal({
  username,
  currentSuspension,
  onClose,
  onSuspend,
}: SuspendUserModalProps) {
  const [suspendedUntil, setSuspendedUntil] = useState<string>(
    currentSuspension
      ? new Date(currentSuspension).toISOString().slice(0, 16)
      : ''
  )
  const [reason, setReason] = useState('')
  const [quickDays, setQuickDays] = useState<number | null>(null)

  const quickOptions = [
    { days: 1, label: '1 jour' },
    { days: 3, label: '3 jours' },
    { days: 7, label: '1 semaine' },
    { days: 30, label: '1 mois' },
  ]

  const handleQuickSelect = (days: number) => {
    setQuickDays(days)
    const date = new Date()
    date.setDate(date.getDate() + days)
    setSuspendedUntil(date.toISOString().slice(0, 16))
  }

  const handleSubmit = () => {
    if (suspendedUntil) {
      onSuspend(new Date(suspendedUntil).toISOString(), reason)
    }
  }

  const handleRemoveSuspension = () => {
    onSuspend(null, '')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>{currentSuspension ? '🔓' : '⏸️'}</span>
          {currentSuspension ? 'Modifier suspension' : 'Suspendre'} {username}
        </h2>

        {currentSuspension && (
          <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Actuellement suspendu jusqu'au{' '}
              <strong>{new Date(currentSuspension).toLocaleString('fr-FR')}</strong>
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Quick select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Durée rapide
            </label>
            <div className="flex flex-wrap gap-2">
              {quickOptions.map((option) => (
                <button
                  key={option.days}
                  onClick={() => handleQuickSelect(option.days)}
                  className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                    quickDays === option.days
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date et heure de fin
            </label>
            <input
              type="datetime-local"
              value={suspendedUntil}
              onChange={(e) => {
                setSuspendedUntil(e.target.value)
                setQuickDays(null)
              }}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Raison (optionnel)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Raison de la suspension..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Annuler
          </button>

          {currentSuspension && (
            <button
              onClick={handleRemoveSuspension}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Lever suspension
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={!suspendedUntil}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentSuspension ? 'Modifier' : 'Suspendre'}
          </button>
        </div>
      </div>
    </div>
  )
}
