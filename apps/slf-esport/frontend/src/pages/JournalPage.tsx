/**
 * Journal Page - Daily progress journal with mood tracking
 */

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardHeader, CardBody, Button, Badge, Input } from '@/components/ui'
import coachingService from '@/services/coachingService'
import type { JournalEntry, JournalMood, JournalStats } from '@/types/coaching'
import { MOOD_LABELS, MOOD_EMOJIS, MOOD_COLORS } from '@/types/coaching'

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [stats, setStats] = useState<JournalStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<JournalMood | ''>('')
  const [energyLevel, setEnergyLevel] = useState('')
  const [trainingQuality, setTrainingQuality] = useState('')
  const [sleepHours, setSleepHours] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [entriesData, statsData] = await Promise.all([
        coachingService.getMyJournalEntries({ page_size: 100 }),
        coachingService.getMyJournalStats(30),
      ])
      setEntries(entriesData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load journal data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setMood('')
    setEnergyLevel('')
    setTrainingQuality('')
    setSleepHours('')
    setTags([])
    setTagInput('')
    setIsPrivate(true)
    setError('')
    setSelectedEntry(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const data = {
        title: title || undefined,
        content,
        mood: mood || undefined,
        energy_level: energyLevel ? parseInt(energyLevel) : undefined,
        training_quality: trainingQuality ? parseInt(trainingQuality) : undefined,
        sleep_hours: sleepHours ? parseFloat(sleepHours) : undefined,
        tags: tags.length > 0 ? tags : undefined,
        is_private: isPrivate,
      }

      if (selectedEntry) {
        await coachingService.updateJournalEntry(selectedEntry.id, data)
      } else {
        await coachingService.createJournalEntry(data)
      }

      resetForm()
      setShowCreateForm(false)
      await loadData()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la sauvegarde')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setTitle(entry.title || '')
    setContent(entry.content)
    setMood(entry.mood || '')
    setEnergyLevel(entry.energy_level?.toString() || '')
    setTrainingQuality(entry.training_quality?.toString() || '')
    setSleepHours(entry.sleep_hours?.toString() || '')
    setTags(entry.tags || [])
    setIsPrivate(entry.is_private)
    setShowCreateForm(true)
  }

  const handleDelete = async (entryId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) return

    try {
      await coachingService.deleteJournalEntry(entryId)
      await loadData()
    } catch (error) {
      console.error('Failed to delete entry:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">📔 Journal de Progression</h1>
              <p className="text-primary-100">
                Suit ton évolution quotidienne et tes ressentis
              </p>
            </div>
            <Button
              variant="accent"
              size="lg"
              onClick={() => {
                resetForm()
                setShowCreateForm(true)
              }}
            >
              + Nouvelle entrée
            </Button>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Entrées (30j)</p>
                <p className="text-2xl font-bold text-primary-600">{stats.total_entries}</p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Énergie moy.</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.avg_energy_level ? `${stats.avg_energy_level}/10` : 'N/A'}
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Qualité entraînement</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.avg_training_quality ? `${stats.avg_training_quality}/10` : 'N/A'}
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sommeil moy.</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.avg_sleep_hours ? `${stats.avg_sleep_hours}h` : 'N/A'}
                </p>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card>
            <CardHeader
              title={selectedEntry ? '✏️ Modifier l\'entrée' : '+ Nouvelle entrée'}
              subtitle="Partage tes ressentis et ton évolution"
            />
            <CardBody>
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Titre (optionnel)"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Session intense aujourd'hui"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comment te sens-tu ? 💭
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {Object.entries(MOOD_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setMood(key as JournalMood)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          mood === key
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-300 dark:border-gray-700 hover:border-primary-400'
                        }`}
                      >
                        <span className="text-2xl block mb-1">
                          {MOOD_EMOJIS[key as JournalMood]}
                        </span>
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Niveau d'énergie (1-10)"
                    type="number"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(e.target.value)}
                    placeholder="7"
                  />

                  <Input
                    label="Qualité entraînement (1-10)"
                    type="number"
                    min="1"
                    max="10"
                    value={trainingQuality}
                    onChange={(e) => setTrainingQuality(e.target.value)}
                    placeholder="8"
                  />

                  <Input
                    label="Heures de sommeil"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    placeholder="7.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contenu de l'entrée *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Décris ta journée, tes ressentis, ce que tu as appris..."
                    rows={6}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                      placeholder="Ajouter un tag"
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      Ajouter
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="primary">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-primary-800 dark:text-primary-200 hover:text-primary-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_private"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_private" className="text-sm text-gray-700 dark:text-gray-300">
                    Entrée privée (visible uniquement par moi)
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setShowCreateForm(false)
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isSubmitting}>
                    {selectedEntry ? 'Enregistrer' : 'Créer l\'entrée'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Entries List */}
        <Card>
          <CardHeader
            title="Historique des entrées"
            subtitle={`${entries.length} entrées au total`}
          />
          <CardBody>
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-6xl mb-4">📔</p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Aucune entrée pour le moment
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Commence à noter tes ressentis et ton évolution !
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    resetForm()
                    setShowCreateForm(true)
                  }}
                >
                  Créer ma première entrée
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {entry.mood && (
                            <Badge className={MOOD_COLORS[entry.mood]}>
                              {MOOD_EMOJIS[entry.mood]} {MOOD_LABELS[entry.mood]}
                            </Badge>
                          )}
                          {entry.is_private && (
                            <Badge variant="secondary" size="sm">
                              🔒 Privé
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(entry.entry_date), 'EEEE d MMMM yyyy', {
                              locale: fr,
                            })}
                          </span>
                        </div>

                        {entry.title && (
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {entry.title}
                          </h3>
                        )}

                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">
                          {entry.content}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          {entry.energy_level && (
                            <span>⚡ Énergie: {entry.energy_level}/10</span>
                          )}
                          {entry.training_quality && (
                            <span>🎯 Entraînement: {entry.training_quality}/10</span>
                          )}
                          {entry.sleep_hours && <span>😴 Sommeil: {entry.sleep_hours}h</span>}
                        </div>

                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {entry.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" size="sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)}>
                          ✏️
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader title="💡 Conseils pour ton journal" />
          <CardBody>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">1.</span>
                <p>Écris régulièrement, même 5 minutes par jour suffisent</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">2.</span>
                <p>Note tes ressentis pendant et après l'entraînement</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">3.</span>
                <p>Sois honnête avec toi-même, c'est un espace personnel</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">4.</span>
                <p>Relis tes anciennes entrées pour voir ton évolution !</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}
