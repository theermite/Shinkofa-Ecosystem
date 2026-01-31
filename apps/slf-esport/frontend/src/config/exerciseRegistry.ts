/**
 * Cognitive Exercise Registry
 *
 * Central registry of all brain training exercises available on SLF E-Sport platform.
 * This modular architecture makes it easy to add new exercises in the future.
 *
 * To add a new exercise:
 * 1. Import the component from @theermite/brain-training
 * 2. Add entry to cognitiveExercises array with metadata
 * 3. Add corresponding type to backend enum MemoryExerciseType
 */

import {
  MemoryCardGame,
  PatternRecall,
  SequenceMemory,
  ImagePairs,
  ReactionTime,
  PeripheralVision,
  MultiTask,
  LastHitTrainer,
  DodgeMaster,
  SkillshotTrainer,
  BreathingExercise,
} from '@theermite/brain-training'

import type { CognitiveExercise } from '@/types/cognitiveExercise'

/**
 * Complete registry of all cognitive exercises
 */
export const cognitiveExercises: CognitiveExercise[] = [
  // ===== MEMORY EXERCISES =====
  {
    id: 'memory-cards',
    type: 'MEMORY_CARDS',
    title: 'Memory Cards',
    description: 'Retrouve les paires de cartes identiques. Améliore ta mémoire visuelle et ta concentration.',
    category: 'memory',
    difficulty: ['EASY', 'MEDIUM', 'HARD'],
    thumbnail: '/images/exercises/memory-cards.png',
    icon: '🃏',
    component: MemoryCardGame,
    defaultConfig: {
      grid_rows: 4,
      grid_cols: 4,
      time_weight: 0.5,
      accuracy_weight: 0.5,
      difficulty: 'MEDIUM',
    },
    tags: ['mémoire', 'concentration', 'visuel'],
    estimatedDuration: 3,
  },
  {
    id: 'pattern-recall',
    type: 'PATTERN_RECALL',
    title: 'Pattern Recall',
    description: 'Mémorise et reproduis le motif de couleurs. Entraîne ta mémoire visuelle spatiale.',
    category: 'memory',
    difficulty: ['EASY', 'MEDIUM', 'HARD'],
    thumbnail: '/images/exercises/pattern-recall.png',
    icon: '🎨',
    component: PatternRecall,
    defaultConfig: {
      grid_rows: 3,
      grid_cols: 3,
      colors: ['#3CB371', '#FF9800', '#FFD600', '#E53935', '#8E24AA'], // SLF palette
      preview_duration_ms: 3000,
      difficulty: 'MEDIUM',
    },
    tags: ['mémoire', 'spatial', 'couleurs'],
    estimatedDuration: 4,
  },
  {
    id: 'sequence-memory',
    type: 'SEQUENCE_MEMORY',
    title: 'Sequence Memory',
    description: 'Mémorise et reproduis la séquence. Développe ta mémoire de travail.',
    category: 'memory',
    difficulty: ['EASY', 'MEDIUM', 'HARD'],
    thumbnail: '/images/exercises/sequence-memory.png',
    icon: '🔢',
    component: SequenceMemory,
    defaultConfig: {
      sequence_length: 5,
      preview_duration_ms: 2000,
      difficulty: 'MEDIUM',
    },
    tags: ['mémoire', 'séquence', 'working memory'],
    estimatedDuration: 5,
  },
  {
    id: 'image-pairs',
    type: 'IMAGE_PAIRS',
    title: 'Image Pairs',
    description: 'Retrouve les paires d\'images identiques. Mémoire visuelle avancée.',
    category: 'memory',
    difficulty: ['EASY', 'MEDIUM', 'HARD'],
    thumbnail: '/images/exercises/image-pairs.png',
    icon: '🖼️',
    component: ImagePairs,
    defaultConfig: {
      grid_rows: 4,
      grid_cols: 4,
      images: [], // Will be populated with SLF gaming images
      time_weight: 0.5,
      accuracy_weight: 0.5,
      difficulty: 'MEDIUM',
    },
    tags: ['mémoire', 'visuel', 'images'],
    estimatedDuration: 4,
  },

  // ===== REFLEXES & ATTENTION =====
  {
    id: 'reaction-time',
    type: 'REACTION_TIME',
    title: 'Reaction Time',
    description: 'Clique le plus vite possible quand la cible apparaît. Améliore tes réflexes.',
    category: 'reflexes',
    difficulty: ['EASY', 'MEDIUM', 'HARD'],
    thumbnail: '/images/exercises/reaction-time.png',
    icon: '⚡',
    component: ReactionTime,
    defaultConfig: {
      trials: 10,
      min_delay_ms: 1000,
      max_delay_ms: 3000,
      difficulty: 'MEDIUM',
    },
    tags: ['réflexes', 'temps de réaction', 'rapidité'],
    estimatedDuration: 2,
  },
  {
    id: 'peripheral-vision',
    type: 'PERIPHERAL_VISION',
    title: 'Peripheral Vision',
    description: 'Repère les cibles dans ta vision périphérique. Essentiel pour l\'awareness en jeu.',
    category: 'attention',
    difficulty: ['EASY', 'MEDIUM', 'HARD'],
    thumbnail: '/images/exercises/peripheral-vision.png',
    icon: '👁️',
    component: PeripheralVision,
    defaultConfig: {
      target_radius: 300,
      target_duration_ms: 1500,
      distractor_count: 3,
      difficulty: 'MEDIUM',
    },
    tags: ['vision', 'awareness', 'périphérique'],
    estimatedDuration: 3,
  },
  {
    id: 'multitask',
    type: 'MULTITASK',
    title: 'MultiTask',
    description: 'Gère plusieurs tâches simultanément. Améliore ta gestion cognitive en teamfight.',
    category: 'attention',
    difficulty: ['EASY', 'MEDIUM', 'HARD'],
    thumbnail: '/images/exercises/multitask.png',
    icon: '🎯',
    component: MultiTask,
    defaultConfig: {
      tasks: ['color_matching', 'number_counting', 'shape_rotation'],
      task_duration_ms: 30000,
      difficulty: 'MEDIUM',
    },
    tags: ['multitasking', 'attention', 'gestion cognitive'],
    estimatedDuration: 5,
  },

  // ===== GAMING MOBA =====
  {
    id: 'last-hit-trainer',
    type: 'LAST_HIT_TRAINER',
    title: 'Last Hit Trainer',
    description: 'Entraîne-toi au last hit sur les sbires. Timing et précision essentiels.',
    category: 'gaming',
    difficulty: ['EASY', 'MEDIUM', 'HARD'],
    thumbnail: '/images/exercises/last-hit-trainer.png',
    icon: '⚔️',
    component: LastHitTrainer,
    defaultConfig: {
      minion_hp: 100,
      minion_spawn_interval_ms: 3000,
      attack_damage: 50,
      difficulty: 'MEDIUM',
    },
    tags: ['MOBA', 'last hit', 'farming', 'timing'],
    estimatedDuration: 5,
  },
  {
    id: 'dodge-master',
    type: 'DODGE_MASTER',
    title: 'Dodge Master',
    description: 'Esquive les projectiles ennemis. Améliore ton positionnement et tes réflexes.',
    category: 'gaming',
    difficulty: ['EASY', 'MEDIUM', 'HARD'],
    thumbnail: '/images/exercises/dodge-master.png',
    icon: '🏃',
    component: DodgeMaster,
    defaultConfig: {
      projectile_speed: 300,
      player_speed: 250,
      difficulty: 'MEDIUM',
    },
    tags: ['MOBA', 'dodge', 'positionnement', 'réflexes'],
    estimatedDuration: 4,
  },
  {
    id: 'skillshot-trainer',
    type: 'SKILLSHOT_TRAINER',
    title: 'Skillshot Trainer',
    description: 'Vise et touche les cibles en mouvement. Maîtrise tes skillshots.',
    category: 'gaming',
    difficulty: ['EASY', 'MEDIUM', 'HARD'],
    thumbnail: '/images/exercises/skillshot-trainer.png',
    icon: '🎯',
    component: SkillshotTrainer,
    defaultConfig: {
      projectile_speed: 400,
      target_speed: 200,
      difficulty: 'MEDIUM',
    },
    tags: ['MOBA', 'skillshot', 'visée', 'précision'],
    estimatedDuration: 5,
  },

  // ===== WELLBEING =====
  {
    id: 'breathing',
    type: 'BREATHING',
    title: 'Respiration Guidée',
    description: 'Exercices de respiration avec fréquences audio. Réduis ton stress avant les matchs.',
    category: 'wellbeing',
    difficulty: ['EASY'],
    thumbnail: '/images/exercises/breathing.png',
    icon: '🧘',
    component: BreathingExercise,
    defaultConfig: {
      pattern: 'cardiac_coherence',
      duration_minutes: 5,
      frequency_hz: 0.1, // 6 respirations/min = cohérence cardiaque
    },
    tags: ['bien-être', 'respiration', 'stress', 'relaxation'],
    estimatedDuration: 5,
  },
]

/**
 * Helper function to get exercise by ID
 */
export function getExerciseById(id: string): CognitiveExercise | undefined {
  return cognitiveExercises.find((ex) => ex.id === id)
}

/**
 * Helper function to get exercise by type
 */
export function getExerciseByType(type: string): CognitiveExercise | undefined {
  return cognitiveExercises.find((ex) => ex.type === type)
}

/**
 * Helper function to get exercises by category
 */
export function getExercisesByCategory(category: string): CognitiveExercise[] {
  return cognitiveExercises.filter((ex) => ex.category === category)
}

/**
 * Helper function to get exercises by difficulty
 */
export function getExercisesByDifficulty(difficulty: string): CognitiveExercise[] {
  return cognitiveExercises.filter((ex) => ex.difficulty.includes(difficulty as any))
}

/**
 * Helper function to register a new exercise
 * (for future extensibility)
 */
export function registerExercise(exercise: CognitiveExercise): void {
  const exists = cognitiveExercises.find((ex) => ex.id === exercise.id)
  if (exists) {
    console.warn(`Exercise with ID "${exercise.id}" already exists. Skipping registration.`)
    return
  }
  cognitiveExercises.push(exercise)
  console.info(`✅ Registered new exercise: ${exercise.title} (${exercise.type})`)
}

/**
 * Category metadata for UI organization
 */
export const categoryMetadata = {
  memory: {
    label: 'Mémoire',
    description: 'Exercices pour améliorer la mémoire visuelle, spatiale et de travail',
    icon: '🧠',
    color: 'primary',
  },
  reflexes: {
    label: 'Réflexes',
    description: 'Entraînement des temps de réaction et de la rapidité',
    icon: '⚡',
    color: 'accent',
  },
  attention: {
    label: 'Attention',
    description: 'Améliore ta concentration, ton awareness et ton multitasking',
    icon: '👁️',
    color: 'secondary',
  },
  gaming: {
    label: 'Gaming MOBA',
    description: 'Exercices spécifiques aux mécaniques de jeu MOBA',
    icon: '🎮',
    color: 'info',
  },
  wellbeing: {
    label: 'Bien-être',
    description: 'Exercices de respiration, relaxation et gestion du stress',
    icon: '🧘',
    color: 'success',
  },
}

export default cognitiveExercises
