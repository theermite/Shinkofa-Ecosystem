/**
 * Goals Page - Goal setting and tracking
 */

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardHeader, CardBody, Button, Badge, Input } from '@/components/ui'
import coachingService from '@/services/coachingService'
import type { Goal, GoalStats, Milestone } from '@/types/coaching'
import { GOAL_CATEGORIES } from '@/types/coaching'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [stats, setStats] = useState<GoalStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [progress, setProgress] = useState(0)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [milestoneInput, setMilestoneInput] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [filterCompleted])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [goalsData, statsData] = await Promise.all([
        coachingService.getMyGoals({ is_completed: filterCompleted ?? undefined }),
        coachingService.getMyGoalStats(),
      ])
      setGoals(goalsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load goals data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('')
    setTargetDate('')
    setProgress(0)
    setMilestones([])
    setMilestoneInput('')
    setIsPublic(false)
    setError('')
    setSelectedGoal(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const data = {
        title,
        description: description || undefined,
        category: category || undefined,
        target_date: targetDate || undefined,
        progress_percentage: progress,
        is_completed: progress >= 100,
        milestones: milestones.length > 0 ? milestones : undefined,
        is_public: isPublic,
      }

      if (selectedGoal) {
        await coachingService.updateGoal(selectedGoal.id, data)
      } else {
        await coachingService.createGoal(data)
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

  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal)
    setTitle(goal.title)
    setDescription(goal.description || '')
    setCategory(goal.category || '')
    setTargetDate(goal.target_date ? goal.target_date.split('T')[0] : '')
    setProgress(goal.progress_percentage)
    setMilestones(goal.milestones || [])
    setIsPublic(goal.is_public)
    setShowCreateForm(true)
  }

  const handleDelete = async (goalId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) return

    try {
      await coachingService.deleteGoal(goalId)
      await loadData()
    } catch (error) {
      console.error('Failed to delete goal:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleAddMilestone = () => {
    if (milestoneInput.trim()) {
      setMilestones([
        ...milestones,
        {
          title: milestoneInput.trim(),
          completed: false,
        },
      ])
      setMilestoneInput('')
    }
  }

  const handleToggleMilestone = (index: number) => {
    const updated = [...milestones]
    updated[index].completed = !updated[index].completed
    setMilestones(updated)
  }

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const getCategoryEmoji = (cat: string) => {
    return GOAL_CATEGORIES.find((c) => c.value === cat)?.emoji || '📌'
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
              <h1 className="text-3xl font-bold mb-2">🎯 Mes Objectifs</h1>
              <p className="text-primary-100">Définis et suis tes objectifs de progression</p>
            </div>
            <Button
              variant="accent"
              size="lg"
              onClick={() => {
                resetForm()
                setShowCreateForm(true)
              }}
            >
              + Nouvel objectif
            </Button>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total objectifs</p>
                <p className="text-2xl font-bold text-primary-600">{stats.total_goals}</p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Complétés</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed_goals}</p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">En cours</p>
                <p className="text-2xl font-bold text-blue-600">{stats.in_progress_goals}</p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Taux de réussite</p>
                <p className="text-2xl font-bold text-orange-600">{stats.completion_rate}%</p>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterCompleted === null ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterCompleted(null)}
              >
                Tous
              </Button>
              <Button
                variant={filterCompleted === false ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterCompleted(false)}
              >
                En cours
              </Button>
              <Button
                variant={filterCompleted === true ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterCompleted(true)}
              >
                Complétés
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card>
            <CardHeader
              title={selectedGoal ? '✏️ Modifier l\'objectif' : '+ Nouvel objectif'}
              subtitle="Définis un objectif clair et mesurable"
            />
            <CardBody>
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Titre de l'objectif *"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Atteindre Diamant en ranked"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catégorie
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {GOAL_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          category === cat.value
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-300 dark:border-gray-700 hover:border-primary-400'
                        }`}
                      >
                        <span className="text-2xl mb-1 block">{cat.emoji}</span>
                        <span className="text-sm font-medium">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Date cible (optionnel)"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Progression ({progress}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => setProgress(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décris ton objectif en détail..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Étapes intermédiaires
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      type="text"
                      value={milestoneInput}
                      onChange={(e) => setMilestoneInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddMilestone()
                        }
                      }}
                      placeholder="Ajouter une étape"
                    />
                    <Button type="button" variant="outline" onClick={handleAddMilestone}>
                      Ajouter
                    </Button>
                  </div>
                  {milestones.length > 0 && (
                    <div className="space-y-2">
                      {milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={milestone.completed}
                            onChange={() => handleToggleMilestone(index)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span
                            className={`flex-1 ${
                              milestone.completed
                                ? 'line-through text-gray-500'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {milestone.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMilestone(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_public" className="text-sm text-gray-700 dark:text-gray-300">
                    Objectif visible par l'équipe (partage ton objectif)
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
                    {selectedGoal ? 'Enregistrer' : 'Créer l\'objectif'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Goals List */}
        <Card>
          <CardHeader title="Liste des objectifs" subtitle={`${goals.length} objectifs`} />
          <CardBody>
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-6xl mb-4">🎯</p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun objectif pour le moment
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Définis tes premiers objectifs pour guider ta progression !
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    resetForm()
                    setShowCreateForm(true)
                  }}
                >
                  Créer mon premier objectif
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {goal.category && (
                          <span className="text-2xl">{getCategoryEmoji(goal.category)}</span>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {goal.title}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                          ✏️
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)}>
                          🗑️
                        </Button>
                      </div>
                    </div>

                    {goal.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {goal.description}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progression</span>
                        <span className="font-semibold text-primary-600">
                          {goal.progress_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${goal.progress_percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Milestones */}
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Étapes:</p>
                        <div className="space-y-1">
                          {goal.milestones.map((milestone, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <span>{milestone.completed ? '✅' : '⏳'}</span>
                              <span
                                className={
                                  milestone.completed
                                    ? 'line-through text-gray-500'
                                    : 'text-gray-700 dark:text-gray-300'
                                }
                              >
                                {milestone.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2">
                      {goal.is_completed && <Badge variant="success">✅ Complété</Badge>}
                      {goal.target_date && (
                        <Badge variant="secondary" size="sm">
                          📅 {format(new Date(goal.target_date), 'dd/MM/yyyy')}
                        </Badge>
                      )}
                      {goal.is_public && (
                        <Badge variant="info" size="sm">
                          👁️ Public
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader title="💡 Conseils pour tes objectifs" />
          <CardBody>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">1.</span>
                <p>Définis des objectifs SMART (Spécifiques, Mesurables, Atteignables, Réalistes, Temporels)</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">2.</span>
                <p>Découpe les grands objectifs en étapes intermédiaires</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">3.</span>
                <p>Mets à jour régulièrement ta progression</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary-600 font-bold">4.</span>
                <p>Célèbre chaque étape franchie, même les petites victoires !</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}
