/**
 * PsychologicalCard Component
 * Displays detailed psychological analysis (MBTI, Big Five, Enneagram, Love Languages)
 * Shinkofa Platform
 */

import React from 'react'
import { ProfileSection, InfoCard, DetailCard } from './ProfileSection'

interface PsychologicalAnalysis {
  mbti: {
    type: string
    description: string
    strengths: string[]
    challenges: string[]
  }
  big_five: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
    description: string
  }
  enneagram: {
    type: number
    wing: number
    description: string
    core_fear: string
    core_desire: string
  }
  love_languages: {
    primary: string
    secondary: string
    scores: {
      words_of_affirmation: number
      quality_time: number
      receiving_gifts: number
      acts_of_service: number
      physical_touch: number
    }
  }
}

interface PsychologicalCardProps {
  data: PsychologicalAnalysis
}

const formatLoveLanguage = (key: string): string => {
  const translations: { [key: string]: string } = {
    words_of_affirmation: 'Paroles valorisantes',
    quality_time: 'Moments de qualité',
    receiving_gifts: 'Recevoir des cadeaux',
    acts_of_service: 'Services rendus',
    physical_touch: 'Contact physique',
  }
  return translations[key] || key
}

// MBTI Profile Names and Descriptions
const MBTI_PROFILES: { [key: string]: { name: string; nickname: string; description: string } } = {
  INTJ: {
    name: 'L\'Architecte',
    nickname: 'Le Stratège Visionnaire',
    description: 'Penseur stratégique et indépendant, l\'INTJ possède une vision à long terme exceptionnelle. Doté d\'une intelligence analytique et d\'une détermination sans faille, il conçoit des systèmes complexes et poursuit ses objectifs avec une efficacité remarquable. Son esprit rationnel et sa capacité à voir au-delà des apparences en font un leader naturel dans l\'innovation et la résolution de problèmes.',
  },
  INTP: {
    name: 'Le Logicien',
    nickname: 'Le Penseur Analytique',
    description: 'Esprit brillant et curieux, l\'INTP explore les idées abstraites avec passion. Son approche logique et son questionnement perpétuel font de lui un inventeur et théoricien hors pair. Indépendant et original, il cherche à comprendre les principes fondamentaux qui régissent le monde, souvent en avance sur son temps.',
  },
  ENTJ: {
    name: 'Le Commandant',
    nickname: 'Le Leader Décisif',
    description: 'Leader né doté d\'une énergie contagieuse, l\'ENTJ excelle dans l\'organisation et la direction. Sa vision stratégique combinée à son charisme naturel lui permet de mobiliser les équipes vers des objectifs ambitieux. Efficace et déterminé, il transforme les défis en opportunités de croissance.',
  },
  ENTP: {
    name: 'L\'Innovateur',
    nickname: 'Le Débatteur Créatif',
    description: 'Esprit vif et provocateur, l\'ENTP remet en question le statu quo avec intelligence et humour. Doté d\'une créativité sans limites et d\'une capacité exceptionnelle à voir les possibilités, il excelle dans l\'innovation et la résolution de problèmes complexes. Son enthousiasme communicatif inspire ceux qui l\'entourent.',
  },
  INFJ: {
    name: 'L\'Avocat',
    nickname: 'Le Visionnaire Empathique',
    description: 'Idéaliste rare et mystérieux, l\'INFJ possède une intuition profonde sur la nature humaine. Animé par un sens du but et une empathie exceptionnelle, il aspire à aider les autres et à créer un monde meilleur. Sa combinaison unique de créativité et de détermination en fait un catalyseur de changement positif.',
  },
  INFP: {
    name: 'Le Médiateur',
    nickname: 'L\'Idéaliste Poétique',
    description: 'Âme sensible et créative, l\'INFP vit guidé par ses valeurs profondes et sa quête de sens. Son monde intérieur riche et imaginatif nourrit une créativité authentique. Empathique et altruiste, il cherche l\'harmonie et l\'expression de soi véritable, tout en défendant ce qui lui tient à cœur.',
  },
  ENFJ: {
    name: 'Le Protagoniste',
    nickname: 'Le Mentor Charismatique',
    description: 'Leader inspirant et bienveillant, l\'ENFJ possède un don naturel pour comprendre et motiver les autres. Son charisme authentique et son désir d\'aider font de lui un excellent mentor et facilitateur. Diplomate et chaleureux, il crée des connexions profondes et encourage le potentiel de chacun.',
  },
  ENFP: {
    name: 'L\'Inspirateur',
    nickname: 'L\'Enthousiaste Créatif',
    description: 'Esprit libre et passionné, l\'ENFP déborde d\'énergie créative et d\'enthousiasme. Sa curiosité insatiable et son optimisme contagieux inspirent ceux qui l\'entourent. Authentique et expressif, il voit des possibilités partout et apporte chaleur et spontanéité dans chaque interaction.',
  },
  ISTJ: {
    name: 'Le Logisticien',
    nickname: 'Le Gardien Fiable',
    description: 'Pilier de fiabilité et d\'intégrité, l\'ISTJ honore ses engagements avec une constance exemplaire. Son sens du devoir et son attention aux détails garantissent un travail de qualité. Traditionnel et organisé, il apporte stabilité et structure, tout en protégeant ce qui a de la valeur.',
  },
  ISFJ: {
    name: 'Le Défenseur',
    nickname: 'Le Protecteur Dévoué',
    description: 'Âme généreuse et attentionnée, l\'ISFJ se dévoue au bien-être des autres avec une loyauté sans faille. Sa mémoire exceptionnelle des détails personnels et son attention aux besoins d\'autrui en font un soutien précieux. Humble et travailleur, il contribue discrètement mais de manière essentielle.',
  },
  ESTJ: {
    name: 'Le Directeur',
    nickname: 'L\'Organisateur Pragmatique',
    description: 'Leader efficace et pragmatique, l\'ESTJ excelle dans l\'organisation et l\'exécution. Son respect des traditions et des règles établies, combiné à son énergie et sa détermination, en fait un gestionnaire et administrateur exemplaire. Direct et honnête, il valorise le travail bien fait.',
  },
  ESFJ: {
    name: 'Le Consul',
    nickname: 'L\'Hôte Bienveillant',
    description: 'Cœur généreux et sociable, l\'ESFJ crée l\'harmonie et prend soin de sa communauté. Son attention aux besoins des autres et son désir de plaire font de lui un hôte parfait et un ami loyal. Traditionnel et chaleureux, il maintient les liens sociaux et les traditions familiales.',
  },
  ISTP: {
    name: 'Le Virtuose',
    nickname: 'L\'Artisan Pragmatique',
    description: 'Esprit pratique et observateur, l\'ISTP maîtrise les outils et les mécanismes avec une aisance naturelle. Son approche rationnelle et son calme sous pression en font un excellent résolveur de problèmes. Indépendant et adaptable, il préfère l\'action à la théorie.',
  },
  ISFP: {
    name: 'L\'Aventurier',
    nickname: 'L\'Artiste Sensible',
    description: 'Âme artistique et libre, l\'ISFP vit dans le moment présent avec une sensibilité esthétique unique. Son approche douce de la vie et son désir d\'authenticité se manifestent dans ses créations et ses relations. Discret mais passionné, il valorise la beauté et l\'harmonie.',
  },
  ESTP: {
    name: 'L\'Entrepreneur',
    nickname: 'Le Fonceur Dynamique',
    description: 'Esprit vif et audacieux, l\'ESTP saisit les opportunités avec énergie et pragmatisme. Son charme naturel et son talent pour l\'improvisation en font un négociateur et homme d\'action efficace. Aventurier et réaliste, il apporte excitement et solutions pratiques.',
  },
  ESFP: {
    name: 'L\'Amuseur',
    nickname: 'L\'Animateur Spontané',
    description: 'Rayon de soleil vivant, l\'ESFP apporte joie et vitalité partout où il va. Son sens du spectacle et son amour de la vie font de lui le centre de toute fête. Généreux et spontané, il vit pleinement l\'instant présent et partage son enthousiasme avec chaleur.',
  },
}

const getMBTIProfile = (type: string) => {
  return MBTI_PROFILES[type?.toUpperCase()] || {
    name: 'Type MBTI',
    nickname: 'Personnalité Unique',
    description: 'Votre profil de personnalité unique combine des traits distinctifs qui vous caractérisent.',
  }
}

export const PsychologicalCard: React.FC<PsychologicalCardProps> = ({ data }) => {
  return (
    <ProfileSection
      title="Analyse Psychologique"
      icon="🧠"
      gradient="from-blue-500 to-purple-600"
    >
      {/* MBTI */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧩</span>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              MBTI : {data.mbti.type}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 ml-10 sm:ml-0">
            <span className="px-3 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full text-sm font-semibold">
              {getMBTIProfile(data.mbti.type).name}
            </span>
            <span className="px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
              {getMBTIProfile(data.mbti.type).nickname}
            </span>
          </div>
        </div>
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 mb-4 border-l-4 border-purple-500">
          <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed font-medium">
            {getMBTIProfile(data.mbti.type).description}
          </p>
        </div>
        {data.mbti.description && (
          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-6 italic">
            {data.mbti.description}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailCard
            title="✅ Points Forts"
            items={data.mbti.strengths}
            icon="✓"
            color="green"
          />
          <DetailCard
            title="⚠️ Défis à Surmonter"
            items={data.mbti.challenges}
            icon="⚡"
            color="orange"
          />
        </div>
      </div>

      {/* Big Five */}
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">📊</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Big Five - Traits de Personnalité
          </h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-6">
          {data.big_five.description}
        </p>
        <div className="space-y-4">
          <TraitBar label="Ouverture à l'expérience" value={data.big_five.openness} description="Curiosité, créativité, ouverture aux nouvelles idées" />
          <TraitBar label="Conscienciosité" value={data.big_five.conscientiousness} description="Organisation, discipline, sens du devoir" />
          <TraitBar label="Extraversion" value={data.big_five.extraversion} description="Sociabilité, énergie sociale, expressivité" />
          <TraitBar label="Agréabilité" value={data.big_five.agreeableness} description="Empathie, coopération, altruisme" />
          <TraitBar label="Neuroticisme" value={data.big_five.neuroticism} description="Stabilité émotionnelle, gestion du stress" />
        </div>
      </div>

      {/* Enneagram */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🌀</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ennéagramme : Type {data.enneagram.type} (Aile {data.enneagram.wing})
          </h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-6">
          {data.enneagram.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
            <h4 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2 text-lg">
              <span className="text-2xl">😨</span> Peur Fondamentale
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{data.enneagram.core_fear}</p>
          </div>
          <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2 text-lg">
              <span className="text-2xl">💙</span> Désir Fondamental
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{data.enneagram.core_desire}</p>
          </div>
        </div>
      </div>

      {/* Love Languages */}
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">❤️</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Langages d'Amour
          </h3>
        </div>
        <div className="mb-6 p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 text-base">
            <strong className="text-pink-600 dark:text-pink-400">Langage Primaire :</strong>{' '}
            {formatLoveLanguage(data.love_languages.primary)}
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-base mt-2">
            <strong className="text-rose-600 dark:text-rose-400">Langage Secondaire :</strong>{' '}
            {formatLoveLanguage(data.love_languages.secondary)}
          </p>
        </div>
        <div className="space-y-3">
          {Object.entries(data.love_languages.scores).map(([key, value]) => (
            <LoveLanguageBar key={key} label={formatLoveLanguage(key)} value={value} />
          ))}
        </div>
      </div>
    </ProfileSection>
  )
}

interface TraitBarProps {
  label: string
  value: number
  description: string
}

const TraitBar: React.FC<TraitBarProps> = ({ label, value, description }) => {
  const getColor = (val: number) => {
    if (val >= 70) return 'bg-green-500 dark:bg-green-600'
    if (val >= 50) return 'bg-blue-500 dark:bg-blue-600'
    if (val >= 30) return 'bg-yellow-500 dark:bg-yellow-600'
    return 'bg-orange-500 dark:bg-orange-600'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${getColor(value)}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  )
}

interface LoveLanguageBarProps {
  label: string
  value: number
}

const LoveLanguageBar: React.FC<LoveLanguageBarProps> = ({ label, value }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
        <span className="text-lg font-bold text-pink-600 dark:text-pink-400">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  )
}
