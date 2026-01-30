/**
 * AstrologyCard Component
 * Displays detailed Astrology analysis (Western + Chinese)
 * Shinkofa Platform
 */

import React from 'react'
import { ProfileSection } from './ProfileSection'

interface AstrologyPlanet {
  name: string
  sign: string
  house: string
  degree: number
  retrograde: boolean
}

interface AstrologyWestern {
  sun_sign: string
  moon_sign: string
  ascendant: string
  dominant_element: string
  dominant_modality: string
  planets?: AstrologyPlanet[]
}

interface AstrologyChinese {
  animal_sign: string
  element: string
  yin_yang: string
  traits: string[]
}

interface AstrologyCardProps {
  western: AstrologyWestern
  chinese: AstrologyChinese
}

// Traduction des signes zodiacaux en français (helper function) + abréviations 3 lettres
const translateZodiacSign = (sign: string): string => {
  const signKey = sign.toLowerCase().trim()
  const translations: { [key: string]: string } = {
    // Noms complets
    'aries': 'Bélier',
    'taurus': 'Taureau',
    'gemini': 'Gémeaux',
    'cancer': 'Cancer',
    'leo': 'Lion',
    'virgo': 'Vierge',
    'libra': 'Balance',
    'scorpio': 'Scorpion',
    'sagittarius': 'Sagittaire',
    'capricorn': 'Capricorne',
    'aquarius': 'Verseau',
    'pisces': 'Poissons',
    // Abréviations 3 lettres
    'ari': 'Bélier',
    'tau': 'Taureau',
    'gem': 'Gémeaux',
    'can': 'Cancer',
    // 'leo' déjà défini (identique au nom complet)
    'vir': 'Vierge',
    'lib': 'Balance',
    'sco': 'Scorpion',
    'sag': 'Sagittaire',
    'cap': 'Capricorne',
    'aqu': 'Verseau',
    'pis': 'Poissons',
  }
  return translations[signKey] || sign
}

export const AstrologyCard: React.FC<AstrologyCardProps> = ({ western, chinese }) => {

  const getZodiacDescription = (sign: string): string => {
    const descriptions: { [key: string]: string } = {
      'aries': 'Signe de feu cardinal. Énergique, courageux, pionnier, impulsif.',
      'taurus': 'Signe de terre fixe. Stable, sensuel, persévérant, patient.',
      'gemini': 'Signe d\'air mutable. Communicatif, curieux, adaptable, intellectuel.',
      'cancer': 'Signe d\'eau cardinal. Sensible, protecteur, intuitif, émotionnel.',
      'leo': 'Signe de feu fixe. Créatif, généreux, charismatique, loyal.',
      'virgo': 'Signe de terre mutable. Analytique, perfectionniste, serviable, méthodique.',
      'libra': 'Signe d\'air cardinal. Harmonieux, diplomate, esthète, indécis.',
      'scorpio': 'Signe d\'eau fixe. Intense, passionné, mystérieux, transformateur.',
      'sagittarius': 'Signe de feu mutable. Aventureux, optimiste, philosophe, libre.',
      'capricorn': 'Signe de terre cardinal. Ambitieux, discipliné, pragmatique, responsable.',
      'aquarius': 'Signe d\'air fixe. Innovant, humaniste, indépendant, original.',
      'pisces': 'Signe d\'eau mutable. Empathique, créatif, spirituel, rêveur.',
    }
    return descriptions[sign.toLowerCase()] || 'Signe astrologique unique.'
  }

  const getElementDescription = (element: string): string => {
    const descriptions: { [key: string]: string } = {
      'fire': '🔥 Feu : Énergie, passion, action, spontanéité, enthousiasme',
      'earth': '🌍 Terre : Stabilité, pragmatisme, matérialité, sens pratique',
      'air': '💨 Air : Communication, intellect, socialité, idées, légèreté',
      'water': '💧 Eau : Émotions, intuition, sensibilité, profondeur, fluidité',
    }
    return descriptions[element.toLowerCase()] || element
  }

  const getModalityDescription = (modality: string): string => {
    const descriptions: { [key: string]: string } = {
      'cardinal': '♾️ Cardinal : Initiative, leadership, début de cycles',
      'fixed': '♾️ Fixe : Stabilité, persévérance, maintien de l\'énergie',
      'mutable': '♾️ Mutable : Adaptabilité, flexibilité, transition',
    }
    return descriptions[modality.toLowerCase()] || modality
  }

  // Traduction des animaux chinois en français
  const translateChineseAnimal = (animal: string): string => {
    const translations: { [key: string]: string } = {
      'rat': 'Rat',
      'ox': 'Buffle',
      'tiger': 'Tigre',
      'rabbit': 'Lapin',
      'dragon': 'Dragon',
      'snake': 'Serpent',
      'horse': 'Cheval',
      'goat': 'Chèvre',
      'monkey': 'Singe',
      'rooster': 'Coq',
      'dog': 'Chien',
      'pig': 'Cochon',
    }
    return translations[animal.toLowerCase()] || animal
  }

  const getChineseAnimalDescription = (animal: string): string => {
    const descriptions: { [key: string]: string } = {
      'rat': '🐀 Intelligent, adaptable, charmeur, opportuniste',
      'ox': '🐂 Travailleur, fiable, patient, méthodique',
      'tiger': '🐅 Courageux, compétitif, confiant, imprévisible',
      'rabbit': '🐇 Élégant, gentil, prudent, diplomatique',
      'dragon': '🐉 Charismatique, énergique, visionnaire, chanceux',
      'snake': '🐍 Sage, mystérieux, intuitif, élégant',
      'horse': '🐴 Énergique, libre, sociable, aventureux',
      'goat': '🐐 Créatif, empathique, paisible, artistique',
      'monkey': '🐵 Intelligent, curieux, joueur, innovant',
      'rooster': '🐓 Observateur, travailleur, courageux, loyal',
      'dog': '🐕 Loyal, honnête, protecteur, juste',
      'pig': '🐖 Généreux, compatissant, sincère, optimiste',
    }
    return descriptions[animal.toLowerCase()] || animal
  }

  // Traduction des éléments chinois en français
  const translateChineseElement = (element: string): string => {
    const translations: { [key: string]: string } = {
      'wood': 'Bois',
      'fire': 'Feu',
      'earth': 'Terre',
      'metal': 'Métal',
      'water': 'Eau',
    }
    return translations[element.toLowerCase()] || element
  }

  const getChineseElementDescription = (element: string): string => {
    const descriptions: { [key: string]: string } = {
      'wood': '🌳 Bois : Croissance, créativité, expansion, compassion',
      'fire': '🔥 Feu : Passion, action, leadership, transformation',
      'earth': '🌍 Terre : Stabilité, nourriture, ancrage, fiabilité',
      'metal': '⚔️ Métal : Structure, rigueur, détermination, clarté',
      'water': '💧 Eau : Sagesse, flexibilité, intuition, communication',
    }
    return descriptions[element.toLowerCase()] || element
  }

  return (
    <ProfileSection
      title="Astrologie"
      icon="✨"
      gradient="from-yellow-500 to-orange-600"
    >
      {/* Western Astrology */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">⭐</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Astrologie Occidentale
          </h3>
        </div>

        {/* Big Three */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ZodiacCard
            title="Soleil"
            icon="☀️"
            sign={western.sun_sign}
            description={getZodiacDescription(western.sun_sign)}
            gradient="from-yellow-400 to-orange-400"
            subtitle="Essence, identité, ego"
          />
          <ZodiacCard
            title="Lune"
            icon="🌙"
            sign={western.moon_sign}
            description={getZodiacDescription(western.moon_sign)}
            gradient="from-blue-400 to-indigo-400"
            subtitle="Émotions, besoins, inconscient"
          />
          <ZodiacCard
            title="Ascendant"
            icon="⬆️"
            sign={western.ascendant}
            description={getZodiacDescription(western.ascendant)}
            gradient="from-purple-400 to-pink-400"
            subtitle="Apparence, première impression"
          />
        </div>

        {/* Element & Modality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-5 border-2 border-yellow-300 dark:border-yellow-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Élément Dominant</h4>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
              {getElementDescription(western.dominant_element)}
            </p>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-5 border-2 border-orange-300 dark:border-orange-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Modalité Dominante</h4>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
              {getModalityDescription(western.dominant_modality)}
            </p>
          </div>
        </div>

        {/* Planets (if available) */}
        {western.planets && western.planets.length > 0 && (
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-5 border-2 border-yellow-300 dark:border-yellow-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-lg flex items-center gap-2">
              <span className="text-2xl">🪐</span> Planètes Personnelles
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {western.planets.filter(p => ['mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(p.name.toLowerCase())).map((planet, idx) => {
                const planetInfo: {[key: string]: {name: string, icon: string, description: string}} = {
                  'mercury': {name: 'Mercure', icon: '☿️', description: 'Communication, pensée'},
                  'venus': {name: 'Vénus', icon: '♀️', description: 'Amour, valeurs'},
                  'mars': {name: 'Mars', icon: '♂️', description: 'Action, énergie'},
                  'jupiter': {name: 'Jupiter', icon: '♃', description: 'Expansion, chance'},
                  'saturn': {name: 'Saturne', icon: '♄', description: 'Structure, leçons'},
                }
                const info = planetInfo[planet.name.toLowerCase()]
                if (!info) return null
                return (
                  <PlanetBadge
                    key={idx}
                    planet={info.name}
                    sign={planet.sign}
                    icon={info.icon}
                    description={info.description}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Chinese Astrology */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">🐉</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Astrologie Chinoise
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-400 to-rose-400 text-white rounded-lg p-5 text-center">
            <h4 className="font-semibold mb-2 text-sm opacity-90">Animal Signe</h4>
            <p className="text-3xl font-bold mb-2">{translateChineseAnimal(chinese.animal_sign)}</p>
            <p className="text-sm opacity-90">{getChineseAnimalDescription(chinese.animal_sign)}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-amber-400 text-white rounded-lg p-5 text-center">
            <h4 className="font-semibold mb-2 text-sm opacity-90">Élément</h4>
            <p className="text-3xl font-bold mb-2">{translateChineseElement(chinese.element)}</p>
            <p className="text-sm opacity-90">{getChineseElementDescription(chinese.element)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-pink-400 text-white rounded-lg p-5 text-center">
            <h4 className="font-semibold mb-2 text-sm opacity-90">Polarité</h4>
            <p className="text-3xl font-bold mb-2">{chinese.yin_yang === 'yin' ? '☯️ Yin' : '☯️ Yang'}</p>
            <p className="text-sm opacity-90">
              {chinese.yin_yang === 'yin' ? 'Réceptif, introspectif' : 'Actif, extraverti'}
            </p>
          </div>
        </div>

        {/* Traits */}
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-5 border-2 border-red-300 dark:border-red-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-lg flex items-center gap-2">
            <span className="text-2xl">🎭</span> Traits de Caractère
          </h4>
          <div className="flex flex-wrap gap-2">
            {chinese.traits.map((trait, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full font-medium shadow-md text-sm"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 text-white">
        <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span className="text-2xl">ℹ️</span> Comprendre l'Astrologie
        </h4>
        <p className="leading-relaxed text-yellow-50">
          L'astrologie occidentale se base sur la position du Soleil, de la Lune et des planètes au moment de votre naissance.
          L'astrologie chinoise utilise les cycles lunaires et les éléments pour révéler votre personnalité et votre destinée.
          Ensemble, ces deux systèmes offrent une vision complémentaire de votre nature profonde.
        </p>
      </div>
    </ProfileSection>
  )
}

interface ZodiacCardProps {
  title: string
  icon: string
  sign: string
  description: string
  gradient: string
  subtitle: string
}

const ZodiacCard: React.FC<ZodiacCardProps> = ({ title, icon, sign, description, gradient, subtitle }) => {
  return (
    <div className={`bg-gradient-to-br ${gradient} text-white rounded-lg p-5`}>
      <div className="text-center mb-3">
        <p className="text-sm font-medium opacity-90">{title}</p>
        <div className="text-5xl my-2">{icon}</div>
        <p className="text-2xl font-bold">{translateZodiacSign(sign)}</p>
        <p className="text-xs opacity-80 mt-1">{subtitle}</p>
      </div>
      <p className="text-sm leading-snug opacity-90 text-center">{description}</p>
    </div>
  )
}

interface PlanetBadgeProps {
  planet: string
  sign: string
  icon: string
  description: string
}

const PlanetBadge: React.FC<PlanetBadgeProps> = ({ planet, sign, icon, description }) => {
  return (
    <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg p-3 text-center border border-yellow-300 dark:border-yellow-700">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="font-bold text-gray-900 dark:text-white text-sm">{planet}</p>
      <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">{translateZodiacSign(sign)}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{description}</p>
    </div>
  )
}
