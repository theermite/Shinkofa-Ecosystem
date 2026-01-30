/**
 * Report Bug Modal
 * Modal simple et accessible pour signaler des bugs
 */

'use client'

import { useState } from 'react'

interface ReportBugModalProps {
  onClose: () => void
  onSubmit: (bugData: BugReportData) => Promise<void>
}

export interface BugReportData {
  title: string
  description: string
  category: string
  url?: string
  screenshot_url?: string
}

const CATEGORIES = [
  { value: 'UI', label: 'Interface (UI)', icon: '🎨', description: 'Problème visuel, layout, design' },
  { value: 'Performance', label: 'Performance', icon: '⚡', description: 'Lenteur, freeze, crash' },
  { value: 'Fonctionnel', label: 'Fonctionnel', icon: '⚙️', description: 'Feature qui ne marche pas' },
  { value: 'Sécurité', label: 'Sécurité', icon: '🔒', description: 'Vulnérabilité ou faille' },
]

export default function ReportBugModal({ onClose, onSubmit }: ReportBugModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (title.length < 5) {
      setError('Le titre doit contenir au moins 5 caractères')
      return
    }

    if (description.length < 10) {
      setError('La description doit contenir au moins 10 caractères')
      return
    }

    if (!category) {
      setError('Veuillez sélectionner une catégorie')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        title,
        description,
        category,
        url: window.location.href,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du bug')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        paddingTop: '10vh',
        paddingBottom: '10vh'
      }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '80vh',
          overflowY: 'auto',
          marginTop: 'auto',
          marginBottom: 'auto'
        }}
      >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐛</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Signaler un bug
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">⚠️ {error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="bug-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Titre du bug *
              </label>
              <input
                id="bug-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Impossible de sauvegarder mon profil"
                maxLength={200}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {title.length}/200 caractères
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Catégorie *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      category === cat.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">
                        {cat.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {cat.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="bug-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description détaillée *
              </label>
              <textarea
                id="bug-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez le bug en détail : que s'est-il passé ? Quelles étapes pour le reproduire ?"
                rows={6}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Minimum 10 caractères
              </p>
            </div>

            {/* Auto-captured info */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                📍 Informations capturées automatiquement
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <li>• URL actuelle : {typeof window !== 'undefined' ? window.location.href : ''}</li>
                <li>• Navigateur et système d'exploitation</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le bug'}
              </button>
            </div>
          </form>
        </div>
    </div>
  )
}
