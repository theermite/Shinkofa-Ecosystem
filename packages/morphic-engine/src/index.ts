/**
 * @shinkofa/morphic-engine
 * Adaptive morphic engine for Shinkofa ecosystem
 * Personalizes UI/UX based on Design Humain profile and neurodivergence
 */

// Core engine
export {
  generateMorphicAdaptation,
  updateMorphicPreferences,
  isOptimalTime,
  getCurrentEnergyLevel,
} from './engine';

// Context and main hooks
export {
  MorphicProvider,
  useMorphic,
  useMorphicPreferences,
  useBreakReminder,
  useMorphicTheme,
} from './context';

// Specialized hooks
export {
  useEnergyLevel,
  useDesignHumainGuidance,
  useCognitiveSupport,
  useSensoryConsiderations,
  useFocusStrategies,
  useAdaptiveAnimation,
  useAdaptiveSpacing,
  useAdaptiveFontSize,
  useWorkSessionTimer,
  useStepByStepMode,
} from './hooks';

// Types
export type {
  MorphicPreferences,
  MorphicRecommendations,
  MorphicAdaptation,
} from './types';
