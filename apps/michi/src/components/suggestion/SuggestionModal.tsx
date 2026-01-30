/**
 * Suggestion Modal
 * Modal simple et accessible pour soumettre des suggestions d'evolution
 */

'use client'

import { useState } from 'react'

interface SuggestionModalProps {
  onClose: () => void
  onSubmit: (suggestionData: SuggestionData) => Promise<void>
}

export interface SuggestionData {
  title: string
  description: string
  category: string
  url?: string
}

const CATEGORIES = [
  { value: 'UX', label: 'Experience utilisateur', icon: '\uD83C\uDFA8', description: 'Navigation, design, ergonomie' },
  { value: 'Nouvelle fonctionnalite', label: 'Nouvelle fonctionnalite', icon: '\u2728', description: 'Idee de feature a ajouter' },
  { value: 'Amelioration', label: 'Amelioration', icon: '\uD83D\uDD27', description: 'Ameliorer une feature existante' },
  { value: 'Autre', label: 'Autre', icon: '\uD83D\uDCAD', description: 'Autre type de suggestion' },
]

export default function SuggestionModal({ onClose, onSubmit }: SuggestionModalProps) {
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
      setError('Le titre doit contenir au moins 5 caracteres')
      return
    }

    if (description.length < 10) {
      setError('La description doit contenir au moins 10 caracteres')
      return
    }

    if (!category) {
      setError('Veuillez selectionner une categorie')
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
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la suggestion')
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
              <span className="text-2xl">{'\uD83D\uDCA1'}</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Proposer une suggestion
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
                <p className="text-sm text-red-600 dark:text-red-400">{'\u26A0\uFE0F'} {error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="suggestion-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Titre de la suggestion *
              </label>
              <input
                id="suggestion-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Ajouter un mode sombre pour le calendrier"
                maxLength={200}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {title.length}/200 caracteres
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Categorie *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      category === cat.value
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
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
              <label htmlFor="suggestion-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description detaillee *
              </label>
              <textarea
                id="suggestion-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Decrivez votre suggestion en detail : quel probleme cela resoudrait ? Comment imaginez-vous la fonctionnalite ?"
                rows={6}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Minimum 10 caracteres
              </p>
            </div>

            {/* Info message */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {'\uD83D\uDC9A'} Merci de contribuer a l'amelioration de Shinkofa ! Chaque suggestion est lue et evaluee par notre equipe.
              </p>
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
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer la suggestion'}
              </button>
            </div>
          </form>
        </div>
    </div>
  )
}
