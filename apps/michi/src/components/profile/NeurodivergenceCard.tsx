/**
 * NeurodivergenceCard Component
 * Displays detailed neurodivergence analysis (ADD/ADHD, Autism, HPI, Multipotentiality, Hypersensitivity)
 * Shinkofa Platform
 */

import React from 'react'
import { ProfileSection, DetailCard } from './ProfileSection'

// Support BOTH old and new API formats from backend
interface NeurodivergenceProfileRaw {
  // Score formats
  score?: number
  score_global?: number
  // Profile label formats
  profile?: string
  profil?: string
  profil_label?: string
  // Manifestations formats
  manifestations?: string[]
  manifestations_principales?: string[]
  // Strategies formats
  strategies?: string[]
  strategies_adaptation?: string[]
  // Additional fields
  dimensions?: Record<string, number>
  types?: string[]
  types_detectes?: string[]
}

// Normalized profile for internal use
interface NeurodivergenceProfile {
  score: number
  profile: string
  manifestations: string[]
  strategies: string[]
  dimensions?: Record<string, number>
  types?: string[]
}

// Helper to get score from either format - with null safety
// Returns -1 for "pending analysis" state, 0 for "not analyzed"
const getScore = (data?: NeurodivergenceProfileRaw | null): number => {
  if (!data) return 0
  const score = data.score_global ?? data.score ?? 0
  return score
}

// Check if analysis is pending (score = -1 or has _pending flag)
const isAnalysisPending = (data?: NeurodivergenceProfileRaw | null): boolean => {
  if (!data) return false
  const score = data.score_global ?? data.score
  return score === -1 || (data as any)?._pending === true
}

// Helper to get profile label from any format
const getProfileLabel = (data?: NeurodivergenceProfileRaw | null): string => {
  if (!data) return 'Non analysé'
  return data.profil_label || data.profil || data.profile || 'Non analysé'
}

// Helper to get manifestations from any format
const getManifestations = (data?: NeurodivergenceProfileRaw | null): string[] => {
  if (!data) return []
  return data.manifestations_principales || data.manifestations || []
}

// Helper to get strategies from any format
const getStrategies = (data?: NeurodivergenceProfileRaw | null): string[] => {
  if (!data) return []
  return data.strategies_adaptation || data.strategies || []
}

// Helper to get types (for hypersensitivity, dys, etc.)
const getTypes = (data?: NeurodivergenceProfileRaw | null): string[] => {
  if (!data) return []
  return data.types || data.types_detectes || []
}

// Default empty neurodivergence profile
const emptyProfile: NeurodivergenceProfile = {
  score: 0,
  profile: 'Non analysé',
  manifestations: [],
  strategies: [],
}

// Safe getter that normalizes all formats to internal format
const getSafeProfile = (raw?: NeurodivergenceProfileRaw | null): NeurodivergenceProfile => {
  if (!raw) return emptyProfile
  return {
    score: getScore(raw),
    profile: getProfileLabel(raw),
    manifestations: getManifestations(raw),
    strategies: getStrategies(raw),
    dimensions: raw.dimensions,
    types: getTypes(raw),
  }
}

// Raw analysis from API (supports both old and new formats)
interface NeurodivergenceAnalysisRaw {
  adhd?: NeurodivergenceProfileRaw
  autism?: NeurodivergenceProfileRaw
  hpi?: NeurodivergenceProfileRaw
  multipotentiality?: NeurodivergenceProfileRaw
  hypersensitivity?: NeurodivergenceProfileRaw
  // Additional types from new 12-type format
  toc?: NeurodivergenceProfileRaw
  dys?: NeurodivergenceProfileRaw
  anxiety?: NeurodivergenceProfileRaw
  bipolar?: NeurodivergenceProfileRaw
  ptsd?: NeurodivergenceProfileRaw
  eating_disorder?: NeurodivergenceProfileRaw
  sleep_disorder?: NeurodivergenceProfileRaw
}

interface NeurodivergenceCardProps {
  data: NeurodivergenceAnalysisRaw
}

export const NeurodivergenceCard: React.FC<NeurodivergenceCardProps> = ({ data }) => {
  // Normalize all profiles from raw API data
  const adhd = getSafeProfile(data?.adhd)
  const autism = getSafeProfile(data?.autism)
  const hpi = getSafeProfile(data?.hpi)
  const multipotentiality = getSafeProfile(data?.multipotentiality)
  const hypersensitivity = getSafeProfile(data?.hypersensitivity)

  // Additional neurodivergences from 12-type format
  const toc = getSafeProfile(data?.toc)
  const dys = getSafeProfile(data?.dys)
  const anxiety = getSafeProfile(data?.anxiety)
  const bipolar = getSafeProfile(data?.bipolar)
  const ptsd = getSafeProfile(data?.ptsd)
  const eatingDisorder = getSafeProfile(data?.eating_disorder)
  const sleepDisorder = getSafeProfile(data?.sleep_disorder)

  // Check if analysis is pending for each type
  const adhdPending = isAnalysisPending(data?.adhd)
  const autismPending = isAnalysisPending(data?.autism)
  const hpiPending = isAnalysisPending(data?.hpi)
  const multipotentialityPending = isAnalysisPending(data?.multipotentiality)
  const hypersensitivityPending = isAnalysisPending(data?.hypersensitivity)

  // Check if overall analysis is pending (from _analysis_status flag)
  const overallPending = (data as any)?._analysis_status === 'pending'

  return (
    <ProfileSection
      title="Profil Neurodivergent"
      icon="🌈"
      gradient="from-green-500 to-teal-600"
    >
      {/* Show warning banner if analysis is pending */}
      {overallPending && (
        <div className="bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-400 dark:border-amber-600 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h4 className="font-bold text-amber-800 dark:text-amber-200">Analyse en attente</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                L'analyse de neurodivergence n'a pas pu être complétée.
                Cliquez sur "Enrichir avec Shizen" pour relancer l'analyse.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ADD/ADHD */}
      <NeurodivergenceItem
        title="TDA(H) - Trouble du Déficit de l'Attention avec ou sans Hyperactivité"
        icon="⚡"
        score={adhd.score}
        profile={adhd.profile}
        manifestations={adhd.manifestations}
        strategies={adhd.strategies}
        color="purple"
        isPending={adhdPending || overallPending}
      />

      {/* Autism */}
      <NeurodivergenceItem
        title="Traits Autistiques"
        icon="🧩"
        score={autism.score}
        profile={autism.profile}
        manifestations={autism.manifestations}
        strategies={autism.strategies}
        color="blue"
        isPending={autismPending || overallPending}
      />

      {/* HPI */}
      <NeurodivergenceItem
        title="Haut Potentiel Intellectuel (HPI)"
        icon="🧠"
        score={hpi.score}
        profile={hpi.profile}
        manifestations={hpi.manifestations}
        strategies={hpi.strategies}
        color="indigo"
        isPending={hpiPending || overallPending}
      />

      {/* Multipotentiality */}
      <NeurodivergenceItem
        title="Multipotentialité"
        icon="🎨"
        score={multipotentiality.score}
        profile={multipotentiality.profile}
        manifestations={multipotentiality.manifestations}
        strategies={multipotentiality.strategies}
        color="pink"
        isPending={multipotentialityPending || overallPending}
      />

      {/* Hypersensitivity */}
      <div className={`bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-rose-200 dark:border-rose-800 ${hypersensitivityPending || overallPending ? 'opacity-75' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">💎</span>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Hypersensibilité
              </h3>
              <p className={`text-sm mt-1 ${hypersensitivityPending || overallPending ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                Profil : {hypersensitivityPending || overallPending ? 'Analyse en attente' : hypersensitivity.profile}
              </p>
            </div>
          </div>
          <ScoreBadge score={hypersensitivity.score} isPending={hypersensitivityPending || overallPending} />
        </div>

        {/* Types d'hypersensibilité */}
        {hypersensitivity.types && hypersensitivity.types.length > 0 && !(hypersensitivityPending || overallPending) && (
          <div className="mb-6 p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">
              Types d'hypersensibilité identifiés :
            </h4>
            <div className="flex flex-wrap gap-2">
              {hypersensitivity.types.map((type, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium shadow-md"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailCard
            title={hypersensitivityPending || overallPending ? "⏳ En attente" : "🔍 Manifestations"}
            items={hypersensitivityPending || overallPending
              ? ["L'analyse n'a pas pu être complétée", "Cliquez sur 'Enrichir avec Shizen' pour relancer"]
              : hypersensitivity.manifestations}
            icon="•"
            color="purple"
          />
          <DetailCard
            title={hypersensitivityPending || overallPending ? "💡 Action requise" : "💡 Stratégies d'Adaptation"}
            items={hypersensitivityPending || overallPending
              ? ["Régénérez votre profil pour obtenir des stratégies personnalisées"]
              : hypersensitivity.strategies}
            icon="✓"
            color="green"
          />
        </div>
      </div>

      {/* Additional Neurodivergences - Only show if score > 25 (traits present) */}
      {anxiety.score > 25 && (
        <NeurodivergenceItem
          title="Anxiété"
          icon="😰"
          score={anxiety.score}
          profile={anxiety.profile}
          manifestations={anxiety.manifestations}
          strategies={anxiety.strategies}
          color="purple"
        />
      )}

      {sleepDisorder.score > 25 && (
        <NeurodivergenceItem
          title="Troubles du Sommeil"
          icon="😴"
          score={sleepDisorder.score}
          profile={sleepDisorder.profile}
          manifestations={sleepDisorder.manifestations}
          strategies={sleepDisorder.strategies}
          color="blue"
        />
      )}

      {toc.score > 25 && (
        <NeurodivergenceItem
          title="TOC (Troubles Obsessionnels Compulsifs)"
          icon="🔄"
          score={toc.score}
          profile={toc.profile}
          manifestations={toc.manifestations}
          strategies={toc.strategies}
          color="indigo"
        />
      )}

      {dys.score > 25 && (
        <NeurodivergenceItem
          title="Troubles Dys- (Apprentissage)"
          icon="📚"
          score={dys.score}
          profile={dys.profile}
          manifestations={dys.manifestations}
          strategies={dys.strategies}
          color="pink"
        />
      )}

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
  isPending?: boolean
}

const NeurodivergenceItem: React.FC<NeurodivergenceItemProps> = ({
  title,
  icon,
  score,
  profile,
  manifestations,
  strategies,
  color,
  isPending = false,
}) => {
  const colorClasses = {
    purple: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800',
    blue: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800',
    indigo: 'from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-200 dark:border-indigo-800',
    pink: 'from-pink-50 to-fuchsia-50 dark:from-pink-900/20 dark:to-fuchsia-900/20 border-pink-200 dark:border-pink-800',
  }

  // Show pending state with informative message
  const displayProfile = isPending ? 'Analyse en attente' : profile
  const displayManifestations = isPending && manifestations.length === 0
    ? ["L'analyse n'a pas pu être complétée", "Cliquez sur 'Enrichir avec Shizen' pour relancer"]
    : manifestations
  const displayStrategies = isPending && strategies.length === 0
    ? ["Régénérez votre profil pour obtenir des stratégies personnalisées"]
    : strategies

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 border-2 ${isPending ? 'opacity-75' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{icon}</span>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className={`text-sm mt-1 ${isPending ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
              Profil : {displayProfile}
            </p>
          </div>
        </div>
        <ScoreBadge score={score} isPending={isPending} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailCard
          title={isPending ? "⏳ En attente" : "🔍 Manifestations"}
          items={displayManifestations}
          icon="•"
          color="purple"
        />
        <DetailCard
          title={isPending ? "💡 Action requise" : "💡 Stratégies d'Adaptation"}
          items={displayStrategies}
          icon="✓"
          color="green"
        />
      </div>
    </div>
  )
}

interface ScoreBadgeProps {
  score: number
  isPending?: boolean
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, isPending = false }) => {
  // Handle pending state
  if (isPending || score === -1) {
    return (
      <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gray-400 text-white shadow-lg animate-pulse">
        <span className="text-2xl font-bold">⏳</span>
        <span className="text-xs font-semibold text-center px-1">En attente</span>
      </div>
    )
  }

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
