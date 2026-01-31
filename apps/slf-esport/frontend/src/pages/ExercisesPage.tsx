/**
 * Exercises Page - Brain Training Cognitive Exercises
 *
 * Displays all 11 brain training exercises organized by category
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { cognitiveExercises, categoryMetadata } from '@/config/exerciseRegistry'
import type { ExerciseCategory } from '@/types/cognitiveExercise'

export default function ExercisesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter exercises
  const filteredExercises = cognitiveExercises.filter((exercise) => {
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory
    const matchesSearch =
      searchQuery === '' ||
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  // Group exercises by category
  const exercisesByCategory = filteredExercises.reduce(
    (acc, exercise) => {
      if (!acc[exercise.category]) {
        acc[exercise.category] = []
      }
      acc[exercise.category].push(exercise)
      return acc
    },
    {} as Record<ExerciseCategory, typeof filteredExercises>
  )

  return (
    <MainLayout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🧠 Exercices Cognitifs
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Entraîne ta mémoire, tes réflexes et tes compétences de jeu avec nos exercices scientifiquement conçus
              pour les joueurs e-sport.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher un exercice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Category Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Tous
                </button>
                {Object.entries(categoryMetadata).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as ExerciseCategory)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === key
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {meta.icon} {meta.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                {cognitiveExercises.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Exercices</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-secondary-600 dark:text-secondary-400 mb-1">5</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Catégories</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-success-600 dark:text-success-400 mb-1">-</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Complétés</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-accent-600 dark:text-accent-500 mb-1">-</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Meilleur score</div>
            </div>
          </div>
        </div>

        {/* Exercises Grid by Category */}
        <div className="max-w-7xl mx-auto space-y-12">
          {selectedCategory === 'all' ? (
            // Show all categories
            Object.entries(categoryMetadata).map(([categoryKey, categoryInfo]) => {
              const categoryExercises = exercisesByCategory[categoryKey as ExerciseCategory]
              if (!categoryExercises || categoryExercises.length === 0) return null

              return (
                <div key={categoryKey}>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                      <span className="text-3xl">{categoryInfo.icon}</span>
                      {categoryInfo.label}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">{categoryInfo.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryExercises.map((exercise) => (
                      <ExerciseCard key={exercise.id} exercise={exercise} />
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            // Show selected category
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExercises.map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
            </div>
          )}

          {filteredExercises.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Aucun exercice trouvé. Essayez une autre recherche ou catégorie.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

/**
 * Exercise Card Component
 */
interface ExerciseCardProps {
  exercise: (typeof cognitiveExercises)[number]
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const categoryMeta = categoryMetadata[exercise.category]

  return (
    <Link
      to={`/exercises/${exercise.id}`}
      className="group block bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-700 dark:to-primary-900 flex items-center justify-center">
        <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
          {exercise.icon || '🎮'}
        </span>

        {/* Category badge */}
        <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg text-sm font-medium">
          {categoryMeta.icon} {categoryMeta.label}
        </div>

        {/* Difficulty indicators */}
        <div className="absolute bottom-3 left-3 flex gap-1">
          {exercise.difficulty.map((diff) => (
            <span
              key={diff}
              className="px-2 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded text-xs font-medium"
            >
              {diff === 'EASY' ? '🟢' : diff === 'MEDIUM' ? '🟡' : '🔴'}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {exercise.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{exercise.description}</p>

        {/* Tags */}
        {exercise.tags && exercise.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {exercise.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            ⏱️ ~{exercise.estimatedDuration || 3} min
          </div>

          <div className="text-primary-600 dark:text-primary-400 font-medium group-hover:translate-x-1 transition-transform duration-300">
            Jouer →
          </div>
        </div>
      </div>
    </Link>
  )
}
