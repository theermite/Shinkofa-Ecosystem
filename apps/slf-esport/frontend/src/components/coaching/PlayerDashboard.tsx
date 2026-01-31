/**
 * Player Dashboard - Player view of coaching interface
 * Shows assigned exercises, goals, and progress
 */

import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import coachingService from '@/services/coachingService'
import exerciseService from '@/services/exerciseService'
import assignmentService from '@/services/assignmentService'
import { Exercise } from '@/types/exercise'
import { Goal, GoalStats } from '@/types/coaching'
import { ExerciseAssignment, AssignmentStats, AssignmentStatus, ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_COLORS } from '@/types/assignment'
import { GOAL_CATEGORIES } from '@/types/coaching'

const PlayerDashboard: FC = () => {
  const navigate = useNavigate()

  // Fetch assignments
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<ExerciseAssignment[]>(
    'myAssignments',
    () => assignmentService.getMyAssignments({ include_completed: false })
  )

  // Fetch assignment stats
  const { data: assignmentStats } = useQuery<AssignmentStats>(
    'myAssignmentStats',
    () => assignmentService.getMyStats()
  )

  // Fetch goals
  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>(
    'myGoals',
    () => coachingService.getMyGoals({ is_completed: false })
  )

  // Fetch goal stats
  const { data: goalStats } = useQuery<GoalStats>(
    'myGoalStats',
    () => coachingService.getMyGoalStats()
  )

  // Fetch all exercises (will show as "suggested" exercises)
  const { data: exercises = [], isLoading: exercisesLoading } = useQuery<Exercise[]>(
    'exercises',
    () => exerciseService.getExercises()
  )

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Exercices Assignés</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {assignmentStats?.total_assignments || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Taux de Complétion</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {assignmentStats?.completion_rate ? Math.round(assignmentStats.completion_rate) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Objectifs Actifs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {goalStats?.in_progress_goals || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">En Retard</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                {assignmentStats?.overdue || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Exercises */}
      {assignments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Exercices Assignés par le Coach
            </h2>
          </div>

          {assignmentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.slice(0, 5).map((assignment) => (
                <div
                  key={assignment.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary dark:hover:border-primary transition-colors cursor-pointer bg-white dark:bg-gray-800"
                  onClick={() => navigate(`/exercises/${assignment.exercise_id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {assignment.title || assignment.exercise_name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${ASSIGNMENT_STATUS_COLORS[assignment.status]}`}>
                          {ASSIGNMENT_STATUS_LABELS[assignment.status]}
                        </span>
                        {assignment.is_mandatory && (
                          <span className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                            Obligatoire
                          </span>
                        )}
                      </div>
                      {assignment.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {assignment.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        {assignment.due_date && (
                          <span>📅 Échéance: {new Date(assignment.due_date).toLocaleDateString()}</span>
                        )}
                        {assignment.target_score && (
                          <span>🎯 Objectif: {assignment.target_score}</span>
                        )}
                        <span>🔄 Tentatives: {assignment.attempts_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Mes Objectifs Actifs
          </h2>
          <button
            onClick={() => navigate('/goals')}
            className="text-primary hover:text-primary-dark dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
          >
            Voir tout →
          </button>
        </div>

        {goalsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aucun objectif actif pour le moment
            </p>
            <button
              onClick={() => navigate('/goals')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Créer un objectif
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => {
              const category = GOAL_CATEGORIES.find((cat) => cat.value === goal.category)
              return (
                <div
                  key={goal.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary dark:hover:border-primary transition-colors cursor-pointer bg-white dark:bg-gray-800"
                  onClick={() => navigate('/goals')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {category && <span className="text-xl">{category.emoji}</span>}
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {goal.title}
                        </h3>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {goal.description}
                        </p>
                      )}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${goal.progress_percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {goal.progress_percentage}% complété
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/journal')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 hover:shadow-lg transition-shadow text-left border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary"
        >
          <div className="text-3xl mb-3">📔</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Journal Quotidien</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enregistrer votre progression et votre ressenti
          </p>
        </button>

        <button
          onClick={() => navigate('/goals')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 hover:shadow-lg transition-shadow text-left border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary"
        >
          <div className="text-3xl mb-3">🎯</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Mes Objectifs</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Suivre et gérer vos objectifs personnels
          </p>
        </button>

        <button
          onClick={() => navigate('/exercises')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 hover:shadow-lg transition-shadow text-left border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary"
        >
          <div className="text-3xl mb-3">🎮</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Tous les Exercices</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Explorer la bibliothèque complète
          </p>
        </button>
      </div>
    </div>
  )
}

export default PlayerDashboard
