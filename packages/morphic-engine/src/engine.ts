/**
 * Morphic Engine - Core adaptation logic
 */

import type {
  MorphicProfile,
  DesignHumainType,
  NeurodivergenceType,
} from '@shinkofa/types';
import type {
  MorphicPreferences,
  MorphicRecommendations,
  MorphicAdaptation,
} from './types';

/**
 * Generate UI/UX preferences based on Design Humain type
 */
function getDesignHumainPreferences(type: DesignHumainType): Partial<MorphicPreferences> {
  const preferences: Record<DesignHumainType, Partial<MorphicPreferences>> = {
    Manifesteur: {
      // Manifesteurs: Besoin d'autonomie, actions rapides
      spacing: 'normal',
      animationSpeed: 'fast',
      quickAccess: true,
      stepByStepMode: false,
      navigationStyle: 'sidebar',
    },
    Générateur: {
      // Générateurs: Besoin de clarté, réponses immédiates
      spacing: 'comfortable',
      animationSpeed: 'normal',
      showHelperText: true,
      progressIndicators: true,
      layoutStyle: 'cards',
    },
    Projecteur: {
      // Projecteurs: Besoin d'invitation, focus sur reconnaissance
      spacing: 'comfortable',
      animationSpeed: 'slow',
      visualCues: true,
      breadcrumbs: true,
      energyTracking: true,
    },
    Réflecteur: {
      // Réflecteurs: Besoin de temps, sensibilité environnement
      spacing: 'comfortable',
      reducedMotion: true,
      animationSpeed: 'slow',
      breakReminders: true,
      showHelperText: true,
    },
  };

  return preferences[type] || {};
}

/**
 * Generate UI/UX preferences based on neurodivergence
 */
function getNeurodivergencePreferences(
  types: NeurodivergenceType[]
): Partial<MorphicPreferences> {
  const preferences: Partial<MorphicPreferences> = {};

  if (types.includes('TDAH')) {
    // TDAH: Réduire distractions, aider focus
    Object.assign(preferences, {
      reducedMotion: true,
      visualCues: true,
      progressIndicators: true,
      breakReminders: true,
    });
  }

  if (types.includes('TSA')) {
    // TSA: Prédictibilité, clarté, réduction sensorielle
    Object.assign(preferences, {
      reducedMotion: true,
      contrastMode: true,
      showHelperText: true,
      stepByStepMode: true,
      soundEffects: false,
    });
  }

  if (types.includes('HPI')) {
    // HPI: Rapidité, complexité, multitâche
    Object.assign(preferences, {
      density: 'high',
      animationSpeed: 'fast',
      quickAccess: true,
      layoutStyle: 'grid',
    });
  }

  if (types.includes('Hypersensible')) {
    // Hypersensible: Douceur, calme, réduction stimuli
    Object.assign(preferences, {
      reducedMotion: true,
      animationSpeed: 'slow',
      colorScheme: 'warm',
      soundEffects: false,
      spacing: 'comfortable',
    });
  }

  if (types.includes('Multipotentiel')) {
    // Multipotentiel: Variété, exploration, flexibilité
    Object.assign(preferences, {
      quickAccess: true,
      navigationStyle: 'tabs',
      layoutStyle: 'cards',
    });
  }

  return preferences;
}

/**
 * Generate recommendations based on Design Humain
 */
function getDesignHumainRecommendations(
  profile: MorphicProfile
): Partial<MorphicRecommendations> {
  const { type, autorite: _autorite, profil: _profil } = profile.designHumain;

  const recommendations: Record<DesignHumainType, Partial<MorphicRecommendations>> = {
    Manifesteur: {
      decisionMakingGuidance:
        "En tant que Manifesteur, tu dois informer avant d'agir pour réduire les résistances.",
      interactionStyle: 'Direct et autonome - tu fonctionnes mieux en initiant.',
      workStyle: 'Travail par sprints, besoin de liberté et autonomie.',
      energyManagement: 'Énergie en vagues - respecte tes cycles pour éviter le burnout.',
    },
    Générateur: {
      decisionMakingGuidance:
        "Attends de ressentir une réponse sacrale claire (oui/non) avant d'agir.",
      interactionStyle: 'Réponds aux opportunités plutôt que d\'initier.',
      workStyle: 'Satisfaction dans le travail aligné - écoute ton sacral.',
      energyManagement: 'Énergie durable mais nécessite alignement pour éviter frustration.',
    },
    Projecteur: {
      decisionMakingGuidance:
        "Attends l'invitation avant de partager ta sagesse ou ton expertise.",
      interactionStyle: 'Guide et facilite - ta force est de voir les autres.',
      workStyle: 'Travail par sessions courtes - ton énergie est limitée.',
      energyManagement: 'Repos crucial - tu absorbes l\'énergie des autres.',
    },
    Réflecteur: {
      decisionMakingGuidance:
        'Prends ton temps (cycle lunaire 28 jours) pour les décisions importantes.',
      interactionStyle: 'Miroir de l\'environnement - ta sensibilité est une force.',
      workStyle: 'Changements réguliers nécessaires - tu ressens tout.',
      energyManagement: 'Extrêmement sensible à l\'environnement - choisis-le avec soin.',
    },
  };

  return recommendations[type] || {};
}

/**
 * Generate recommendations based on neurodivergence
 */
function getNeurodivergenceRecommendations(
  types: NeurodivergenceType[]
): Partial<MorphicRecommendations> {
  const cognitiveSupport: string[] = [];
  const sensoryConsiderations: string[] = [];
  const focusStrategies: string[] = [];

  if (types.includes('TDAH')) {
    cognitiveSupport.push(
      'Utilise des listes et rappels pour gérer tes tâches',
      'Décompose les gros projets en petites étapes'
    );
    sensoryConsiderations.push('Évite les environnements trop stimulants');
    focusStrategies.push(
      'Technique Pomodoro (25min focus + 5min pause)',
      'Musique blanche ou binaurale pour concentration'
    );
  }

  if (types.includes('TSA')) {
    cognitiveSupport.push(
      'Routines prévisibles réduisent l\'anxiété',
      'Transitions progressives entre activités'
    );
    sensoryConsiderations.push(
      'Contrôle lumière/bruit dans ton espace',
      'Accorde-toi des pauses sensorielles'
    );
    focusStrategies.push('Environnement calme et prévisible', 'Time-blocking structuré');
  }

  if (types.includes('HPI')) {
    cognitiveSupport.push(
      'Challenge intellectuel nécessaire pour engagement',
      'Permet-toi d\'explorer plusieurs sujets'
    );
    focusStrategies.push(
      'Multitâches stratégiques (rotation projets)',
      'Apprentissage continu pour maintenir intérêt'
    );
  }

  if (types.includes('Hypersensible')) {
    sensoryConsiderations.push(
      'Protège-toi des surcharges émotionnelles/sensorielles',
      'Crée un espace ressourçant et apaisant'
    );
    focusStrategies.push(
      'Méditation et pleine conscience',
      'Journaling pour traiter les émotions'
    );
  }

  if (types.includes('Multipotentiel')) {
    cognitiveSupport.push(
      'Ta variété d\'intérêts est une force, pas un défaut',
      'Projets parallèles plutôt que séquentiels'
    );
    focusStrategies.push(
      'Rotation entre projets pour maintenir motivation',
      'Portfolio de compétences diversifiées'
    );
  }

  return {
    cognitiveSupport,
    sensoryConsiderations,
    focusStrategies,
  };
}

/**
 * Main engine: Generate complete morphic adaptation
 */
export function generateMorphicAdaptation(profile: MorphicProfile): MorphicAdaptation {
  // Start with default preferences
  const defaultPreferences: MorphicPreferences = {
    theme: profile.preferences.theme,
    fontSize: profile.preferences.fontSize,
    contrastMode: profile.preferences.contrastMode,
    colorScheme: 'default',
    spacing: 'normal',
    density: 'medium',
    layoutStyle: 'cards',
    reducedMotion: profile.preferences.reducedMotion,
    animationSpeed: 'normal',
    hapticFeedback: false,
    soundEffects: true,
    navigationStyle: 'sidebar',
    quickAccess: false,
    breadcrumbs: false,
    showHelperText: false,
    progressIndicators: false,
    visualCues: false,
    stepByStepMode: false,
    optimalHours: profile.cyclesEnergetiques.optimal,
    lowEnergyHours: profile.cyclesEnergetiques.faible,
    breakReminders: false,
    energyTracking: false,
  };

  // Apply Design Humain adaptations
  const dhPreferences = getDesignHumainPreferences(profile.designHumain.type);

  // Apply neurodivergence adaptations
  const ndPreferences = getNeurodivergencePreferences(profile.neurodivergence);

  // Merge preferences (neurodivergence overrides DH in case of conflict)
  const finalPreferences: MorphicPreferences = {
    ...defaultPreferences,
    ...dhPreferences,
    ...ndPreferences,
  };

  // Generate recommendations
  const dhRecommendations = getDesignHumainRecommendations(profile);
  const ndRecommendations = getNeurodivergenceRecommendations(profile.neurodivergence);

  const finalRecommendations: MorphicRecommendations = {
    decisionMakingGuidance: dhRecommendations.decisionMakingGuidance || '',
    interactionStyle: dhRecommendations.interactionStyle || '',
    communicationPreferences: '',
    cognitiveSupport: ndRecommendations.cognitiveSupport || [],
    sensoryConsiderations: ndRecommendations.sensoryConsiderations || [],
    focusStrategies: ndRecommendations.focusStrategies || [],
    workStyle: dhRecommendations.workStyle || '',
    energyManagement: dhRecommendations.energyManagement || '',
  };

  return {
    profile,
    preferences: finalPreferences,
    recommendations: finalRecommendations,
    lastUpdated: new Date(),
  };
}

/**
 * Update morphic adaptation with user overrides
 */
export function updateMorphicPreferences(
  adaptation: MorphicAdaptation,
  overrides: Partial<MorphicPreferences>
): MorphicAdaptation {
  return {
    ...adaptation,
    preferences: {
      ...adaptation.preferences,
      ...overrides,
    },
    lastUpdated: new Date(),
  };
}

/**
 * Check if it's optimal time based on energy cycles
 */
export function isOptimalTime(adaptation: MorphicAdaptation): boolean {
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentTime = `${currentHour}:00`;

  return adaptation.preferences.optimalHours.includes(currentTime);
}

/**
 * Get energy level recommendation for current time
 */
export function getCurrentEnergyLevel(
  adaptation: MorphicAdaptation
): 'optimal' | 'low' | 'normal' {
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentTime = `${currentHour}:00`;

  if (adaptation.preferences.optimalHours.includes(currentTime)) {
    return 'optimal';
  }

  if (adaptation.preferences.lowEnergyHours.includes(currentTime)) {
    return 'low';
  }

  return 'normal';
}
