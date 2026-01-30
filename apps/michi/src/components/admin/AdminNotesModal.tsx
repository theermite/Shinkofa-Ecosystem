/**
 * Admin Notes Modal
 * Modal pour gérer les notes admin sur un utilisateur
 */

'use client'

import { useState } from 'react'

interface AdminNotesModalProps {
  username: string
  currentNotes: string | null
  onClose: () => void
  onSave: (notes: string | null) => void
}

export default function AdminNotesModal({
  username,
  currentNotes,
  onClose,
  onSave,
}: AdminNotesModalProps) {
  const [notes, setNotes] = useState(currentNotes || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await onSave(notes.trim() || null)
    setIsSaving(false)
  }

  const handleClear = () => {
    setNotes('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>📝</span>
          Notes admin - {username}
        </h2>

        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Notes internes visibles uniquement par les super admins.
            Ces notes ne sont jamais visibles par l'utilisateur.
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajouter des notes sur cet utilisateur...

Exemples:
- Contact support le 15/01/2026
- Problème de paiement résolu
- VIP - attention particulière"
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none font-mono text-sm"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span>{notes.length} caractères</span>
          {notes !== (currentNotes || '') && (
            <span className="text-amber-600">Modifications non sauvegardées</span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Annuler
          </button>

          {currentNotes && (
            <button
              onClick={handleClear}
              className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              Effacer
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving || notes === (currentNotes || '')}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
