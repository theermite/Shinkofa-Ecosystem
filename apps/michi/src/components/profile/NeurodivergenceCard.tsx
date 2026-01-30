/**
 * NeurodivergenceCard Component
 * Displays detailed neurodivergence analysis (ADD/ADHD, Autism, HPI, Multipotentiality, Hypersensitivity)
 * Shinkofa Platform
 */

import React from 'react'
import { ProfileSection, DetailCard } from './ProfileSection'

interface NeurodivergenceProfile {
  // Support both old (score) and new (score_global) API formats
  score?: number
  score_global?: number
  profile: string
  manifestations: string[]
  strategies: string[]
}

interface MultipotentialityProfile {
  // Support both old (score) and new (score_global) API formats
  score?: number
  score_global?: number
  manifestations: string[]
  profile?: string
  strategies?: string[]
}

// Helper to get score from either format - with null safety
const getScore = (data?: { score?: number; score_global?: number } | null): number => {
  if (!data) return 0
  return data.score_global ?? data.score ?? 0
}

// Default empty neurodivergence profile
const emptyProfile: NeurodivergenceProfile = {
  score: 0,
  score_global: 0,
  profile: 'Non analysé',
  manifestations: [],
  strategies: [],
}

// Safe getter for neurodivergence profiles
const getSafeProfile = (profile?: NeurodivergenceProfile | null): NeurodivergenceProfile => {
  return profile || emptyProfile
}

interface NeurodivergenceAnalysis {
  adhd: NeurodivergenceProfile
  autism: NeurodivergenceProfile
  hpi: NeurodivergenceProfile
  multipotentiality: MultipotentialityProfile
  hypersensitivity: NeurodivergenceProfile & {
    types: string[]
  }
}

interface NeurodivergenceCardProps {
  data: NeurodivergenceAnalysis
}

export const NeurodivergenceCard: React.FC<NeurodivergenceCardProps> = ({ data }) => {
  // Safe access to all profiles with fallbacks
  const adhd = getSafeProfile(data?.adhd)
  const autism = getSafeProfile(data?.autism)
  const hpi = getSafeProfile(data?.hpi)
  const multipotentiality = data?.multipotentiality || { score: 0, score_global: 0, manifestations: [], profile: 'Non analysé', strategies: [] }
  const hypersensitivity = data?.hypersensitivity || { ...emptyProfile, types: [] }

  return (
    <ProfileSection
      title="Profil Neurodivergent"
      icon="🌈"
      gradient="from-green-500 to-teal-600"
    >
      {/* ADD/ADHD */}
      <NeurodivergenceItem
        title="TDA(H) - Trouble du Déficit de l'Attention avec ou sans Hyperactivité"
        icon="⚡"
        score={getScore(adhd)}
        profile={adhd.profile}
        manifestations={adhd.manifestations || []}
        strategies={adhd.strategies || []}
        color="purple"
      />

      {/* Autism */}
      <NeurodivergenceItem
        title="Traits Autistiques"
        icon="🧩"
        score={getScore(autism)}
        profile={autism.profile}
        manifestations={autism.manifestations || []}
        strategies={autism.strategies || []}
        color="blue"
      />

      {/* HPI */}
      <NeurodivergenceItem
        title="Haut Potentiel Intellectuel (HPI)"
        icon="🧠"
        score={getScore(hpi)}
        profile={hpi.profile}
        manifestations={hpi.manifestations || []}
        strategies={hpi.strategies || []}
        color="indigo"
      />

      {/* Multipotentiality */}
      <NeurodivergenceItem
        title="Multipotentialité"
        icon="🎨"
        score={getScore(multipotentiality)}
        profile={multipotentiality.profile || 'Multipotentiel'}
        manifestations={multipotentiality.manifestations || []}
        strategies={multipotentiality.strategies || []}
        color="pink"
      />

      {/* Hypersensitivity */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-rose-200 dark:border-rose-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">💎</span>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Hypersensibilité
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Profil : {hypersensitivity.profile}
              </p>
            </div>
          </div>
          <ScoreBadge score={getScore(hypersensitivity)} />
        </div>

        {/* Types d'hypersensibilité */}
        <div className="mb-6 p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">
            Types d'hypersensibilité identifiés :
          </h4>
          <div className="flex flex-wrap gap-2">
            {(hypersensitivity.types || []).map((type, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium shadow-md"
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailCard
            title="🔍 Manifestations"
            items={hypersensitivity.manifestations || []}
            icon="•"
            color="purple"
          />
          <DetailCard
            title="💡 Stratégies d'Adaptation"
            items={hypersensitivity.strategies || []}
            icon="✓"
            color="green"
          />
        </div>
      </div>

      {/* Summary Info */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span className="text-2xl">ℹ️</span> Comprendre la Neurodivergence
        </h4>
        <p className="leading-relaxed text-blue-50">
          La neurodivergence n'est pas une déficience, mais une différence dans le fonctionnement neurologique.
          Chaque profil apporte des forces uniques et des défis spécifiques. Les stratégies proposées visent
          à optimiser vos forces naturelles et à faciliter votre quotidien dans un monde neurotypique.
        </p>
      </div>
    </ProfileSection>
  )
}

interface NeurodivergenceItemProps {
  title: string
  icon: string
  score: number
  profile: string
  manifestations: string[]
  strategies: string[]
  color: 'purple' | 'blue' | 'indigo' | 'pink'
}

const NeurodivergenceItem: React.FC<NeurodivergenceItemProps> = ({
  title,
  icon,
  score,
  profile,
  manifestations,
  strategies,
  color,
}) => {
  const colorClasses = {
    purple: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800',
    blue: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800',
    indigo: 'from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-200 dark:border-indigo-800',
    pink: 'from-pink-50 to-fuchsia-50 dark:from-pink-900/20 dark:to-fuchsia-900/20 border-pink-200 dark:border-pink-800',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 border-2`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{icon}</span>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Profil : {profile}
            </p>
          </div>
        </div>
        <ScoreBadge score={score} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailCard
          title="🔍 Manifestations"
          items={manifestations}
          icon="•"
          color="purple"
        />
        <DetailCard
          title="💡 Stratégies d'Adaptation"
          items={strategies}
          icon="✓"
          color="green"
        />
      </div>
    </div>
  )
}

interface ScoreBadgeProps {
  score: number
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  const getScoreColor = (val: number) => {
    if (val >= 70) return 'bg-red-500 text-white'
    if (val >= 50) return 'bg-orange-500 text-white'
    if (val >= 30) return 'bg-yellow-500 text-gray-900'
    return 'bg-green-500 text-white'
  }

  const getScoreLabel = (val: number) => {
    if (val >= 70) return 'Fort'
    if (val >= 50) return 'Modéré'
    if (val >= 30) return 'Léger'
    return 'Faible'
  }

  return (
    <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-full ${getScoreColor(score)} shadow-lg`}>
      <span className="text-3xl font-bold">{score}</span>
      <span className="text-xs font-semibold">{getScoreLabel(score)}</span>
    </div>
  )
}
