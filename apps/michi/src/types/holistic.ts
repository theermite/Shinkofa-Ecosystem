/**
 * Holistic Profile Types
 * Shinkofa Platform - Complete user profile analysis
 */

// ═══════════════════════════════════════════════════════════
// PSYCHOLOGICAL ANALYSIS
// ═══════════════════════════════════════════════════════════

export interface MBTI {
  type: string // e.g., "INTJ", "ENFP"
  scores: {
    E_I: number // Extraversion vs Introversion (-100 to 100)
    S_N: number // Sensing vs Intuition
    T_F: number // Thinking vs Feeling
    J_P: number // Judging vs Perceiving
  }
  description: string
  strengths: string[]
  challenges: string[]
}

export interface BigFive {
  openness: number // 0-100
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
  description: string
}

export interface Enneagram {
  type: number // 1-9
  wing: number // Wing type
  tritype: string // e.g., "531"
  description: string
  core_fear: string
  core_desire: string
}

export interface PNL {
  toward_away: 'toward' | 'away'
  internal_external: 'internal' | 'external'
  options_procedures: 'options' | 'procedures'
  big_picture_details: 'big_picture' | 'details'
  sameness_difference: 'sameness' | 'difference'
  proactive_reactive: 'proactive' | 'reactive'
  global_specific: 'global' | 'specific'
  match_mismatch: 'match' | 'mismatch'
  description: string
}

export interface PCM {
  dominant_type: string
  base_type: string
  phase_type: string
  drivers: string[]
  communication_channels: {
    preferred: string[]
    avoid: string[]
  }
  stress_sequences: string[]
  description: string
}

export interface VAKOG {
  dominant_channel: 'visual' | 'auditory' | 'kinesthetic' | 'olfactory' | 'gustatory'
  scores: {
    visual: number
    auditory: number
    kinesthetic: number
    olfactory: number
    gustatory: number
  }
  learning_style: string
  communication_preferences: string[]
  description: string
}

export interface LoveLanguages {
  primary: string
  secondary: string
  scores: {
    words_of_affirmation: number
    quality_time: number
    receiving_gifts: number
    acts_of_service: number
    physical_touch: number
  }
  interpretation: string
  description: string
}

export interface PsychologicalAnalysis {
  mbti: MBTI
  big_five: BigFive
  enneagram: Enneagram
  pnl: PNL
  pcm: PCM
  vakog: VAKOG
  love_languages: LoveLanguages
}

// ═══════════════════════════════════════════════════════════
// NEURODIVERGENCE ANALYSIS
// ═══════════════════════════════════════════════════════════

export interface NeurodivergenceProfile {
  score: number // 0-100
  profile: string
  manifestations: string[]
  strategies: string[]
}

export interface HypersensitivityProfile extends NeurodivergenceProfile {
  types: ('emotional' | 'sensory' | 'intellectual' | 'imaginative' | 'psychomotor')[]
}

export interface NeurodivergenceAnalysis {
  adhd: NeurodivergenceProfile
  autism: NeurodivergenceProfile
  hpi: NeurodivergenceProfile
  multipotentiality: {
    score: number
    manifestations: string[]
  }
  hypersensitivity: HypersensitivityProfile
}

// ═══════════════════════════════════════════════════════════
// SHINKOFA ANALYSIS
// ═══════════════════════════════════════════════════════════

export interface LifeWheel {
  spiritual: number // 1-10
  mental: number
  emotional: number
  physical: number
  social: number
  professional: number
  creative: number
  financial: number
}

export interface Archetypes {
  primary: string
  secondary: string
  tertiary: string
}

export interface InnerDialogue {
  child: number // 0-100
  warrior: number
  guide: number
  sage: number
}

export interface ShinkoфaAnalysis {
  life_wheel: LifeWheel
  archetypes: Archetypes
  limiting_paradigms: string[]
  inner_dialogue: InnerDialogue
}

// ═══════════════════════════════════════════════════════════
// DESIGN HUMAIN
// ═══════════════════════════════════════════════════════════

export interface DesignHumanGate {
  number: number
  line: number
  color: number
  tone: number
  planet: string
  side: 'personality' | 'design'
}

export interface DesignHumanPlanet {
  name: string
  position_degrees: number
}

export interface DesignHumanChannel {
  gates: number[]
  name: string
}

export interface DesignHuman {
  type: string // e.g., "projector", "generator", "manifestor", "reflector", "manifesting_generator"
  authority: string // e.g., "emotional", "sacral", "splenic", "ego", "self_projected", "mental", "lunar"
  profile: string // e.g., "1/3", "5/2"
  definition: string // e.g., "single", "split", "triple", "quadruple", "none"
  strategy: string
  signature: string
  not_self: string
  variable: string // e.g., "PLR DLL" - 4 arrows (Motivation, Perspective, Digestion, Environment)
  defined_centers: string[]
  open_centers: string[]
  gates: DesignHumanGate[]
  channels: DesignHumanChannel[]
  incarnation_cross: string
  personality_planets: DesignHumanPlanet[]
  design_planets: DesignHumanPlanet[]
}

// ═══════════════════════════════════════════════════════════
// ASTROLOGY
// ═══════════════════════════════════════════════════════════

export interface AstrologyPlanet {
  name: string
  sign: string
  house: string
  degree: number
  retrograde: boolean
}

export interface AstrologyHouse {
  number: number
  sign: string
  degree: number
}

export interface AstrologyWestern {
  sun_sign: string
  moon_sign: string
  ascendant: string
  planets: AstrologyPlanet[]
  houses: AstrologyHouse[]
  aspects: any[] // Placeholder
  dominant_element: string
  dominant_modality: string
  chart_shape: string
  hemisphere_emphasis: {
    horizontal: string
    vertical: string
  }
}

export interface AstrologyChinese {
  animal_sign: string
  element: string
  yin_yang: 'yin' | 'yang'
  year: number
  compatible_signs: string[]
  incompatible_signs: string[]
  traits: string[]
}

// ═══════════════════════════════════════════════════════════
// NUMEROLOGY
// ═══════════════════════════════════════════════════════════

export interface NumerologyChallenge {
  type: string
  value: number
  ages: string
}

export interface NumerologyCycle {
  type: string
  value: number
  ages: string
}

export interface NumerologyInterpretation {
  keyword: string
  traits: string[]
}

export interface Numerology {
  life_path: number
  expression: number
  soul_urge: number
  personality: number
  maturity: number
  active: number
  hereditary: number
  challenges: NumerologyChallenge[]
  cycles: NumerologyCycle[]
  personal_year: number
  interpretations: {
    life_path: NumerologyInterpretation
    expression: NumerologyInterpretation
    soul_urge: NumerologyInterpretation
    personality: NumerologyInterpretation
    active?: NumerologyInterpretation
    hereditary?: NumerologyInterpretation
  }
}

// ═══════════════════════════════════════════════════════════
// RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════

export interface Recommendation {
  category: string
  recommendation: string
  rationale: string
}

export interface Recommendations {
  energy_management: Recommendation[]
  task_organization: Recommendation[]
  relationship_strategies: Recommendation[]
  growth_areas: Recommendation[]
  daily_rituals: Recommendation[]
}

// ═══════════════════════════════════════════════════════════
// MAIN HOLISTIC PROFILE
// ═══════════════════════════════════════════════════════════

export interface HolisticProfile {
  id: string
  session_id: string
  user_id: string
  psychological_analysis: PsychologicalAnalysis
  neurodivergence_analysis: NeurodivergenceAnalysis
  shinkofa_analysis: ShinkoфaAnalysis
  design_human: DesignHuman
  astrology_western: AstrologyWestern
  astrology_chinese: AstrologyChinese
  numerology: Numerology
  synthesis: string // Narrative synthesis from AI
  recommendations: Recommendations
  pdf_export_path: string | null
  markdown_export_path: string | null
  generated_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}
