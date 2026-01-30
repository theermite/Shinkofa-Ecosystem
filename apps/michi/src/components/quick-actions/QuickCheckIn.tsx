/**
 * QuickCheckIn - Modal rapide pour check-in mental/physique
 * Shinkofa Platform - Next.js 15
 */

'use client'

import { useState } from 'react'
import { Heart, Brain, Zap, X, Check } from 'lucide-react'
import { useJournalStore } from '@ermite-widgets/daily-journal/src/store'

interface QuickCheckInProps {
  onClose: () => void
}

export function QuickCheckIn({ onClose }: QuickCheckInProps) {
  const [physical, setPhysical] = useState(5)
  const [emotional, setEmotional] = useState(5)
  const [mental, setMental] = useState(5)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  const { addMoodCheckIn } = useJournalStore()

  const handleSubmit = async () => {
    const today = new Date().toISOString().split('T')[0]

    // Sauvegarder dans le Daily Journal (localStorage)
    addMoodCheckIn(today, {
      physical,
      emotional,
      mental,
      note: note.trim() || undefined,
    })

    // Afficher confirmation
    setSaved(true)
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  const getEmojiForLevel = (level: number): string => {
    if (level >= 8) return '😊'
    if (level >= 6) return '🙂'
    if (level >= 4) return '😐'
    if (level >= 2) return '😕'
    return '😢'
  }

  const getColorForLevel = (level: number): string => {
    if (level >= 7) return 'text-green-500'
    if (level >= 4) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              💭 Check-in rapide
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-purple-500 transition-colors rounded-lg"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Comment te sens-tu en ce moment ?
          </p>

          {/* Physical */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <Zap size={18} className="text-orange-500" />
                Physique {getEmojiForLevel(physical)}
              </label>
              <span className={`text-2xl font-bold ${getColorForLevel(physical)}`}>
                {physical}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={physical}
              onChange={(e) => setPhysical(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Épuisé</span>
              <span>En forme</span>
            </div>
          </div>

          {/* Emotional */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <Heart size={18} className="text-orange-500" />
                Émotionnel {getEmojiForLevel(emotional)}
              </label>
              <span className={`text-2xl font-bold ${getColorForLevel(emotional)}`}>
                {emotional}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={emotional}
              onChange={(e) => setEmotional(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Triste</span>
              <span>Joyeux</span>
            </div>
          </div>

          {/* Mental */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <Brain size={18} className="text-orange-500" />
                Mental {getEmojiForLevel(mental)}
              </label>
              <span className={`text-2xl font-bold ${getColorForLevel(mental)}`}>
                {mental}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={mental}
              onChange={(e) => setMental(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Stressé</span>
              <span>Serein</span>
            </div>
          </div>

          {/* Note optionnelle */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Note (optionnel)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Pause lunch très ressourçante"
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-orange-500 focus:outline-none text-sm"
              maxLength={100}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSubmit}
              disabled={saved}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {saved ? (
                <>
                  <Check size={18} />
                  Enregistré dans le journal
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
            {!saved && (
              <button
                onClick={onClose}
                className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
