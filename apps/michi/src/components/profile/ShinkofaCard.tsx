/**
 * ShinkofaCard Component
 * Displays detailed Shinkofa analysis (Life Wheel, Archetypes, Limiting Paradigms)
 * Shinkofa Platform
 */

import React from 'react'
import { ProfileSection, DetailCard } from './ProfileSection'

interface ShinkofaAnalysis {
  life_wheel: {
    spiritual: number
    mental: number
    emotional: number
    physical: number
    social: number
    professional: number
    creative: number
    financial: number
  }
  archetypes: {
    primary: string
    secondary: string
    tertiary: string
  }
  limiting_paradigms: string[]
}

interface ShinkofaCardProps {
  data: ShinkofaAnalysis
}

export const ShinkofaCard: React.FC<ShinkofaCardProps> = ({ data }) => {
  const lifeWheelDomains = [
    { key: 'spiritual', label: 'Spiritualité & Sens', icon: '✨', description: 'Connexion intérieure, quête de sens, pratiques spirituelles' },
    { key: 'mental', label: 'Mental & Intellect', icon: '🧠', description: 'Clarté mentale, apprentissage, stimulation intellectuelle' },
    { key: 'emotional', label: 'Émotionnel & Ressenti', icon: '❤️', description: 'Équilibre émotionnel, gestion des émotions, bien-être affectif' },
    { key: 'physical', label: 'Physique & Vitalité', icon: '💪', description: 'Santé corporelle, énergie, habitudes physiques' },
    { key: 'social', label: 'Social & Relations', icon: '👥', description: 'Qualité des liens, relations familiales et amicales, appartenance' },
    { key: 'professional', label: 'Professionnel & Mission', icon: '🎯', description: 'Carrière, épanouissement au travail, alignement mission' },
    { key: 'creative', label: 'Créativité & Expression', icon: '🎨', description: 'Expression artistique, projets créatifs, loisirs créatifs' },
    { key: 'financial', label: 'Financier & Abondance', icon: '💰', description: 'Stabilité financière, abondance, rapport à l\'argent' },
  ]

  const getArchetypeDescription = (archetype: string): string => {
    const descriptions: { [key: string]: string } = {
      'Explorer': 'Curieux et aventurier, tu cherches constamment de nouvelles expériences et connaissances.',
      'Sage': 'Quête de vérité et de sagesse, tu aimes comprendre le monde en profondeur.',
      'Héros': 'Courageux et déterminé, tu relèves les défis et inspires les autres.',
      'Rebelle': 'Indépendant et anticonformiste, tu remets en question les normes établies.',
      'Magicien': 'Visionnaire et transformateur, tu crées de nouvelles réalités.',
      'Innocent': 'Optimiste et pur, tu vois le meilleur en chacun et aspires au bonheur simple.',
      'Amoureux': 'Passionné et relationnel, tu cherches la connexion profonde et l\'intimité.',
      'Bouffon': 'Joueur et léger, tu apportes joie et perspective par l\'humour.',
      'Créateur': 'Innovant et artistique, tu donnes forme à tes visions uniques.',
      'Souverain': 'Leader naturel, tu crées l\'ordre et structures les choses.',
      'Aidant': 'Généreux et empathique, tu prends soin des autres naturellement.',
      'Orphelin': 'Réaliste et résilient, tu développes force et indépendance face aux épreuves.',
    }
    return descriptions[archetype] || 'Archétype unique avec ses propres caractéristiques.'
  }

  return (
    <ProfileSection
      title="Dimensions Shinkofa"
      icon="🌈"
      gradient="from-pink-500 to-orange-500"
    >
      {/* Life Wheel */}
      <div className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-orange-200 dark:border-orange-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">🎯</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Roue de Vie Shinkofa
          </h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          La Roue de Vie évalue votre satisfaction actuelle dans 8 dimensions essentielles de l'existence.
          Chaque score reflète votre niveau d'épanouissement dans ce domaine (0 = insatisfait, 10 = pleinement satisfait).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lifeWheelDomains.map((domain) => (
            <LifeWheelDomain
              key={domain.key}
              icon={domain.icon}
              label={domain.label}
              description={domain.description}
              score={data.life_wheel[domain.key as keyof typeof data.life_wheel]}
            />
          ))}
        </div>
      </div>

      {/* Archetypes */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">🦸</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Archétypes Shinkofa
          </h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          Les archétypes représentent les patterns fondamentaux qui guident votre comportement, vos motivations et votre manière d'être au monde.
          Votre profil combine trois archétypes principaux qui s'harmonisent pour créer votre identité unique.
        </p>
        <div className="space-y-4">
          <ArchetypeCard
            rank="Primaire"
            archetype={data.archetypes.primary}
            description={getArchetypeDescription(data.archetypes.primary)}
            gradient="from-purple-500 to-blue-500"
            icon="🥇"
          />
          <ArchetypeCard
            rank="Secondaire"
            archetype={data.archetypes.secondary}
            description={getArchetypeDescription(data.archetypes.secondary)}
            gradient="from-blue-500 to-green-500"
            icon="🥈"
          />
          <ArchetypeCard
            rank="Tertiaire"
            archetype={data.archetypes.tertiary}
            description={getArchetypeDescription(data.archetypes.tertiary)}
            gradient="from-green-500 to-yellow-500"
            icon="🥉"
          />
        </div>
      </div>

      {/* Limiting Paradigms */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">🔓</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Paradigmes Limitants à Transformer
          </h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          Les paradigmes limitants sont des croyances ou schémas de pensée qui peuvent freiner votre épanouissement.
          En prendre conscience est la première étape pour les transformer en forces.
        </p>
        <div className="space-y-3">
          {data.limiting_paradigms.map((paradigm, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border-l-4 border-orange-500"
            >
              <span className="text-2xl mt-1">⚠️</span>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                  {paradigm}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-orange-600 to-pink-600 rounded-xl p-6 text-white">
        <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span className="text-2xl">💫</span> La Voie Shinkofa
        </h4>
        <p className="leading-relaxed text-orange-50">
          La philosophie Shinkofa intègre développement personnel, spiritualité et action concrète.
          Votre profil holistique vous guide vers un épanouissement authentique en harmonisant toutes les dimensions de votre être.
        </p>
      </div>
    </ProfileSection>
  )
}

interface LifeWheelDomainProps {
  icon: string
  label: string
  description: string
  score: number
}

const LifeWheelDomain: React.FC<LifeWheelDomainProps> = ({ icon, label, description, score }) => {
  const getColor = (val: number) => {
    if (val >= 8) return 'from-green-500 to-emerald-500'
    if (val >= 6) return 'from-blue-500 to-cyan-500'
    if (val >= 4) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-rose-500'
  }

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h4 className="font-bold text-gray-900 dark:text-white">{label}</h4>
        </div>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{score}/10</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{description}</p>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full bg-gradient-to-r ${getColor(score)} transition-all duration-500`}
          style={{ width: `${(score / 10) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}

interface ArchetypeCardProps {
  rank: string
  archetype: string
  description: string
  gradient: string
  icon: string
}

const ArchetypeCard: React.FC<ArchetypeCardProps> = ({ rank, archetype, description, gradient, icon }) => {
  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-lg p-5 text-white shadow-lg`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-sm font-medium opacity-90">{rank}</p>
          <h4 className="text-2xl font-bold">{archetype}</h4>
        </div>
      </div>
      <p className="text-white/90 leading-relaxed">{description}</p>
    </div>
  )
}
