/**
 * Daily Journal Widget - Main component
 * Gratitude journal (3G/3R/1A) with mood check-ins
 *
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState, useEffect } from 'react'
import {
  Download,
  Upload,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Heart,
  Brain,
  Zap,
  Calendar,
  Eye,
  X,
} from 'lucide-react'
import { useJournalStore, type MoodCheckIn } from './store'

// Mood Check-In Component
function MoodCheckInSection({
  checkIns,
  onAdd,
  onDelete,
}: {
  checkIns: MoodCheckIn[]
  onAdd: (checkIn: Omit<MoodCheckIn, 'id' | 'timestamp'>) => void
  onDelete: (id: string) => void
}) {
  const [physical, setPhysical] = useState(5)
  const [emotional, setEmotional] = useState(5)
  const [mental, setMental] = useState(5)
  const [note, setNote] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = () => {
    onAdd({
      physical,
      emotional,
      mental,
      note: note.trim() || undefined,
    })
    setPhysical(5)
    setEmotional(5)
    setMental(5)
    setNote('')
    setShowForm(false)
  }

  const getEmojiForLevel = (level: number): string => {
    if (level >= 8) return '😊'
    if (level >= 6) return '🙂'
    if (level >= 4) return '😐'
    if (level >= 2) return '😕'
    return '😢'
  }

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Heart size={18} className="text-ermite-primary" />
          Check-ins du jour
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-ermite-primary text-slate-900 rounded-lg hover:bg-ermite-primary-hover transition-colors flex items-center gap-1 text-sm font-medium"
        >
          <Plus size={14} />
          Check-in
        </button>
      </div>

      {showForm && (
        <div className="p-4 bg-slate-700 border border-ermite-primary rounded-lg space-y-4">
          <p className="text-sm text-slate-300">Comment te sens-tu en ce moment ?</p>

          {/* Physical */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
              <Zap size={16} className="text-yellow-400" />
              Physique {getEmojiForLevel(physical)}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="10"
                value={physical}
                onChange={(e) => setPhysical(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-ermite-primary"
              />
              <span className="text-lg font-semibold text-white w-8 text-center">{physical}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Epuise</span>
              <span>En forme</span>
            </div>
          </div>

          {/* Emotional */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
              <Heart size={16} className="text-pink-400" />
              Emotionnel {getEmojiForLevel(emotional)}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="10"
                value={emotional}
                onChange={(e) => setEmotional(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-ermite-primary"
              />
              <span className="text-lg font-semibold text-white w-8 text-center">{emotional}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Triste</span>
              <span>Joyeux</span>
            </div>
          </div>

          {/* Mental */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
              <Brain size={16} className="text-purple-400" />
              Mental {getEmojiForLevel(mental)}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="10"
                value={mental}
                onChange={(e) => setMental(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-ermite-primary"
              />
              <span className="text-lg font-semibold text-white w-8 text-center">{mental}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Stresse</span>
              <span>Serein</span>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Note (optionnel)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Pause lunch ressourcante"
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm placeholder-slate-400 focus:border-ermite-primary focus:outline-none"
              maxLength={100}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-ermite-primary text-slate-900 rounded-lg hover:bg-ermite-primary-hover transition-colors font-medium"
            >
              Enregistrer
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Check-ins list */}
      {checkIns.length > 0 && (
        <div className="space-y-2">
          {checkIns
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((checkIn) => (
              <div
                key={checkIn.id}
                className="p-3 bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-between hover:border-ermite-primary/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-white">{formatTime(checkIn.timestamp)}</span>
                    <div className="flex gap-2 text-xs text-slate-300">
                      <span title="Physique">
                        <Zap size={12} className="inline text-yellow-400" /> {checkIn.physical}
                      </span>
                      <span title="Emotionnel">
                        <Heart size={12} className="inline text-pink-400" /> {checkIn.emotional}
                      </span>
                      <span title="Mental">
                        <Brain size={12} className="inline text-purple-400" /> {checkIn.mental}
                      </span>
                    </div>
                  </div>
                  {checkIn.note && <p className="text-xs text-slate-400 italic">{checkIn.note}</p>}
                </div>
                <button
                  onClick={() => onDelete(checkIn.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
        </div>
      )}

      {checkIns.length === 0 && !showForm && (
        <p className="text-sm text-slate-400 text-center py-4 bg-slate-700/50 rounded-lg">
          Aucun check-in pour aujourd'hui
        </p>
      )}
    </div>
  )
}

// Main Widget
export default function DailyJournalWidget() {
  const {
    getOrCreateJournal,
    updateJournal,
    addMoodCheckIn,
    deleteMoodCheckIn,
    getJournalStats,
    exportJournal,
    exportData,
    importData,
  } = useJournalStore()

  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0])
  const [journal, setJournal] = useState(() => getOrCreateJournal(currentDate))
  const [showPreview, setShowPreview] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [showCheckIns, setShowCheckIns] = useState(true)
  const [showJournal, setShowJournal] = useState(true)

  useEffect(() => {
    setJournal(getOrCreateJournal(currentDate))
  }, [currentDate, getOrCreateJournal])

  const stats = getJournalStats(currentDate)
  const isToday = currentDate === new Date().toISOString().split('T')[0]

  const handleGratitudeChange = (index: number, value: string) => {
    const newGratitudes = [...journal.gratitudes] as [string, string, string]
    newGratitudes[index] = value
    updateJournal(currentDate, { gratitudes: newGratitudes })
    setJournal({ ...journal, gratitudes: newGratitudes })
  }

  const handleSuccessChange = (index: number, value: string) => {
    const newSuccesses = [...journal.successes] as [string, string, string]
    newSuccesses[index] = value
    updateJournal(currentDate, { successes: newSuccesses })
    setJournal({ ...journal, successes: newSuccesses })
  }

  const handleEnergyMorningChange = (value: number) => {
    updateJournal(currentDate, { energyMorning: value })
    setJournal({ ...journal, energyMorning: value })
  }

  const handleEnergyEveningChange = (value: number) => {
    updateJournal(currentDate, { energyEvening: value })
    setJournal({ ...journal, energyEvening: value })
  }

  const handleLearningChange = (value: string) => {
    updateJournal(currentDate, { learning: value })
    setJournal({ ...journal, learning: value })
  }

  const handleAdjustmentsChange = (value: string) => {
    updateJournal(currentDate, { adjustments: value })
    setJournal({ ...journal, adjustments: value })
  }

  const handleAddCheckIn = (checkIn: Omit<typeof journal.moodCheckIns[0], 'id' | 'timestamp'>) => {
    addMoodCheckIn(currentDate, checkIn)
    setJournal(getOrCreateJournal(currentDate))
  }

  const handleDeleteCheckIn = (id: string) => {
    deleteMoodCheckIn(currentDate, id)
    setJournal(getOrCreateJournal(currentDate))
  }

  const handleExportMarkdown = () => {
    const markdown = exportJournal(currentDate)
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `journal-${currentDate}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJSON = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `journals-backup-${currentDate}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    if (importData(importText)) {
      setShowImport(false)
      setImportText('')
      setJournal(getOrCreateJournal(currentDate))
    } else {
      alert('Format invalide')
    }
  }

  const formatDisplayDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0])
  }

  const changeDate = (days: number) => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() + days)
    setCurrentDate(date.toISOString().split('T')[0])
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Daily Journal</h1>
            <div className="flex gap-1">
              <button
                onClick={() => setShowPreview(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                title="Apercu Markdown"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={handleExportMarkdown}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                title="Export Markdown"
              >
                <Download size={18} />
              </button>
              <button
                onClick={() => setShowImport(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                title="Importer"
              >
                <Upload size={18} />
              </button>
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between bg-slate-800 rounded-lg p-2">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
            >
              <ChevronDown size={18} className="rotate-90" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-ermite-primary" />
              <span className="font-medium capitalize">{formatDisplayDate(currentDate)}</span>
              {!isToday && (
                <button
                  onClick={goToToday}
                  className="px-2 py-0.5 bg-ermite-primary text-slate-900 text-xs rounded font-medium"
                >
                  Aujourd'hui
                </button>
              )}
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
              disabled={isToday}
            >
              <ChevronDown size={18} className="-rotate-90" />
            </button>
          </div>
        </div>

        {/* Energy Morning */}
        <div className="mb-6 p-4 bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Energie Matin</span>
            <span className="text-lg font-bold text-ermite-primary">{journal.energyMorning}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={journal.energyMorning}
            onChange={(e) => handleEnergyMorningChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-ermite-primary"
          />
        </div>

        {/* Mood Check-ins Section */}
        <div className="mb-6">
          <button
            onClick={() => setShowCheckIns(!showCheckIns)}
            className="w-full flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <span className="font-medium flex items-center gap-2">
              <Heart size={18} className="text-ermite-primary" />
              Check-ins Emotionnels
              {stats.checkInsCount > 0 && (
                <span className="text-xs text-slate-400">({stats.checkInsCount})</span>
              )}
            </span>
            {showCheckIns ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showCheckIns && (
            <div className="mt-2 p-4 bg-slate-800 rounded-lg">
              <MoodCheckInSection
                checkIns={journal.moodCheckIns}
                onAdd={handleAddCheckIn}
                onDelete={handleDeleteCheckIn}
              />
              {stats.checkInsCount > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-yellow-400">{stats.avgPhysical}</div>
                    <div className="text-xs text-slate-400">Physique</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-pink-400">{stats.avgEmotional}</div>
                    <div className="text-xs text-slate-400">Emotionnel</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-400">{stats.avgMental}</div>
                    <div className="text-xs text-slate-400">Mental</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Journal Section */}
        <div className="mb-6">
          <button
            onClick={() => setShowJournal(!showJournal)}
            className="w-full flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <span className="font-medium">Journal 3G/3R/1A</span>
            {showJournal ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showJournal && (
            <div className="mt-2 p-4 bg-slate-800 rounded-lg space-y-6">
              {/* Gratitudes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  3 Gratitudes (Ce qui t'a fait plaisir)
                </label>
                <div className="space-y-2">
                  {journal.gratitudes.map((g, i) => (
                    <input
                      key={i}
                      type="text"
                      value={g}
                      onChange={(e) => handleGratitudeChange(i, e.target.value)}
                      placeholder={`${i + 1}. Ex: Beau temps aujourd'hui`}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:border-ermite-primary focus:outline-none"
                      maxLength={150}
                    />
                  ))}
                </div>
              </div>

              {/* Successes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  3 Reussites (Ce dont tu es fier)
                </label>
                <div className="space-y-2">
                  {journal.successes.map((s, i) => (
                    <input
                      key={i}
                      type="text"
                      value={s}
                      onChange={(e) => handleSuccessChange(i, e.target.value)}
                      placeholder={`${i + 1}. Ex: J'ai fini mon code`}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:border-ermite-primary focus:outline-none"
                      maxLength={150}
                    />
                  ))}
                </div>
              </div>

              {/* Learning */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  1 Apprentissage (Ce que tu as appris)
                </label>
                <textarea
                  value={journal.learning}
                  onChange={(e) => handleLearningChange(e.target.value)}
                  placeholder="Ex: Les pauses m'aident a rester concentre"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:border-ermite-primary focus:outline-none resize-none"
                  rows={2}
                  maxLength={300}
                />
              </div>

              {/* Adjustments */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ajustements pour demain (Optionnel)
                </label>
                <textarea
                  value={journal.adjustments}
                  onChange={(e) => handleAdjustmentsChange(e.target.value)}
                  placeholder="Ex: Prevoir pause plus longue a midi"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:border-ermite-primary focus:outline-none resize-none"
                  rows={2}
                  maxLength={200}
                />
              </div>
            </div>
          )}
        </div>

        {/* Energy Evening */}
        <div className="mb-6 p-4 bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Energie Soir</span>
            <span className="text-lg font-bold text-ermite-primary">{journal.energyEvening}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={journal.energyEvening}
            onChange={(e) => handleEnergyEveningChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-ermite-primary"
          />
        </div>

        {/* Quick Stats */}
        <div className="p-4 bg-slate-800 rounded-lg">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Resume du jour</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Energie</span>
              <span className="text-white">
                {journal.energyMorning} → {journal.energyEvening}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gratitudes</span>
              <span className="text-white">{journal.gratitudes.filter((g) => g.trim()).length}/3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Reussites</span>
              <span className="text-white">{journal.successes.filter((s) => s.trim()).length}/3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Check-ins</span>
              <span className="text-white">{stats.checkInsCount}</span>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Apercu Markdown</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportMarkdown}
                    className="px-3 py-1.5 bg-ermite-primary text-slate-900 rounded-lg text-sm font-medium"
                  >
                    Telecharger
                  </button>
                  <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
              </div>
              <pre className="flex-1 overflow-auto text-xs text-slate-300 bg-slate-900 p-4 rounded-lg font-mono whitespace-pre-wrap">
                {exportJournal(currentDate)}
              </pre>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Importer</h2>
                <button onClick={() => setShowImport(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Collez le JSON exporte..."
                  rows={6}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleImport}
                    className="flex-1 py-2 bg-ermite-primary text-slate-900 rounded-lg font-medium"
                  >
                    Importer
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="flex-1 py-2 bg-slate-700 text-white rounded-lg"
                  >
                    Backup JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
