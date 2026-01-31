/**
 * Exercise Detail Page - Submit scores and view progression
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardHeader, CardBody, Badge, Button, Input } from '@/components/ui'
import exerciseService from '@/services/exerciseService'
import type {
  Exercise,
  ExerciseScore,
  ExerciseStats,
} from '@/types/exercise'
import {
  ExerciseType,
  CATEGORY_LABELS,
  CATEGORY_EMOJIS,
  CATEGORY_COLORS,
} from '@/types/exercise'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [scores, setScores] = useState<ExerciseScore[]>([])
  const [stats, setStats] = useState<ExerciseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [scoreValue, setScoreValue] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  // Get game route for custom exercises
  const getGameRoute = (exercise: Exercise): string | null => {
    if (exercise.exercise_type !== ExerciseType.CUSTOM) return null

    const name = exercise.name.toLowerCase()
    if (name.includes('reaction') || name.includes('réaction')) {
      return `/games/reaction-time/${exercise.id}`
    }
    if (name.includes('peripheral') || name.includes('périphérique')) {
      return '/games/peripheral-vision'
    }
    if (name.includes('multi-task') || name.includes('multi-tâche')) {
      return '/games/multi-task'
    }
    return null
  }

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    if (!id) return

    setIsLoading(true)
    try {
      const [exerciseData, scoresData, statsData] = await Promise.all([
        exerciseService.getExercise(parseInt(id)),
        exerciseService.getMyScores(parseInt(id)),
        exerciseService.getMyStats(),
      ])

      setExercise(exerciseData)
      setScores(scoresData)

      // Find stats for this exercise
      const exerciseStats = statsData.find((s) => s.exercise_id === parseInt(id))
      setStats(exerciseStats || null)
    } catch (error) {
      console.error('Failed to load exercise data:', error)
      setError('Erreur lors du chargement de l\'exercice')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exercise || !scoreValue) return

    setIsSubmitting(true)
    setError('')

    try {
      await exerciseService.submitScore({
        exercise_id: exercise.id,
        score_value: parseFloat(scoreValue),
        score_unit: exercise.score_unit,
        notes: notes || undefined,
      })

      // Reload data
      await loadData()

      // Reset form
      setScoreValue('')
      setNotes('')

      // Success message
      alert('Score enregistré avec succès ! 🎉')
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Erreur lors de l\'enregistrement du score')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Prepare chart data
  const chartData = scores
    .slice()
    .reverse()
    .map((score) => ({
      date: format(new Date(score.created_at), 'dd/MM'),
      score: score.score_value,
      fullDate: format(new Date(score.created_at), 'dd/MM/yyyy HH:mm'),
    }))

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

  if (!exercise) {
    return (
      <MainLayout>
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <span className="text-6xl mb-4">❌</span>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Exercice non trouvé
              </h3>
              <Link to="/exercises">
                <Button variant="primary">Retour aux exercices</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back button */}
        <Link to="/exercises">
          <Button variant="ghost" size="sm">
            ← Retour aux exercices
          </Button>
        </Link>

        {/* Exercise Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{CATEGORY_EMOJIS[exercise.category]}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {exercise.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={CATEGORY_COLORS[exercise.category]}>
                      {CATEGORY_LABELS[exercise.category]}
                    </Badge>
                    {exercise.score_unit && (
                      <Badge variant="primary">Unité: {exercise.score_unit}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {exercise.external_url && (
                <a
                  href={exercise.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary">
                    Lancer l'exercice →
                  </Button>
                </a>
              )}

              {exercise.exercise_type === ExerciseType.CUSTOM && getGameRoute(exercise) && (
                <Button
                  variant="primary"
                  onClick={() => navigate(getGameRoute(exercise)!)}
                >
                  🎮 Lancer le jeu
                </Button>
              )}
            </div>
          </CardHeader>

          <CardBody>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{exercise.description}</p>

            {exercise.instructions && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📝 Instructions :
                </h4>
                <pre className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap font-sans">
                  {exercise.instructions}
                </pre>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Meilleur score</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.best_score} {stats.score_unit}
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Score moyen</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.average_score.toFixed(1)} {stats.score_unit}
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Dernier score</p>
                <p className="text-2xl font-bold text-primary-600">
                  {stats.latest_score || 'N/A'} {stats.score_unit}
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Progression</p>
                <p className={`text-2xl font-bold ${stats.progression && stats.progression > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.progression !== null && stats.progression !== undefined
                    ? `${stats.progression > 0 ? '+' : ''}${stats.progression.toFixed(1)}%`
                    : 'N/A'}
                </p>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Submit Score Form - Only show for external exercises or custom exercises without auto-submit */}
        {exercise.exercise_type === ExerciseType.EXTERNAL && (
          <Card>
            <CardHeader title="Enregistrer un nouveau score" subtitle="Ajoute ta performance" />
            <CardBody>
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmitScore} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={`Score (${exercise.score_unit || 'valeur'})`}
                  type="number"
                  step="any"
                  value={scoreValue}
                  onChange={(e) => setScoreValue(e.target.value)}
                  placeholder={exercise.lower_is_better ? 'Ex: 245' : 'Ex: 85'}
                  required
                  helperText={exercise.lower_is_better ? 'Plus bas = meilleur' : 'Plus haut = meilleur'}
                />

                <Input
                  label="Notes (optionnel)"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Conditions, ressenti..."
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                Enregistrer le score
              </Button>
            </form>
          </CardBody>
        </Card>
        )}

        {/* Progression Chart */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader
              title="Graphique de progression"
              subtitle={`${chartData.length} tentatives enregistrées`}
            />
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {payload[0].payload.fullDate}
                            </p>
                            <p className="text-lg font-bold text-primary-600">
                              {payload[0].value} {exercise.score_unit}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#1c3049"
                    strokeWidth={2}
                    dot={{ fill: '#e08f34', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        )}

        {/* Score History */}
        <Card>
          <CardHeader
            title="Historique des scores"
            subtitle={`${scores.length} tentatives au total`}
          />
          <CardBody>
            {scores.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Aucun score enregistré pour cet exercice
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Enregistre ton premier score ci-dessus !
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {scores.map((score, index) => (
                  <div
                    key={score.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <span className="text-xs text-gray-500">#{scores.length - index}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {score.score_value} {score.score_unit}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(score.created_at), 'dd/MM/yyyy à HH:mm')}
                        </p>
                        {score.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            💬 {score.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {index === 0 && stats?.latest_score === score.score_value && (
                      <Badge variant="success" size="sm">
                        Dernier
                      </Badge>
                    )}

                    {stats?.best_score === score.score_value && (
                      <Badge variant="warning" size="sm">
                        🏆 Meilleur
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}
